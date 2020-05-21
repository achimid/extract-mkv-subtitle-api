const fs = require('fs')
const os = require('os')
const replacement = require('./src/extract/replacement/common')
const { translateDialogues } = require('./src/extract/subtitle')


const main = async () => {

    const options = {from: 'en', to: 'pt'}
    const lines = fs.readFileSync('./00-original.txt', {encoding:'utf8', flag:'r'}).split(os.EOL)
    
    let dialogues = lines
    console.log(dialogues, ' <-- Original')
    
    const tagDict = replacement.getTagsDict(dialogues)
    
    dialogues = replacement.replacePreTranslations(dialogues)
    console.log(dialogues, ' <-- PreTranslations')

    dialogues = replacement.replaceTagToKey(tagDict, dialogues)
    console.log(dialogues, ' <-- Replaced Tag')

    dialogues = await translateDialogues(dialogues, options)
    console.log(dialogues, ' <-- Translated')
    
    dialogues = replacement.replaceKeyToTag(tagDict, dialogues)
    console.log(dialogues, ' <-- ReSet Tag')

    dialogues = replacement.replacePostTranslations(dialogues)
    console.log(dialogues, ' <-- PostTranslations')
    

    fs.writeFile('./00-translated.txt', dialogues.join(os.EOL), () => {})
}


main()