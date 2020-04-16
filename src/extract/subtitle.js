const fs = require('fs')
const path = require('path');
const translate = require('google-translate-open-api')
const os = require('os')
const decode = require('unescape')
const translationsService = require('../translation/translation-service')

const LINE_SEPARATOR = os.EOL
const SCRIPT_PATH = `${process.cwd()}/scripts`
const SUBTITLE_PART = 9

const REGEX_REMOVE = [
    {old: '\\N', neww: ' '},
    {old: '\\i0}', neww: ''},
    {old: '{\\i1}', neww: ''},
    // {old: '<i>', neww: ''},
    // {old: '</i>', neww: ''},
    // {old: '<b>', neww: ''},
    // {old: '</b>', neww: ''},
]

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

const replaceEspecialChars = (d) => {
    let value = d
    for (const rg of REGEX_REMOVE) { value = value.split(rg.old).join(rg.neww) }
    return value
}

const replaceLastPart = (newPart, string) => {
    const parts = string.split(',')

    if (parts === -1)
        return string
        
    const primeiraPart = parts.splice(0, SUBTITLE_PART).join(',')
    return primeiraPart + ',' + newPart
}

const getLastPart = (string) => {
    const parts = string.split(',')

    if (parts === -1)
        return string
    
    let ultimaPart = parts.splice(SUBTITLE_PART, parts.length).join(',')
    return ultimaPart
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

const getSSADialogues = (lines) => {

    console.info('Extraindo dialogos do arquivo formadato...')
    
    const dialoguesLines = lines.filter(l => l.indexOf('Dialogue') == 0)
    const dialogues = dialoguesLines.map(getLastPart).map(replaceEspecialChars)
    
    return {dialoguesLines, dialogues}
}

// To use
const getSrtDialogues = (content) => {
    return content.split('\n\n').map(l => l.split('\n'))
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


const getEditedFileContent = (lines, dialoguesMap) => {
    console.info('Efetuando edição do arquivo original de legandas...')

    return lines.map(line => {
        const finded = dialoguesMap.filter(m => m.line === line)
        const hasLineTranslated = finded.length > 0

        if (!hasLineTranslated) return line
        
        const firstTranslation = finded[0]
        return replaceLastPart(firstTranslation.translated, firstTranslation.line)
    })
}


const multipleTranslations = async (sub, langsTo, from) => {
    const {fileContent} = sub
    const lines = fileContent.split(LINE_SEPARATOR)
    // const lines = fileContent.split('\\n')
    const {dialoguesLines, dialogues} = getSSADialogues(lines)

    if (!dialogues || dialogues.length <= 0) return Promise.resolve(sub)

    const translationsPromises = langsTo.map(async (to) => {
        const languages = { from, to }

        const translations = await translateDialogue(dialogues, languages)

        console.info('Gerando map de dialogos')
        const dialoguesMap = dialogues.map((original, index) => {
            const translated = translations[index]
            const line = dialoguesLines[index]
            return {line, original, translated, to, index}
        })

        const editedFileContent = getEditedFileContent(lines, dialoguesMap).join(LINE_SEPARATOR)

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