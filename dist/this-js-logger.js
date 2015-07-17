!function(){
	//@TODO: Check for dependencies
	var VERSION = "0.1.2";
	
	/** Get current script **/
	var me = document.currentScript; //@TODO: Check for dependency
	
	/** Settings p1 **/
	var logger_prefix = me.getAttribute("logger-file-prefix");
		if( !logger_prefix ) logger_prefix = "thisJs-logger";
		logger_prefix +=  " - ";
	var logger_db = me.getAttribute("logger-db");
		if( !logger_db ) logger_db = "thisJs_logger";
	var logger_dbDescp = me.getAttribute("logger-db-descp");
		if( !logger_dbDescp ) logger_dbDescp = "thisJs-logger logs table";
	var logger_max_records = me.getAttribute("logger-max-records");
		if( !logger_max_records ) logger_max_records = 300;
		logger_remove_limit = logger_max_records * 0.40;
	
	var db = openDatabase( logger_db, '1.0', logger_dbDescp, 512);
		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS '+logger_db+' (log TEXT)');
		});
	
	var style = {
		ERROR: { header: "font-weight:bold;color:red;", body: "font-weight:normal;color:red;" },
		WARN : { header: "font-weight:bold;color:darkred;", body: "font-weight:normal;color:darkred;" },
		INFO : { header: "font-weight:bold;", body: "font-weight:normal;" },
		DEBUG : { header: "font-weight:bold;color:#01014C;", body: "font-weight:normal;color:#01014C;" },
		TRACE : { header: "font-weight:bold;color:#054C05;", body: "font-weight:normal;color:#054C05;" }
	}
	
	var intLevels = {
		ERROR:1,
		WARN:2,
		INFO:3,
		DEBUG:4,
		TRACE:5
	};
	
	/** Settings p2 **/
	var logLevel = me.getAttribute("logger-level");
		if( logLevel == undefined ) logLevel = intLevels[ "TRACE" ];
		else logLevel = intLevels[ logLevel.toUpperCase() ];

	function factory(type){
		var s = style[type];
		return function(message,obj,isRecorded){
			if( logLevel < intLevels[type] ) return;
		
			if( isRecorded == undefined ) isRecorded = true;
			var now = (new Date()).toLocaleString();
			var stack = (new Error()).stack.substring(6);
			

			if( obj ){
				var stackHeader =  "%c"+ type +" %c"+message + " -- " + now 
				console.log(stackHeader, s.header, s.body, obj);
				console.log( "%c" + stack, s.body );
			}
			else{
				var stackMessage =  "%c"+ type  +" %c"+message + " -- " + now + "\n"+stack
				console.log( stackMessage, s.header, s.body );
			}
			
			if( isRecorded ){
				logToWeb(type,message,stack,now,obj);
			}//if logToWeb
		}
	}

	function logToWeb(type,message,stack,time,obj){
		db.transaction(function (tx) {
		var logFileValue = type  + " : " + message + " -- " + time;
			if( obj ) logFileValue += " " + JSON.stringify(obj) ;
			logFileValue += "\r\n" + stack;
		tx.executeSql('INSERT INTO '+logger_db+' (log) VALUES (?)',[logFileValue]);
		});
	}//logToWeb
	window.log ={
		error 	:factory("ERROR"),
		warn 	:factory("WARN"),
		info 	:factory("INFO"),
		debug 	:factory("DEBUG"),
		trace	:factory("TRACE"),
		download:download,
		clear	:clear
	}
	
	function download(){
		db.transaction(function (tx) {
			tx.executeSql('SELECT log FROM ' + logger_db, [], function (tx, results) {
				var contentArray = [];
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					contentArray.push(results.rows.item(i).log + "\r\n");
				}		
				
				var a = document.createElement('a');
				var blob = new Blob( contentArray, {'type':'application/octet-stream'});
				a.href = window.URL.createObjectURL(blob);
				a.download = logger_prefix + (new Date()).toUTCString() + ".txt";
				a.click();
			});
		});	
	}
	
	function clear(){
		db.transaction(function (tx) {
			tx.executeSql('DELETE FROM ' + logger_db );
			log.info("Cleared logs",null,false);
		});	
	}

	
	function winOnError(message,source,lineNum,d,errorObject){
		var time = (new Date()).toLocaleString();
		var type = "EXCEPTION";
		var stack;
		if( errorObject ){
			stack = errorObject.stack;
		} else{
			stack = source + " @ line:"+ lineNum;
		}
		logToWeb(type,message,stack,time,errorObject);
	}
	if(  window.onerror ){
		var winOnErrorTemp =  window.onerror;
		window.onerror = function(){
			winOnErrorTemp.apply(this,arguments);
			winOnError.apply(this,arguments);
		};
	}
	else
		window.onerror = winOnError;

	/** Some form of algo that checks #of logged "PAGES" in the db
	to prevent file logs from getting too large **/
	 db.transaction(function (tx) {
		tx.executeSql('SELECT COUNT(*) AS c FROM ' + logger_db, [], function (tx, r) {
			var count =  r.rows.item(0).c;
			console.log(count);
			if( parseInt(count) > logger_max_records ) {
				
				tx.executeSql('DELETE FROM '+logger_db+' WHERE rowid IN (SELECT rowid FROM '+logger_db+' ASC LIMIT '+logger_remove_limit+')',[],function(){
					log.warn("Cleared 10 records from the db");
				},function(tx,e){console.log(e);});
			}
		}, function (tx, e) {
		  log.warn("Could not auto-clear: " + e.message);
		});
	  });

	
	log.trace("RUNNING thisJs-logger v" +VERSION + "--- ON PAGE: " + window.location );
	//document.cookie.match( RegExp("happy=(.*?)(?:\;)") )
}();