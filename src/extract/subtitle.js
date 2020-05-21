const fs = require('fs')
const path = require('path');
const translate = require('google-translate-open-api')
const os = require('os')
const decode = require('unescape')

const replacement = require('./replacement/common')

const LINE_SEPARATOR = os.EOL
const LINE_SEPARATOR_DOUBLE = LINE_SEPARATOR + LINE_SEPARATOR
const SCRIPT_PATH = `${process.cwd()}/scripts`


// =============== SSA/ASS Subtitle ===============
    
    const SUBTITLE_PART = 9

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
        const dialogues = dialoguesLines.map(getDialogueColumnSSA)
        
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




// =============== Subtitle Manipulation ===============

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

// =============== Subtitle Manipulation ===============






// =============== Files Manipulation / Utils ===============

    const extractSubtitlesFromVideo = async (data) => {  
        console.info('Executando script de extração de legenda...')  

        const script = `sh ${SCRIPT_PATH}/strExtract.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`
        await require("child_process").execSync(script)
        
        console.info('Execução do script de extração finalizada')
        return Promise.resolve(data)
    }

    const includeSubtitlesIntoVideo = async (data) => {
        console.info('Executando script de inclusão de legenda...', data.file)  

        const script = `sh ${SCRIPT_PATH}/strJoin.sh ${data.torrent.path} ${SCRIPT_PATH}/bin`
        await require("child_process").execSync(script)
        
        console.info('Execução do script de inclusao finalizada', data.file)
        return Promise.resolve(data)        
    }

    const listFilesOnDirRecursive = (dir, filter) => {
        if (!fs.existsSync(dir)) return
        
        const files = fs.readdirSync(dir)
        const finded = files.map(file => {
            const filename = path.join(dir,file)
            const stat = fs.lstatSync(filename)
    
            if (stat.isDirectory()){
                return listFilesOnDirRecursive(filename, filter)
            } else if (filename.indexOf(filter)>=0) {
                return filename
            }
        }).filter(d => d).flat()
    
        return finded
    }

    const findSubtitleFilesOnDir = (data) => listFilesOnDirRecursive(data.torrent.path, '.srt')

    const parseFileIntoSubtitleMap = (data) => (f) => { return {
        fileName: path.basename(f), 
        filePath: path.dirname(f),
        infoHash: data.torrent.infoHash,
        magnetURI: data.torrent.magnetURI,
        fileContent: fs.readFileSync(f, 'utf8')
    }}

    const getSubtitlesFromFiles = async (data) => {
        console.info('Obtendo leganda dos arquivos de leganda...')
    
        const subtitles = findSubtitleFilesOnDir(data).map(parseFileIntoSubtitleMap(data))
        data.extraction.subtitles = subtitles
    
        return Promise.resolve(data)
    }

// =============== Files Manipulation / Utils ===============




// =============== Dialogue and Subtitle Translation ===============

    const translateDialogues = async (originalDialogues, {from, to}) => {
        console.info(`Efetuando tradução dos dialogos (google-API) (${from || 'en'}-${to})...`)

        const options = {tld: 'cn', from, to}


        let dialogues = originalDialogues
        
        const tagDict = replacement.getTagsDict(dialogues)
        
        dialogues = replacement.replacePreTranslations(dialogues)
        // console.log(dialogues, ' <-- PreTranslations')

        dialogues = replacement.replaceTagToKey(tagDict, dialogues)
        // console.log(dialogues, ' <-- Replaced Tag')
        

        const translationResponse = await translate.default(dialogues, options)
        const content = translationResponse.data[0]
        const translations = translate.parseMultiple(content)
        dialogues = translations.map(s => decode(s))
        // console.log(dialogues, ' <-- Translated')
        
        dialogues = replacement.replacePostTranslations(dialogues)
        console.log(dialogues, ' <-- PostTranslations')

        dialogues = replacement.replaceKeyToTag(tagDict, dialogues)
        console.log(dialogues, ' <-- ReSet Tag')

        return dialogues
    }

    const translateSubtitleToMultipleLanguages = async (sub, langsTo, from) => {
        
        const {fileContent} = sub
        const {dialoguesLines, dialogues} = loadSubtitle(fileContent)

        if (!dialogues || dialogues.length <= 0) return Promise.resolve(sub)

        const translations = await Promise.all(
            langsTo
                .filter(v => v)
                .map(async (to) => {
                
                const translations = await translateDialogues(dialogues, { from, to })

                const dialoguesMap = dialogues.map((original, index) => {
                    const translated = translations[index]
                    const line = dialoguesLines[index]
                    return {line, original, translated, to, index}
                })

                const editedFileContent = buildSubtitle(fileContent, dialoguesMap)

                return { content: editedFileContent, dialoguesMap, to }
            })
        )

        sub.translations = translations        
        return Promise.resolve(sub)
    }

    const translateSubtitles = async (data) => {
        console.info('Começando Tradução das legendas...', data.file)

        const { langsTo, langFrom } = data.extraction

        if (!langsTo || langsTo.length <= 0) {
            console.info('Nenhuma liguagem para tradução encontrada, tradução abortada...')
            return Promise.resolve(data)
        }

        const subtitles = await Promise.all(data.extraction.subtitles
            .map(sub => translateSubtitleToMultipleLanguages(sub, langsTo, langFrom)))
        
        data.extraction.subtitles = subtitles
        
        console.info('Terminando tradução das legendas...', data.file)
        return Promise.resolve(data)
    }

// =============== Dialogue and Subtitle Translation ===============


module.exports = {
    translateSubtitles,
    extractSubtitlesFromVideo,
    includeSubtitlesIntoVideo,
    getSubtitlesFromFiles,
    translateDialogues
}