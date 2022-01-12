/* Magic Mirror
 * Module: MMM-RMV
 *
 * By Com-Lum
 * MIT Licensed.
 */

const https = require("https");
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
		para +="&duration=" + this.config.maxT;
		para +="&maxJourneys=" + this.config.maxJ;
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

	getData: function(url, stationId)
	{
		https.get(url, (res) => {
			let data = [];
			res.on("data", (chunk) => {
				data.push(chunk);
			});
			res.on("end", () => {
				let text = Buffer.concat(data).toString();
				if (res.statusCode < 200 || res.statusCode > 299) {
					console.error("Requesting " + url + " failed with status code " + res.statusCode + " " + text);
				} else {
					if (text !== "") text = JSON.parse(text);
					this.sendSocketNotification("Trains" + stationId, text);
				}
			});
		})
		.on("error", (err) => {
			console.error("Request failed: ", err.message);
		});
	}
});
