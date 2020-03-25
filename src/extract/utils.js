
function msToFormatedTime(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}   

const replaceExtensionFile = (file, newExtension) => {
    var pos = file.lastIndexOf(".")
    return file.substr(0, pos < 0 ? file.length : pos) + newExtension
}

module.exports = {
    msToFormatedTime,
    bytesToSize,
    replaceExtensionFile
}