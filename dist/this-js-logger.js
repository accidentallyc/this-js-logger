!function(){
	//@TODO: Check for dependencies
	var VERSION = "0.2.0";
	
	/** Get current script **/
	var me = document.currentScript; //@TODO: Check for dependency
	var intLevels = {
		ERROR:1,
		WARN:2,
		INFO:3,
		DEBUG:4,
		TRACE:5
	};

	function defaultify(objCollection){
		for(var x in objCollection){
			var tempAttr = me.getAttribute(x);
			if( tempAttr ) {
				switch(typeof(objCollection[x]) ){
					case "number": objCollection[x] = parseInt(tempAttr); break;
					case "boolean":  objCollection[x] = tempAttr == "true"; break;
					default: objCollection[x] = tempAttr;
				}
			}
		}
		return objCollection;
	}

	var db;
	function getDB(){
		if( db ) return db;
		else {
			db = openDatabase( settings["logger-db"], '1.0', settings["logger-db-descp"], 512);
			db.transaction(function (tx) {
				tx.executeSql('CREATE TABLE IF NOT EXISTS '+settings["logger-db"]+' (log TEXT)');
			});
			return db;
		}
	}
	
	/** Settings **/
	var temp = Object.create(null,{});
		temp["logger-prefix"]		= "thisJs-logger",
		temp["logger-db"]			= "choose_a_unique_name_for_your_website",
		temp["logger-db-descp"]		= "thisJs-logger logs table",
		temp["logger-max-records"]	= 300,
		temp["logger-auto-instance"]= true,
		temp["logger-level"]		= "TRACE",
		temp["logger-record-flag"]	= false
	var settings = defaultify(temp);

	settings["logger-prefix"] +=  " - ";
	settings["logger-remove-limit"] = settings["logger-max-records"] * 0.40;
	
	var hash = window.location.hash;
	var debug_settings = Object.create(null,{});
		debug_settings.ns = null;
		debug_settings.ns_list = null;
	var reg = /([0-9a-zA-Z_-]*)=([0-9a-zA-Z_-\s]*)/g;
	var match = reg.exec(hash);;
	while (match != null){
	    debug_settings[match[1]] = (2 in match) ? match[2] : true;
	    match = reg.exec(hash);
	}
	if(debug_settings.ns) debug_settings.ns_list = debug_settings.ns.split(",");
	
	var style = {
		ERROR: { header: "font-weight:bold;color:red;", body: "font-weight:normal;color:red;" },
		WARN : { header: "font-weight:bold;color:darkred;", body: "font-weight:normal;color:darkred;" },
		INFO : { header: "font-weight:bold;", body: "font-weight:normal;" },
		DEBUG : { header: "font-weight:bold;color:#01014C;", body: "font-weight:normal;color:#01014C;" },
		TRACE : { header: "font-weight:bold;color:#054C05;", body: "font-weight:normal;color:#054C05;" }
	}
	var blank_func = function(){};
	window.debug_settings = debug_settings;
	function factory(that,type,namespace){
		var s = style[type];
		var isRecorded = that.settings["logger-record-flag"];
		var isNotLeveled = intLevels[that.settings["logger-level"].toUpperCase()] < intLevels[type];
		var isNotInDebugCategory = debug_settings.ns_list === null ? false : (debug_settings.ns_list.indexOf(namespace) == -1) ;

		if( isNotLeveled || isNotInDebugCategory ) return blank_func;
		return function(message,obj){
			
		
			if( isRecorded == undefined ) isRecorded = true;
			var now = (new Date()).toLocaleString();
			var stack = (new Error()).stack.substring(6);

			var openNS = namespace ? "< " + namespace + " >\n":"";
			var closeNS = namespace ? "\n</ " + namespace + " >":"";
			

			if( obj ){
				var stackHeader =  "%c"+ type +" %c"+message + " -- " + now 
				console.log(stackHeader, s.header, s.body, obj);
				console.log( "%c" + stack, s.body );
			}
			else{
				var stackMessage =  openNS + "%c"+ type  +" %c"+message + " -- " + now + "\n"+stack + closeNS
				console.log( stackMessage, s.header, s.body );
			}
			
			if( isRecorded ){
				logToWeb(type,message,stack,now,obj);
			}//if logToWeb
		}
	}

	function logToWeb(type,message,stack,time,obj){
		var db = getDB();
		db.transaction(function (tx) {
		var logFileValue = type  + " : " + message + " -- " + time;
			if( obj ) logFileValue += " " + JSON.stringify(obj) ;
			logFileValue += "\r\n" + stack;
		tx.executeSql('INSERT INTO '+settings["logger-db"]+' (log) VALUES (?)',[logFileValue]);
		});
	}//logToWeb

	window.thisJsLogger = function(newSettings,name){
		name = (name ? name : "");
		this.settings = Object.create(null,{});
		for(var x in settings){
			if( newSettings && x in newSettings) this.settings[x] = newSettings[x];
			else this.settings[x] = settings[x];
		}

		this.error 	= factory(this,"ERROR", name );
		this.warn 	= factory(this,"ERROR", name);
		this.info 	= factory(this,"INFO",name);
		this.debug 	= factory(this,"DEBUG",name);
		this.trace 	= factory(this,"TRACE",name);
		this.clear 	= clear;
		this.download = download;

		this.trace("RUNNING thisJs-logger v" +VERSION + "--- ON PAGE: " + window.location );
	};

	if( settings["logger-auto-instance"] )	window.log = new thisJsLogger();


	
	function download(){
		db.transaction(function (tx) {
			tx.executeSql('SELECT log FROM ' + settings["logger-db"], [], function (tx, results) {
				var contentArray = [];
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					contentArray.push(results.rows.item(i).log + "\r\n");
				}		
				
				var a = document.createElement('a');
				var blob = new Blob( contentArray, {'type':'application/octet-stream'});
				a.href = window.URL.createObjectURL(blob);
				a.download = settings.logger_prefix + (new Date()).toUTCString() + ".txt";
				a.click();
			});
		});	
	}
	
	function clear(){
		db.transaction(function (tx) {
			tx.executeSql('DELETE FROM ' + settings["logger-db"] );
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

	/** 
	* Some form of algo that checks #of logged "PAGES" in the db
	* to prevent file logs from getting too large. Written inside
	* an interval to insure that the db has been made.
	*
	*/
	window.setInterval(function(){
		var db = getDB();
		 db.transaction(function (tx) {
		tx.executeSql('SELECT COUNT(*) AS c FROM ' + settings["logger-db"], [], function (tx, r) {
			var count =  r.rows.item(0).c;
			if( parseInt(count) > settings["logger-max-records"] ) {
				
				tx.executeSql('DELETE FROM '+settings["logger-db"]+' WHERE rowid IN (SELECT rowid FROM '+settings["logger-db"]+' ASC LIMIT '+ settings["logger-remove-limit"] +')',[],function(){
					log.warn("Cleared "+settings["logger-remove-limit"]+" records from the db");
				},function(tx,e){console.log(e);});
			}
		}, function (tx, e) {
		  log.warn("Could not auto-clear: " + e.message);
		});
	  });
	},200);
	

	//document.cookie.match( RegExp("happy=(.*?)(?:\;)") )
}();