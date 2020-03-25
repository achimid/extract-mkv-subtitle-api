require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const cron = require('node-cron')

const { 
    extractSubtitles, 
    getSubtitlesFiles
} = require('./subtitle')

const { 
    removeFileFromFileSystem, 
    removeTorrentFromClient, 
    startDownload
} = require('./torrent')

const app = express()

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')

// Keep API Alive
cron.schedule(process.env.CRON_TIME_DEFAULT , () => fetch(process.env.API_URL).then(() => console.log('ping...')))

// Health Check Endpoint
app.get('/api/v1', async (req, res) => { res.json({status: 'ok'}) })

// Extract Subtitle Endpoint
app.post('/api/v1/extract', async (req, res) => {
    const { magnetLink } = req.body
    const { langTo, langFrom, format } = req.query

    const data = {magnetLink, langTo, langFrom, format}

    startDownload(data)
        .then(extractSubtitles)
        .then(getSubtitlesFiles)
        .then((data) => {
            res.json({ subtitles: data.subtitles })
            return data
        })
        .then(removeTorrentFromClient)
        .then(removeFileFromFileSystem)
})


app.listen(process.env.PORT)
