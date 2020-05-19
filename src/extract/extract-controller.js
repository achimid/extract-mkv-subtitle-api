const router = require("express").Router()
const service = require('./extract-service')
const { validate } = require('./extract-validator')


router.post('/', validate, async (req, res) => {
    const { magnetLink, langsTo, langFrom, ignoreCache } = req.body
    
    const extraction = {magnetLink, langsTo, langFrom, ignoreCache}

    service.saveOrGetExtraction({ extraction })
        .then((data) => { res.json(data.extraction) })        

})

router.get('/:id', validate, async (req, res) => {
    service.findById(req.params.id)
        .then((data) => res.json(data))
        .catch(console.error)
})

module.exports = router