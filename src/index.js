require('dotenv').config()
const express = require('express')
const cors = require('cors')
const databaseInit = require('./config/database')
const { registerSocketEvents } = require('./socket/socket-events')

const app = express()

const server = require('http').createServer(app)
const io = require('socket.io')(server, { origins: '*:*'})
global.socket = io

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')

app.use('/api/v1/healthcheck', require('./healthcheck/healthcheck'))
app.use('/api/v1/extract', require('./extract/extract-controller'))

databaseInit()
registerSocketEvents(io)

setInterval(() => {    
    console.log('>>>>>>>>>>>>>>> Memória Heap: ', process.memoryUsage().heapUsed / 1024 / 1024)
    console.log('>>>>>>>>>>>>>>> Memória Total: ', process.memoryUsage().heapTotal / 1024 / 1024)
}, 1000)


server.listen(process.env.PORT)
