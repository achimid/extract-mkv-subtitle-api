const mongoose = require("mongoose")

const schema = mongoose.Schema({
    magnetLink: { 
        type: String,
        required: true
    },
    langTo: { type: String },
    langFrom: { type: String },
    subtitles: [{
        fileName: { type: String }, 
        filePath: { type: String },
        infoHash: { type: String },
        magnetURI: { type: String },
        fileContent: { type: String },
        fileContentTranslated: { type: String },
    }]
}, { versionKey: false, timestamps: true})

const Extraction = mongoose.model("extractions", schema)

module.exports = Extraction
