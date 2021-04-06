/* global mdb, asyncWrapper */
import settings from './settings.js'
import stdExpressApp from 'stdExpressApp'
import staticFilesHandler from 'st'
import path from 'path'
import AuthLib from 'AuthLib'
import backendSocketHandlers from './backend/all.js'
// process.env.PORT=3001;

function socketHandler (socket) {
  backendSocketHandlers(socket)
  socket.emitInit()
}

stdExpressApp(settings, socketHandler).then((app) => {
  // Адрес сервиса авторизации
  const Auth = new AuthLib('https://auth.ans.aero', 'archiveDv', '.authKeys.json')

  // Переадресация клиента в сервис авторизации
  app.get('/login', (req, res) => {
    const ret = Auth.requestLoginLink({
      Referer: req.header('Referer')
    }, '/authResult', 'ref')
    if (ret.error) return res.end(ret.error)
    // console.log("link",ret.link);
    console.log(req.headers)
    res.status(302)
    res.redirect(ret.link)
  })

  // Клиент пришел с ответом от сервиса авторизации
  app.get('/authResult', Auth.decodeAnswer(), (req, res) => {
    // console.log('req.authInfo', req.authInfo)
    if (req.authInfo.error) {
      res.end(req.authInfo.error)
    }
    req.session.userData = req.authInfo.userData
    req.session.save(() => {
      // console.log("req.clientOpts",req.clientOpts);
      res.status(302)
      res.redirect((req.clientOpts && req.clientOpts.Referer) || '/')
    })
  })

  // Отчистка сессии
  app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.render('logout', { referrer: '/' })
    })
  })

  //app.get('/', (req, res) => {
  //  res.redirect('/table/plan')
  //})

  app.use((req, res, next) => {
    // Пользователь не авторизован
    if (!req.session.userData) {
      return res.render('jsRedirect', { location: '/login' })
    }
    next()
  })

  function renderMainApp (req, res) {
    // В сессии есть инфо о пользователе, передаем реакт приложение
    // Далее клиент работает через socket.io см. файл backend/testActions.js
    // console.log(`Open table ${req.params.tableName} userData %j`, req.session.userData)
    res.render('reactApp', {
      name: 'clientApp',
      params: req.params || {},
      appProps: { userData: req.session.userData }
    })
  }

  app.use(staticFilesHandler({
    cache: false,
    path: path.resolve('public'),
    url: '/files/'
  }))

  app.get('/getDvFile/:binaryId',asyncWrapper(async (req, res) => {
    if (req.session.userData?.rights?.adminDvCards !== 'allow') {
      res.status(403);
      res.end('Forbidden');
      return
    }
    const fileDoc = await mdb.collection('dvFiles.files').findOne({ _id: req.params.binaryId });
    if (!fileDoc) {
      res.status(404);
      res.end('404 file not found')
    }
    console.log('fileDoc', fileDoc)
    const bucket = new MongoDb.GridFSBucket(mdb, { bucketName: 'dvFiles' });
    const readStream = bucket.openDownloadStream(req.params.binaryId);
    res.setHeader('Content-Length', fileDoc.length);
    res.setHeader('Content-Disposition', `attachment;filename*=UTF-8\'\'${encodeURIComponent(fileDoc.metadata.Name)}`);
    readStream.pipe(res);
  }, true))

  // default render react app
  app.use(renderMainApp)
})// stdExpressApp.then
