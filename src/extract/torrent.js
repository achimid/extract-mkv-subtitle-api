require('dotenv').config()

const mv = require('mv');
const rimraf = require("rimraf");
const WebTorrent = require('webtorrent')
const client = new WebTorrent({ maxConns: 200 })
const utils = require('./utils')
const { notifySocket } = require('../socket/socket-events')

const startDownload = (data) => new Promise((resolve) => {
    if (!data.extraction.magnetLink) return

    const isDuplicated = client.torrents.filter(({xt}) => data.extraction.magnetLink.indexOf(xt) >= 0).length > 0
    if (isDuplicated) return // TODO: Responder o processo do download em execução
    
    client.add(data.extraction.magnetLink, { maxWebConns: 50 }, (torrent) => {
        const obj = Object.assign({ client, torrent, pathNew: process.env.DOWNLOAD_FOLDER }, data )
        startProgressLog(obj)
            .then(onStartDownload)
            .then(whenTorrentDone)
            .then(onFinishDownload)
            .then(stopProgressLog)
            .then(resolve)
    })
})

const moveFileFromFileSystem = (data) => new Promise((resolve, reject) => {
    console.info('Movendo arquivos...')
    const source = data.torrent.path + '/' + data.torrent.name
    const dest = data.pathNew + data.torrent.name
    mv(source, dest, (err) => err ?  reject(err) : resolve(Object.assign(data, {dest})))
})

const removeTorrentFromClient = (data) => new Promise((resolve, reject) => {
    console.info('Removendo torrent do downloader...')        
    data.client.remove(data.torrent.infoHash, (err) => err ?  reject(err) : resolve(data))    
})

const removeFileFromFileSystem = (data) => new Promise((resolve, reject) => {
    if (process.env.DELETE_FILE == 'false') return resolve(data)
    console.info('Removendo arquivos...')
    rimraf(data.torrent.path, (err) => err ?  reject(err) : resolve(data))
})

const whenTorrentDone = (data) => new Promise((resolve, reject) => {
    if (data.torrent.done) {
        console.info('Download do torrent finalizado... (cached)')
        return resolve(data)
    }

    data.torrent.on('done', () => {
        console.info('Download do torrent finalizado...')
        resolve(data)
    })
})

const startProgressLog = async (data) => {
    data.progressLog = setInterval(() => {
        
        const status = {
            extra: { 
                progress: (data.torrent.progress * 100).toFixed(0),
                downloadSpeed: utils.bytesToSize(data.torrent.downloadSpeed),
                uploadSpeed: utils.bytesToSize(data.torrent.uploadSpeed),
            },
            status: 'DOWNLOADING'
        }

        const msg = `Progresso [${status.extra.progress}%] [${status.extra.downloadSpeed}/s] [${status.extra.uploadSpeed}/s] [${data.torrent.name}]`
        status.extra.msg = msg
        
        console.info(msg)        
        
        notifyClient(data, status)

    }, 2000)
    data.startTime = Date.now()
    return Promise.resolve(data)
}

const onStartDownload = async (data) => {
    data.torrent.files.map((file) => {
        console.info('Iniciando download:', file.path)

        const status = {
            extra: {
                file: file.name
            },
            status: "STARTED"
        }

        notifyClient(data, status)
    })
    return Promise.resolve(data)
}

const onFinishDownload = async (data) => {
    data.torrent.files.map((file) => {
        const downloadTime = `${utils.msToFormatedTime(Date.now() - data.startTime)}s`

        console.info('Download concluido:', file.path)
        console.info(`Download time: ${downloadTime}`)
        
        const status = {
            extra: {
                file: file.name,
                downloadTime
            },
            status: "FINISHED"
        }

        notifyClient(data, status)
    })

    Object.assign(data, { file: `${data.torrent.path}/${data.torrent.name}`})

    return Promise.resolve(data)
}

const stopProgressLog = async (data) => {
    clearInterval(data.progressLog)
    delete data.progressLog
    return Promise.resolve(data)
}

const notifyClient = async (data, status) => notifySocket(data.extraction.id, status)

module.exports = {
    startDownload,
    removeTorrentFromClient,
    removeFileFromFileSystem
}