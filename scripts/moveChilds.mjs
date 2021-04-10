import MinimalMongodb from 'MinimalMongodb'
import settings from './../settings.js'

async function start () {
  const dbConnector = new MinimalMongodb(settings.dbSettings)
  const mdb = await dbConnector.connect()


  const cardsCursor = mdb.collection('dvCards').find({
    ParentID: { $ne: '00000000-0000-0000-0000-000000000000' }
  });

  let cnt = 0;
  for await (let doc of cardsCursor) {
    await mdb.collection('dvChildCards').insertOne(doc);
    await mdb.collection('dvCards').removeOne(doc);
    cnt++;
    (cnt % 100) === 0 && console.log(`Updated docs ${cnt}`)
  }
}
start().then(() => {
  console.log('finish')
  process.exit(0)
}).catch((err) => {
  console.log('Error', err.toString())
  process.exit(1)
})
