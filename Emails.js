/**
 * EmailManagement.gs
 * By Sidharth Baskaran (LASA '22), last edit on 3/3/21
 * Goal: to send emails with time-based trigger 
 */

//global variables
var eventStorageRange = storage.getRange(`A2:E${eventConfig.length + 1}`);
var blockStorageRange = storage.getRange(`G2:H${blockConfig.length + 1}`);
var eventStorageValues = eventStorageRange.getValues();
var blockStorageValues = blockStorageRange.getValues();
var stackRange = storage.getRange(`J2:J${blockConfig.length + 1}`);
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
        blockStorageValues[i][1] = blockConfig[i].datetime;
    }
    blockStorageRange.setValues(blockStorageValues);

    for (let i = 0; i < blockConfig.length; i++) {
        stackValues[i][0] = blockConfig[i].blockNumber;
        //set trigger for each block
        ScriptApp.newTrigger(`send${blockConfig[i].blockNumber}`).timeBased().
          at(parseTime(blockStorageValues[i][1])).create();
        //parseTime(blockStorageValues[i][1]);
    }
    stackRange.setValues(stackValues);
    
}

/**
 * Standalone function to send email
 * @function sendEmail
 */
function sendEmail(blockNum) {

    //manage test document permissions for this block at time of trigger
    managePermissions(blockNum, false);

    let currBlockEvents = [];
    
    for (let j = 0; j < eventStorageValues.length; j++) {
      if (eventStorageValues[j][1] == blockNum)
        currBlockEvents.push(eventStorageValues[j]);
      else if (blockNum == blockConfig.length && eventStorageValues[j][4] != '')
        currBlockEvents.push(eventStorageValues[j]);
    }
    
    //Logger.log(currBlockEvents);
    
    let urlNames = [], addresses = [];
    for (let j = 0; j < currBlockEvents.length; j++) {
      urlNames.push({'name': currBlockEvents[j][0], 'url': currBlockEvents[j][2]});
      addresses.push(currBlockEvents[j][blockNum == blockConfig.length ? 4 : 3]);
    }
    let urlString = '';
    urlNames.forEach(x => {urlString += `${x.name}: ${x.url}\n`;});
    
    let to = addresses.filter(x => x != '').join();
    let subject = `Block ${blockNum} Test-Offs` + (blockNum == blockConfig.length ? ' (Flex)' : '');
    let body = msg(urlString);
    
    //Logger.log(to);
    
    if (to) {
      GmailApp.sendEmail(to, subject, body);
      Logger.log(`${to}\n${subject}\n${body}`);
    }
    
    if (stackValues[blockNum - 1][0])
        stackValues[blockNum - 1][0] = 'COMPLETE';
    
    stackRange.setValues(stackValues);
}

//set of anonymous functions for up to 15 time blocks, improves reliability vs. reading from sheet
const send1 = () => {sendEmail(1)};
const send2 = () => {sendEmail(2)};
const send3 = () => {sendEmail(3)};
const send4 = () => {sendEmail(4)};
const send5 = () => {sendEmail(5)};
const send6 = () => {sendEmail(6)};
const send7 = () => {sendEmail(7)};
const send8 = () => {sendEmail(8)};
const send9 = () => {sendEmail(9)};
const send10 = () => {sendEmail(10)};
const send11 = () => {sendEmail(11)};
const send12 = () => {sendEmail(12)};
const send13 = () => {sendEmail(13)};
const send14 = () => {sendEmail(14)};
const send15 = () => {sendEmail(15)};

//utility function, do not modify or use
const deleteTriggers = () => {
  for (let i = 0; i < ScriptApp.getProjectTriggers().length; i++)
      ScriptApp.deleteTrigger(ScriptApp.getProjectTriggers()[i]);
};
