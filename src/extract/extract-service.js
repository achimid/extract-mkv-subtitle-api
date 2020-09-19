const Extraction = require('./extract-model')
const subtitle = require('./subtitle')
const torrent = require('./torrent')
const kue = require('kue')
const { notifySocket } = require('../socket/socket-events')

const executionJobs = kue.createQueue({ redis: process.env.REDIS_URL})
const EXTRACT_EVENT = 'extract'

// Executando JOB de extraction
executionJobs.process(EXTRACT_EVENT, process.env.JOB_CONCURRENCY, async (job, done) => {
    const extraction = await Extraction.findById(job.data.extractionId)
    return torrent.startDownload({ extraction })
        .then(subtitle.extractSubtitlesFromVideo)
        .then(subtitle.getSubtitlesFromFiles)
        .then(subtitle.translateSubtitles)
        .then(saveExtraction)
        .then(torrent.removeTorrentFromClient)
        .then(torrent.removeFileFromFileSystem)
        .then(notifyClientDone)
        .catch((err) => console.error('Erro de execução: ', err))
        .finally(done)
    
})

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
        if (!extraction.id) extraction = Extraction.get(extraction)
        await extraction.save()

        console.info('Adicionando nova extração a fila')

        // Adicionando execução na fila de Job, para processamento paralelo controlado
        executionJobs
            .create(EXTRACT_EVENT, {extractionId: extraction.id})
            .removeOnComplete(true)
            .save()
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
    saveOrGetExtraction,
    findById
}