# JavaScriptLogger
Example

1:
```js
logger.log(message = "No Message", name = null, showTime = false, innerSpace = false, outerSpace = false, baseColor = null, borderChar = "-", borderCharLength = 10, filesPath = null)
```

2:
```js
logger.logByOptions({
  message: "This is the message",
  name: "Scriptname",
  showTime: true,
  innerSpace: true,
  outerSpace: true,
  baseColor: chalk.green,
  borderChar: "-",
  borderCharLength: 20
  filesPath: "logs"
});
```

3:
```js
logger.logByOptions({
  message: "This is the message"
});
```

Output from example 2:
```

####################| Scriptname |####################

Time: 22:10:00

This is the message

######################################################

```
*the whole log will be green because of baseColor and will be also written in the logs folder in the latest.log file*

---

Without any parameters it would look like:

Output from example 3:
```
------------------------
This is the message
------------------------
```

You can set Standards:
```js
logger.setStandards({
  title: "Preset"
});
```
The title will now always be "Preset", if you dont overwrite it using the NORMAL logByOptions or log function

- **message**: Message that appears in log

- **name**: Title of the log

- **showTime**: Show time upper the message

- **innerSpace**: Makes a line space between border, message and (time)

- **outerSpace**: Makes a line space to other console outputs

- **baseColor**: Set color of whole log using chalk without function ()

- **borderChar**: Set the character for border

- **borderCharLength**: Set length for border each side. 20 -> 20chars | name | 20chars [-1 will set a automatic length detection]

- **filesPath**: Set a path for the file logs. null for disable