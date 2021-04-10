/* global mdb, MongoDb, mdbClient  */
import { getSafeRegex } from '../libs/regexHelpers.js'
import PrepareWords from 'PrepareWords'

const defaultRightsArray = ['adminDvCards', 'viewAll']
const colName = 'dvCards'

export default function (socket) {
  socket.onp('getDvCard', defaultRightsArray, async (data) => {
    const doc = await mdb.collection(colName).findOne({ _id: data.docId })
    console.log('doc', doc)
    return doc
  })

  socket.onp('getFolders', defaultRightsArray, async (data) => {
    const folders = await mdb.collection('dvFoldersTree').find({
      ParentTreeRowID: data.parentId || 'FFFFFFFF-FFFF-0003-FFFF-000000000000' // Начальная папка "Папки"
    }, {
      sort: { Name: 1 },
      projection: {
        RowID: 1,
        Name: 1
      }
    }).toArray();
    return folders.map(a => ({
      id: a.RowID,
      name: a.Name,
      loadOnDemand: true
    }))
  })

  socket.onp('getChildsDvCards', defaultRightsArray, async (data) => {
    if (!data.rootCardId) return []

    async function fillChilds(parentCard){
      const children = await mdb.collection('dvChildCards').find({
        ParentID : parentCard._id
      }, {
        sort: { CreationDateTime: -1 },
        projection: {
          _id: 1,
          Description: 1
        }
      }).toArray()
      const outTreeChilds = []
      for (let child of children) {
        outTreeChilds.push(await fillChilds(child))
      }
      return {
        id: parentCard._id,
        name: parentCard.Description,
        children: children.length ? outTreeChilds : null,
        selected: parentCard._id === data.curDocId
      }
    }

    const rootCard = await mdb.collection('dvCards').findOne({
      _id : data.rootCardId
    }, {
      // sort: { CreationDateTime: -1 },
      projection: {
        _id: 1,
        Description: 1
      }
    });

    const rootTreeNode = await fillChilds(rootCard);
    return [rootTreeNode];
  })

  socket.onp('getDvCards', defaultRightsArray, async (data) => {
    const userData = socket.session.userData
    var ret = {
      rowsAndPages: data.rowsAndPages
    }

    var searchCondition = {
      words: { $all: [] },
      $and: [],
      $or: []
    }

    const filters = data.searchCondition.filters || {};
    (new PrepareWords())
      .fromString(data.searchCondition.keywords || '')
      .words.forEach((word) => {
        if (!isNaN(Number(word))){
          searchCondition.words.$all.push(new RegExp(`^${getSafeRegex(word)}$`))
        }else if (word.length > 3) {
          searchCondition.words.$all.push(new RegExp(`^${getSafeRegex(word)}`))
        }
      })
    if (searchCondition.words.$all.length === 0) {
      delete searchCondition.words;
      // searchCondition.ParentID = '00000000-0000-0000-0000-000000000000';
    }

    if (filters.sdate) {
      console.log('sdate', filters.sdate);
      searchCondition.CreationDateTime = searchCondition.CreationDateTime || {}
      searchCondition.CreationDateTime.$gte = new Date(filters.sdate);
    }

    if (filters.edate) {
      console.log('edate', filters.edate);
      searchCondition.CreationDateTime = searchCondition.CreationDateTime || {}
      searchCondition.CreationDateTime.$lt = new Date(filters.edate);
    }

    if (filters.folderId && filters.folderId.length) {
      // Документ в одном из каталогов
      searchCondition['folders._id'] = { $in: filters.folderId }
      /*let folderIds = [];
      (await mdb.collection('dvFoldersTree').aggregate([
        {
          $match: {
            _id: {
              $in: filters.folderId
            }
          }
        },
        {
          $graphLookup: {
            from: 'dvFoldersTree',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'ParentTreeRowID',
            as: 'childFolders',
            restrictSearchWithMatch: {
              Deleted: null
            },
            depthField: 'level'
          }
        }
      ]).toArray()).forEach((rootFolder) => {
        folderIds.push(rootFolder._id);
        rootFolder.childFolders.forEach((childFolder) => {
          folderIds.push(childFolder._id);
        })
      })
      searchCondition['FolderRowId'] = { $in : folderIds };*/
    }

    if (filters.inclTags && filters.inclTags.length) {
      searchCondition.$and.push({
        tags: { $all: filters.inclTags }
      })
    }
    if (filters.exclTags && filters.exclTags.length) {
      searchCondition.$and.push({
        tags: { $nin: filters.exclTags }
      })
    }

    if (searchCondition.$and.length === 0) delete searchCondition.$and
    if (searchCondition.$or.length === 0) delete searchCondition.$or

    console.log('searchCondition',searchCondition);
    const cursor = mdb.collection(colName).find(searchCondition);
    cursor.sort({ CreationDateTime: -1 });

    ret.rowsAndPages.cnt = await cursor.count();
    cursor.skip(data.rowsAndPages.page * data.rowsAndPages.limit)
      .limit(data.rowsAndPages.limit);
    ret.rowsAndPages.rows = await cursor.toArray()
    return ret
  })
}
