# this-js-logger
This is a js logger. It is tiny. It is colorful. It can store and download logs ( client side ). You know, just like any other JS logger.

Originally developed for one of my projects. Maybe someone here will like this.
## Sample Usage
```javascript

log.warn("Warning, this version is out of date.");
log.info("Connect to XXX Server...");
log.debug("Attempting to reconnect ");

log.download();     //download the logfile ( stored via WebSQL )
log.clear();        //clear the WebSQL

```

## Sample Result
```
WARN Warning, this version is out of date. -- 6/30/2015, 9:42:52 PM
    at Object.warn (file:///F:/mygit/this-js-logger/dist/this-js-logger.js:50:17)
    at <anonymous>:2:5
    at Object.InjectedScript._evaluateOn (<anonymous>:895:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:828:34)
    at Object.InjectedScript.evaluate (<anonymous>:694:21)
INFO Connect to XXX Server... -- 6/30/2015, 9:42:52 PM
    at Object.info (file:///F:/mygit/this-js-logger/dist/this-js-logger.js:50:17)
    at <anonymous>:3:5
    at Object.InjectedScript._evaluateOn (<anonymous>:895:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:828:34)
    at Object.InjectedScript.evaluate (<anonymous>:694:21)
DEBUG Attempting to reconnect  -- 6/30/2015, 9:42:52 PM
    at Object.debug (file:///F:/mygit/this-js-logger/dist/this-js-logger.js:50:17)
    at <anonymous>:4:5
    at Object.InjectedScript._evaluateOn (<anonymous>:895:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:828:34)
    at Object.InjectedScript.evaluate (<anonymous>:694:21)
```

## Installation
Just include the script file.
```html
<script src='dist/this-js-logger.js'></script>
```
## Configuration
Below are the default configurations, They are all optional. You can use it as is.
```html
<script 
    src='dist/this-js-logger.js'
    logger-level = 'TRACE'    /* accepts ERROR,WARN,INFO,DEBUG,TRACE */
    logger-file-prefix = 'thisJs-logger'  /* when performing log.download() */
    logger-db = 'thisJs_logger'  /* name of the database and table where the logs are stored */
    logger-db-descp = ''  /* description of the db (might be used in the future for named logs */
></script>
```

## Caveats
1. This only works with the later browser version (because HTML5). However i still have to pinpoint which browser versions it fails at.
2. Since its using WebSQL it does have a table size limit. The default size is set to 512. Will work on a version where it implicity replace old records.

