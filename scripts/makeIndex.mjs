import MinimalMongodb from 'MinimalMongodb'
import settings from './../settings.js'

async function start () {
  const dbConnector = new MinimalMongodb(settings.dbSettings)
  const mdb = await dbConnector.connect()
  await mdb.collection('dvCards').createIndex({ CreationDateTime:-1, FolderRowId: 1, words: 1 })
  await mdb.collection('dvCards').createIndex({ CreationDateTime:-1, FolderRowId: 1, ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ CreationDateTime:-1, 'folders._id': 1, ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ CreationDateTime:-1, words: 1 })
  await mdb.collection('dvCards').createIndex({ CreationDateTime:-1, ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ FolderRowId: 1, words: 1 })
  await mdb.collection('dvCards').createIndex({ FolderRowId: 1, ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ 'folders._id': 1, ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ words: 1 })
  await mdb.collection('dvCards').createIndex({ ParentID: 1 })
  await mdb.collection('dvCards').createIndex({ 'CreationDateTime': -1 })
  await mdb.collection('dvFoldersTree').createIndex({ 'ParentTreeRowID': 1 })

  await mdb.collection('dvFiles.files').createIndex({ 'length': -1 })
}
start().then(() => {
  console.log('finish')
  process.exit(0)
}).catch((err) => {
  console.log('Error', err.toString())
  process.exit(1)
})
