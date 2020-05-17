const Translation = require('./translation-model')

const saveTranslations = async (data) => {

    const { langsTo, langFrom } = data.extraction
    if (!langsTo || langsTo.length <= 0) return Promise.resolve(data)

    console.info('Salvando traduções...', data.file)

    const translations = data.extraction.subtitles.map(sub => 
        sub.translations.map(translation => 
            translation.dialoguesMap.map(dialogue => 
                new Translation(Object.assign(dialogue.toObject(), {from: langFrom || 'en'}))
            )
        )
        
    ).flat().flat()

    Translation.insertMany(translations, { ordered: false })
            .then(() => console.info('Traduções salvas...', data.file))
            .catch(() => console.error('Erro ao salvar traduções duplicadas... silent...'))

    return data
}

const translateMultiples = async (dialogues, {from = 'en', to}) => {

    const queryOr = dialogues.map(original => { return { original, from, to} })
    const finded =  await Translation.find({ $or: queryOr})

    return Promise.resolve(finded)
}

module.exports = {
    saveTranslations,
    translateMultiples
}