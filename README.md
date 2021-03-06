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
    at Object.warn (/some_directory/dist/this-js-logger.js:50:17)
    at <anonymous>:2:5
    at Object.InjectedScript._evaluateOn (<anonymous>:895:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:828:34)
    at Object.InjectedScript.evaluate (<anonymous>:694:21)
INFO Connect to XXX Server... -- 6/30/2015, 9:42:52 PM
    at Object.info (/some_directory/dist/this-js-logger.js:50:17)
    at <anonymous>:3:5
    at Object.InjectedScript._evaluateOn (<anonymous>:895:140)
    at Object.InjectedScript._evaluateAndWrap (<anonymous>:828:34)
    at Object.InjectedScript.evaluate (<anonymous>:694:21)
DEBUG Attempting to reconnect  -- 6/30/2015, 9:42:52 PM
    at Object.debug (/some_directory/dist/this-js-logger.js:50:17)
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
    logger-record-flag = 'false' /* If true, saves all the logs into the WebSQL */
></script>
```

## Caveats
1. This only works with the later browser version (because HTML5). However i still have to pinpoint which browser versions it fails at.
2. Since its using WebSQL it does have a table size limit. The default size is set to 512. Will work on a version where it implicity replace old records.


## What's new?
VERSION "0.2.0" has the ff new features

1. thisJsLogger class ( allows you to instantiate your own logger )
2. Logger categories ( allows you to categorize logging )
3. `logger-record-flag` default changed from true to false.

### Logger Categories
Sample Result
```
< function binding >
TRACE RUNNING thisJs-logger v0.2.0--- ON PAGE: /some_directory/sample.html -- 7/22/2015, 2:44:24 PM
    at null.trace (/some_directory/dist/this-js-logger.js:88:17)
    at new window.thisJsLogger (/some_directory/dist/this-js-logger.js:136:8)
    at /some_directory/sample.html:76:16
</ function binding >
< function binding >
INFO Finished binding function to the `the` word in <li> #1 -- 7/22/2015, 2:44:24 PM
    at null.info (/some_directory/dist/this-js-logger.js:88:17)
    at /some_directory/sample.html:83:7
</ function binding >
```

Sample Html
```html
<script>
    window.flog = new thisJsLogger({},"function binding");
    flog.info("Finished binding function to the `the` word in <li> #1");
</script>
```

If you are using logger categories, while debugging you can filter through the logs by
appending #ns=cat1,cat2,cat3 or #ns=cat1.


## FAQ
What if i don't want to use `log` as the function name?

```html
<script src='dist/this-js-logger.js' logger-auto-instance = 'false'></script>
<script>
    yourOwnVariable = new thisJsLogger();
    yourOwnVariable.log("you can now log via `yourOwnVariable` ");
</script>
```

