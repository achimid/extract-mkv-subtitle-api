
const SERVER_URL = 'http://localhost:9001'
const EXTRACTION_ID = '5e7e3bcebc9a6d63b1e09406'

const socket = require('socket.io-client')(SERVER_URL, { transports: ['websocket'] })

socket.on('reconnect_attempt', () => { socket.io.opts.transports = ['polling', 'websocket']})

socket.on('connect', () => console.info('Socket conectado ao servidor'))

socket.on('disconnect', () => console.info('Socket desconectado do servidor'))

// socket.on(`${EXTRACTION_ID}`, (data) => console.info(data))
// Recebe a notificação de todos os tipos de eventos. (Atenção, cada evento pode ter um corpo de mensagem diferente)

// socket.on(`${EXTRACTION_ID}_STARTED`, (data) => console.info(data))
// Recebe a notificação quando o download da extração foi iniciado

// socket.on(`${EXTRACTION_ID}_DOWNLOADING`, (data) => console.info(data))
// Recebe a notificação enquanto o download esta sendo realizado, em uma frequencia de 2s entre as notificações

// socket.on(`${EXTRACTION_ID}_FINISHED`, (data) => console.info(data))
// Recebe a notificação quando o download foi finalizado

// socket.on(`${EXTRACTION_ID}_DONE`, (data) => console.info(data))
// Recebe a notificação quando toda a operação foi realizada (download, extração, tradução, limpeza)