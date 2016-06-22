/* ***************************************************************** */
/*                                                                   */
/* VSI-International Confidential                                    */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright VSI-International Corp. 2016                            */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the VN. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */
var log4js = require('log4js');

module.exports = function() {
	log4js.configure({
		appenders: [
		  { type: 'console' },
		  {
			 type: 'dateFile', 
			 filename: 'logs/access.log', 
			 pattern: "_yyyy-MM-dd.log",
			 alwaysIncludePattern: true,
			 maxLogSize: 1024*1024,
		     backups: 20,
			 category: 'access' 
		  },{
		     type: 'dateFile', 
		     filename: 'logs/console.log',
		     pattern: "_yyyy-MM-dd.log",
		     alwaysIncludePattern: true,
		     maxLogSize: 1024*1024,
		     backups: 20,
		     category: 'console' 
		  }
		],
		replaceConsole: true
	});
	return log4js;
};
