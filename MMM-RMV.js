/* Magic Mirror
 * Module: MMM-RMV
 *
 * By Com-Lum / https://github.com/Com-Lum
 * MIT Licensed.
 * 
 * v1.0.11
 */

Module.register("MMM-RMV",{

	defaults: {
		apiUrl: 'https://www.rmv.de/hapi/departureBoard?accessId=',
		apiKey: '',
		stopName: 'RMV',
		stationId: '', // update required here
		labelStation: true,
		labelDestination: false,
		labelType: true,
		labelRow: true,
		delayLimit: 0,
		relativTime: true,
		reduceD: false,
		fDest: true,
		fDestination1: '', // update required here
		fDestination2: '', // update required here
		fDestination3: '',
		fDestination4: '',
		fDestination5: '',
		lines: '', // "S1, U1,Tram 11"
		Ctype: '', // "Bus" "Tram" "Sub" "Train" "Unk"
		showblocked: false,
		maxC: 15,
		maxT: 60,
		minT: 0,
		maxJ: 50,
		relT: 45,
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

	start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);
		this.sendSocketNotification("CONFIG",this.config);
		setInterval(
			function () { self.sendSocketNotification("CONFIG",self.config); }
			,this.config.updateInterval);
	},


	socketNotificationReceived: function (notification,payload) {
		if (notification === "Trains" + this.config.stationId) {
			console.log(payload);	//see recieved data
			this.rmv_data = payload;
			this.config.stopName = this.rmv_data.Departure[0].stop;
			this.updateDom();

		}
	},

	getDom: function () {
		// adds the station name as header	

		function getTrainCat(trains) {
			if (typeof trains.Product[0] != "undefined") {
				// new api
				return trains.Product[0].catOutL;
			} else {
				// old api
				return trains.Product.catOutL;
			}
		};

		var collector = document.createElement("div");
		if (this.config.labelStation == true) {
			if (this.config.labelDestination == true && this.config.fDest == true) {
				var _check = 0;
				var _fDest = 0;

				if (this.config.fDestination1 !== "") {
					_check++;
					_fDest = 1;
				}
				if (this.config.fDestination2 !== "") {
					_check++;
					_fDest = 2;
				}
				if (this.config.fDestination3 !== "") {
					_check++;
					_fDest = 3;
				}
				if (this.config.fDestination4 !== "") {
					_check++;
					_fDest = 4;
				}
				if (this.config.fDestination5 !== "") {
					_check++;
					_fDest = 5;
				}

				if (_check == 1) {
					var header = document.createElement("header");
					header.className = "headerS";
					switch (_fDest) {
						case 1:
							{
								header.innerHTML = this.config.stopName + " -> " + this.config.fDestination1;
								break;
							}
						case 2:
							{
								header.innerHTML = this.config.stopName + " -> " + this.config.fDestination2;
								break;
							}
						case 3:
							{
								header.innerHTML = this.config.stopName + " -> " + this.config.fDestination3;
								break;
							}
						case 4:
							{
								header.innerHTML = this.config.stopName + " -> " + this.config.fDestination4;
								break;
							}
						case 5:
							{
								header.innerHTML = this.config.stopName + " -> " + this.config.fDestination5;
								break;
							}
						default:
							{
								header.innerHTML = this.config.stopName;
								break;
							}
					}
					collector.appendChild(header);
				}
				else {
					var header = document.createElement("header");
					header.innerHTML = this.config.stopName;
					collector.appendChild(header);
				}
			}
			else {
				var header = document.createElement("header");
				header.innerHTML = this.config.stopName;
				collector.appendChild(header);
			}


		}

		// lists the blocked types and lines

		if (this.config.showblocked == true && (this.config.lines !== "" || this.config.Ctype !== "")) {
			var headerBlocked = document.createElement("header");
			headerBlocked.className = "blocked";
			headerBlocked.innerHTML = this.Build_BlockedRow();
			collector.appendChild(headerBlocked);
		}

		// splits the different transport types	

		var collUnk = document.createElement("div");
		var collTram = document.createElement("div");
		var collSub = document.createElement("div");
		var collBus = document.createElement("div");
		var collTrain = document.createElement("div");

		if (this.config.labelType == true) {
			var headerUnk = document.createElement("header");
			headerUnk.className = "type";
			headerUnk.innerHTML = this.translate("UNKNOWN");
			collUnk.appendChild(headerUnk);

			var headerTram = document.createElement("header");
			headerTram.className = "type";
			headerTram.innerHTML = this.translate("TRAM");
			collTram.appendChild(headerTram);

			var headerSub = document.createElement("header");
			headerSub.className = "type";
			headerSub.innerHTML = this.translate("SUB");
			collSub.appendChild(headerSub);

			var headerBus = document.createElement("header");
			headerBus.className = "type";
			headerBus.innerHTML = this.translate("BUS");
			collBus.appendChild(headerBus);

			var headerTrain = document.createElement("header");
			headerTrain.className = "type";
			headerTrain.innerHTML = this.translate("TRAIN");
			collTrain.appendChild(headerTrain);
		}

		// Loading data notification

		if (!this.rmv_data) {
			var note = document.createElement("div");
			note.innerHTML = this.translate("Loading data");
			note.className = "small dimmed";
			collector.appendChild(note);
		}
		else {

			// Start creating connections tables

			var table = document.createElement("table");
			var tableTram = document.createElement("table");
			var tableSub = document.createElement("table");
			var tableBus = document.createElement("table");
			var tableTrain = document.createElement("table");
			var tableUnk = document.createElement("table");

			table.classList.add("small","table");
			table.border = '0';
			tableBus.classList.add("small","table");
			tableBus.border = '0';
			tableTram.classList.add("small","table");
			tableTram.border = '0';
			tableSub.classList.add("small","table");
			tableSub.border = '0';
			tableTrain.classList.add("small","table");
			tableTrain.border = '0';
			tableUnk.classList.add("small","table");
			tableUnk.border = '0';


			// check if connections are available and sort by train / tram / sub / bus
			// if "fDest" is "false" all departures at the station will be shown.



			var countedLines = 0;
			var countedLinesBus = 0;
			var countedLinesTram = 0;
			var countedLinesSub = 0;
			var countedLinesTrain = 0;

			for (var f in this.rmv_data.Departure) {
				var trains = this.rmv_data.Departure[f];
				const cat = getTrainCat(trains);
				if (this.config.lines !== '') {
					if (this.rmvLines(trains.name,this.config.lines)) {
						if (this.config.fDest == false) {
							if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") { countedLinesTram = countedLinesTram + 1; }
							else if (cat == "U-Bahn") { countedLinesSub = countedLinesSub + 1; }
							else if (cat == "Niederflurbus" || cat == "Bus") { countedLinesBus = countedLinesBus + 1; }
							else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") { countedLinesTrain = countedLinesTrain + 1; }
							else { countedLines = countedLines + 1; }
						}
						else if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) {
							if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") { countedLinesTram = countedLinesTram + 1; }
							else if (cat == "U-Bahn") { countedLinesSub = countedLinesSub + 1; }
							else if (cat == "Niederflurbus" || cat == "Bus") { countedLinesBus = countedLinesBus + 1; }
							else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") { countedLinesTrain = countedLinesTrain + 1; }
							else { countedLines = countedLines + 1; }
						}
						else { }
					}
				}
				else {
					if (this.config.fDest == false) {
						if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") { countedLinesTram = countedLinesTram + 1; }
						else if (cat == "U-Bahn") { countedLinesSub = countedLinesSub + 1; }
						else if (cat == "Niederflurbus" || cat == "Bus") { countedLinesBus = countedLinesBus + 1; }
						else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") { countedLinesTrain = countedLinesTrain + 1; }
						else { countedLines = countedLines + 1; }
					}
					else if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) {
						if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") { countedLinesTram = countedLinesTram + 1; }
						else if (cat == "U-Bahn") { countedLinesSub = countedLinesSub + 1; }
						else if (cat == "Niederflurbus" || cat == "Bus") { countedLinesBus = countedLinesBus + 1; }
						else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") { countedLinesTrain = countedLinesTrain + 1; }
						else { countedLines = countedLines + 1; }
					}
					else { }
				}
			}

			// adds label

			if (this.config.labelRow) {
				collector.appendChild(this.Build_RowSp());
				if (countedLines > 0) {
					tableUnk.appendChild(this.Build_LabelRow());
				}
				if (countedLinesTram > 0) {
					tableTram.appendChild(this.Build_LabelRow());
				}
				if (countedLinesSub > 0) {
					tableSub.appendChild(this.Build_LabelRow());
				}
				if (countedLinesBus > 0) {
					tableBus.appendChild(this.Build_LabelRow());
				}
				if (countedLinesTrain > 0) {
					tableTrain.appendChild(this.Build_LabelRow());
				}
			}

			// add the available lines
			var countedLines = 0;
			var countedLinesBus = 0;
			var countedLinesTram = 0;
			var countedLinesSub = 0;
			var countedLinesTrain = 0;

			for (var f in this.rmv_data.Departure) {
				var trains = this.rmv_data.Departure[f];
				const cat = getTrainCat(trains);
				//calc minT
				var date = new Date();
				var hour = date.getHours();
				var min = date.getMinutes();
				var dataHour;
				var dataMin;
				var dataTime;
				var AddHour = false;
				var maxTDif = Math.round(this.config.maxT / 60) + 1;
				if (!trains.rtTime) {
					dataHour = parseInt(trains.time.slice(0,2),10);
					dataMin = parseInt(trains.time.slice(3,5));
					dataTime = trains.time.slice(0,5);
				}
				else {
					dataHour = parseInt(trains.rtTime.slice(0,2),10);
					dataMin = parseInt(trains.rtTime.slice(3,5));
					dataTime = trains.rtTime.slice(0,5);
				}
				if (dataHour < maxTDif && hour > 24 - maxTDif) {
					dataHour = dataHour + 24;
					AddHour = true;
				}
				var MinCur = (hour * 60) + min;
				var MinPlanRT = (dataHour * 60) + dataMin;
				var MinPlan = ((parseInt(trains.time.slice(0,2),10)) * 60) + (parseInt(trains.time.slice(3,5)));
				if (AddHour && trains.time.slice(0,2) < 2) {
					MinPlan = MinPlan + 24 * 60;
				}
				var DifTime = MinPlanRT - MinCur;

				if (!trains.rtTime) {
					if (DifTime < 0) {
						DifTime = DifTime * (-1);
					}
				}
				var MinHide = this.config.minT;
				if (MinHide < 0) {
					MinHide = 0;
				}

				if (DifTime >= MinHide) {
					if (this.config.lines !== '') {
						if (this.rmvLines(trains.name,this.config.lines)) {
							if (this.config.fDest == false) {
								if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") {
									if (countedLinesTram < this.config.maxC) {
										tableTram.appendChild(this.Build_RowData(trains));
										countedLinesTram = countedLinesTram + 1;
									}
								}
								else if (cat == "U-Bahn") {
									if (countedLinesSub < this.config.maxC) {
										tableSub.appendChild(this.Build_RowData(trains));
										countedLinesSub = countedLinesSub + 1;
									}
								}
								else if (cat == "Niederflurbus" || cat == "Bus") {
									if (countedLinesBus < this.config.maxC) {
										tableBus.appendChild(this.Build_RowData(trains));
										countedLinesBus = countedLinesBus + 1;
									}
								}
								else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") {
									if (countedLinesTrain < this.config.maxC) {
										tableTrain.appendChild(this.Build_RowData(trains));
										countedLinesTrain = countedLinesTrain + 1;
									}
								}
								else {
									if (countedLines < this.config.maxC) {
										tableUnk.appendChild(this.Build_RowData(trains));
										countedLines = countedLines + 1;
									}
								}
							}
							else if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) {
								if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") {
									if (countedLinesTram < this.config.maxC) {
										tableTram.appendChild(this.Build_RowData(trains));
										countedLinesTram = countedLinesTram + 1;
									}
								}
								else if (cat == "U-Bahn") {
									if (countedLinesSub < this.config.maxC) {
										tableSub.appendChild(this.Build_RowData(trains));
										countedLinesSub = countedLinesSub + 1;
									}
								}
								else if (cat == "Niederflurbus" || cat == "Bus") {
									if (countedLinesBus < this.config.maxC) {
										tableBus.appendChild(this.Build_RowData(trains));
										countedLinesBus = countedLinesBus + 1;
									}
								}
								else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") {
									if (countedLinesTrain < this.config.maxC) {
										tableTrain.appendChild(this.Build_RowData(trains));
										countedLinesTrain = countedLinesTrain + 1;
									}
								}
								else {
									if (countedLines < this.config.maxC) {
										tableUnk.appendChild(this.Build_RowData(trains));
										countedLines = countedLines + 1;
									}
								}
							}
							else { }
						}
					}
					else {
						if (this.config.fDest == false) {
							if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") {
								if (countedLinesTram < this.config.maxC) {
									tableTram.appendChild(this.Build_RowData(trains));
									countedLinesTram = countedLinesTram + 1;
								}
							}
							else if (cat == "U-Bahn") {
								if (countedLinesSub < this.config.maxC) {
									tableSub.appendChild(this.Build_RowData(trains));
									countedLinesSub = countedLinesSub + 1;
								}
							}
							else if (cat == "Niederflurbus" || cat == "Bus") {
								if (countedLinesBus < this.config.maxC) {
									tableBus.appendChild(this.Build_RowData(trains));
									countedLinesBus = countedLinesBus + 1;
								}
							}
							else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") {
								if (countedLinesTrain < this.config.maxC) {
									tableTrain.appendChild(this.Build_RowData(trains));
									countedLinesTrain = countedLinesTrain + 1;
								}
							}
							else {
								if (countedLines < this.config.maxC) {
									tableUnk.appendChild(this.Build_RowData(trains));
									countedLines = countedLines + 1;
								}
							}
						}
						else if (trains.direction === this.config.fDestination1 || trains.direction === this.config.fDestination2 || trains.direction === this.config.fDestination3 || trains.direction === this.config.fDestination4 || trains.direction === this.config.fDestination5) {
							if (cat == "S-Bahn" || cat == "Niederflurstraßenbahn") {
								if (countedLinesTram < this.config.maxC) {
									tableTram.appendChild(this.Build_RowData(trains));
									countedLinesTram = countedLinesTram + 1;
								}
							}
							else if (cat == "U-Bahn") {
								if (countedLinesSub < this.config.maxC) {
									tableSub.appendChild(this.Build_RowData(trains));
									countedLinesSub = countedLinesSub + 1;
								}
							}
							else if (cat == "Niederflurbus" || cat == "Bus") {
								if (countedLinesBus < this.config.maxC) {
									tableBus.appendChild(this.Build_RowData(trains));
									countedLinesBus = countedLinesBus + 1;
								}
							}
							else if (cat == "RB" || cat == "RE" || cat == "IC" || cat == "ICE" || cat == "R-Bahn" || cat == "EC") {
								if (countedLinesTrain < this.config.maxC) {
									tableTrain.appendChild(this.Build_RowData(trains));
									countedLinesTrain = countedLinesTrain + 1;
								}
							}
							else {
								if (countedLines < this.config.maxC) {
									tableUnk.appendChild(this.Build_RowData(trains));
									countedLines = countedLines + 1;
								}
							}
						}
						else { }
					}
				}
			}

			// adds the tables which contain connections to the main display


			if (countedLines + countedLinesTram + countedLinesSub + countedLinesBus + countedLinesTrain == 0) {
				if (!this.hidden) {
					table.appendChild(this.Build_NoConRow());
					collector.appendChild(table);
					this.hide(30000);
				}
			}
			else if (this.rmvTypeall(countedLines,countedLinesTram,countedLinesSub,countedLinesBus,countedLinesTrain)) {
				if (!this.hidden) {
					table.appendChild(this.Build_AllBlockRow());
					collector.appendChild(table);
					this.hide(60000);
				}
			}
			else {
				if (this.hidden) {
					this.show(5000);
				}
				if (countedLines == 0 || this.rmvType("Unk")) {
					if (!collUnk.hidden) {
						tableUnk.appendChild(this.Build_NoConRow());
						collUnk.appendChild(tableUnk);
						collUnk.style.display = 'none';
					}
				}
				else {
					if (collUnk.hidden) { collUnk.show(5000); }
					tableUnk.appendChild(this.Build_RowSp());
					collUnk.appendChild(tableUnk);
				}
				if (countedLinesTram == 0 || this.rmvType("Tram")) {
					if (!collTram.hidden) {
						tableTram.appendChild(this.Build_NoConRow());
						collTram.appendChild(tableTram);
						collTram.style.display = 'none';
					}
				}
				else {
					if (collTram.hidden) { collTram.show(5000); }
					tableTram.appendChild(this.Build_RowSp());
					collTram.appendChild(tableTram);
				}

				if (countedLinesSub == 0 || this.rmvType("Sub")) {
					if (!collSub.hidden) {
						tableSub.appendChild(this.Build_NoConRow());
						collSub.appendChild(tableSub);
						collSub.style.display = 'none';
					}
				}
				else {
					if (collSub.hidden) { collSub.show(5000); }
					tableSub.appendChild(this.Build_RowSp());
					collSub.appendChild(tableSub);
				}

				if (countedLinesBus == 0 || this.rmvType("Bus")) {
					if (!collBus.hidden) {
						tableBus.appendChild(this.Build_NoConRow());
						collBus.appendChild(tableBus);
						collBus.style.display = 'none';
					}
				}
				else {
					if (collBus.hidden) { collBus.show(5000); }
					tableBus.appendChild(this.Build_RowSp());
					collBus.appendChild(tableBus);
				}

				if (countedLinesTrain == 0 || this.rmvType("Train")) {
					if (!collTrain.hidden) {
						tableTrain.appendChild(this.Build_NoConRow());
						collTrain.appendChild(tableTrain);
						collTrain.style.display = 'none';
					}
				}
				else {
					if (collTrain.hidden) { collTrain.show(5000); }
					tableTrain.appendChild(this.Build_RowSp());
					collTrain.appendChild(tableTrain);
				}
				collector.appendChild(collUnk);
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

	Build_NoConRow: function () {
		var NoConRow = document.createElement("tr");
		var NoConHeader = document.createElement("th");
		NoConHeader.className = "NoConRow";
		NoConHeader.setAttribute("colSpan","3");
		NoConHeader.innerHTML = this.translate("NO_CONNECTION");
		NoConRow.appendChild(NoConHeader);
		return NoConRow;
	},

	Build_AllBlockRow: function () {
		var AllBlockRow = document.createElement("tr");
		var AllBlockHeader = document.createElement("th");
		AllBlockHeader.className = "NoConRow";
		AllBlockHeader.setAttribute("colSpan","3");
		AllBlockHeader.innerHTML = this.translate("ALL_BLOCKED");
		AllBlockRow.appendChild(AllBlockHeader);
		return AllBlockRow;
	},

	Build_BlockedRow: function () {
		var Blocked = this.translate("BLOCKED") + ": ";
		var TypeConfig2 = this.config.Ctype;
		var LinesConfig2 = this.config.lines;
		//Ignore spaces / not needed characters
		var TypesWoC2 = TypeConfig2.replace(/\s+/g,'');
		var LinesWoC2 = LinesConfig2.replace(/\s+/g,'');
		//Create a type array from the config parameter
		TypesWoC2 = TypesWoC2.replace('Tram',this.translate("TRAM"));
		TypesWoC2 = TypesWoC2.replace('Sub',this.translate("SUB"));
		TypesWoC2 = TypesWoC2.replace('Bus',this.translate("BUS"));
		TypesWoC2 = TypesWoC2.replace('Train',this.translate("TRAIN"));
		TypesWoC2 = TypesWoC2.replace('Unk',this.translate("UNK"));
		LinesWoC2 = LinesWoC2.replace(/Tram/g,'S');
		if (TypeConfig2 == "") {
			Blocked = Blocked + LinesWoC2;
		}
		else if (LinesConfig2 == "") {
			Blocked = Blocked + TypesWoC2;
		}
		else {
			Blocked = Blocked + TypesWoC2 + "," + LinesWoC2;
		}
		return Blocked;
	},

	Build_LabelRow: function () {
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

	Build_RowSp: function () {
		var RowSp = document.createElement("tr");
		var HeaderSp = document.createElement("th");
		HeaderSp.className = "RowSp";
		HeaderSp.setAttribute("colSpan","3");
		HeaderSp.innerHTML = "";
		RowSp.appendChild(HeaderSp);
		//
		return RowSp;
	},

	// check if lines should be ignored

	rmvLines: function (IgLines,LinesConfig) {
		//Ignore spaces / not needed characters
		var linesWoC = LinesConfig.replace(/\s+/g,'');
		IgLines = IgLines.replace(/\s+/g,'');
		//Create a line array from the config parameter
		var LineArr = linesWoC.split(",");
		//Check lines from config
		for (var a = 0;a < LineArr.length;a++) {
			if (IgLines.length == 1) { IgLines = "S" + IgLines; }
			if (LineArr[a] == IgLines) {
				return false;
			}
		}
		return true;
	},

	rmvType: function (IgType) {
		var TypeConfig = this.config.Ctype;
		if (TypeConfig == '') {
			return false;
		}
		//Ignore spaces / not needed characters
		var TypesWoC = TypeConfig.replace(/\s+/g,'');
		//Create a type array from the config parameter
		var TypeArr = TypesWoC.split(",");
		//Check Types from config
		for (var a = 0;a < TypeArr.length;a++) {
			if (TypeArr[a] == IgType) {
				return true;
			}
		}
		return false;
	},

	rmvTypeall: function (cL,cLTram,cLS,cLB,cLTrain) {
		var unk = 1,tram = 1,sub = 1,bus = 1,train = 1;
		var TypeConfig = this.config.Ctype;
		if (TypeConfig == '') {
			return false;
		}
		//Ignore spaces / not needed characters
		var TypesWoC = TypeConfig.replace(/\s+/g,'');
		//Create a line array from the config parameter
		var TypeArr = TypesWoC.split(",");
		//Check Types from config
		for (var a = 0;a < TypeArr.length;a++) {
			if (TypeArr[a] == "Tram") {
				tram = 0;
			}
			if (TypeArr[a] == "Sub") {
				sub = 0;
			}
			if (TypeArr[a] == "Bus") {
				bus = 0;
			}
			if (TypeArr[a] == "Train") {
				train = 0;
			}
			if (TypeArr[a] == "Unk") {
				unk = 0;
			}
		}
		if (tram == 1 && cLTram == 0) {
			tram = 0;
		}
		if (sub == 1 && cLS == 0) {
			sub = 0;
		}
		if (bus == 1 && cLB == 0) {
			bus = 0;
		}
		if (train == 1 && cLTrain == 0) {
			train = 0;
		}
		if (unk == 1 && cL == 0) {
			unk = 0;
		}
		if (tram + sub + bus + train + unk == 0) {
			return true;
		}
		else {
			return false;
		}
	},

	Build_RowData: function (data) {
		var DataRow = document.createElement("tr");
		var DataLine = document.createElement("td");
		DataLine.className = "lines";
		if (data.Product.catOutL == "Niederflurbus" || data.Product.catOutL == "Niederflurstraßenbahn" || data.Product.catOutL == "Bus") { DataLine.innerHTML = data.Product.line; }
		else { DataLine.innerHTML = data.name; }
		DataRow.appendChild(DataLine);
		//
		var destination = document.createElement("td");
		var dest = data.direction
		if (this.config.reduceD) {
			dest = dest.replace("(Main)","");
			dest = dest.replace("(Taunus)","");
			dest = dest.replace("(Lahn)","");
			dest = dest.replace("(Hessen)","");
			dest = dest.replace("(Odw.)","");
			dest = dest.replace("(Westerwald)","");
			dest = dest.replace("(Rhein)","");
			dest = dest.replace("(Lumda)","");
			dest = dest.replace("(Wetterau)","");
			dest = dest.replace("(Vogelsberg)","");
			dest = dest.replace("(Felda)","");
			dest = dest.replace("(Rhön)","");
			dest = dest.replace("(Wasserkuppe)","");
			dest = dest.replace("(Ohm)","");
			dest = dest.replace("v.d.H.","");
		}
		if (dest.length > 20) {
			dest = dest.replace("Hauptbahnhof","Hbf")
			dest = dest.replace("Bahnhof","Bf")
		}
		if (dest.length > 20) {
			dest = dest.replace("Straße","Str.");
			dest = dest.replace("straße","str.");
		}
		if (dest.length > 25) {
			dest = dest.replace("Frankfurt","F-");
		}

		if (dest.length > 30 && this.config.reduceD) {
			dest = dest.replace("Wiesbaden","Wi-");
			dest = dest.replace("Offenbach","Of-");
			dest = dest.replace("Liederbach","Li-");
			dest = dest.replace("Neu-Isenburg","NI-");
			dest = dest.replace("Mörfelden-Walldorf","M-W-");
			dest = dest.replace("Rödermark","Rö-");
			dest = dest.replace("Rodgau","Ro-");
			dest = dest.replace("Seligenstadt","Se-");
			dest = dest.replace("Rüsselsheim","Rü-");
			dest = dest.replace("Steinau an der Str.","Steinau");
			dest = dest.replace("Niedernhausen","Ni-");
			dest = dest.replace("Bad Homburg","BHom-");
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
		var maxTDif = Math.round(this.config.maxT / 60) + 1;
		if (!data.rtTime) {
			dataHour = parseInt(data.time.slice(0,2),10);
			dataMin = parseInt(data.time.slice(3,5));
			dataTime = data.time.slice(0,5);
		}
		else {
			dataHour = parseInt(data.rtTime.slice(0,2),10);
			dataMin = parseInt(data.rtTime.slice(3,5));
			dataTime = data.rtTime.slice(0,5);
		}
		if (dataHour < maxTDif && hour > 24 - maxTDif) {
			dataHour = dataHour + 24;
			AddHour = true;

		}
		var MinCur = (hour * 60) + min;
		var MinPlanRT = (dataHour * 60) + dataMin;
		var MinPlan = ((parseInt(data.time.slice(0,2),10)) * 60) + (parseInt(data.time.slice(3,5)));
		if (AddHour && data.time.slice(0,2) < 2) {
			MinPlan = MinPlan + 24 * 60;
		}
		var DifTime = MinPlanRT - MinCur;
		if (data.time.slice(0,2) > 22 && hour < 2) { var Late = MinPlanRT + (23 * 60) - MinPlan; }
		else { var Late = MinPlanRT - MinPlan; }
		if (!data.rtTime) {
			if (DifTime < 0) {
				DifTime = DifTime * (-1);
				var Late = DifTime;
			}
		}


		if (this.config.relativTime) {
			if (Late <= this.config.delayLimit && data.reachable == true) {
				var departure = document.createElement("td");
				departure.className = "departure";
				if (DifTime == 0) { departure.innerHTML = this.translate("NOW"); }
				else if (DifTime == 1) { departure.innerHTML = 'In 1 ' + this.translate("MINUTE"); }
				else if (DifTime < this.config.relT) { departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES"); }
				else {
					if (AddHour) {
						if (dataMin < 10) { dataMin = '0' + dataMin; }
						departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin;
					}
					else {
						departure.innerHTML = dataTime;
					}
				}
			}
			else if (data.reachable == true) {
				var departure = document.createElement("td");
				departure.className = "departureLate";
				if (DifTime == 0) { departure.innerHTML = this.translate("NOW") + ' (+' + Late + ')'; }
				else if (DifTime == 1) { departure.innerHTML = 'In 1 ' + this.translate("MINUTE") + ' (+' + Late + ')'; }
				else if (DifTime < this.config.relT && data.rtTime) { departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES") + ' (+' + Late + ')'; }
				else if (Late > 30 && !data.rtTime) { departure.innerHTML = this.translate("UNCLEAR") + ' (+' + Late + ')'; }
				else {
					if (AddHour) {
						if (dataMin < 10) { dataMin = '0' + dataMin; }

						departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin + ' (+' + Late + ')';
					}
					else {
						departure.innerHTML = dataTime + ' (+' + Late + ')';
					}
				}
			}
			else {
				var departure = document.createElement("td");
				departure.className = "departureCancelled";
				departure.innerHTML = this.translate("CANCELLED");
			}
		}
		else {
			if (this.config.relT == 0) {
				if (Late <= this.config.delayLimit && data.reachable == true) {
					var departure = document.createElement("td");
					departure.className = "departure";
					if (AddHour) {
						if (dataMin < 10) { dataMin = '0' + dataMin; }
						departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin;
					}
					else {
						departure.innerHTML = dataTime;
					}
				}
				else if (data.reachable == true) {
					var departure = document.createElement("td");
					departure.className = "departureLate";
					if (Late > 30 && !data.rtTime) { departure.innerHTML = this.translate("UNCLEAR") + ' (+' + Late + ')'; }
					else {
						if (AddHour) {
							if (dataMin < 10) { dataMin = '0' + dataMin; }

							departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin + ' (+' + Late + ')';
						}
						else {
							departure.innerHTML = dataTime + ' (+' + Late + ')';
						}
					}
				}
				else {
					var departure = document.createElement("td");
					departure.className = "departureCancelled";
					departure.innerHTML = this.translate("CANCELLED");
				}
			}
			else {
				if (Late <= this.config.delayLimit && data.reachable == true) {
					var departure = document.createElement("td");
					departure.className = "departure";
					if (DifTime == 0) { departure.innerHTML = this.translate("NOW"); }
					else if (DifTime == 1 && DifTime < this.config.relT) { departure.innerHTML = 'In 1 ' + this.translate("MINUTE"); }
					else if (DifTime < this.config.relT) { departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES"); }
					else {
						if (AddHour) {
							if (dataMin < 10) { dataMin = '0' + dataMin; }
							departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin;
						}
						else {
							departure.innerHTML = dataTime;
						}
					}
				}
				else if (data.reachable == true) {
					var departure = document.createElement("td");
					departure.className = "departureLate";
					if (DifTime == 0) { departure.innerHTML = this.translate("NOW") + ' (+' + Late + ')'; }
					else if (DifTime == 1 && DifTime < this.config.relT) { departure.innerHTML = 'In 1 ' + this.translate("MINUTE") + ' (+' + Late + ')'; }
					else if (DifTime < this.config.relT && data.rtTime) { departure.innerHTML = 'In ' + DifTime + ' ' + this.translate("MINUTES") + ' (+' + Late + ')'; }
					else if (Late > 30 && !data.rtTime) { departure.innerHTML = this.translate("UNCLEAR") + ' (+' + Late + ')'; }
					else {
						if (AddHour) {
							if (dataMin < 10) { dataMin = '0' + dataMin; }

							departure.innerHTML = (parseInt(dataHour,10) - 24) + ':' + dataMin + ' (+' + Late + ')';
						}
						else {
							departure.innerHTML = dataTime + ' (+' + Late + ')';
						}
					}
				}
				else {
					var departure = document.createElement("td");
					departure.className = "departureCancelled";
					departure.innerHTML = this.translate("CANCELLED");
				}
			}
		}
		DataRow.appendChild(departure);
		return DataRow;
	}
}
);
