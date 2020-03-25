const Extraction = require('./extract-model')
const subtitle = require('./subtitle')
const torrent = require('./torrent')

const startExtraction = (data) => torrent.startDownload(data)
    .then(subtitle.extractSubtitles)
    .then(subtitle.getSubtitlesFiles)
    .then(async (data) => {
        const ret = await saveExtraction(data)
        console.log(ret)
        return ret
    })
    .then(torrent.removeTorrentFromClient)
    .then(torrent.removeFileFromFileSystem)

const saveExtraction = async (data) => {
    let extraction = data
    const clientbkp = extraction.client
    
    delete extraction.client

    if (!data.id) extraction = new Extraction(data)
    extraction.save()

    extraction.client = clientbkp

    return extraction
}

module.exports = {
    startExtraction,
    saveExtraction
}