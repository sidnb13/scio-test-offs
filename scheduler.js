/**
* Scheduler.gs
* By Sidharth Baskaran (LASA '22), last edit on 3/3/21
* Goal: to automate the Science Olympiad test-off process
* Nothing in this file should have to be changed except for the email body below (if needed) and the spreadsheet link
* Only work with the config of the spreadsheet and run the "schedule" function when ready
*/

//NOTE: any changes will change indentation of the message here
const msg = (eventUrls) => {
    return `Hi all,
    
Before you start, make sure to review the test-off expectations from before (https://docs.google.com/document/d/15A4IijPQvPEh-zwHRowtq_b7tTyuulDdmhX6e8-ql-8/edit?usp=sharing). 
You will have 50 minutes to take your test, with 10 additional minutes to make up for any submission issues. Don\'t count on this extra time to finish up since if you go beyond the 1 hour limit as we will be able to see the timestamps. We recommend having a system to quickly submit your work (e.g. phone scanner app) nearby.

When finished, submit a PDF of your test to this Google form: INSERT THE LINK HERE

Access the test you were assigned for this block from the list below:

${eventUrls}
Good luck,
The Captains`;
};

//-------------------GLOBAL SETUP-------------------------------------------------
const SS_URL = 'https://docs.google.com/spreadsheets/d/1wG_vInafAUZMU6tLLPkyjCXiUgkOWhDFU0Vd3NOchww/edit?usp=sharing';

//access to each sheet
var config = SpreadsheetApp.openByUrl(SS_URL).getSheets()[0];
var scheduler = SpreadsheetApp.openByUrl(SS_URL).getSheets()[1];
var responses = SpreadsheetApp.openByUrl(SS_URL).getSheets()[2];
var storage = SpreadsheetApp.openByUrl(SS_URL).getSheets()[3];

//reading in config
const MAX_STUDENTS = config.getRange('B2').getValue();
var eC = config.getRange('A7:C30').getValues();
var bC = config.getRange('E7:F17').getValues();

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
            'datetime': bC[i][1],
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
                    //Logger.log(eventData[i][j]);
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
    // for (let i = 1; i <= 6; ++i)
    //     managePermissions(i, false);
    sendScheduledEmails();

}

//-------------------AUX FUNCTIONS-------------------------------------------------

/**
 * Reset permissions, not to be used during test-offs window
 * Takes a long time to execute
 */
const resetPermissions = () => {
  for (let i = 0; i < bC.length; ++i)
      managePermissions(i, true);
}


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
const parseTime = (datetime) => {
    let dat = new Date(datetime);
    Logger.log(dat);
    return dat;
};
