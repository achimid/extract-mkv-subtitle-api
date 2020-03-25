require('dotenv').config()

const mv = require('mv');
const rimraf = require("rimraf");
const WebTorrent = require('webtorrent')
const client = new WebTorrent()
const utils = require('./utils')

const startDownload = (data) => new Promise((resolve) => {
    if (!data.magnetLink) return
        
    client.add(data.magnetLink, (torrent) => {
        const obj = Object.assign({ client, torrent, pathNew: process.env.DOWNLOAD_FOLDER }, data )
        startProgressLog(obj)
            .then(onStartDownload)
            .then(whenTorrentDone)
            .then(onFinishDownload)
            .then(stopProgressLog)
            .then(resolve)
            .catch((err) => console.error('Erro ao efetuar download', err))
    })
})

const moveFileFromFileSystem = (wrapObj) => new Promise((resolve, reject) => {
    console.info('Movendo arquivos...')
    const source = wrapObj.torrent.path + '/' + wrapObj.torrent.name
    const dest = wrapObj.pathNew + wrapObj.torrent.name
    mv(source, dest, (err) => err ?  reject(err) : resolve(Object.assign(wrapObj, {dest})))
})

const removeTorrentFromClient = (wrapObj) => new Promise((resolve, reject) => {
    console.info('Removendo torrent do downloader...')
    wrapObj.client.remove(wrapObj.torrent.infoHash, (err) => err ?  reject(err) : resolve(wrapObj))
})

const removeFileFromFileSystem = (wrapObj) => new Promise((resolve, reject) => {
    console.info('Removendo arquivos...')
    rimraf(wrapObj.torrent.path, (err) => err ?  reject(err) : resolve(wrapObj))
})

const whenTorrentDone = (wrapObj) => new Promise((resolve, reject) => {
    wrapObj.torrent.on('done', () => {
        console.info('Download do torrent finalizado...')
        resolve(wrapObj)
    })
})

const startProgressLog = async (wrapObj) => {
    wrapObj.progressLog = setInterval(() => console.log(`Progresso [${(wrapObj.torrent.progress * 100).toFixed(0)}%] [${utils.bytesToSize(wrapObj.torrent.downloadSpeed)}/s] [${utils.bytesToSize(wrapObj.torrent.uploadSpeed)}/s]`), 3000)
    wrapObj.startTime = Date.now()
    return Promise.resolve(wrapObj)
}

const onStartDownload = async (wrapObj) => {
    wrapObj.torrent.files.map((file) => {
        console.info('Iniciando download:', file.path)        
        notifyEvent({ title: 'Iniciando download', message: file.path })
    })
    return Promise.resolve(wrapObj)
}

const onFinishDownload = async (wrapObj) => {
    wrapObj.torrent.files.map((file) => {
        console.info('Download concluido:', file.path)
        console.info(`Download time: ${utils.msToFormatedTime(Date.now() - wrapObj.startTime)}s`)
        notifyEvent({ title: 'Download concluido', message: file.path })
    })

    Object.assign(wrapObj, { file: `${wrapObj.torrent.path}/${wrapObj.torrent.name}`})

    return Promise.resolve(wrapObj)
}

const stopProgressLog = async (wrapObj) => {
    clearInterval(wrapObj.progressLog);
    delete wrapObj.progressLog
    return Promise.resolve(wrapObj)
}

const notifyEvent = ({title, message}) => {
    // TODO
}

module.exports = {
    startDownload,
    removeTorrentFromClient,
    removeFileFromFileSystem
}