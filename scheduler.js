const SS_URL = 'https://docs.google.com/spreadsheets/d/1DGQLqfB9BD5VlRVpqAN6XMauoq0mu94S1DKHqez3uXU/edit#gid=1951640728';

//access to each sheet
var config = SpreadsheetApp.openByUrl(SS_URL).getSheets()[0];
var scheduler = SpreadsheetApp.openByUrl(SS_URL).getSheets()[1];
var responses = SpreadsheetApp.openByUrl(SS_URL).getSheets()[2];

//reading in config
const MAX_STUDENTS = config.getRange('B2').getValue();
var eC = config.getRange('A7:C30').getValues();
var bC = config.getRange('E7:H17').getValues();

var eventConfig = [], blockConfig = [];

for (let i = 0; i < eC.length; i++) {
    if (eC[i][0] != '')
        eventConfig.push({
            'event': eC[i][0],
            'blockNumber': eC[i][1],
            'testUrl': eC[i][2],
            'blockAddresses': '',
            'flexAddresses': ''
        })
}

for (let i = 0; i < bC.length; i++) {
    if (bC[i][0] != '')
        blockConfig.push({
            'blockNumber': bC[i][0],
            'startTime': bC[i][1],
            'endTime': bC[i][2],
            'date': bC[i][3],
        })
}

var eventArr = eventConfig.map(x => x.event);

// Populates scheduling spreadsheet with names and emails

function populateSchedule() {
    //read into object lists

    let maxColLetter = letter => {return String.fromCharCode(`${letter}`.charCodeAt(0) + blockConfig.length - 1);}

    let studentData = responses.getRange(`B2:C${MAX_STUDENTS + 1}`).getValues();
    let eventData = responses.getRange(`D2:${maxColLetter('D')}${MAX_STUDENTS + 1}`).getValues(); 

    //update the list of objects with addresses/names when going through responses

    for (let i = 0; i < eventData.length; i++) {
        for (let j = 0; j < eventData[0].length; j++) {
            if (eventData[i][j] != '') {
                let idx = eventArr.indexOf(eventData[i][j]);
                let tkn = `${studentData[i][1]}`;
                if (j == eventData[0].length - 1) //case for flex block
                    eventConfig[idx].flexAddresses += `${tkn},`;
                else
                    eventConfig[idx].blockAddresses += `${tkn},`;
                //Logger.log(`${eventData[i][j]} ${eventArr.indexOf(eventData[i][j])}`);
            }
        }
    }

    for (let i = 0; i < eventConfig.length; i++) {
        eventConfig[i].blockAddresses = eventConfig[i].blockAddresses.replace(/,$/,'');
        eventConfig[i].flexAddresses = eventConfig[i].flexAddresses.replace(/,$/,'');
    }

    //populate the scheduler sheet

    eventConfig.forEach(x => {
        Logger.log(x.flexAddresses);
    })

    let eventScheduleRange = scheduler.getRange(`C3:${maxColLetter('C')}${3 + eventArr.length - 1}`);
    let eventScheduleValues = eventScheduleRange.getValues();
    
    for (let i = 0; i < eventScheduleValues.length; i++) {
        for (let j = 0; j < eventScheduleValues[0].length; j++) {
            if (j == eventConfig[i].blockNumber - 1)
                eventScheduleValues[i][j] = eventConfig[i].blockAddresses;
            if (j == eventScheduleValues[0].length - 1)
                eventScheduleValues[i][j] = eventConfig[i].flexAddresses;
        }
    }

    eventScheduleRange.setValues(eventScheduleValues);

    return 1;
}

function sendTimedMail(time, addresses, subject, message) {
    
    
    MailApp.sendMail({
        to: addresses,
        subject: subject,
        body: message
    })
}