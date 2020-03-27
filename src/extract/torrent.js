require('dotenv').config()

const mv = require('mv');
const rimraf = require("rimraf");
const WebTorrent = require('webtorrent')
const client = new WebTorrent({ maxConns: 200 })
const utils = require('./utils')

const startDownload = (data) => new Promise((resolve) => {
    if (!data.extraction.magnetLink) return
    
    client.add(data.extraction.magnetLink, { maxWebConns: 20 }, (torrent) => {
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
    console.info('Removendo arquivos...')
    rimraf(data.torrent.path, (err) => err ?  reject(err) : resolve(data))
})

const whenTorrentDone = (data) => new Promise((resolve, reject) => {
    data.torrent.on('done', () => {
        console.info('Download do torrent finalizado...')
        resolve(data)
    })
})

const startProgressLog = async (data) => {
    data.progressLog = setInterval(() => console.info(`Progresso [${(data.torrent.progress * 100).toFixed(0)}%] [${utils.bytesToSize(data.torrent.downloadSpeed)}/s] [${utils.bytesToSize(data.torrent.uploadSpeed)}/s]`), 3000)
    data.startTime = Date.now()
    return Promise.resolve(data)
}

const onStartDownload = async (data) => {
    data.torrent.files.map((file) => {
        console.info('Iniciando download:', file.path)        
        notifyEvent({ title: 'Iniciando download', message: file.path })
    })
    return Promise.resolve(data)
}

const onFinishDownload = async (data) => {
    data.torrent.files.map((file) => {
        console.info('Download concluido:', file.path)
        console.info(`Download time: ${utils.msToFormatedTime(Date.now() - data.startTime)}s`)
        notifyEvent({ title: 'Download concluido', message: file.path })
    })

    Object.assign(data, { file: `${data.torrent.path}/${data.torrent.name}`})

    return Promise.resolve(data)
}

const stopProgressLog = async (data) => {
    clearInterval(data.progressLog);
    delete data.progressLog
    return Promise.resolve(data)
}

const notifyEvent = ({title, message}) => {
    // TODO
}

module.exports = {
    startDownload,
    removeTorrentFromClient,
    removeFileFromFileSystem
}