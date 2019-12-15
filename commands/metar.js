module.exports = {

    name: 'metar',
    description: 'MetarInformation',
    args: true,
    usage: '<icaocode>',
    
    execute(message, args) {

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
        var DomParser = require('xmldom').DOMParser
        var regex = RegExp('[a-z]{4}');
        
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
                        
                        retString = `**metar information for ${icaoCode.toUpperCase()}**\n`
                        retString += `\`${metarString}\``;
                        
                        return message.channel.send(`${retString}`);
                    
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
