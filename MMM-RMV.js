/* Magic Mirror
 * Module: MMM-RMV
 *
 * By Com-Lum / https://github.com/Com-Lum
 * MIT Licensed.
 * 
 * v1.0.0
 */

Module.register("MMM-RMV", {

    defaults: {
		apiUrl: 'https://www.rmv.de/hapi/departureBoard?accessId=',
		apiKey: '',
		stationId: '3000001',
		maxC: '50',
		lines: '', // "S8, S1"
		fDestination1: 'Wiesbaden Hauptbahnhof',
		fDestination2: 'Hanau Hauptbahnhof',
		fDestination3: '',
		fDestination4: '',
		fDestination5: '',
		labelRow: true,
		stopName: 'RMV',
        	updateInterval: 1 * 60 * 1000,       // every minute
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getStyles: function () {
        return ["MMM-RMV.css"];
    },

    start: function () 
    {
	var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
		setInterval(
			function()
			{self.sendSocketNotification("CONFIG", self.config);}
			,this.config.updateInterval);
    },

		
    socketNotificationReceived: function (notification, payload) 
    {
	if (notification === "Trains" + this.config.stationId) 
	{
	    this.rmv_data = payload;
	    this.config.stopName = this.rmv_data.Departure[0].stop;
	    this.updateDom();
		//console.log(payload);	//see recieved data	
	}
    },

    getDom: function () 
    {	
	// add the station name as header	

	var collector = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        collector.appendChild(header);
	
	// Loading data notification
		
	if (!this.rmv_data) 
	{
	     var note = document.createElement("div");
	     note.innerHTML = this.translate("Loading data");
	     note.className = "small dimmed";
             collector.appendChild(note);
        
	}
	else
	{

	// Start creating connections table
			
	     var table = document.createElement("table");
	     table.classList.add("small", "table");
	     table.border='0';
								
	     // check if connections are available

	     var countedLines = 0;
				
	     for (var f in this.rmv_data.Departure)
	     {
		  var trains = this.rmv_data.Departure[f];
		  if(this.config.lines !== '' ) 
		  {			
			if(this.rmvLines(trains.name, this.config.lines)) 
			{													
				if (trains.direction === this.config.fDestination1) 
				{	countedLines = countedLines + 1;	}
				else if (trains.stop === this.config.fDestination2) 
				{	countedLines = countedLines + 1;	}
				else if (trains.direction === this.config.fDestination3)
				{	countedLines = countedLines + 1;	}
				else if (trains.direction === this.config.fDestination4)
				{	countedLines = countedLines + 1;	}
				else if (trains.direction === this.config.fDestination5)
				{	countedLines = countedLines + 1;	}
				else {}
			} 
		   } 
		   else
		   {
			if (trains.direction === this.config.fDestination1)
			{	countedLines = countedLines + 1;	}
			else if (trains.direction === this.config.fDestination2)
			{		countedLines = countedLines + 1;	}
			else if (trains.direction === this.config.fDestination3)
			{		countedLines = countedLines + 1		}
			else if (trains.direction === this.config.fDestination4)
			{		countedLines = countedLines + 1;	}
			else if (trains.direction === this.config.fDestination5)
			{		countedLines = countedLines + 1;	}
			else {}
		   }
	     }								
	     if (countedLines > 0 && this.config.LabelRow) 
	     {	table.appendChild(this.Build_LabelRow());	}
	     table.appendChild(this.Build_RowSp());
					
	     // add the available lines
	     var countedLines = 0;
				
	     for (var f in this.rmv_data.Departure)
	     {
		  var trains = this.rmv_data.Departure[f];
		  if(this.config.lines !== '' ) 
		  {
		  	if (countedLines < this.config.maxC)
			{
				if(this.rmvLines(trains.name, this.config.lines)) 
				{
					if (trains.direction === this.config.fDestination1) 
					{
						table.appendChild(this.Build_RowData(trains));
						countedLines = countedLines + 1;
					}
					else if (trains.direction === this.config.fDestination2)
					{
						table.appendChild(this.Build_RowData(trains));
						countedLines = countedLines + 1;
					}
					else if (trains.direction === this.config.fDestination3) 
					{
						table.appendChild(this.Build_RowData(trains));
						countedLines = countedLines + 1
					}
					else if (trains.direction === this.config.fDestination4)
					{
						table.appendChild(this.Build_RowData(trains));
						countedLines = countedLines + 1;
					} 
					else if (trains.direction === this.config.fDestination5)
					{
						table.appendChild(this.Build_RowData(trains));
						countedLines = countedLines + 1;
					}
					else {}
				}						
			} 
		}
		else
		{
			if (countedLines < this.config.maxC)
			{	
				if (trains.direction === this.config.fDestination1)
				{
					table.appendChild(this.Build_RowData(trains));
					countedLines = countedLines + 1;
				}
				else if (trains.direction === this.config.fDestination2)
				{
					table.appendChild(this.Build_RowData(trains));
					countedLines = countedLines + 1;
				} 
				else if (trains.direction === this.config.fDestination3)
 				{
					table.appendChild(this.Build_RowData(trains));
					countedLines = countedLines + 1
				} 
				else if (trains.direction === this.config.fDestination4) 
				{		
					table.appendChild(this.Build_RowData(trains));
					countedLines = countedLines + 1;
				} 
				else if (trains.direction === this.config.fDestination5) 
				{
					table.appendChild(this.Build_RowData(trains));
					countedLines = countedLines + 1;
				} 
			}
			else {}
		}
	    }					
	    if (countedLines == 0) 
	    {			
		if (!this.hidden) 
		{
			table.appendChild(this.Build_NoConRow());
			collector.appendChild(table);
			this.hide(30000);
		}
	    }
	    else
	    {
		if (this.hidden) 
		{	this.show(5000);	} 
		collector.appendChild(table);
	    }
	}
	return collector; 	
    },
	
	Build_NoConRow: function () 
	{
        	var NoConRow = document.createElement("tr");
		
		var NoConHeader = document.createElement("th");
		NoConHeader.className = "NoConRow";
		NoConHeader.setAttribute("colSpan", "3");
		NoConHeader.innerHTML = this.translate("No_CONNECTION");
		NoConRow.appendChild(NoConHeader); 
      	
		return NoConRow;
    	},

	Build_LabelRow: function () 
	{
	        var labelRow = document.createElement("tr");
	        var lineLabel = document.createElement("th");
		lineLabel.className = "lines";
	        lineLabel.innerHTML = this.translate("LINE");
	        labelRow.appendChild(lineLabel);
		//
	        var destinationLabel = document.createElement("th");
		destinationLabel.className = "destination";
	        destinationLabel.innerHTML = this.translate("DESTINATION");
	        labelRow.appendChild(destinationLabel);
		//
	        var departureLabel = document.createElement("th");
		departureLabel.className = "departure";
	        departureLabel.innerHTML = this.translate("DEPARTURE");
	        labelRow.appendChild(departureLabel);
		//
		return labelRow;
    	},
	
	Build_RowSp: function ()
	{
        	var RowSp = document.createElement("tr");
		var HeaderSp = document.createElement("th");
		HeaderSp.className = "RowSp";
		HeaderSp.setAttribute("colSpan", "3");
		HeaderSp.innerHTML = "";
		RowSp.appendChild(HeaderSp); 
      		//
		return RowSp;
	},

	// check if lines should be ignored
	
	rmvLines: function(IgLines, LinesConfig) 
	{
		//Ignore spaces / not needed characters
		var linesWoC = LinesConfig.replace(/\s+/g,'');
		IgLines = IgLines.replace(/\s+g,'');
		//Create a line array from the config parameter
		var LineArr = linesWoC.split(",");
		//Check lines from config
		for (var a=0; a<LineArr.length; a++) 
		{
                        if(IgLines.length == 1)
                        {       IgLines = "S" + IgLines;    }
			if(LineArr[a] == IgLines)
			{	
                             return false;	
                        }
		}
	return true;
	},


	Build_RowData: function (data) 
	{
	        var DataRow = document.createElement("tr");
	        var DataLine = document.createElement("td");
		DataLine.className = "lines";
	        DataLine.innerHTML = data.name;
	        DataRow.appendChild(DataLine);
		//
	        var destination = document.createElement("td");
	        destination.innerHTML = data.direction;
        	DataRow.appendChild(destination);
		//Create current Time
		var date = new Date();
		var hour = date.getHours();
		var min = date.getMinutes();
		var dataHour;
		var dataMin;
		var dataTime;
		if (!data.rtTime)
		{
			dataHour = data.time.slice(0,2);
			dataMin = data.time.slice(3,5);
			dataTime = data.time.slice(0,5);
		}
		else
		{
			dataHour = data.rtTime.slice(0,2);
			dataMin = data.rtTime.slice(3,5);
			dataTime = data.rtTime.slice(0,5);
		}
		var DifMin = dataMin - min;
		var DifHour = dataHour - hour;
		var Dif = DifHour * 60 + DifMin;
  		var Late = ((dataHour - data.time.slice(0,2)) * 60) + (dataMin - data.time.slice(3,5));

		if (Late == 0)
		{
			var departure = document.createElement("td");
			departure.className = "departure";
			if (DifHour == 0 && DifMin == 0)
			{	departure.innerHTML = this.translate("NOW");	}
			else if (DifHour == 0 && DifMin == 1)
			{	departure.innerHTML = 'In 1 ' + this.translate("MINUTE");	}
			else if (Dif < 45) 
			{	departure.innerHTML = 'In ' + Dif + ' ' + this.translate("MINUTES");	}
			else
			{	departure.innerHTML = dataTime;	}
		} 
		else
		{
			var departure = document.createElement("td");
			departure.className = "departureLate";
		        if (DifHour == 0 && DifMin == 0)
			{	departure.innerHTML = this.translate("NOW") + '(+' + Late + ')';	}
			else if (DifHour == 0 && DifMin == 1) 
			{	departure.innerHTML = 'In 1 ' + this.translate("MINUTE") + '(+' + Late + ')';	} 
			else if (Dif < 45) 
			{	departure.innerHTML = 'In ' + Dif + ' ' + this.translate("MINUTES")+ '(+' + Late + ')';	} 
			else {	departure.innerHTML = dataTime + '(+' + Late + ')';	}
		}
		DataRow.appendChild(departure);
		return DataRow;
    	}
}
);
