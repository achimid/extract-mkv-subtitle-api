const router = require("express").Router()
const service = require('./extract-service')

router.post('/', async (req, res) => {
    const { magnetLink } = req.body
    const { langTo, langFrom } = req.query

    const data = {magnetLink, langTo, langFrom}

    service.saveExtraction(data)
        .then((data) => { res.json(data); return data; })        
        .then((data) => service.startExtraction(data))        

})

module.exports = router