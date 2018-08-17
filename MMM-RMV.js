/* Magic Mirror
 * Module: MMM-RMV
 *
 * By Com-Lum / https://github.com/Com-Lum
 * MIT Licensed.
 * 
 * v1.0.3
 */

Module.register("MMM-RMV", {

    defaults: {
		apiUrl: 'https://www.rmv.de/hapi/departureBoard?accessId=',
		apiKey: '',
		stationId: '3000001',
		maxC: 15,
		lines: '', // "S1, U1"
		fDestination1: 'Frankfurt (Main) Hauptbahnhof',
		fDestination2: 'Frankfurt (Main) Flughafen Regionalbahnhof',
		fDestination3: '',
		fDestination4: '',
		fDestination5: '',
		labelRow: true,
		stopName: 'RMV',
		maxT: 60,
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
	// adds the station name as header	

	var collector = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        collector.appendChild(header);
	
	// splits the different transport types	
	
	var coll = document.createElement("div");
        var headerGen = document.createElement("header");
	headerGen.className = "type";
        headerGen.innerHTML = this.translate("UNKNOWN");
        coll.appendChild(headerGen);

	var collTram = document.createElement("div");
	var headerTram = document.createElement("header");
	headerTram.className = "type";
	headerTram.innerHTML = this.translate("TRAM");
        collTram.appendChild(headerTram);

	var collSub = document.createElement("div");
	var headerSub = document.createElement("header");
	headerSub.className = "type";
	headerSub.innerHTML = this.translate("SUB");
        collSub.appendChild(headerSub);

	var collBus = document.createElement("div");
	var headerBus = document.createElement("header");
	headerBus.className = "type";
	headerBus.innerHTML = this.translate("BUS");
        collBus.appendChild(headerBus);

	var collTrain = document.createElement("div");
	var headerTrain = document.createElement("header");
	headerTrain.className = "type";
	headerTrain.innerHTML = this.translate("TRAIN");
        collTrain.appendChild(headerTrain);


	
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

	// Start creating connections tables
			
	     var table = document.createElement("table");
	     var tableTram = document.createElement("table");
	     var tableSub = document.createElement("table");
	     var tableBus = document.createElement("table");
	     var tableTrain = document.createElement("table");
	     
	     table.classList.add("small", "table");
	     table.border='0';
	     tableBus.classList.add("small", "table");
	     tableBus.border='0';
	     tableTram.classList.add("small", "table");
	     tableTram.border='0';
	     tableSub.classList.add("small", "table");
	     tableSub.border='0';
	     tableTrain.classList.add("small", "table");
	     tableTrain.border='0';	     
	
								
	     // check if connections are available and sort by train / tram / sub / bus

	     var countedLines = 0;
	     var countedLinesBus = 0;
	     var countedLinesTram = 0;
	     var countedLinesSub = 0;
	     var countedLinesTrain = 0;
				
	     for (var f in this.rmv_data.Departure)
	     {
		  var trains = this.rmv_data.Departure[f];
		  if(this.config.lines !== '' ) 
		  {			
			if(this.rmvLines(trains.name, this.config.lines)) 
			{													
				if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) 
				{	
					if (trains.Product.catOutL == "S-Bahn" || trains.Product.catOutL == "Niederflurstraßenbahn")
					{	countedLinesTram = countedLinesTram + 1;	}
					else if (trains.Product.catOutL == "U-Bahn")
					{	countedLinesSub = countedLinesSub + 1;	}
					else if (trains.Product.catOutL == "Niederflurbus")
					{	countedLinesBus = countedLinesBus + 1;	}
					else if (trains.Product.catOutL == "RB" || trains.Product.catOutL == "RE" || trains.Product.catOutL == "IC" || trains.Product.catOutL == "ICE")
					{	countedLinesTrain = countedLinesTrain + 1;	}
					else 
					{	countedLines = countedLines + 1; }
				}
				else {}
			} 
		   } 
		   else
		   {
			if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5)
			{
				if (trains.Product.catOutL == "S-Bahn" || trains.Product.catOutL == "Niederflurstraßenbahn")
				{	countedLinesTram = countedLinesTram + 1;	}
				else if (trains.Product.catOutL == "U-Bahn")
				{	countedLinesSub = countedLinesSub + 1;	}
				else if (trains.Product.catOutL == "Niederflurbus")
				{	countedLinesBus = countedLinesBus + 1;	}
				else if (trains.Product.catOutL == "RB" || trains.Product.catOutL == "RE" || trains.Product.catOutL == "IC" || trains.Product.catOutL == "ICE" )
				{	countedLinesTrain = countedLinesTrain + 1;	}
				else 
				{	countedLines = countedLines + 1; }
			}
			else {}
		   }
	     }		

	// adds label

	     if (this.config.labelRow) 
	     {
		collector.appendChild(this.Build_RowSp());
		if (countedLines > 0)
		{	
			table.appendChild(this.Build_LabelRow());	
		}
		if (countedLinesTram > 0)
		{	
			tableTram.appendChild(this.Build_LabelRow());
		}
		if (countedLinesSub > 0)
		{	
			tableSub.appendChild(this.Build_LabelRow());
		}
		if (countedLinesBus > 0)
		{	
			tableBus.appendChild(this.Build_LabelRow());
		}	
		if (countedLinesTrain > 0)
		{	
			tableTrain.appendChild(this.Build_LabelRow());
		}	
	     }
					
	     // add the available lines
	     var countedLines = 0;
	     var countedLinesBus = 0;
	     var countedLinesTram = 0;
	     var countedLinesSub = 0;
	     var countedLinesTrain = 0;
				
	     for (var f in this.rmv_data.Departure)
	     {
		  var trains = this.rmv_data.Departure[f];

		  if(this.config.lines !== '' ) 
		  {
			if(this.rmvLines(trains.name, this.config.lines)) 
			{
				if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) 
				{
					if (trains.Product.catOutL == "S-Bahn" || trains.Product.catOutL == "Niederflurstraßenbahn")
					{
					  	if (countedLinesTram < this.config.maxC)
						{
							tableTram.appendChild(this.Build_RowData(trains));
							countedLinesTram = countedLinesTram + 1;
						}	
					}
					else if (trains.Product.catOutL == "U-Bahn")
					{	
					  	if (countedLinesSub < this.config.maxC)
						{
							tableSub.appendChild(this.Build_RowData(trains));
							countedLinesSub = countedLinesSub + 1;	
						}					
					}
					else if (trains.Product.catOutL == "Niederflurbus")
					{	
					  	if (countedLinesBus < this.config.maxC)
						{
							tableBus.appendChild(this.Build_RowData(trains));
							countedLinesBus = countedLinesBus + 1;
						}						
					}
					else if (trains.Product.catOutL == "RB" || trains.Product.catOutL == "RE" || trains.Product.catOutL == "IC" || trains.Product.catOutL == "ICE" )
					{	
					  	if (countedLinesTrain < this.config.maxC)
						{
							tableTrain.appendChild(this.Build_RowData(trains));
							countedLinesTrain = countedLinesTrain + 1;
						}					
					}
					else 
					{
					  	if (countedLines < this.config.maxC)
						{
							table.appendChild(this.Build_RowData(trains));							
							countedLines = countedLines + 1;
						}
					}
				}
				else {}
			}						
		}
		else
		{	
			if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5)
			{
				if (trains.Product.catOutL == "S-Bahn" || trains.Product.catOutL == "Niederflurstraßenbahn")
				{	
					if (countedLinesTram < this.config.maxC)
					{
						tableTram.appendChild(this.Build_RowData(trains));
						countedLinesTram = countedLinesTram + 1;
					}	
				}
				else if (trains.Product.catOutL == "U-Bahn")
				{	
					if (countedLinesSub < this.config.maxC)
					{
						tableSub.appendChild(this.Build_RowData(trains));
						countedLinesSub = countedLinesSub + 1;	
					}					
				}
				else if (trains.Product.catOutL == "Niederflurbus")
				{	
					if (countedLinesBus < this.config.maxC)
					{
						tableBus.appendChild(this.Build_RowData(trains));
						countedLinesBus = countedLinesBus + 1;	
					}
				}
				else if (trains.Product.catOutL == "RB" || trains.Product.catOutL == "RE" || trains.Product.catOutL == "IC" || trains.Product.catOutL == "ICE" )
				{	
					if (countedLinesTrain < this.config.maxC)
					{
						tableTrain.appendChild(this.Build_RowData(trains));
						countedLinesTrain = countedLinesTrain + 1;
					}	
				}
				else 
				{
					if (countedLines < this.config.maxC)
					{
						table.appendChild(this.Build_RowData(trains));							
						countedLines = countedLines + 1;
					}
				}
			}
			else {}
		}
	    }
		
	// adds the tables which contain connections to the main display
	
	    if (countedLines + countedLinesTram + countedLinesSub + countedLinesBus + countedLinesTrain == 0 ) 
	    {			
		if (!collector.hidden) 
		{
			table.appendChild(this.Build_NoConRow());
			collector.appendChild(table);
			this.hide(30000);
		}
	    }
	    else
	    {
		if (countedLines == 0) 
		{	
			if (!coll.hidden) 
			{
				table.appendChild(this.Build_NoConRow());
				coll.appendChild(table);
				coll.style.display = 'none';	
			}
		}
		else
		{
			if (coll.hidden) 
			{	coll.show(5000);	} 
			table.appendChild(this.Build_RowSp());
			coll.appendChild(table);
		}

		if (countedLinesTram == 0) 
		{	
			if (!collTram.hidden) 
			{
				tableTram.appendChild(this.Build_NoConRow());
				collTram.appendChild(tableTram);
				collTram.style.display = 'none';		
			}
		}
		else
		{
			if (collTram.hidden) 
			{	collTram.show(5000);	} 
			tableTram.appendChild(this.Build_RowSp());
			collTram.appendChild(tableTram);
		}

		if (countedLinesSub == 0) 
		{	
			if (!collSub.hidden) 
			{
				tableSub.appendChild(this.Build_NoConRow());
				collSub.appendChild(tableSub);
				collSub.style.display = 'none';	
			}
		}
		else
		{
			if (collSub.hidden) 
			{	collSub.show(5000);	} 
			tableSub.appendChild(this.Build_RowSp());
			collSub.appendChild(tableSub);
		}

		if (countedLinesBus == 0) 
		{	
			if (!collBus.hidden) 
			{
				tableBus.appendChild(this.Build_NoConRow());
				collBus.appendChild(tableBus);
				collBus.style.display = 'none';	
			}
		}
		else
		{
			if (collBus.hidden) 
			{	collBus.show(5000);	} 
			tableBus.appendChild(this.Build_RowSp());
			collBus.appendChild(tableBus);
		}

		if (countedLinesTrain == 0) 
		{	
			if (!collTrain.hidden) 
			{
				tableTrain.appendChild(this.Build_NoConRow());
				collTrain.appendChild(tableTrain);
				collTrain.style.display = 'none';
			}
		}
		else
		{
			if (collTrain.hidden) 
			{	collTrain.show(5000);	} 
			tableTrain.appendChild(this.Build_RowSp());
			collTrain.appendChild(tableTrain);
		}
		collector.appendChild(coll);	
     		collector.appendChild(this.Build_RowSp());
		collector.appendChild(collTram);
     		collector.appendChild(this.Build_RowSp());
		collector.appendChild(collSub);
     		collector.appendChild(this.Build_RowSp());
		collector.appendChild(collBus);
     		collector.appendChild(this.Build_RowSp());
		collector.appendChild(collTrain);
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
		IgLines = IgLines.replace(/\s+/g,'');
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
		if (data.Product.catOutL == "Niederflurbus")
	        	{ DataLine.innerHTML = data.Product.line; }
	        else
        	{ DataLine.innerHTML = data.name; }
		DataRow.appendChild(DataLine);
		//
	        var destination = document.createElement("td");
		var dest = data.direction
		dest = dest.replace("(Main)", "");
		if (dest.length > 20)
		{	
			dest = dest.replace("Frankfurt", "");	
		}
		if (dest.length > 20)
		{	
			dest = dest.replace("Hauptbahnhof", "Hbf")
			dest = dest.replace("Bahnhof", "Bf")
		}
	        destination.innerHTML = dest;
        	DataRow.appendChild(destination);

		//Create current Time

		var date = new Date();
		var hour = date.getHours();
		var min = date.getMinutes();
		var dataHour;
		var dataMin;
		var dataTime;
		var AddHour = false;
		var maxTDif = Math.round(this.config.maxT/60)+1;
		if (!data.rtTime)
		{
			dataHour = parseInt(data.time.slice(0,2),10);
			dataMin = parseInt(data.time.slice(3,5));
			dataTime = data.time.slice(0,5);
		}
		else
		{
			dataHour = parseInt(data.rtTime.slice(0,2),10);
			dataMin = parseInt(data.rtTime.slice(3,5));
			dataTime = data.rtTime.slice(0,5);
		}
		if (dataHour < maxTDif && hour > 24 - maxTDif)
		{
			dataHour = dataHour + 24;
			AddHour = true;
			
		}
		var MinCur = (hour * 60) + min;
		var MinPlanRT = (dataHour * 60) + dataMin;
		var MinPlan = ((parseInt(data.time.slice(0,2),10)) *60) + (parseInt(data.time.slice(3,5)));
		if (AddHour && data.time.slice(0,2) < 2)
		{	
			MinPlan = MinPlan + 24 * 60;	
		}
		var DifTime = MinPlanRT - MinCur;
		if (data.time.slice(0,2) > 22 && hour < 2)
		{	var Late = MinPlanRT + (23 * 60) - MinPlan;	}
		else
		{	var Late = MinPlanRT - MinPlan;		}
		if (!data.rtTime)
		{
			if (DifTime < 0)
			{
				DifTime = DifTime * (-1);
				var Late = DifTime;
			}
		}
		
		if (Late == 0 && data.reachable == true)
		{
			var departure = document.createElement("td");
			departure.className = "departure";
			if (DifTime == 0)
			{	departure.innerHTML = this.translate("NOW");	}
			else if (DifTime == 1)
			{	departure.innerHTML = 'In 1 ' + this.translate("MINUTE");	}
			else if (DifTime < 45) 
			{	departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES");	}
			else
			{	
				if (AddHour)
				{	
					if (dataMin < 10)
					{ dataMin = '0' + dataMin; }
					departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin;	
				}
				else
				{
					departure.innerHTML = dataTime;	
				}
			}
		} 
		else if (data.reachable == true)
		{
			var departure = document.createElement("td");
			departure.className = "departureLate";
		        if (DifTime == 0)
			{	departure.innerHTML = this.translate("NOW") + ' (+' + Late + ')';	}
			else if (DifTime == 1) 
			{	departure.innerHTML = 'In 1 ' + this.translate("MINUTE") + ' (+' + Late + ')';	} 
			else if (DifTime < 45 && data.rtTime) 
			{	departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES")+ ' (+' + Late + ')';	} 
			else if (Late > 30 && !data.rtTime)
			{	departure.innerHTML = this.translate("UNCLEAR")+ ' (+' + Late + ')';	}
			else 
			{	
				if (AddHour)
				{	
					if (dataMin < 10)
					{ dataMin = '0' + dataMin; }
					
					departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin + ' (+' + Late + ')';	
				}
				else
				{
					departure.innerHTML = dataTime + ' (+' + Late + ')';
				}
			}
		}
		else
		{
			var departure = document.createElement("td");
			departure.className = "departure";
			departure.innerHTML = this.translate("CANCELLED");
		}
		DataRow.appendChild(departure);
		return DataRow;
    	}
}
);
