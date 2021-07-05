/**
 * Get links for all files in a folder (alphabetical order)
 */
 function getTestUrls() {
    let folder = DriveApp.getFolderById(TEST_FOLDER_ID);
    let files = folder.getFilesByType(MimeType.PDF);
    let hashMap = [];
  
    while (files.hasNext()) {
      let file = files.next();
      file.setName(file.getName().replace("Copy of",""));
      hashMap.push({
        'name': file.getName(),
        'url' : file.getUrl()
      })
    } 
  
    function compare(a ,b) {
      return a.name.replace(' ','').localeCompare(b.name.replace(' ',''));
    }
  
    hashMap.sort(compare);
  
    //Logger.log(hashMap)
  
    for (let i = 0; i < eC.length; ++i) {
      if (i < hashMap.length) {
        let url = hashMap[i].url;
        eC[i][2] = url;
      }
    }
  
    config.getRange('A7:C30').setValues(eC);
  
  }
  
  /**
   * remove duplicate rows from responses spreadsheet
   * @param {sheet} studentData the response array of names + emails
   */
  function removeDuplicateResponses(studentData) {
      if (studentData == null)
        studentData = studentData = responses.getRange(`B2:C${MAX_STUDENTS + 1}`).getValues();
  
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
  
  //utility function, do not modify or use
  const deleteTriggers = () => {
    for (let i = ScriptApp.getProjectTriggers().length - 1; i >= 0; i--)
        ScriptApp.deleteTrigger(ScriptApp.getProjectTriggers()[i]);
  };
  
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
  