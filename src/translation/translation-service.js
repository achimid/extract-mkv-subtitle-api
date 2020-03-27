const Translation = require('./translation-model')

const saveTranslations = async (data) => {

    if (!data.extraction.langTo) return Promise.resolve(data)

    console.info('Salvando traduções...')

    const lang = {
        from: data.extraction.langFrom || 'en',
        to: data.extraction.langTo,
    }

    const translations = data.extraction.subtitles.map(sub => 
        sub.dialoguesMap.map(dialogue => 
            new Translation(Object.assign(lang, dialogue))
        )
    ).flat()

    Translation.insertMany(translations, { ordered: false })
            .then(() => console.info('Traduções salvas...'))
            .catch(() => console.error('Erro ao salvar traduções duplicadas... silent...'))

    return data
}

module.exports = {
    saveTranslations
}