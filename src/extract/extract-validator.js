const Joi = require('@hapi/joi');

const validate = (req, res, next) => {
    const schema = Joi.object({
        magnetLink: Joi.string().pattern(/magnet:\?xt=urn:/i),
        langTo: Joi.string().allow('').optional(),
        langFrom: Joi.string().allow('').optional(),
        ignoreCache: Joi.boolean().allow('').optional()    
    })

    const validation =  req.method == "GET" ? schema.validate(req.query) : schema.validate(req.body)

    if (validation.error) {
        res.status(400).json({errors: validation.error})
        return 
    }

    next()
}

module.exports = {
    validate
}