const mongoose = require("mongoose")

const schema = mongoose.Schema({
    from: { 
        type: String,
        required: true
    },
    to: { 
        type: String,
        required: true
    },
    original: { type: String },
    translated: { type: String }
}, { versionKey: false, timestamps: false})

const Extraction = mongoose.model("translations", schema)

module.exports = Extraction
