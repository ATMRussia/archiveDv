import MinimalMongodb from 'MinimalMongodb'
import settings from './../settings.js'



async function start () {
  const dbConnector = new MinimalMongodb(settings.dbSettings)
  const mdb = await dbConnector.connect()
  const now = new Date();
  const borderDate = new Date(now.getTime() - (4 * 24 * 60 * 60000))

  const bucket = new MongoDb.GridFSBucket(mdb, {
    bucketName: 'dvFiles'
  });

  await mdb.collection('dvFiles.files').createIndex({ dublicatesCheck: 1 });
  await mdb.collection('dvFiles.files').createIndex({ md5: 1, length: 1 });
  await mdb.collection('dvCards').createIndex({ 'binaryFileInfo.BinaryID': 1 });
  console.log('Index ready')

  let cnt = 0;
  let cleanSize = 0;
  const filesCursor = mdb.collection('dvFiles.files').find({
    dublicatesCheck: { $not: { $gt: borderDate } }
  });

  async function saveFDoc(fileDoc){
    return mdb.collection('dvFiles.files').updateOne({
      _id : fileDoc._id
    }, {
      $set: {
        dublicatesCheck: now
      }
    })
  }

  for await (let fileDoc of filesCursor) {
    let dublicates = await mdb.collection('dvFiles.files').find({
      md5: fileDoc.md5,
      length: fileDoc.length,
      _id: { $ne: fileDoc._id }
    }).toArray();

    cnt++;
    (cnt % 100) === 0 && console.log(`Updated docs ${cnt} saved space: ${(cleanSize/(1024*1024)).toFixed(1)} Mb`)


    !fileDoc.metadata.size && await mdb.collection('dvCards').updateOne({
      'binaryFileInfo.BinaryID': fileDoc._id
    }, {
      $set :{ 'binaryFileInfo.size': fileDoc.length }
    });
    fileDoc.metadata.size = fileDoc.length

    if (!dublicates.length){
      saveFDoc(fileDoc);
      continue;
    }

    for (let fileDublicate of dublicates){
      await mdb.collection('dvCards').updateMany({
        'binaryFileInfo.BinaryID': fileDublicate._id
      }, {
        $set :{
          binaryFileInfo: fileDoc.metadata
        }
      });

      await mdb.collection('dvFiles.files').deleteOne({ _id: fileDublicate._id });
      await mdb.collection('dvFiles.chunks').deleteMany({ files_id: fileDublicate._id });
      console.log(`Remove file ${fileDublicate.filename}`)
      cleanSize += fileDublicate.length;
    }
    saveFDoc(fileDoc);
  }
}
start().then(() => {
  console.log('finish')
  process.exit(0)
}).catch((err) => {
  console.log('Error', err.toString())
  process.exit(1)
})
