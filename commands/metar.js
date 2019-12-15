
function DegToDirection(degrees) {
    const deg = parseInt(degrees, 10);
    
    if (isNaN(deg)) {
        return 'UNKNOWN';
    }
    
    var val = Math.floor((deg / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function hpaToInhg(value) {
    return Math.round( (parseInt(value, 10) * 0.030) * 100 ) / 100;
}

function InhgToHpa(value) {
    var floatValue = parseFloat(value);
    return Math.round(floatValue * 33.7685);
}

function knotsTokmh(knots) {
    return Math.round( (parseInt(knots, 10) * 1.852) *10 ) / 10;
}

module.exports = {

    name: 'metar',
    description: 'MetarInformation',
    args: true,
    usage: '<icaocode>',
    
    execute(message, args) {

        const Discord = require('discord.js');
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
        var DomParser = require('xmldom').DOMParser
        var regex = RegExp('[a-z]{4}');
        var parseMETAR = require("metar");
        
        const icaoCode = args[0].toLowerCase();
        
        if (!regex.test(icaoCode)) {
            return message.channel.send(`${message.author} you didn't provide a valid ICAO airport code!`);
        } else {
            console.log(`   airport code: ${icaoCode}`);
                        
            const Http = new XMLHttpRequest();
            const url='https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&mostRecent=true&hoursBeforeNow=1&stationString='+icaoCode
            //console.log(`   ${url}`);
            
            Http.open("GET", url);
            Http.send();

            Http.onreadystatechange = (e) => {

                //console.log("   " + Http.responseText)
                
                if (Http.readyState == 4 && Http.status == 200) {
                    
                    if (Http.responseText) {
                        //console.log("   we have a response ...");
                        parser = new DomParser();
                        xmlDoc = parser.parseFromString(Http.responseText);
                
                        var xmlMetar = xmlDoc.getElementsByTagName("raw_text");
                        var metarString = xmlMetar[0].toString();
                        metarString = metarString.substring(10, metarString.length-11);
                        console.log("<- " + metarString);
                        
                        const metarJson = parseMETAR(metarString);
                        var windString = "wind from " + DegToDirection(metarJson.wind.direction) + " (" + metarJson.wind.direction + " degrees) with " + metarJson.wind.speed + " knots (" + knotsTokmh(metarJson.wind.speed) + " km/h)";

                        if(metarJson.altimeterInHpa) {
                            var pressureString = metarJson.altimeterInHpa + " hPa (" + hpaToInhg(metarJson.altimeterInHpa) + " inHg)";
                        } else if (metarJson.altimeterInHg) {
                            var pressureString = metarJson.altimeterInHg + " inHg (" + InhgToHpa(metarJson.altimeterInHg) + " hPa)";
                        } else {
                            var pressureString = "undefined";
                        }

                        var titleString = "information for " + icaoCode.toUpperCase() + " issued " + metarJson.time.toString().substring(0, 15) + " at " + metarJson.time.getHours() + ":" + metarJson.time.getMinutes();

                        const exampleEmbed = new Discord.RichEmbed()
                        //.setTitle('information for ' + icaoCode.toUpperCase())
                        .setTitle(titleString)
                        .addField('metar', metarString)
                        .addField("wind information", windString)
                        .addField('pressure', pressureString);
                        return message.channel.send(exampleEmbed);
                                           
                    } else {
                        console.log("<- ERROR no response");
                    }
                    
                }
            }
        }

    },
};

/*
Sun Dec 15 2019 14:50:43 GMT+0100 (Central European Standard Time)

"time": "2013-12-17T19:50:38.219Z",

https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString='.$icao.'&hoursBeforeNow=1
mostRecent=true
https://www.aviationweather.gov/metar/data?ids=KDEN&format=decoded&taf=on
*/
