
const SERVER_URL = 'http://localhost:9001'
const EXTRACTION_ID = '5e7e36c99385455cdda45ef0'

const socket = require('socket.io-client')(SERVER_URL, { transports: ['websocket'] })

socket.on('reconnect_attempt', () => { socket.io.opts.transports = ['polling', 'websocket']})

socket.on('connect', () => console.info('Socket conectado ao servidor'))

socket.on('disconnect', () => console.info('Socket desconectado do servidor'))

socket.on(EXTRACTION_ID, (data) => console.info(data))