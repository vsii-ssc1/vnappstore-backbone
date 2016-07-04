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
var crypto = require("crypto");

module.exports = function Encode(ds) {
	return {
		sha256: function(key1, key2, type) {
			//type = base46|hex...
			type = (type||'base64');
			var res = crypto.createHash("sha256").update(key1+':'+key2, 'utf8').digest(type);
			return res;
		}
	};
};
