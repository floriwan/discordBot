
function DegToDirection(degrees) {
    const deg = parseInt(degrees, 10);
    
    if (isNaN(deg)) {
        return 'UNKNOWN';
    }
    
    var val = Math.floor((deg / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function knotsTokmh(knots) {
    return parseInt(knots, 10) * 1.852;
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
                        console.log("   we have a response ...");
                        parser = new DomParser();
                        xmlDoc = parser.parseFromString(Http.responseText);
                
                        var xmlMetar = xmlDoc.getElementsByTagName("raw_text");
                        var metarString = xmlMetar[0].toString();
                        metarString = metarString.substring(10, metarString.length-11);
                        console.log("<- " + metarString);
                        
                        const metarJson = parseMETAR(metarString);
                        var windString = "wind from " + DegToDirection(metarJson.wind.direction) + "(" + metarJson.wind.direction + " degrees) with " + metarJson.wind.speed + "knots (" + knotsTokmh(metarJson.wind.speed) + "km/h)";
                        
                        const exampleEmbed = new Discord.RichEmbed()
                        .setTitle('information for ' + icaoCode.toUpperCase())
                        .addField('metar', metarString)
                        .addField("wind information", windString);
                        
                        return message.channel.send(exampleEmbed);
                        
                        /*
                        retString = "**metar information for " + icaoCode.toUpperCase() + "**\n"
                        retString += "\`" + metarString + "\`\n";
                        retString += "wind from " + metarJson.wind.direction + " degrees with " + metarJson.wind.speed + "kts\n";

                        return message.channel.send(`${retString}`);*/                    
                    } else {
                        console.log("<- ERROR no response");
                    }
                    
                }
            }
        }

    },
};

/*
https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString='.$icao.'&hoursBeforeNow=1
mostRecent=true
https://www.aviationweather.gov/metar/data?ids=KDEN&format=decoded&taf=on
*/
