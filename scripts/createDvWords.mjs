import MinimalMongodb from 'MinimalMongodb'
import PrepareWords from 'PrepareWords'
import settings from './../settings.js'

const wordsVer = 4;

function alwaysArray(item) {
  if (!item){
    return [];
  }else if (!(item instanceof Array)) {
    return [item]
  }else {
    return item
  }
}

const employerFields = {
  AccountName: 1,
  Email: 1,
  FirstName: 1,
  LastName: 1,
  MiddleName: 1,
  Phone: 1
};

function pushEmpoyerWords(employer, pWords) {
  for (let prop in employer) {
    prop !== '_id' && prop !== 'Phone' && pWords.fromString(employer[prop])
  }
}

async function start () {
  const dbConnector = new MinimalMongodb(settings.dbSettings)
  const mdb = await dbConnector.connect()
  await mdb.collection('dvCards').createIndex({ wordsVer: 1 })

  async function processCard(doc, pWords, level) {
    let upd = {};
    pWords
      .fromString(doc.Description)
      .fromString(doc.sections?.MainInfo?.SenderName)
      .fromString(doc.sections?.MainInfo?.FileName)
      .fromString(doc.sections?.MainInfo?.FullNumber)
      .fromString(doc.sections?.MainInfo?.OutgoingNumber)
      .fromString(doc.sections?.MainInfo?.SenderOrg)
      .fromString(doc.sections?.MainInfo?.Digest)
      .fromString(doc.sections?.MainInfo?.Name);

    doc?.fields?.['Категории']?.forEach(pWords.fromString.bind(pWords));
    ["Исполнители", "Получатели", "Подписано", "Согласующие лица"].forEach((emplKey) => {
      doc?.fields?.[emplKey]?.forEach((employer) => {
        for (let prop in employer) {
          /Name$/.test(prop) && pWords.fromString(employer[prop])
        }
      });
    })

    doc.folders && doc.folders.forEach((folder) => {
      !/^Папки$/.test(folder.Name) && pWords.fromString(folder.Name)
      // pWords.fromString('folderId'+folder._id)
    })
    for (let emplLink of alwaysArray(doc?.sections?.Employees)){
      upd.Employees = upd.Employees || [];
      let employer = await mdb.collection('dvUsers').findOne({
        _id: emplLink.EmployeeID
      }, {
        projection: employerFields
      });
      upd.Employees.push(employer)
      pushEmpoyerWords(employer, pWords)
    }
    for (let performerLink of alwaysArray(doc?.sections?.Performers)){
      upd.Performers = upd.Performers || [];
      let employer = await mdb.collection('dvUsers').findOne({
        _id: performerLink.PerformerID
      }, {
        projection: employerFields
      });
      upd.Performers.push(employer)
      pushEmpoyerWords(employer, pWords)
    }

    for (let key of ['RespRecipient', 'Author']){
      if (doc?.sections?.MainInfo?.[key]){
        let employer = await mdb.collection('dvUsers').findOne({
          _id: doc?.sections?.MainInfo?.[key]
        }, {
          projection: employerFields
        });

        upd[key] = employer;
        pushEmpoyerWords(employer, pWords)
      }
    }

    // Найдем все дочерние карточки
    const childCardsCursor = mdb.collection('dvChildsCards').find({
      ParentID: doc._id
    });

    for await (let childDoc of childCardsCursor) {
      await processCard(childDoc, pWords, level + 1);
    }

    //Все ключевые слова в главную карточку
    upd.words = (level === 0) ? pWords.words : null;
    upd.words && upd.words.filter((word) => {
      if (!isNaN(Number(word))){
        return true
      }else if (word.length > 3) {
        return true
      }else {
        return false
      }
    })
    upd.wordsVer = wordsVer;
    await mdb.collection('dvCards').updateOne({
      _id: doc._id
    }, {
      $set: upd
    });
  }


  let cnt = 0;
  const cardsCursor = mdb.collection('dvCards').find({
    // _id: 'C6285904-30A6-4E5E-A446-BE716056B35F',
    ParentID: '00000000-0000-0000-0000-000000000000',
    wordsVer: { $ne: wordsVer}
  }, {
    //sort: { CreationDateTime: 1 }
  });

  for await (let doc of cardsCursor) {
    let pWords = new PrepareWords([]);
    await processCard(doc, pWords, 0);
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
