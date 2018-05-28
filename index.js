'use strict'

const net = require('net')
// const JsonSocket = require('json-socket')
const settings = require('standard-settings').getSettings()
const vorpal = require('vorpal')()

var port = settings.service['tcp-server'].port
var host = settings.service['tcp-server'].host
var defaultMsg = settings.messages[0]
var socket = new net.Socket()
let retryCount = 0
let reconnectTimetout = null
const { SpacebroClient } = require('spacebro-client')

const spaceClient = new SpacebroClient({
  host: settings.service.spacebro.host,
  port: settings.service.spacebro.port,
  client: {name: settings.service.spacebro.client.name},
  channelName: settings.service.spacebro.channelName
})

socket.on('error', (err) => {
  console.error(err)
})

socket.on('end', () => {
  console.log('end')
  socket.end()
  reconnect()
})

let reconnect = () => {
  if (retryCount < settings.reconnect.maxRetry) {
    console.log(`⏱ - ${retryCount}/${settings.reconnect.maxRetry} - trying to reconnect...`)
    socket.connect(port, host)
    clearTimeout(reconnectTimetout)
    reconnectTimetout = setTimeout(() => { reconnect() }, settings.reconnect.time * (retryCount + 1) * 1000)
    retryCount++
  } else {
    console.error(`Exit, max number of retries (${settings.reconnect.maxRetry}) to connect reached.`)
    process.exit(1)
  }
}

vorpal
  .command('test')
  .description('Compute a self test of the machine')
  .action((args, cb) => {
    socket.write('{"SelfTest"}')
    cb()
  })

vorpal
.delimiter('tcp-bro$')
.show()

socket.on('connect', function () {
  console.log('✨ - connected')
  clearTimeout(reconnectTimetout)
  retryCount = 0
  socket.write(JSON.stringify(defaultMsg))
})

socket.on('data', (data) => {
  try {
    let JSONresponse = JSON.parse(data.toString().replace(/'/g, '"'))
    console.log(JSONresponse)
    if (JSONresponse['msg']) {
      if (JSONresponse['msg'] === 'success') {
        console.log('emit process:end')
        spaceClient.emit('process:end', {'val': JSONresponse['msg']})
      } else {
        console.log('emit process:error')
        spaceClient.emit('process:error', {'val': JSONresponse['msg']})
      }
    } else {
      console.log('emit process:error')
      spaceClient.emit('process:error', {'val': JSONresponse})
    }
  } catch (err) {
    console.error(err)
    console.log('raw data.toString():', data.toString())
    spaceClient.emit('process:error', {'val': 'errorInDataParsing'})
  }
})

spaceClient.on('dispense', (data) => {
  console.log('dispense', data)
  socket.write(JSON.stringify({'dispense': data}))
})

spaceClient.on('enable', (data) => {
  console.log('enable', data)
  socket.write(JSON.stringify({'action': 'enable'}))
})

spaceClient.on('inventory', (data) => {
  console.log('inventory', data)
  socket.write(JSON.stringify({'action': 'inventory'}))
})

reconnect()
