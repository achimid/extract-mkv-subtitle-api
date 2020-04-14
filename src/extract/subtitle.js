const fs = require('fs')
const path = require('path');
const translate = require('google-translate-open-api')
const os = require('os')
const decode = require('unescape');

const LINE_SEPARATOR = os.EOL
const SCRIPT_PATH = `${process.cwd()}/scripts`
const SUBTITLE_PART = 9

const REGEX_REMOVE = [
    {old: '\\N', neww: ' '},
    {old: '\\i0}', neww: ''},
    {old: '{\\i1}', neww: ''},
    {old: '<i>', neww: ''},
    {old: '</i>', neww: ''},
    {old: '<b>', neww: ''},
    {old: '</b>', neww: ''},
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
    console.info('Executando script de de extração de legenda...')  
    await require("child_process").execSync(`sh ${SCRIPT_PATH}/strExtract.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`)
    console.info('Execução do script finalizada')

    return Promise.resolve(data)
}

const getSubtitlesFiles = (data) => new Promise((resolve) => {
    console.info('Obtendo leganda dos arquivos de leganda...')

    fs.readdir(data.torrent.path, function (err, files) {
        if (err) return console.log('Unable to scan directory: ' + err)
        
        const subtitles = files
            .filter(f => f.indexOf('.srt') >= 0)
            .map((f) => {
                return {
                    fileName: f, 
                    filePath: path.join(data.torrent.path, f),
                    infoHash: data.torrent.infoHash,
                    magnetURI: data.torrent.magnetURI
                }
            })
            .map(fObj => Object.assign(fObj, {
                fileContent: fs.readFileSync(fObj.filePath, 'utf8')
            }))

        data.extraction.subtitles = subtitles
        resolve(data)
    })
})

const joinSubtitle = async (data) => {
    console.info('Executando script de inclusão de legenda...')  
    await require("child_process").execSync(`sh ${SCRIPT_PATH}/strJoin.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`)
    console.info('Execução do script finalizada')
    return Promise.resolve(data)
}

const getSSADialogues = (lines) => {

    console.info('Extraindo dialogos do arquivo formadato...')
    
    const dialoguesLines = lines.filter(l => l.indexOf('Dialogue') == 0)
    const dialogues = dialoguesLines.map(getLastPart).map(replaceEspecialChars)
    
    return {dialoguesLines, dialogues}
}

const translateDialogue = async (dialogues, {from, to}) => {

    console.info('Efetuando tradução dos dialogos (google-API) ...')

    const options = {tld: "cn", from, to}
    const translationResponse = await translate.default(dialogues, options)
    const content = translationResponse.data[0]
    const translations = translate.parseMultiple(content)
    const fixedTranslations = translations.map(fixPontuation).map(s => decode(s))

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


const translateSubtitle = async (data) => {
    console.info('Começando Tradução das legendas...')

    if (!data.extraction.langTo) return Promise.resolve(data)

    const langsTo = data.extraction.langTo.split('|')

    const subTranslationsPromises = data.extraction.subtitles.map(async (sub) => {
        const {fileContent} = sub
        // const lines = fileContent.split(LINE_SEPARATOR)
        const lines = fileContent.split("\\n")
        const {dialoguesLines, dialogues} = getSSADialogues(lines)

        const translationsPromises = langsTo.map(async (to) => {
            const languages = { from: data.extraction.langFrom, to }

            const translations = await translateDialogue(dialogues, languages)

            const dialoguesMap = dialogues.map((original, index) => {
                const translated = translations[index]
                const line = dialoguesLines[index]
                return {line, original, translated, to}
            })

            const editedFileContent = getEditedFileContent(lines, dialoguesMap).join(LINE_SEPARATOR)

            return { content: editedFileContent, dialoguesMap, to}
        })

        const translations = await Promise.all(translationsPromises)
        
        return Object.assign(sub, { translations })
    })

    const subtitles = await Promise.all(subTranslationsPromises)
    data.extraction.subtitles = subtitles

    console.info('Terminando tradução das legendas...')

    return Promise.resolve(data)
}

module.exports = {
    translateSubtitle,
    extractSubtitles,
    joinSubtitle,
    getSubtitlesFiles
}

// const writeSubtitleFile = (lines, outputFile) => {
//     fs.writeFileSync(outputFile, lines.join(LINE_SEPARATOR))    
// }

// const translateFile = async (inputFile, outputFile, languages) => {

//     console.info('Começando Tradução da legenda...')

//     const lines = readSubtitleFile(inputFile)
//     const {dialoguesLines, dialogues} = getSSADialogues(lines)
//     const translations = await translateDialogue(dialogues, languages)
    
//     const dialoguesMap = dialogues.map((original, index) => {
//         const translated = translations[index]
//         const line = dialoguesLines[index]
//         return {line, original, translated}
//     })

//     const editedLines = getEditedFileContent(lines, dialoguesMap)    

//     writeSubtitleFile(editedLines, outputFile)

// }


// const readSubtitleFile = (inputFile) => {
//     console.info('Lendo arquivo de legenda...')

//     const fileContent = fs.readFileSync(inputFile, 'utf8')
//     const lines = fileContent.split(LINE_SEPARATOR)
//     return lines
// }


// const path = '/home/lourran/Downloads/tmp'
// const input = `${path}/[HorribleSubs] Infinite Dendrogram - 10 [1080p].srt`
// const output = `${path}/[HorribleSubs] Infinite Dendrogram - 10 [1080p].srt`

// extractSubtitle(path)
//    .then(() => translateFile(input, output))
//    .then(() => joinSubtitle(path))

// translateFile('str.str', 'str-br.str')


// const data = {
//     torrent: { path: '/home/lourran/Downloads/tmp' }
// }

// extractSubtitles(data).then(getSubtitlesFiles)