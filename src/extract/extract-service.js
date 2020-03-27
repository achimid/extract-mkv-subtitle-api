const Extraction = require('./extract-model')
const subtitle = require('./subtitle')
const torrent = require('./torrent')
const translation = require('../translation/translation-service')

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
}

const findExtraction = (data) => {
    if (data.extraction.ignoreCache) return data.extraction

    return Extraction.findOne(data.extraction).then((extraction) => {        
        return extraction ? Object.assign(extraction, { isCached: true}) :  data.extraction
    })
}

const saveExtraction = async (data) => {
    
    let extraction = await findExtraction(data)

    if (!extraction.isCached) {
        if (!extraction.id) extraction = new Extraction(extraction)
        extraction.save()
    }

    return Object.assign(data, { extraction })
}

const findById = (id) => Extraction.findById(id)

module.exports = {
    startExtraction,
    saveExtraction,
    findById
}