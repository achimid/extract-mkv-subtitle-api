const { translateDialogues } = require('./src/extract/subtitle')

const CHAR_TMP = '#'
const options = {from: 'en', to: 'pt'}
const texto = [
    "So now Brother Helmut's \\N married \\N into a knightdom, too. \\N",
    "Isn't this Heine's {\i1}Buch Der Lieder{\i0} {sdjfghsfd} {isudf9sd9fgs9d899sdf9 } {\i1}?"
]

const translate = async (dialogues) => translateDialogues(dialogues, options)

const TAG_REGEX = /\{(.*?)\}/g

const getTags = (dialogues) => {
    return [...(new Set(dialogues.map(text => {
        const tags = text.match(TAG_REGEX)
        return tags ? [...text.match(TAG_REGEX)] : []
    }).flat()))]
}

const getTagsDict = (dialogues) => {
    const tags = getTags(dialogues)
    let size = tags.length
    const dict = tags.map((tag, index) => { 
        const tmp = CHAR_TMP.repeat(size - index)
        return { tag, tmp}
    })
    console.log(dict)
    return dict
}

const replaceTagToKey = (dict, dialogues) => {
    return dialogues.map(text => {
        let ret = text
        dict.map(({tag, tmp}) => {
            ret = ret.replace(new RegExp(tag, 'g'), tmp)
        })
        return ret
    })
}

const replaceKeyToTag = (dict, dialogues) => {
    return dialogues.map(text => {
        let ret = text
        dict.map(({tag, tmp}) => {
            ret = ret.replace(new RegExp(tmp, 'g'), tag)
        })
        return ret
    })
}


// const tagDict = getTagsDict(texto)
// console.log(tagDict)

// const v = replaceTagToKey(tagDict, texto)
// console.log(v)

// const r = replaceKeyToTag(tagDict, v)
// console.log(r)

translate(texto).then((dialogues) => {
    const fs = require('fs');
    const os = require('os')
    fs.writeFile('helloworld.txt', dialogues.join(os.EOL), function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });
})

// console.log('So now Brother Helmuts \\Nmarried into a knightdom, too.')



// const finded = [...texto.match(/\{(.*?)\}/g)]

// finded.forEach((v, i) => {
//     v.replace(new RegExp(v, '/g'), `{${i}}`)
// })