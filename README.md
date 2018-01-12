# MMM-RMV

<B>Rhein-Main</b> local transport system (<b>RMV</b>) - Departure Monitor <P>

After building my own mirror I've realized that there is no module available for my region to display departure times of trams.<br>
I'm not so familiar with this programming language but after checking the code of other modules I've decided to write my own extension module
for the [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror) project by [MichMich](https://github.com/MichMich/).
<p>

Please feel free to contact me in case you have questions, comments or improvements.

## Version:

v1.0.0<br>
<b>Note</b>: The feature to ignore lines is currently not working...

## Translation

This module is available in English (en) and German (de).

## Dependencies
  * npm
  * [request](https://www.npmjs.com/package/request)

## Installation of the module

As similar to other modules:
* Navigate into your `MagicMirror/modules folder`
* `git clone 'https://github.com/Com-Lum/MMM-RMV.git'`
* Navigate into `MagicMirror/modules/MMM-RMV`
* Execute `npm intall`

## Note

* Multiple instances possible <p>
* The Header of the module will be automatically chosen according to the station name placed in the config-file <p>
* If no connection is available the module disappears after a few seconds<p>
* If there is an error during data retrieving process it will be shown in the console<p>
* if the train is not on time the line will be displayed in red (can be configured)<p>

## Configuration
 
1. minimum configuration within `config.js`:

  ... 

    {
        module: 'MMM-RMV',
        position: 'top_right',
        config: {
                apiKey: '', // can be requested at [RMV - opendata](https://opendata.rmv.de/site/start.html)
                stationId: '', // default is: '30000001' - 'Frankfurt (Main) Hauptwache'
                fDestination1: '', // default is: '30000010' - 'Frankfurt (Main) Hauptbahnhof'
        }
    }
   
 ...
 
2. Configuration including optional parameters within `config.js`:
   
 ...
   
    {
        module: 'MMM-RMV',
        position: 'top_right',
        config: {
			apiKey: '', // can be requested at [RMV - opendata](https://opendata.rmv.de/site/start.html)
			stationId: '', 	
			fDestination1: '', 
			fDestination2: '', // The final destination of the train will be displayed for each line.
			fDestination3: '', 
			fDestination4: '', 
			fDestination5: '', 	
			maxC: 6, // maximum displayed connections (standard = 30)
			lines: '', // Other lines will be ignored
			LabelRow: true, // Show or hide column headers
		    	updateInterval: 60 * 1000 // default: once per minute
        }
    }
    
  ...
    
## Station ID

The stationId can be found in file 'StationID.txt' or at [RMV - opendata](https://opendata.rmv.de/site/start.html).<br>	
The correct station name is in column 'E'.<br>
<b>Note</b>: The stations have to be added in german only.


## Config Options

| **Option** | **Default** | **Description** |
| :---: | :---: | --- |
| stationId | 30000001 | <BR>Choose your departure station<BR><EM> default value: '30000001' - 'Frankfurt (Main) Hauptwache'</EM><P> |
| fDestination1 | 30000010 | <BR>The final stop of the train line has to be added here! (station name)<BR><EM>default value: '30000010' - 'Frankfurt (Main) Hauptbahnhof'</EM><P> |
| fDestination2 | 30002930 | <BR>The final stop of the train line has to be added here! (station name)<BR><EM>default value: '30002930' - 'Frankfurt (Main) Flughafen Regionalbahnhof'</EM><P> |
| fDestination3<BR>`optional` | | <BR>The final stop of the train line has to be added here! (station name) |
| fDestination4<BR>`optional` | | <BR>The final stop of the train line has to be added here! (station name) |
| fDestination5<BR>`optional` | | <BR>The final stop of the train line has to be added here! (station name) |
| maxC<BR>`optional` | 30 | <BR>Maximum displayed lines <BR><EM><B>Note</B>: only the lines within a time frame of 2 hours will be displayed. If there less lines than the limit only the available lines will be displayed</EM><P> |
| lines<BR>`optional` |  | <BR> Not specific lines will be ignored (add commas between the lines)<BR><EM> Example: 'S8, S1' </BR></E><P> |
| labelRow<BR>`optional` | true | <BR> Show or hide column headers<BR> <P> |
| updateInterval<BR>`optional`  | 1*60*1000 | <BR> Update interval in milliseconds <BR><EM> default: Once per minute </EM><P> |


## Screenshots


## Licence
MIT License

Copyright (c) 2018 Com-Lum (https://github.com/Com-Lum/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
