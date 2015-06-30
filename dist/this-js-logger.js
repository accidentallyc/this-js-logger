!function(){
	//@TODO: Check for dependencies
	var VERSION = "0.1";
	
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
				db.transaction(function (tx) {
					var logFileValue = type  + " : " + message + " -- " + now;
						if( obj ) logFileValue += " " + JSON.stringify(obj) ;
						logFileValue += "\r\n" + stack;
					tx.executeSql('INSERT INTO '+logger_db+' (log) VALUES (?)',[logFileValue]);
				});
			}//if logToWeb
		}
	}
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
	
	log.trace("RUNNING thisJs-logger v" +VERSION);
}();