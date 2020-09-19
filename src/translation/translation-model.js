const config = require('../config/database-config')
const mongoose = require('../config/mongoose-multi-db')

const schema = mongoose.Schema({
    from: { 
        type: String,
        required: true
    },
    to: { 
        type: String,
        required: true 
    },
    original: { 
        type: String,
        required: true 
    },
    translated: { 
        type: String,
        required: true
    }
}, { versionKey: false, timestamps: false})

schema.index({ from: 1, to: 1, original: 1, translated: 1 }, { unique: true, background: true, dropDups: true });

const Translation = mongoose.model('translations', schema, config)
module.exports = Translation
