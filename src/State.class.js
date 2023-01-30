module.exports = class State {
    template = "%NAME% > %STATE%";
    objects = [];
    interval;

    constructor(template = null) {
        this.template = template || this.template;
        this.go();
    }

    go() {
        let first = true;
        this.interval = setInterval(() => {
            const clearLines = (n) => {
                for (let i = 0; i < n; i++) {
                    const y = i === 0 ? null : -1;
                    process.stdout.moveCursor(0, y);
                    process.stdout.clearLine(1);
                }
                process.stdout.cursorTo(0)
            }

            let str = "\u001B[?25l";

            let i = 0;
            this.objects.forEach(object => {
                str += this.template.replace("%NAME%", object.name).replace("%STATE%", object.state) + "\n";
                //if(i < this.objects.length-1) str += "\n"; removed because added it here              ^^ because it works better if a log is created WHILE the state process
                i++;
            });

            process.stdout.cursorTo(0);
            if(!first) clearLines(this.objects.length+1); //execute after second iteration because it clears the "before" stuff
            process.stdout.write(str);
            first = false;
        }, 10);
    }

    add(name, state) {
        this.objects.push({name: name, state: state});
    }

    update(objectName, objectState) {
        this.objects[this.objects.findIndex(obj => obj.name == objectName)].state = objectState;
    }

    stop() {
        clearInterval(this.interval);
    }
}