window.$ = require('jquery');
const base45 = require('base45');
const cbor = require('cbor-web');
const pako = require('pako');
const moment = require('moment');

import './style.css';

// mp value set
var vaccines = {
    "valueSetId": "vaccines-covid-19-names",
    "valueSetDate": "2021-04-27",
    "valueSetValues": {
        "EU/1/20/1528": {
            "display": "Comirnaty",
            "lang": "en",
            "active": true,
            "system": "https://ec.europa.eu/health/documents/community-register/html/",
            "version": ""
        },
        "EU/1/20/1507": {
            "display": "COVID-19 Vaccine Moderna",
            "lang": "en",
            "active": true,
            "system": "https://ec.europa.eu/health/documents/community-register/html/",
            "version": ""
        },
        "EU/1/21/1529": {
            "display": "Vaxzevria",
            "lang": "en",
            "active": true,
            "system": "https://ec.europa.eu/health/documents/community-register/html/",
            "version": ""
        },
        "EU/1/20/1525": {
            "display": "COVID-19 Vaccine Janssen",
            "lang": "en",
            "active": true,
            "system": "https://ec.europa.eu/health/documents/community-register/html/",
            "version": ""
        },
        "CVnCoV": {
            "display": "CVnCoV",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "Sputnik-V": {
            "display": "Sputnik-V",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "Convidecia": {
            "display": "Convidecia",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "EpiVacCorona": {
            "display": "EpiVacCorona",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "BBIBP-CorV": {
            "display": "BBIBP-CorV",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "Inactivated-SARS-CoV-2-Vero-Cell": {
            "display": "Inactivated SARS-CoV-2 (Vero Cell)",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "CoronaVac": {
            "display": "CoronaVac",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        },
        "Covaxin": {
            "display": "Covaxin (also known as BBV152 A, B, C)",
            "lang": "en",
            "active": true,
            "system": "http://ec.europa.eu/temp/vaccineproductname",
            "version": "1.0"
        }
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function encodeDGC(obj) {
    // patch with dummy data to make the QR code look like a real DGC with lots of data
    obj.date = moment().format('YYYY-MM-DD');
    obj.type = obj.purpose.substr(0, 1).toUpperCase() + 'ST';
    const data = "HC2: " + JSON.stringify(obj) + "|" + makeid(10);
    console.log(data.length);
    return data;

}

function decodeDGC(data) {

    // check prefix
    const prefix = data.substr(0, data.indexOf(':'));

    if (prefix === 'HC2') {
        // cool a fun DGC !
        const pass = JSON.parse(data.substr(4, data.indexOf('|') - 4));
        json = {
            "type":"f",
            "f": [{
                "t": pass.type,
                "p": pass.purpose,
                "dt": pass.date
            }],
            "dob": moment().format('YYYY-MM-DD'),
            "nam": {
                "fn": pass.lastName,
                "gn": pass.firstName,
                "fnt": pass.lastName.toUpperCase(),
                "gnt": pass.firstName.toUpperCase()
            }
        };
        json.age = moment().diff(json.dob, 'years', false);
        json.dob_str = moment(json.dob).format('MMMM Do YYYY');
        json.f[0].daysAgo = moment().diff(json.f[0].dt, 'days', false)
        return {"valid": true, "json": json};

    } else if (prefix === "HC1") {
        // Remove `HC1:` from the string
        const greenpassBody = data.substr(4);

        // Data is Base45 encoded
        const decodedData = base45.decode(greenpassBody);

        // And zipped
        const output = pako.inflate(decodedData);

        const results = cbor.decodeAllSync(output);

        //const headers1 = results[0].value[0];
        //const headers2 = results[0].value[1];
        const cbor_data = results[0].value[2];
        //const signature = results[0].value[3];

        const greenpassData = cbor.decodeAllSync(cbor_data);
        var json = greenpassData[0].get(-260).get(1);

        // add age
        json.age = moment().diff(json.dob, 'years', false);
        json.dob_str = moment(json.dob).format('MMMM Do YYYY');
        if (json.v) {
            json.v[0].daysAgo = moment().diff(json.v[0].dt, 'days', false)
            json.v[0].name = vaccines.valueSetValues[json.v[0].mp].display;
            json.type = "v";
        }
        if (json.r) {
            json.r[0].daysAgo = moment().diff(json.r[0].fr, 'days', false)
            json.type = "r";
        }
        if (json.t) {
            json.t[0].daysAgo = moment().diff(json.t[0].sc, 'days', false)
            json.type = "t";
        }

        return {"valid": true, "json": json};
    } else {
        return {"valid": false};
    }
}

export {decodeDGC, encodeDGC}



