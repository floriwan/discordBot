var conf = require('../config.json');
var mysql = require('mysql');
var Discord = require('discord.js');
const geolib = require('geolib');

var icaoCode = '';

var db_config = {
    host: "localhost",
    user: conf.dbuser,
    password: conf.dbpass
}

function ftToM(feet) {
    return Math.round( (feet / 3.281) * 100) / 100;
}

function getRunways(connection, id) {

    return new Promise((resolve, reject) => {

        connection.query("select * from botbox.runways where airport_ref = \"" + 
            id + "\"", function (err, result) {
            if(err) reject(err);
            //console.log ("dbrequest " + result);
            resolve(result);
        });
    });
}

function getAirport(connection) {

    return new Promise((resolve, reject) => {
console.log("select * from botbox.airports where ident like \"" + 
            icaoCode.toUpperCase() + "\"");
        connection.query("select * from botbox.airports where ident like \"" + 
            icaoCode.toUpperCase() + "\"", function (err, result) {
            if(err) reject(err);
            //console.log ("dbrequest " + result);
            resolve(result[0]);
        });
    });

}

async function getAllDBResults(message) {

    const connection = mysql.createConnection(db_config);

    airport = await getAirport(connection);
    console.log("airport: " + airport.name);
    runways = await getRunways(connection, airport.id);
    console.log("runways found: " + runways.length);

    var titleString = "information for " + airport.name + " (" + icaoCode.toUpperCase() + ")";

    website = airport.wikipedia_link;
    if (website === '') website = airport.home_link;

    elevation = airport.elevation_ft + "ft (" + ftToM(airport.elevation_ft) + "m)";
    
    coordinates = "LAT " + airport.latitude_deg + " LONG " + airport.longitude_deg + "\n" +
        "N " + geolib.decimalToSexagesimal(airport.latitude_deg) + " E " +
        geolib.decimalToSexagesimal(airport.longitude_deg);

    allRunways = "";
    for (let runway of runways) {
        allRunways += "**" + runway.le_ident + "/" + runway.he_ident + "** length: " + 
            runway.length_ft + "ft (" +
            ftToM(runway.length_ft) + "m) surface: " + runway.surface + "\n";
    }
    if (runways === "") runways = "N/A";

    const exampleEmbed = new Discord.RichEmbed()
        .setColor('#e59866')
        .setTitle(titleString)
        .addField('elevation', elevation)
        .addField('coordinates', coordinates)
        .addField('ICAO', icaoCode.toUpperCase(), true)
        .addField('IATA', airport.iata_code, true)
        .addField('runways', allRunways)
        .addField('website', website);
    return message.channel.send(exampleEmbed);

    //console.log("getAllDBResults " + airportName);
/*
    if ( airportName === '') {
        throw new Error("no airport name found in DB")
    }

    var windString = "wind from " + DegToDirection(metarJson.wind.direction) + 
        " (" + metarJson.wind.direction + " degrees) with " + 
        metarJson.wind.speed + " knots (" + knotsTokmh(metarJson.wind.speed) + " km/h)";

    var titleString = "information for " + airportName + 
        " (" + icaoCode.toUpperCase() + ")\nissued " +
    metarJson.time.toString().substring(0, 15) + " at " + 
    metarJson.time.getHours() + ":" + metarJson.time.getMinutes();
    //console.log(titleString);

    if(metarJson.altimeterInHpa) {}
        var pressureString = metarJson.altimeterInHpa + " hPa (" +
            hpaToInhg(metarJson.altimeterInHpa) + " inHg)";
    } else if (metarJson.altimeterInHg) {
        var pressureString = metarJson.altimeterInHg + " inHg (" +
            InhgToHpa(metarJson.altimeterInHg) + " hPa)";
    } else {
        var pressureString = "undefined";
    }

    console.log("channel send");
    const exampleEmbed = new Discord.RichEmbed()
        .setTitle(titleString)
        .addField('metar', metarString)
        .addField("wind information", windString)
        .addField('pressure', pressureString);
    return message.channel.send(exampleEmbed);
*/
}

module.exports = {

    name: 'info',
    description: 'AirpotInformation',
    args: true,
    usage: '<icaocode>',
    
    execute(message, args, con) {

        Discord = require('discord.js');
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
        var DomParser = require('xmldom').DOMParser
        var regex = RegExp('[a-z]{4}');
        var parseMETAR = require("metar");

        icaoCode = args[0].toLowerCase();
        
        if (!regex.test(icaoCode)) {
            return message.channel.send(`${m|| message.connectionauthor.botessage.author} you didn't provide a valid ICAO airport code!`);
        } else {
            console.log(`   airport code: ${icaoCode}`);
            return getAllDBResults(message);
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
