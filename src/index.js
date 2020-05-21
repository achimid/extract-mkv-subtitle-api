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

console.log('Redis URL >>>>>>>>>>>>>>', process.env.REDIS_URL)

server.listen(process.env.PORT)
