// delete
// ------------------------------------
function viewOwn(userID) {
    var curr_user = userExists(userID);
    var room = curr_user.room;
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
        var remark = rangeValues[i][7];
      
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " + '\n '+ request_time.slice(0, -2) + ", " + request_date.slice(0, -2),
                  callback_data: 'cancel-' + i,
                },
            ];
            count++;
        }
    }
  
    var cancelKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return cancelKeyboard;
    }
}

function cancelRequest(row_data, userID) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var curr_user = userExists(userID);
    // some gross programming here
    var row = parseInt(row_data) + 2; // add 2 to offset the array index start and the column headings
    var requestID = active_request_sheet.getRange(row, 4).getValue();
    var status = active_request_sheet.getRange(row, 5).getValue();
    
    if (requestID === userID && status === 'Available') {
        active_request_sheet.getRange(row, 5).setValue('Cancelled');
        return 'Request cancelled!';
    } else {
        return 'You have no active requests!';
    }
}
// ------------------------------------
