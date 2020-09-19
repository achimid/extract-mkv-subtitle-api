require('dotenv').config()

const cors = require('cors')
const express = require('express')
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

registerSocketEvents(io)

server.listen(process.env.PORT)
