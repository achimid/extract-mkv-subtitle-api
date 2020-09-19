const escapeStringRegexp = require('escape-string-regexp');

const CHAR_TMP = '#'
const TAG_REGEX = /\{(.*?)\}/gi


const REGEX_REPLACE_POST_TRANSLATION = [
    {old: '\\\\\\\\', neww: '\\'},
    {old: '# #', neww: '##'},
    {old: escapeStringRegexp('. . . '), neww: '... '},
    {old: escapeStringRegexp(' ...'), neww: '...'},
    {old: escapeStringRegexp('...'), neww: '... '},
    {old: escapeStringRegexp('...  '), neww: '... '},
    {old: escapeStringRegexp('! ?'), neww: '!?'},
    {old: escapeStringRegexp('? !'), neww: '?!'},
]

const REGEX_REPLACE_PRE_TRANSLATION = [
    // {old: '# #', neww: '##'},
]

const replacePostTranslations = (dialogues) => dialogues.map(aplyRegexPostTranslation)

const aplyRegexPostTranslation = (dialogue) => {
    let tmp =  dialogue

    // Adicionando espaço depois de caracteres especiais
    var separators = [',', '.',  ':', '?', '!'];

    for (let i = 0; i < separators.length; i++) { 
        tmp = tmp.replace(new RegExp(escapeStringRegexp(separators[i]), "g"),separators[i] + " ")
    }

    for (let i = 0; i < separators.length; i++) { 
        tmp = tmp.replace(new RegExp(escapeStringRegexp(separators[i] + '  '), "g"),separators[i] + " ")
    }
    REGEX_REPLACE_POST_TRANSLATION.map(reg => { tmp = tmp.replace(new RegExp(reg.old, 'gi'), reg.neww) })
    
    if (tmp.startsWith('...')) tmp = tmp.replace('... ', '...')

    return tmp.trim()
}

const replacePreTranslations = (dialogues) => dialogues.map(aplyRegexPreTranslation)

const aplyRegexPreTranslation = (dialogue) => {
    let tmp =  dialogue
    REGEX_REPLACE_PRE_TRANSLATION.map(reg => { tmp = tmp.replace(new RegExp(reg.old, 'gi'), reg.neww) })
    return tmp        
}    



// =============== Subtitle Tags Handler ===============
const getTags = (dialogues) => {
    return [ '\\N', ...(new Set(dialogues.map(text => {
        const tags = text.match(TAG_REGEX)
        return tags ? [...text.match(TAG_REGEX)] : []
    }).flat()))]
}

const getTagsDict = (dialogues) => {
    const tags = getTags(dialogues)
    const dict = tags.map((tag, index) => { 
        const tmp = CHAR_TMP.repeat(index +1)
        return { tag, tmp: `"${tmp}"`}
    })
    return dict
}

const replaceTagToKey = (dict, dialogues) => {
    return dialogues.map(text => {
        let ret = text
        dict.forEach(({tag, tmp}) => {
            ret = ret.replace(new RegExp(escapeStringRegexp(tag), 'gi'), tmp)
        })
        return ret
    })
}

const replaceKeyToTag = (dict, dialogues) => {
    return dialogues.map(text => {
        let ret = text
        dict.forEach(({tag, tmp}) => {
            ret = ret.replace(new RegExp(tmp, 'gi'), tag)
        })
        return ret
    })
}

// =============== Subtitle Tags Handler ===============

module.exports = {
    replacePreTranslations,
    replacePostTranslations,
    getTagsDict,
    replaceTagToKey,
    replaceKeyToTag
}