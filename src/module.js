function simpleLog(string) {
    console.log(string);
}

function log(message = "No Message", name = null, showTime = false, innerSpace = false, outerSpace = false, baseColor = null, borderChar = "-", borderCharLength = 10) {
    let output = "";
    let prefix = (name != null) ? borderChar.repeat(borderCharLength) + "| " + name + " |" + borderChar.repeat(borderCharLength) : borderChar.repeat((borderCharLength*2)+4);
    let date = new Date();
    let time =
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" +
    (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());

    let suffix = "";

    for(let i = 0; i < prefix.length; i++) {
        suffix += borderChar;
    }

    if(outerSpace) output += "\n";
    output += prefix;
    output += "\n"
    if(innerSpace) output += "\n"
    if(showTime) output += "Time: " + time + "\n";
    if(showTime && innerSpace) output += "\n";
    output += message;
    output += "\n";
    if(innerSpace) output += "\n";
    output += suffix;
    if(outerSpace) output += "\n";

    if(baseColor) {
        console.log(baseColor(output));
    } else {
        console.log(output);
    }
}

function groupedLog(messagesArray, name = null, showTime = false, innerSpace = false, outerSpace = false, baseColor = null, borderChar = "-", borderCharLength = 10) {
    if(messagesArray.length < 1) return;
    let output = "";
    for (let i = 0; i < messagesArray.length; i++) {
        let message = messagesArray[i];
        output += message;
        if(i < messagesArray.length-1) output += "\n";
    }
    log(output, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength);
}

function logByOptions(options) {
    let message = options.message;
    let name = options.name || null;
    let showTime = options.showTime || false;
    let innerSpace = options.innerSpace || false;
    let outerSpace = options.outerSpace || false;
    let baseColor = options.baseColor || null;
    let borderChar = options.borderChar || "-";
    let borderCharLength = options.borderCharLength || 10;

    if(!Array.isArray(message)) {
        log(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength);
    } else {
        groupedLog(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength);
    }

}

module.exports = {
    simpleLog: simpleLog,
    log: log,
    groupedLog: groupedLog,
    logByOptions: logByOptions
}