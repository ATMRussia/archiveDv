/* global mdbClient, asyncWrapperSocketio */
function recursiveFill (place, docs) {
  const item = docs.shift()
  item.items = item.activePeople ? [] : null
  item.items && docs.length && recursiveFill(item.items, docs)
  place.push(item)
}

export default function (socket) {
  const authBase = mdbClient.db('Auth')
  socket.on('getParentItems', asyncWrapperSocketio(async (data) => {
    if (!socket.session.userData) {
      throw new Error('Вход в профиль не выполнен')
    }
    var docs = await authBase.collection('structure').aggregate([
      {
        $match: {
          _id: { $in: data.ids },
          parent: { $ne: null }
        }
      },
      {
        $graphLookup: {
          from: 'structure',
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'hierarchy'
        }
      },
      { $unwind: '$hierarchy' },
      { $project: { id: '$hierarchy._id' } },
      { $group: { _id: '$id' } }
    ], {
      readPreference: 'secondaryPreferred'
    }).toArray()
    return docs.map((doc) => doc._id)
  }))

  socket.on('getStruct', asyncWrapperSocketio(async (data) => {
    if (!socket.session.userData) {
      throw new Error('Вход в профиль не выполнен')
    }
    // if (!(data.bottomId || data.parentId)) return []

    var items = []
    if (data.bottomId) {
      var docs = await authBase.collection('structure').aggregate([
        { $match: { _id: data.bottomId } },
        // {$limit:1},
        {
          $graphLookup: {
            from: 'structure',
            startWith: data.bottomId,
            connectFromField: 'parent',
            connectToField: '_id',
            as: 'hierarchy'
          }
        },
        { $unwind: '$hierarchy' },
        { $replaceRoot: { newRoot: '$hierarchy' } },
        { $sort: { level: 1 } }
      ], {
        readPreference: 'secondaryPreferred'
      }).toArray()

      recursiveFill(items, docs)
    } else {
      items = await authBase.collection('structure').find({
        parent: data.parentId || null
      }, {
        readPreference: 'secondaryPreferred'
      }).sort({
        activePeople: -1
      }).toArray()
    }
    return items
  }))
}
