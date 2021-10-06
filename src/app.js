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

export function decodeDGC(data) {

    // check prefix
    const prefix = data.substr(0, data.indexOf(':'));

    if (prefix === "HC1") {
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

        console.log(json);
        // add age
        json.age = moment().diff(json.dob,'years',false);
        json.dob_str = moment(json.dob).format('MMMM Do YYYY');
        if (json.v)
        {
            json.v[0].daysAgo = moment().diff(json.v[0].dt,'days',false)
            json.v[0].name = vaccines.valueSetValues[json.v[0].mp].display;
        }
        if (json.r)
        {
            json.r[0].daysAgo = moment().diff(json.r[0].fr,'days',false)
        }
        if (json.t)
        {
            json.t[0].daysAgo = moment().diff(json.t[0].sc,'days',false)
        }

        return {"valid":true, "json": greenpassData[0].get(-260).get(1)};
    } else {
        return {"valid":false};
    }
}



