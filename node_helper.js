/* Magic Mirror
 * Module: MMM-RMV
 *
 * By Com-Lum
 * MIT Licensed.
 */

const request = require('request');
const NodeHelper = require("node_helper");



module.exports = NodeHelper.create({

	start: function() 
	{
        console.log("node helper: " + this.name);
    	},

	
	//Built_Para - return URL parameter as string
	
	Built_Para: function() 
	{
		var para = this.config.apiKey;
		para +="&id=" + this.config.stationId;
		if (this.config.lines !== '') 
		{	para += "&lines=" + this.config.lines;	}
		para +="&format=json";
		return para;
	},
	
    	socketNotificationReceived: function(notification, payload) 
	{
        	if(notification === 'CONFIG')
		{
            	this.config = payload;
		var rmvUrl = this.config.apiUrl + this.Built_Para();
		this.getData(rmvUrl, this.config.stationId);
		//console.log(rmvUrl);
        	}
   	},

    	getData: function(options, stationId) {
		request(options, (error, response, body) => {
	        if (response.statusCode === 200) {
				this.sendSocketNotification("Trains" + stationId, JSON.parse(body));
				} else {
                console.log("Error: No connection data recieved. Error code: " + response.statusCode);
            }
        });
    }
});