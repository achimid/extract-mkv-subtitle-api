const router = require("express").Router()
const fetch = require('node-fetch')
const cron = require('node-cron')

// Keep API Alive
cron.schedule(process.env.CRON_TIME_DEFAULT , () => fetch(process.env.API_URL).then(() => console.log('ping...')))

// Health Check Endpoint
router.get('/health', async (req, res) => { res.json({status: 'ok'}) })

module.exports = router