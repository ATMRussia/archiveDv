/* global socket  */
function emitReadyStateChanged () {
  var functions = socket.listeners('readyStateChanged').concat([])
  functions.forEach((func) => {
    func && func.apply(socket, [socket.ready])
  })
}

socket.on('init', function (data, cb) {
  if (!socket.ready) {
    socket.ready = true
    emitReadyStateChanged()
  }
  socket.ready = true
  cb && cb()
})

socket.on('disconnect', function (reason) {
  socket.ready = false
  emitReadyStateChanged()
  console.log('Disconnect', reason)
  setTimeout(function () {
    socket.open()
  }, 3000)
})

socket.on('connect_error', function (reason) {
  console.log('Socket connect_error', reason)
  setTimeout(function () {
    socket.open()
  }, 3000)
})

socket.origOn = socket.on
socket.on = function (event, handler) {
  socket.origOn(event, handler)
  event === 'readyStateChanged' && socket.ready && handler && handler(socket.ready)
}
socket.origOnce = socket.once
socket.once = function (event, handler) {
  if (event === 'readyStateChanged' && socket.ready) {
    handler && handler(socket.ready)
    return
  }
  socket.origOnce(event, handler)
}
socket.waitReady = function () {
  return new Promise((resolve, reject) => {
    socket.once('readyStateChanged', (ready) => {
      resolve(ready)
    })
  })
}

socket.displayLogErr = function (errorString) {
  document.displayError && document.displayError(errorString)
  console.log(errorString)
}

// Обертка отправки события на серверу
// выводит на экран сообщение об ошибке при её наличии.
socket.safeEmit = function (event, data, cb) {
  if (!(socket.connected && socket.ready)) {
    var tx = 'Нет подключения к серверу, повторите попытку позже'
    // socket.displayLogErr(tx);
    cb && cb(tx)
    return
  }
  var cmdTimeout = null
  var skipAnswer = false
  // if (data.timeout || ){
  cmdTimeout = setTimeout(() => {
    skipAnswer = true
    // socket.displayLogErr();
    var tx = 'Сервер не ответил в заданное время'
    cb && cb(tx)
  }, data.timeout || 10000)
  delete data.timeout

  socket.emit(event, data || {}, (err, ret) => {
    cmdTimeout && clearTimeout(cmdTimeout)
    if (skipAnswer) {
      console.log('Server return answer after timeout')
      return
    }
    // err && socket.displayLogErr(err);
    cb && cb(err, ret)
  })
}

socket.asyncSafeEmit = function (event, data) {
  return new Promise((resolve, reject) => {
    socket.safeEmit(event, data, (err, ret) => {
      if (err) return reject(new Error(err))
      resolve(ret)
    })
  })
}

/* socket.asyncTimeout=function(ms){
  return new Promise((resolve) => {
    var tm=setTimeout(resolve, ms);
    tm.unref();
  });
} */

socket.emitRepeat = function (event, data, cb) {
  if (!(socket.connected && socket.ready)) {
    setTimeout(() => {
      socket.emitRepeat(event, data, cb)
    }, 1000)
    return
  }

  var skipAnswer = false
  var cmdTimeout = setTimeout(() => {
    skipAnswer = true
    setTimeout(() => {
      socket.emitRepeat(event, data, cb)
    }, 5000)
  }, data.timeout || 10000)

  socket.emit(event, data || {}, (err, ret) => {
    cmdTimeout && clearTimeout(cmdTimeout)
    if (skipAnswer) {
      console.log('Server return answer after timeout')
      return
    }
    cb && cb(err, ret)
  })
}

socket.asyncEmitRepeat = function (event, data) {
  return new Promise((resolve, reject) => {
    socket.emitRepeat(event, data, (err, ret) => {
      if (!err) return resolve(ret)
      reject(err)
    })
  })
}

socket.open()
