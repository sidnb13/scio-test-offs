//NOTE: any changes will change indentation of the message here
const msg = (eventUrls) => {
    return `Hi all,
    
Before you start, make sure to review the test-off expectations from before (https://docs.google.com/document/d/1mYsnflsSaMV6FyXaZ8dRRv8iozBNwd2E1oqS1ebnjnk/edit?usp=sharing). 
You will have 50 minutes to take your test, with 10 additional minutes to make up for any submission issues. Don\'t count on this extra time to finish up since if you go beyond the 1 hour limit as we will be able to see the timestamps. We recommend having a system to quickly submit your work (e.g. phone scanner app) nearby.

When finished, submit a PDF of your test to this Google form after reading the submission instructions carefully: https://forms.gle/gpCMjiP425NxFsGv9.

Access the test you were assigned for this block from the list below:

${eventUrls}
Good luck,
The Captains`;
};

//-------------------GLOBAL SETUP-------------------------------------------------
const SS_URL = 'https://docs.google.com/spreadsheets/d/1LtIqFng5H0yXJOkQNMpZBUIoeTEqUIbth7z496gpkZM/edit#gid=2002959293';
var TEST_FOLDER_ID = '1dyhqWumn5rZ4YMPHy-r3A8JpDuFNM9I9';

//access to each sheet
var config = SpreadsheetApp.openByUrl(SS_URL).getSheets()[0];
var scheduler = SpreadsheetApp.openByUrl(SS_URL).getSheets()[1];
var responses = SpreadsheetApp.openByUrl(SS_URL).getSheets()[2];
var storage = SpreadsheetApp.openByUrl(SS_URL).getSheets()[3];

//reading in config
const MAX_STUDENTS = config.getRange('B2').getValue();
const USE_EXCEPTIONS = config.getRange('B3').getValue();

var eC = config.getRange('A7:C30').getValues();
var bC = config.getRange('E7:G17').getValues();

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
            'toSend': bC[i][2]
        })
}

var eventArr = eventConfig.map(x => x.event);
