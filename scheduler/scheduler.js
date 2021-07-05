/**
* Scheduler.gs
* By Sidharth Baskaran, last edit on 3/3/21
* Goal: to automate the Science Olympiad test-off process
* Nothing in this file should have to be changed except for the email body below (if needed) and the spreadsheet link
* Only work with the config of the spreadsheet and run the "schedule" function when ready
*/

/**
 * Populates scheduler spreadsheets and sends out emails at the specified times
 * @function schedule
 */
function schedule() {
    //populate links
    getTestUrls();
    
    //read into object lists
    let maxColLetter = (letter) => {return String.fromCharCode(`${letter}`.charCodeAt(0) + blockConfig.length - 1);}

    let studentData = responses.getRange(`B2:C${MAX_STUDENTS + 1}`).getValues();
    let eventData = responses.getRange(`D2:${maxColLetter('D')}${MAX_STUDENTS + 1}`).getValues(); 

    //remove duplicate rows
    removeDuplicateResponses(studentData);

    studentData = responses.getRange(`B2:C${MAX_STUDENTS + 1}`).getValues();

    //update the list of objects with addresses/names when going through responses

    for (let i = 0; i < eventData.length; i++) {
        for (let j = 0; j < eventData[0].length; j++) {
            if (eventData[i][j] != '') {
                let idx = eventArr.indexOf(eventData[i][j]);
                let tkn = `${studentData[i][1]}`.trim();
                let nm = `${studentData[i][0]}`.trim();

                //REGEX CHECKS -- WHITESPACE BREAK THE CODE
                if (nm != '' || tkn != '') {
                  Logger.log(i);
                  if (j == eventData[0].length - 1) { //case for flex block
                      eventConfig[idx].flexAddresses += tkn;
                      eventConfig[idx].flexNames += nm;
                  } else {
                      eventConfig[idx].blockAddresses += tkn;
                      eventConfig[idx].blockNames += nm;
                  }
                }
            }
        }
    }

    for (let i = 0; i < eventConfig.length; i++) {
        eventConfig[i].blockAddresses = eventConfig[i].blockAddresses.replace(/,$/,'');
        eventConfig[i].flexAddresses = eventConfig[i].flexAddresses.replace(/,$/,'');
        eventConfig[i].blockNames = eventConfig[i].blockNames.replace(/,$/,'');
        eventConfig[i].flexNames = eventConfig[i].flexNames.replace(/,$/,'');
    }

    for (item of eventConfig)
      Logger.log(item);

    //populate the database sheet

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

    sendScheduledEmails(); //uncomment to send emails

}
