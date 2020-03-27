const router = require("express").Router()
const service = require('./extract-service')

router.post('/', async (req, res) => {
    const { magnetLink, langTo, langFrom, ignoreCache } = req.body
    
    const extraction = {magnetLink, langTo, langFrom, ignoreCache}

    service.saveExtraction({ extraction })
        .then((data) => { res.json(data.extraction); return data;})
        .then((data) => service.startExtraction(data))        

})

router.get('/:id', async (req, res) => {
    service.findById(req.params.id)
        .then((data) => res.json(data))
        .catch(console.error)
})

module.exports = router