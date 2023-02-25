const fs = require("fs");
const path = require("path");

module.exports = {
    getDateOfToday: function() {
        let date = new Date();
        let response =
        this.pad(date.getDate()) + "." +
        this.pad(date.getMonth() + 1) + "." +
        this.pad(date.getFullYear());

        return response;
    },
    getDateOfYesterday: function() {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        let response =
        this.pad(date.getDate()) + "." +
        this.pad(date.getMonth() + 1) + "." +
        this.pad(date.getFullYear());

        return response;
    },
    getDateOfTimestamp: function(timestamp) {
        let date = new Date(timestamp);
        let response =
        this.pad(date.getDate()) + "." +
        this.pad(date.getMonth() + 1) + "." +
        this.pad(date.getFullYear());

        return response;
    },
    getTime: function() {
        let date = new Date();
        let response =
        this.pad(date.getHours()) + ":" +
        this.pad(date.getMinutes()) + ":" +
        this.pad(date.getSeconds());

        return response;
    },
    pad: function(d) {
        return (d < 10) ? "0" + d : d;
    },
    ansiRegex: function() {
        const pattern = [
            '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
            '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
        ].join('|');
    
        return new RegExp(pattern, 'g');
    },
    getLastLogFile: function(searchPath) {
        const files = [];
        const getMostRecentFile = (dir) => {
            orderReccentFiles(dir);
            let response;
            files.forEach(file => {
                if(!file.includes("latest")) {
                    if(file.includes(module.exports.getDateOfYesterday())) {
                        response = file;
                    }
                }
            })
            return response;
        };
          
        const orderReccentFiles = (dir) => {
            return fs.readdirSync(dir).forEach(file => {
                const Absolute = path.join(dir, file);
                if (fs.statSync(Absolute).isDirectory()) return orderReccentFiles(Absolute);
                else return files.push(Absolute);
            });
        }

        return getMostRecentFile(searchPath)
    },
    calculateLongestLine: function(string) {
        let lines = string.split("\n")
            .filter(line => line != "");
    
        return Math.max(...(lines.map(line => line.length)));
    },
    calculatePercentage(val, max) {
        return (100 * val)/max;
    },
    divideLargerBySmaller(a, b) {
        return (Math.max(a, b) / Math.min(a, b));
    },
    clearLines(n) {
        for (let i = 0; i < n; i++) {
            const y = i === 0 ? null : -1;
            process.stdout.moveCursor(0, y);
            process.stdout.clearLine(1);
        }
        process.stdout.cursorTo(0)
    }
}