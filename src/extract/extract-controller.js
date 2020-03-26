const router = require("express").Router()
const service = require('./extract-service')

router.post('/', async (req, res) => {
    const { magnetLink } = req.body
    const { langTo, langFrom } = req.query

    const extraction = {magnetLink, langTo, langFrom}

    service.saveExtraction({ extraction })
        .then((data) => { res.json(data.extraction); return data;})
        .then((data) => service.startExtraction(data))        

})

module.exports = router