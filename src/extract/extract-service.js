const Extraction = require('./extract-model')
const subtitle = require('./subtitle')
const torrent = require('./torrent')
const translation = require('../translation/translation-service')
const { notifySocket } = require('../socket/socket-events')

const startExtraction = (data) => {
    if (data.extraction.isCached) return

    return torrent.startDownload(data)
        .then(subtitle.extractSubtitles)
        .then(subtitle.getSubtitlesFiles)
        .then(subtitle.translateSubtitle)
        .then(saveExtraction)
        .then(translation.saveTranslations)
        .then(torrent.removeTorrentFromClient)
        .then(torrent.removeFileFromFileSystem)
        .then(notifyClientDone)
}

const findExtraction = (data) => {
    if (data.extraction.ignoreCache != 'false') return data.extraction

    const query = {
        magnetLink: data.extraction.magnetLink, 
        langsTo: data.extraction.langsTo, 
        subtitles: { 
            $exists: true, 
            $not: {
                $size: 0
            }
        }
    }
    
    return Extraction.findOne(query).then((extraction) => {        
        return extraction ? Object.assign(extraction, { isCached: true}) :  data.extraction
    })
}

const saveExtraction = async (data) => {
    console.info('Salvando extração...')
    data.extraction.save()
    
    return Promise.resolve(data)
}

const saveOrGetExtraction = async (data) => {
    
    let extraction = await findExtraction(data)

    if (!extraction.isCached) {
        if (!extraction.id) extraction = new Extraction(extraction)
        extraction.save()
    }

    return Object.assign(data, { extraction })
}

const findById = (id) => Extraction.findById(id)

const notifyClientDone = async (data) => {
    console.info('Notificando evento de DONE')
    
    Promise.resolve(data)

    notifySocket(data.extraction.id, { body: data.extraction, status: 'DONE' })
}

module.exports = {
    startExtraction,
    saveOrGetExtraction,
    findById
}