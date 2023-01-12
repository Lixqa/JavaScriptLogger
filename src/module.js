const utl = require("./utils.js");
const fs = require("fs");
const chalk = require("chalk");

let standarts = {};

function simpleLog(string) {
    console.log(string);
}

function log(_message, _name, _showTime, _innerSpace, _outerSpace, _baseColor, _borderChar, _borderCharLength, _filesPath) {
    let message = _message || standarts.message || "No Message";
    let name = _name || standarts.name || null;
    let showTime = _showTime || standarts.showTime || false;
    let innerSpace = _innerSpace || standarts.innerSpace || false;
    let outerSpace = _outerSpace || standarts.outerSpace || standarts.message || false;
    let baseColor = _baseColor || standarts.baseColor || null;
    let borderChar = _borderChar || standarts.borderChar || "-";
    let borderCharLength = _borderCharLength || standarts.borderCharLength || 10;
    let filesPath = _filesPath || standarts.filesPath || null;

    let longestContentStr = message.replace(utl.ansiRegex(), "");
    if(showTime) longestContentStr += "\nTime: " + utl.getTime();

    let nameLength = (name != null) ? (4 + name?.length || 0) : (name?.length || 0);
    if(borderCharLength == -1) borderCharLength = ((utl.calculateLongestLine(longestContentStr)-(nameLength || 0))/2);
    if(borderCharLength <= 0) borderCharLength = 1;
    borderCharLength = Math.ceil(borderCharLength);

    let output = "";
    let prefix = (name != null) ? borderChar.repeat(borderCharLength) + "| " + name + " |" + borderChar.repeat(borderCharLength) : borderChar.repeat((borderCharLength*2));
    let time = utl.getTime();

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

    /*########### FILE SYSTEM ###########*/

    if(filesPath != null) {
        let dir = filesPath;
        let latest = dir + "/latest.log";
        if(!fs.existsSync(dir)) fs.mkdirSync(dir, 0744);
        if(!fs.existsSync(latest)) fs.writeFileSync(latest, "");

        let latestCreated = utl.getDateOfTimestamp(fs.statSync(latest).birthtimeMs);

        fs.appendFileSync(latest, output.replace(utl.ansiRegex(), "") + "\n");

        if(!utl.getLastLogFile(dir)?.includes(utl.getDateOfYesterday()) && latestCreated != utl.getDateOfToday()) {
            /*logByOptions({                                    //muss in einen loop am besten diese ganze checker sonst triggert er sich immer selber
                message: "Creating new log file...",
                name: "LOGGER",
                filesPath: "logs",
                outerSpace: true
            });*/
            fs.renameSync(latest, dir + "/" + utl.getDateOfYesterday() + ".log");
        }
    }

    /*###################################*/

    if(baseColor) {
        console.log(baseColor(output));
    } else {
        console.log(output);
    }
}

function groupedLog(messagesArray, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath) {
    if(messagesArray.length < 1) return;
    let output = "";
    let i = 0;
    messagesArray.forEach(message => {
        output += message;
        if(i < messagesArray.length-1) output += "\n";
        i++;
    })
    log(output, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
}

function logByOptions(options) {
    let message = options.message;
    let name = options.name;
    let showTime = options.showTime;
    let innerSpace = options.innerSpace;
    let outerSpace = options.outerSpace;
    let baseColor = options.baseColor;
    let borderChar = options.borderChar;
    let borderCharLength = options.borderCharLength;
    let filesPath = options.filesPath;

    if(!Array.isArray(message)) {
        log(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
    } else {
        groupedLog(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
    }

}

function setStandards(obj){
    standarts = obj;
}

module.exports = {
    simpleLog: simpleLog,
    log: log,
    groupedLog: groupedLog,
    logByOptions: logByOptions,
    setStandards: setStandards
}

setStandards({
    showTime: true,
    borderChar: "+"
});
