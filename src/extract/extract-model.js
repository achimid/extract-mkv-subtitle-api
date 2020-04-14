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
        translations: [{
            dialogueMap: [{
                line: { type: String },
                original: { type: String },
                translated: { type: String },
                to: { type: String }
            }],
            fileContentTranslated: { type: String},
            to: { type: String}
        }],
    }],
    isCached: { type: Boolean },
}, { versionKey: false, timestamps: true})

const Extraction = mongoose.model("extractions", schema)

module.exports = Extraction
