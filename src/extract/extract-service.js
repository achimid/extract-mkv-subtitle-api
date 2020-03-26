const Extraction = require('./extract-model')
const subtitle = require('./subtitle')
const torrent = require('./torrent')

const startExtraction = (data) => torrent.startDownload(data)
    .then(subtitle.extractSubtitles)
    .then(subtitle.getSubtitlesFiles)
    .then(subtitle.translateSubtitle)    
    .then(saveExtraction)
    .then(torrent.removeTorrentFromClient)
    .then(torrent.removeFileFromFileSystem)

const saveExtraction = async (data) => {
    let { extraction } = data

    if (!extraction.id) extraction = new Extraction(extraction)
    extraction.save()

    return Object.assign(data, { extraction })
}

const findById = (id) => Extraction.findById(id)

module.exports = {
    startExtraction,
    saveExtraction,
    findById
}