module.exports = {
    simpleLog: function(string) {
        console.log(string);
    },
    log: function(string, name = null) {
        let output, prefix, suffix;
        prefix = (name != null) ? "----------| " + name + " |----------" : "------------------------";

        for(let i = 0; i < prefix.length; i++) {
            suffix += "-";
        }

        output = prefix + "\n" + message + "\n" + suffix;

        console.log(output);
    }
}