const utl = require("./utils.js");
const fs = require("fs");
const chalk = require("chalk");
const State = require("./State.class.js");
const Progress = require("./Progress.class.js");
const { type } = require("os");

let defaults = {};

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
 * @param {Boolean} object.showTime - Show time in log object
 * @param {Boolean} object.innerSpace - Place empty lines inside the log object
 * @param {Boolean} object.betweenSpace - Place empty lines between the log object (Only grouped log)
 * @param {Boolean} object.outerSpace - Place empty lines outside the log object
 * @param {Function} object.baseColor - Use a chalk function to send the color of log object. Example: chalk.green
 * @param {String} object.borderChar - Set a character for the log object border
 * @param {Number} object.borderCharLength - Set a length for the border (-1 for automatic detection)
 * @param {String} object.filesPath - Set a path for the file logs. Null to disable
 * @param {String} object.box - Send the log in a box of borderChars
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
 * @param {String} box - Send the log in a box of borderChars
 * @param {Class} dynamic - Put Progress or State class in there and the log will appear inside the progress or state
 */
function log(object, name = null, showTime = null, innerSpace = null, betweenSpace = null, outerSpace = null, baseColor = null, borderChar = null, borderCharLength = null, filesPath = null, box = false, dynamic = null) {
    if(Array.isArray(object)) {
        groupedLog(object, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
        return;
    }

    if(typeof object == "string") {
       logByParams(object, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
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
            box: object.box,
            dynamic: object.dynamic
        });
        return;
    }
}

//internal
function LOG(_message, _name, _showTime, _innerSpace, _outerSpace, _baseColor, _borderChar, _borderCharLength, _filesPath, _box, _dynamic) {
    let message = _message || defaults.message || "No Message";
    let name = _name || defaults.name || null;
    let showTime = _showTime || defaults.showTime || false;
    let innerSpace = _innerSpace || defaults.innerSpace || false;
    let outerSpace = _outerSpace || defaults.outerSpace || false;
    let baseColor = _baseColor || defaults.baseColor || null;
    let borderChar = _borderChar || defaults.borderChar || "-";
    let borderCharLength = _borderCharLength || defaults.borderCharLength || 10;
    let filesPath = _filesPath || defaults.filesPath || null;
    let box = _box || defaults.box || false;
    let dynamic = _dynamic || defaults.dynamic || null;

    let time = utl.getTime();

    let longestContentStr = message.replace(utl.ansiRegex(), "");
    if(showTime) longestContentStr += "\nTime: " + time;
    let longestLine = utl.calculateLongestLine(longestContentStr);

    let nameLength = (name != null) ? (4 + name?.length || 0) : (name?.length || 0);
    if(borderCharLength == -1) borderCharLength = ((longestLine-(nameLength || 0))/2);
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

    if(box) {
        output = output.split("\n").map((line, i) => {
            if(outerSpace && i == 0) return line; //ignore first line if is outerspace
            if(outerSpace && i == output.split("\n").length - 1) return line; //ignore last line if is outerspace

            return borderChar + (innerSpace ? " " : "") + line;
        }).join('\n'); //add char at start
        
        output = output.split("\n").map((line, i) => {
            if(outerSpace && i == 0) return line; //ignore first line if is outerspace
            if(outerSpace && i == output.split("\n").length - 1) return line; //ignore last line if is outerspace

            let space = (prefix.length - line.replace(utl.ansiRegex(), "").length > 0) ? prefix.length - line.replace(utl.ansiRegex(), "").length + 1 : 0; //add ansiRegex because if the message is underlined there are invisible chars which affects the count

            if(innerSpace) space += (prefix.length - line.length > 0 ? 1 : 0); //add innerspace to lines who DONT touch the border
            if(innerSpace) space += 1; //add one seperater char

            return line + (" ".repeat(space)) + borderChar;
        }).join('\n'); //add char at end

        //fix the empty edges if the log is a box
        if(output.split("\n").length > 2 && innerSpace) {
            output = output.split("\n");
            output[outerSpace ? 1 : 0] = utl.replaceFirstAndLastChar(output[outerSpace ? 1 : 0], " ", borderChar); //replace first line - prefix > START LATER IF OUTERSPACE
            output[output.length - (outerSpace ? 2 : 1)] = utl.replaceFirstAndLastChar(output[output.length - (outerSpace ? 2 : 1)], " ", borderChar); //replace last line - suffix > START LATER IF OUTERSPACE
            output = output.join("\n");
        }
    }

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

function groupedLog(messagesArray, name, showTime, innerSpace, betweenSpace = false, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic) {
    if(messagesArray.length < 1) return;
    let output = "";
    let i = 0;
    messagesArray.forEach(message => {
        output += message;
        if(i < messagesArray.length-1) output += "\n";
        if(i < messagesArray.length-1 && betweenSpace) output += "\n";
        i++;
    })
    LOG(output, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
}

function logByParams(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic) {
    if(!Array.isArray(message)) {
        LOG(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
    } else {
        groupedLog(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
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
    let box = options.box;
    let dynamic = options.dynamic;

    if(!Array.isArray(message)) {
        LOG(message, name, showTime, innerSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
    } else {
        groupedLog(message, name, showTime, innerSpace, betweenSpace, outerSpace, baseColor, borderChar, borderCharLength, filesPath, box, dynamic);
    }
}

function setDefaults(obj){
    defaults = obj;
}

module.exports = {
    simpleLog: simpleLog,
    setDefaults: setDefaults,

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