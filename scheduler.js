/**
* test-off-scheduler
* By Sidharth Baskaran (LASA 2022), last edit on Jan 3 2021
* Goal: to automate the Science Olympiad test-off process at my high school
* Nothing in this file should have to be changed except for the email body below (if needed)
* Only work with the config of the spreadsheet and run the "schedule" function when ready
*/

//NOTE: any changes will ruin indentation of the message here
const msg = (eventUrls) => {
    return `Hi all,
    
Before you start, make sure to review the test-off expectations (link.com). 
You will have 50 minutes to take your test, with 10 additional minutes to make up for any submission issues.
Don\'t count on this extra time to finish up since if you go beyond the 1 hour limit, we will be able to see the timestamps.

Here are your tests:

${eventUrls}
Good luck,
The Captains`;


};

//-------------------GLOBAL SETUP-------------------------------------------------

const SS_URL = 'https://docs.google.com/spreadsheets/d/1DGQLqfB9BD5VlRVpqAN6XMauoq0mu94S1DKHqez3uXU/edit#gid=1951640728';

//access to each sheet
var config = SpreadsheetApp.openByUrl(SS_URL).getSheets()[0];
var scheduler = SpreadsheetApp.openByUrl(SS_URL).getSheets()[1];
var responses = SpreadsheetApp.openByUrl(SS_URL).getSheets()[2];
var storage = SpreadsheetApp.openByUrl(SS_URL).getSheets()[3];

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
            'url': eC[i][2],
            'blockAddresses': '',
            'flexAddresses': '',
            'blockNames': '',
            'flexNames': ''
        })
}

for (let i = 0; i < bC.length; i++) {
    if (bC[i][0] != '')
        blockConfig.push({
            'blockNumber': bC[i][0],
            'startTime': bC[i][1],
            'endTime': bC[i][2],
            'dt': bC[i][3],
        })
}

var eventArr = eventConfig.map(x => x.event);

//-------------------SCHEDULING-------------------------------------------------

/**
 * Populates scheduler spreadsheets and sends out emails at the specified times
 * @function schedule
 */
function schedule() {

    //read into object lists

    let maxColLetter = (letter) => {return String.fromCharCode(`${letter}`.charCodeAt(0) + blockConfig.length - 1);}

    let studentData = responses.getRange(`B2:C${MAX_STUDENTS + 1}`).getValues();
    let eventData = responses.getRange(`D2:${maxColLetter('D')}${MAX_STUDENTS + 1}`).getValues(); 

    //remove duplicate rows
    removeDuplicateResponses(studentData);

    //update the list of objects with addresses/names when going through responses

    for (let i = 0; i < eventData.length; i++) {
        for (let j = 0; j < eventData[0].length; j++) {
            if (eventData[i][j] != '') {
                let idx = eventArr.indexOf(eventData[i][j]);
                let tkn = `${studentData[i][1]}`;
                let nm = `${studentData[i][0]}`;

                if (j == eventData[0].length - 1) { //case for flex block
                    eventConfig[idx].flexAddresses += `${tkn},`;
                    eventConfig[idx].flexNames += `${nm},`;
                } else {
                    eventConfig[idx].blockAddresses += `${tkn},`;
                    eventConfig[idx].blockNames += `${nm},`;
                }
                //Logger.log(`${eventData[i][j]} ${eventArr.indexOf(eventData[i][j])}`);
            }
        }
    }

    for (let i = 0; i < eventConfig.length; i++) {
        eventConfig[i].blockAddresses = eventConfig[i].blockAddresses.replace(/,$/,'');
        eventConfig[i].flexAddresses = eventConfig[i].flexAddresses.replace(/,$/,'');
        eventConfig[i].blockNames = eventConfig[i].blockNames.replace(/,$/,'');
        eventConfig[i].flexNames = eventConfig[i].flexNames.replace(/,$/,'');
    }

    //populate the scheduler sheet

    let eventScheduleRange = scheduler.getRange(`D3:${maxColLetter('D')}${3 + eventArr.length - 1}`);
    let eventScheduleValues = eventScheduleRange.getValues();

    let nameRange = scheduler.getRange(`A3:B${3 + eventArr.length - 1}`);
    let nameValues = nameRange.getValues();
    
    for (let i = 0; i < eventScheduleValues.length; i++) {
        for (let j = 0; j < eventScheduleValues[0].length; j++) {
            if (j == eventConfig[i].blockNumber - 1) {
                eventScheduleValues[i][j] = eventConfig[i].blockAddresses;
                nameValues[i][0] = eventConfig[i].blockNames;
            }
            if (j == eventScheduleValues[0].length - 1) {
                eventScheduleValues[i][j] = eventConfig[i].flexAddresses;
                nameValues[i][1] = eventConfig[i].flexNames;
            }
        }
    }

    eventScheduleRange.setValues(eventScheduleValues);
    nameRange.setValues(nameValues);

    //send emails based on time trigger
    sendScheduledEmails();

    //flush scheduler sheet

}

//-------------------EMAIL SCHEDULING-------------------------------------------------

//global variables
var eventStorageRange = storage.getRange(`A2:E${eventConfig.length + 1}`);
var blockStorageRange = storage.getRange(`G2:I${blockConfig.length + 1}`);
var eventStorageValues = eventStorageRange.getValues();
var blockStorageValues = blockStorageRange.getValues();
var stackRange = storage.getRange(`K2:${blockConfig.length + 1}`);
var stackValues = stackRange.getValues();

/**
 * Sends emails to participants at desired times (as specified in config sheet) using time-based triggers
 * @function sendScheduledEmails
 */
function sendScheduledEmails() {
    deleteTriggers();

    for (let i = 0; i < eventStorageValues.length; i++) {
        eventStorageValues[i][0] = eventConfig[i].event;
        eventStorageValues[i][1] = eventConfig[i].blockNumber;
        eventStorageValues[i][2] = eventConfig[i].url;
        eventStorageValues[i][3] = eventConfig[i].blockAddresses;
        eventStorageValues[i][4] = eventConfig[i].flexAddresses;
        //Logger.log(eventConfig[i])
    }
    eventStorageRange.setValues(eventStorageValues);

    for (let i = 0; i < blockStorageValues.length; i++) {
        blockStorageValues[i][0] = Number(blockConfig[i].blockNumber);
        blockStorageValues[i][1] = blockConfig[i].startTime;
        blockStorageValues[i][2] = blockConfig[i].dt;
    }
    blockStorageRange.setValues(blockStorageValues);

    for (let i = 0; i < blockConfig.length; i++) {
        stackValues[i][0] = blockConfig[i].blockNumber;
        ScriptApp.newTrigger('sendEmail').timeBased().
          at(parseTime(blockConfig[i].startTime, blockConfig[i].dt)).create();
    }
    stackRange.setValues(stackValues);
}

/**
 * Standalone function to send email
 * @function sendEmail
 */
function sendEmail() {
    for (let i = 0; i < stackValues.length; i++) {
        //Logger.log(`Block ${stackValues[i][0]}`);
        if (stackValues[i][0] != 'COMPLETE') {
            let currBlockEvents = [];

            for (let j = 0; j < eventStorageValues.length; j++) {
                if (eventStorageValues[j][1] == stackValues[i][0])
                  currBlockEvents.push(eventStorageValues[j]);
                else if (stackValues[i][0] == blockConfig.length && eventStorageValues[j][4] != '')
                  currBlockEvents.push(eventStorageValues[j]);
                //Logger.log(eventStorageValues[j][1], stackValues[i][0])
            }

            //Logger.log(currBlockEvents);

            let urlNames = [], addresses = [];
            for (let j = 0; j < currBlockEvents.length; j++) {
                urlNames.push({'name': currBlockEvents[j][0], 'url': currBlockEvents[j][2]});
                addresses.push(currBlockEvents[j][stackValues[i][0] == blockConfig.length ? 4 : 3]);
            }
            let urlString = '';
            urlNames.forEach(x => {
                urlString += `${x.name}: ${x.url}\n`;
            });

            let to = addresses.filter(x => x != '').join();
            let subject = `Block ${stackValues[i][0]} Test-Offs` + (stackValues[i][0] == blockConfig.length ? ' (Flex)' : '');
            let body = msg(urlString);

            if (!to.match(/(\s*)|(,*)/) || to != '')
              Logger.log(`${to}\n${subject}\n${body}`);
            GmailApp.sendEmail(to, subject, body);

            //stackValues[i][0] = 'COMPLETE';
        }
    }
    stackRange.setValues(stackValues);
}

//utility function, do not modify or use
const deleteTriggers = () => {
  for (let i = 0; i < ScriptApp.getProjectTriggers().length; i++)
      ScriptApp.deleteTrigger(ScriptApp.getProjectTriggers()[i]);
};

//-------------------AUX FUNCTIONS-------------------------------------------------

/**
 * remove duplicate rows from responses spreadsheet
 * @param {sheet} studentData the response array of names + emails
 */
function removeDuplicateResponses(studentData) {
    let rowsToDel = [];

    //Logger.log(studentData);

    for (let i = 0; i < studentData.length - 1; i++) {
        for (let j = i + 1; j < studentData.length; j++)
        if (!studentData[i].includes('')) {    
            if (studentData[i][0] == studentData[j][0] || studentData[i][1] == studentData[j][1]) {
                //Logger.log(i, j);
                rowsToDel.push(j + 2);
            }
        }
    }

    for (let i = rowsToDel.length - 1; i >= 0; i--)
        responses.deleteRow(rowsToDel[i]);
}

/**
 * @const parseTime
 * @param {string} time the time
 * @param {string} date the date
 * @returns a Date object for this info
 */
const parseTime = (time, date) => {
    let dat1 = new Date(time), dat2 = new Date(date);
    return new Date(dat2.getFullYear(), dat2.getMonth(), dat2.getDate(), dat1.getHours(), dat1.getMinutes(), dat1.getSeconds(), 0);
};
