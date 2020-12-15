// take request
// ------------------------------------
function processRequest(userID) {
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        var curr_user = userExists(rangeValues[i][3]);
        var name = curr_user.name;
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
      
        if (rangeValues[i][3] !== userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " 
                  + name + '\n '+ request_time.slice(0, -2),
                  callback_data: 'take_request-' + i,
                },
            ];
            count++;
        }
    }
              
    var takeRequestKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return takeRequestKeyboard;
    }
}
              
function takeRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1]) + 2;
          
    active_request_sheet.getRange(ref_id, 5).setValue("Taken");
    active_request_sheet.getRange(ref_id, 10).setValue(userID);

    sendText(userID, 'Request taken');
}
// ------------------------------------
