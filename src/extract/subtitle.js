const fs = require('fs')
const path = require('path');
const translate = require('google-translate-open-api')
const os = require('os')
const decode = require('unescape')
const translationsService = require('../translation/translation-service')

const LINE_SEPARATOR = os.EOL
const LINE_SEPARATOR_DOUBLE = LINE_SEPARATOR + LINE_SEPARATOR
const SCRIPT_PATH = `${process.cwd()}/scripts`





// =============== SSA/ASS Subtitle ===============
    
    const SUBTITLE_PART = 9
    const REGEX_ESPECIAL_CHAR_TO_REMOVE = [
        {old: '\\N', neww: ' '},
        {old: '\\i0}', neww: ''},
        {old: '{\\i1}', neww: ''}
    ]

    const removeEspecialChars = (d) => {
        let value = d
        for (const rg of REGEX_ESPECIAL_CHAR_TO_REMOVE) { value = value.split(rg.old).join(rg.neww) }
        return value
    }

    const getDialogueColumnSSA = (dialogueLine) => {
        const cols = dialogueLine.split(',')    
        if (cols === -1) return dialogueLine
                
        return cols.splice(SUBTITLE_PART, cols.length).join(',')
    }


    const setDialogueColumnSSA = (newPart, string) => {
        const parts = string.split(',')    
        if (parts === -1) return string
        
        return parts.splice(0, SUBTITLE_PART).join(',') + ',' + newPart
    }

    const loadSubtitleSSA = (subtitleText) => {
        console.info('Extraindo dialogos do arquivo formatado (SSA/ASS)...')

        const lines = subtitleText.split(LINE_SEPARATOR)
        const dialoguesLines = lines.filter(l => l.indexOf('Dialogue') == 0)
        const dialogues = dialoguesLines.map(getDialogueColumnSSA).map(removeEspecialChars)
        
        return {dialoguesLines, dialogues}
    }

    const buildSubtitleSSA = (subtitleText, dialoguesMap) => {
        console.info('Efetuando edição do arquivo original de legandas (SSA/ASS)...')
    
        const lines = subtitleText.split(LINE_SEPARATOR)
        const replacedLines = lines.map(line => {
            const finded = dialoguesMap.filter(m => m.line === line)
            if (finded.length <= 0) return line

            return setDialogueColumnSSA(finded[0].translated, finded[0].line)
        })

        return replacedLines.join(LINE_SEPARATOR)
    }

// =============== SSA/ASS Subtitle ===============





// =============== SRT (SubRip) Subtitle ===============

    const loadSubtitleSRT = (subtitleText) => {
        console.info('Extraindo dialogos do arquivo formatado (SRT)...')

        const mapedSubtitle = subtitleText.split(LINE_SEPARATOR_DOUBLE).map(l => l.split(LINE_SEPARATOR))
        
        const dialoguesLines = mapedSubtitle.map(block => block.join(LINE_SEPARATOR))
        const dialogues = mapedSubtitle
            .map(block => block
                .map((line, index) => { return index > 1 ? line : null} ))
            .flat()
            .filter(v => v)
        
        
        return {dialoguesLines, dialogues}
    }

    const buildSubtitleSRT = (subtitleText, dialoguesMap) => {
        console.info('Efetuando edição do arquivo original de legandas (SRT)...')
    
        const lines = subtitleText.split(LINE_SEPARATOR)
        const replacedLines = lines.map(line => {
            const finded = dialoguesMap.filter(m => m.original === line)
            return finded.length <= 0 ? line : finded[0].translated || finded[0].original
        })

        return replacedLines.join(LINE_SEPARATOR)
    }

// =============== SRT (SubRip) Subtitle ===============




// =============== Subtitle ===============


    const SUBTITLE_TYPE_MAPPER = {
        loader: {
            ssa: loadSubtitleSSA,
            srt: loadSubtitleSRT
        },
        builder: {
            ssa: buildSubtitleSSA,
            srt: buildSubtitleSRT
        }
    }

    const getSubtitleType = (subtitleText) => {
        if (subtitleText.indexOf('﻿[Script Info]') == 0) {
            return 'ssa'
        } else if (subtitleText.indexOf('-->') > 0) {
            return 'srt'
        }
        return 'default'
    }

    const loadSubtitle = (subtitleText) => SUBTITLE_TYPE_MAPPER.loader[getSubtitleType(subtitleText)](subtitleText)

    const buildSubtitle = (subtitleText, dialoguesMap) => SUBTITLE_TYPE_MAPPER.builder[getSubtitleType(subtitleText)](subtitleText, dialoguesMap)


// =============== Subtitle ===============










const fixPontuation = (str) => {
    // return str.replace(/[&\/\\#,+()$~%.'":*?!<>{}]/g, '$& ')
    //     .replace(/(\.\s){3}/g, '... ')
    //     .replace(/\?\s\!\s/g, '?! ')
    //     .replace(/\!\s\?\s/g, '!? ')
    //     .replace(/\s{2}/g, ' ')
    //     .replace(/\s+(?=[^{]*\})/g, "")
    //     .trim()
    return str
}








const extractSubtitles = async (data) => {  
    console.info('Executando script de de extração de legenda...', data.file)  
    await require("child_process").execSync(`sh ${SCRIPT_PATH}/strExtract.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`)
    console.info('Execução do script finalizada', data.file)

    return Promise.resolve(data)
}

const findFileOnDirRecursive = (dir, filter) => {
    if (!fs.existsSync(dir)) return
    
    const files = fs.readdirSync(dir)
    const finded = files.map(file => {
        const filename = path.join(dir,file)
        const stat = fs.lstatSync(filename)

        if (stat.isDirectory()){
            return findFileOnDirRecursive(filename, filter)
        } else if (filename.indexOf(filter)>=0) {
            return filename
        }
    }).filter(d => d).flat()

    return finded
}

const getSubtitlesFiles = (data) => new Promise((resolve) => {
    console.info('Obtendo leganda dos arquivos de leganda...', data.file)

    const filesSrt = findFileOnDirRecursive(data.torrent.path, '.srt')

    const subtitles = filesSrt.map(f => {
        return {
            fileName: path.basename(f), 
            filePath: path.dirname(f),
            infoHash: data.torrent.infoHash,
            magnetURI: data.torrent.magnetURI,
            fileContent: fs.readFileSync(f, 'utf8')
        }
    })

    data.extraction.subtitles = subtitles
    resolve(data)
})

const joinSubtitle = async (data) => {
    console.info('Executando script de inclusão de legenda...', data.file)  
    await require("child_process").execSync(`sh ${SCRIPT_PATH}/strJoin.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`)
    console.info('Execução do script finalizada', data.file)
    return Promise.resolve(data)
}


const translateDialogue = async (dialogues, {from, to}) => {

    console.info('Efetuando tradução dos dialogos (google-API) ...')

    const options = {tld: "cn", from, to}

    // Testing
    console.time('cached'+to)
    await translationsService.translateMultiples(dialogues, options)
    console.timeEnd('cached'+to)

    // Testing
    console.time('tradução'+to)

    const translationResponse = await translate.default(dialogues, options)
    const content = translationResponse.data[0]
    const translations = translate.parseMultiple(content)
    const fixedTranslations = translations.map(fixPontuation).map(s => decode(s))

    console.timeEnd('tradução'+to)

    return fixedTranslations 
}





const multipleTranslations = async (sub, langsTo, from) => {
    
    const {fileContent} = sub
    const {dialoguesLines, dialogues} = loadSubtitle(fileContent)

    if (!dialogues || dialogues.length <= 0) return Promise.resolve(sub)

    const translationsPromises = langsTo.filter(v => v).map(async (to) => {
        const languages = { from, to }

        const translations = await translateDialogue(dialogues, languages)

        console.info('Gerando map de dialogos')
        const dialoguesMap = dialogues.map((original, index) => {
            const translated = translations[index]
            const line = dialoguesLines[index]
            return {line, original, translated, to, index}
        })

        const editedFileContent = buildSubtitle(fileContent, dialoguesMap)

        return { content: editedFileContent, dialoguesMap, to }
    })

    const translations = await Promise.all(translationsPromises)
    
    return Promise.resolve(Object.assign(sub, { translations }))
}


const translateSubtitle = async (data) => {
    console.info('Começando Tradução das legendas...', data.file)

    const { langsTo, langFrom } = data.extraction
    if (!langsTo || langsTo.length <= 0) return Promise.resolve(data)

    const subTranslationsPromises = data.extraction.subtitles.map(sub => multipleTranslations(sub, langsTo, langFrom))

    data.extraction.subtitles = await Promise.all(subTranslationsPromises)

    console.info('Terminando tradução das legendas...', data.file)

    return Promise.resolve(data)
}

module.exports = {
    translateSubtitle,
    extractSubtitles,
    joinSubtitle,
    getSubtitlesFiles
}