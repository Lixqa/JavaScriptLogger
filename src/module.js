const utl = require("./utils.js");
const fs = require("fs");
const chalk = require("chalk");
const State = require("./State.class.js");
const Progress = require("./Progress.class.js");
const { type } = require("os");

let standards = {};

/**
 * Simple log.
 * @param {String} string - Log string
 */
function simpleLog(string) {
    console.log(string);
}

/**
 * Log something into console.
 * @param {Object} object - Message string or options object
 * @param {String} object.message - Message for log
 * @param {String} object.name - Name of "title" above the message
 * @param {String} object.showTime - Show time in log object
 * @param {String} object.innerSpace - Place empty lines inside the log object
 * @param {String} object.betweenSpace - Place empty lines between the log object (Only grouped log)
 * @param {String} object.outerSpace - Place empty lines outside the log object
 * @param {String} object.baseColor - Use a chalk function to send the color of log object. Example: chalk.green
 * @param {String} object.borderChar - Set a character for the log object border
 * @param {String} object.borderCharLength - Set a length for the border (-1 for automatic detection)
 * @param {String} object.filesPath - Set a path for the file logs. Null to disable
 * @param {Class} object.dynamic - Put Progress or State class in there and the log will appear inside the progress or state
 * 
 * @param {String} name - Name of "title" above the message
 * @param {Boolean} showTime - Show time in log object
 * @param {Boolean} innerSpace - Place empty lines inside the log object
 * @param {Boolean} betweenSpace - Place empty lines between the log object (Only grouped log)
 * @param {Boolean} outerSpace - Place empty lines outside the log object
 * @param {Function} baseColor - Use a chalk function to send the color of log object. Example: chalk.green
 * @param {String} borderChar - Set a character for the log object border
 * @param {Number} borderCharLength - Set a length for the border (-1 for automatic detection)
 * @param {String} filesPath - Set a path for the file logs. Null to disable
 * @param {Class} dynamic - Put Progress or State class in there and the log will appear inside the progress or state
 */
function log(object, name = null, showTime = null, innerSpace = null, betweenSpace = null, outerSpace = null, baseColor = null, borderChar = null, borderCharLength = null, filesPath = null, dynamic = null) {
    if(Array.isArray(object)) {
        groupedLog(object, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, dynamic);
        return;
    }

    if(typeof object == "string") {
       logByParams(object, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, dynamic);
       return;
    }
    if(typeof object == "object") {
        logByOptions({
            message: object.message,
            name: object.name,
            showTime: object.showTime,
            innerSpace: object.innerSpace,
            betweenSpace: object.betweenSpace,
            outerSpace: object.outerSpace,
            baseColor: object.baseColor,
            borderChar: object.borderChar,
            borderCharLength: object.borderCharLength,
            filesPath: object.filesPath,
            dynamic: object.dynamic
        });
        return;
    }
}

//internal
function LOG(_message, _name, _showTime, _innerSpace, _outerSpace, _baseColor, _borderChar, _borderCharLength, _filesPath, _dynamic) {
    let message = _message || standards.message || "No Message";
    let name = _name || standards.name || null;
    let showTime = _showTime || standards.showTime || false;
    let innerSpace = _innerSpace || standards.innerSpace || false;
    let outerSpace = _outerSpace || standards.outerSpace || false;
    let baseColor = _baseColor || standards.baseColor || null;
    let borderChar = _borderChar || standards.borderChar || "-";
    let borderCharLength = _borderCharLength || standards.borderCharLength || 10;
    let filesPath = _filesPath || standards.filesPath || null;
    let dynamic = _dynamic || standards.dynamic || null;

    let time = utl.getTime();

    let longestContentStr = message.replace(utl.ansiRegex(), "");
    if(showTime) longestContentStr += "\nTime: " + time;

    let nameLength = (name != null) ? (4 + name?.length || 0) : (name?.length || 0);
    if(borderCharLength == -1) borderCharLength = ((utl.calculateLongestLine(longestContentStr)-(nameLength || 0))/2);
    if(borderCharLength <= 0) borderCharLength = 1;
    borderCharLength = Math.ceil(borderCharLength);

    let output = "";
    let prefix = (name != null) ? borderChar.repeat(borderCharLength) + "| " + name + " |" + borderChar.repeat(borderCharLength) : borderChar.repeat((borderCharLength*2));

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

    if(dynamic instanceof State) {
        utl.clearLines(dynamic.objects.length+1);
        output += "\n".repeat(dynamic.objects.length);
    }
    if(dynamic instanceof Progress) {
        utl.clearLines(dynamic.objects.length+1);
        output += "\n".repeat(dynamic.objects.length);
    }

    if(baseColor) {
        console.log(baseColor(output));
    } else {
        console.log(output);
    }
}

function MINILOG(_message, _showTime, _separator, _baseColor, _dynamic) {
    let message = _message || "No Message";
    let showTime = _showTime || false;
    let separator = _separator || ">";
    let baseColor = _baseColor || null;
    let dynamic = _dynamic || null;

    let output = "";
    let time = utl.getTime();

    if(showTime) output = "" + time + " " + separator + " ";
    output += message;

    if(dynamic instanceof State) {
        utl.clearLines(dynamic.objects.length+1);
        output += "\n".repeat(dynamic.objects.length);
    }
    if(dynamic instanceof Progress) {
        utl.clearLines(dynamic.objects.length+1);
        output += "\n".repeat(dynamic.objects.length);
    }

    if(baseColor) {
        console.log(baseColor(output));
    } else {
        console.log(output);
    }
}

function miniLogByParams(message, showTime, separator, baseColor, dynamic) {
    MINILOG(message, showTime, separator, baseColor, dynamic);
}

function miniLogByOptions(options) {
    let message = options.message;
    let showTime = options.showTime;
    let separator = options.separator;
    let baseColor = options.baseColor;
    let dynamic = options.dynamic;

    MINILOG(message, showTime, separator, baseColor, dynamic);
}

/**
 * Log something into console.
 * @param {Object} object - Message string or options object
 * @param {String} object.message - Message for log
 * @param {String} object.showTime - Show time in log object
 * @param {String} object.separator - Separator between time and message
 * @param {String} object.baseColor - Use a chalk function to send the color of log object. Example: chalk.green
 * @param {Class} object.dynamic - Put Progress or State class in there and the log will appear inside the progress or state
 * 
 * @param {String} message - Message for log
 * @param {String} showTime - Show time in log object
 * @param {String} separator - Separator between time and message
 * @param {String} baseColor - Use a chalk function to send the color of log object. Example: chalk.green
 * @param {Class} dynamic - Put Progress or State class in there and the log will appear inside the progress or state
 */
function miniLog(object, showTime = null, separator = null, baseColor = null, dynamic = null) {
    if(typeof object == "string") {
        miniLogByParams(object, showTime, separator, baseColor, dynamic);
        return;
     }
     if(typeof object == "object") {
         miniLogByOptions({
            message: object.message,
            showTime: object.showTime,
            separator: object.separator,
            baseColor: object.baseColor,
            dynamic: object.dynamic
         });
         return;
     }
}

function groupedLog(messagesArray, name, showTime, innerSpace, betweenSpace = false, outerSpace, baseColor, borderChar, borderCharLength, filesPath) {
    if(messagesArray.length < 1) return;
    let output = "";
    let i = 0;
    messagesArray.forEach(message => {
        output += message;
        if(i < messagesArray.length-1) output += "\n";
        if(i < messagesArray.length-1 && betweenSpace) output += "\n";
        i++;
    })
    LOG(output, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
}

function logByParams(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath) {
    if(!Array.isArray(message)) {
        LOG(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
    } else {
        groupedLog(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath);
    }
}

function logByOptions(options) {
    let message = options.message;
    let name = options.name;
    let showTime = options.showTime;
    let innerSpace = options.innerSpace;
    let betweenSpace = options.betweenSpace; //only for groupedLog
    let outerSpace = options.outerSpace;
    let baseColor = options.baseColor;
    let borderChar = options.borderChar;
    let borderCharLength = options.borderCharLength;
    let filesPath = options.filesPath;
    let dynamic = options.dynamic;

    if(!Array.isArray(message)) {
        LOG(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, dynamic);
    } else {
        groupedLog(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, dynamic);
    }
}

function setStandards(obj){
    standards = obj;
}

module.exports = {
    simpleLog: simpleLog,
    setStandards: setStandards,

    log: log,
    groupedLog: groupedLog,
    logByParams: logByParams,
    logByOptions: logByOptions,

    miniLog: miniLog,
    miniLogByParams: miniLogByParams,
    miniLogByOptions: miniLogByOptions,
    
    State: State,
    Progress: Progress
}