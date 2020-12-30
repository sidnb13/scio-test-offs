var maxStudents = 50;

function populateSchedule() {
    var ss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1DGQLqfB9BD5VlRVpqAN6XMauoq0mu94S1DKHqez3uXU/edit#gid=0');

    var sheet_scheduler = ss.getSheets()[0];
    var sheet_responses = ss.getSheets()[1];

    var event_data = sheet_responses.getRange(`D2:J${maxStudents}`).getValues();

    //collect unique events signed up for

    let event_set = new Set();

    for (let i = 0; i < event_data.length; i++) {
        for (let j = 0; j < event_data[0].length; j++)
            if (event_data[i][j] != "")
                event_set.add(event_data[i][j]);
    }

    let event_arr = [];

    for (let i = 0; i < Array.from(event_set).length; i++)
        event_arr[i] = [Array.from(event_set)[i]];

    //populate scheduler sheet with unique events

    Logger.log(event_arr);

    var schedule_range = sheet_scheduler.getRange(`B3:B${3 + event_arr.length - 1}`);
    schedule_range.setValues(event_arr);

    //populate email addresses for each event

    var addresses = sheet_responses.getRange(`C2:C${maxStudents}`).getValues();

    return 1;
}

function sendTimedMail(time, addresses, subject, message) {
    
    
    MailApp.sendMail({
        to: addresses,
        subject: subject,
        body: message
    })
}