const { translateDialogues } = require('./src/extract/subtitle')
const wrap = require('word-wrap');


const CHAR_TMP = '#'
const options = {from: 'en', to: 'pt'}
const texto = [
    "So now Brother Helmut's \\Nmarried into a knightdom, too.",
    "That's how it was for you two as well, right?",
    "The only reason anyone would want to marry \\Nus is to become your relative, honestly.",
    "No, I'm sure that's not the only reason.",
    "You need to make a decision about the \\Ntournament soon, or you'll embarrass yourself.",
    "{\\fscx200\\fscy110\\clip(186,293,451,299)\\pos(320,330)\\c&H32A6DD&\\fad(396,1)}The 8th Son?\\N{\\fs10\\c&H32A6DD&} Are You Kidding Me?",
    "{\\fscx200\\fscy110\\clip(186,299,451,305)\\pos(320,330)\\c&H3194C8&\\fad(396,1)}The 8th Son?\\N{\\fs10\\c&H3194C8&} Are You Kidding Me?",
    "",
    "",
    
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

// const v = replaceTagToKey(tagDict, textnewline: '\n\n'}o)
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

const v = 'sdfs df{sdf sdf sdf fds f} <sdf sdf sdf> sd f'.replace(/\{[\s]+\}/g, "")

console.log('>>>>>>',v)