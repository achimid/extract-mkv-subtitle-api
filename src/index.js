require('dotenv').config()
const express = require('express')
const cors = require('cors')
const databaseInit = require('./config/database')

const app = express()

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')

app.use('/api/v1/healthcheck', require('./healthcheck/healthcheck'))
app.use('/api/v1/extract', require('./extract/extract-controller'))

databaseInit()

app.listen(process.env.PORT)
