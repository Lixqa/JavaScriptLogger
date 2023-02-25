const utl = require("./utils.js");

module.exports = class State {
    template = "%NAME% > [%PROGRESSBAR%] %PERCENTAGE%";
    objects = [];
    barLength = 10;
    chars = ["#", "-"];
    interval;

    constructor(template = null, barLength = null, chars = null) {
        this.template = template || this.template;
        this.barLength = barLength || this.barLength;
        this.chars = chars || this.chars
        this.go();
    }

    go() {
        let first = true;
        this.interval = setInterval(() => {
            let str = "\u001B[?25l";

            let i = 0;
            this.objects.forEach(object => {
                let doneCharLength = Math.floor(this.barLength * (object.percentage / 100)); //get doneCharLength
                let pendingCharLength = this.barLength - doneCharLength; //get pending/filler char length
                let bar = this.chars[0].repeat(doneCharLength) + this.chars[1].repeat(pendingCharLength); //build bar
                str += this.template.replace("%NAME%", object.name).replace("%PROGRESSBAR%", bar).replace("%PERCENTAGE%", object.percentage) + "\n";
                i++;
            });

            process.stdout.cursorTo(0);
            if(!first) utl.clearLines(this.objects.length+1); //execute after second iteration because it clears the "before" stuff
            process.stdout.write(str);
            first = false;
        }, 10);
    }

    add(name) {
        this.objects.push({name: name, percentage: 0});
    }

    update(objectName, objectPercentage) {
        if(this.objects[this.objects.findIndex(obj => obj.name == objectName)]) this.objects[this.objects.findIndex(obj => obj.name == objectName)].percentage = objectPercentage
    }

    stop() {
        clearInterval(this.interval);
    }
}