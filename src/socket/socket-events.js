
const onConnect = (socket) => console.info(`Socket client ${socket.id} conectado...`)

const onDisconnect = (socket) => () => console.info(`Socket client ${socket.id} desconectado...`)

const registerSocketEvents = (io) => io.on('connection', (socket) => {
    onConnect(socket)
    socket.on('disconnect', onDisconnect(socket))
})

const notifySocket = (id, data) => global.socket.emit(id, data)

module.exports = {
    registerSocketEvents,
    notifySocket
}