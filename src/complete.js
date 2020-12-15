// complete request
// ------------------------------------
function viewOwnTaken(userID) {
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
      
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Taken") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr), " + request_time.slice(0, -2) + ", " + request_date.slice(0, -2),
                  callback_data: 'complete-' + i,
                },
            ];
            count++;
        }
    }
  
    var takenKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return takenKeyboard;
    }
}

function completeRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1]);
          
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = active_request_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
    
    var slaveID = rangeValues[ref_id][9];
    var slaveRow = findSlaveRow(userID, slaveID);
    var slave = userExists(slaveID);
    var credit = slave.total_credits;
          
    var pending_credit = rangeValues[ref_id][8];
    var new_credits = credit + parseInt(pending_credit);
    
    var ref_plus_one = parseInt(ref_id) + 2;
    var row_plus_one = parseInt(slaveRow) + 1;

    active_request_sheet.getRange(ref_plus_one, 5).setValue('Completed');
    active_request_sheet.getRange(ref_plus_one, 9).setValue(0);
    users_sheet.getRange(row_plus_one + 1, 4).setValue(new_credits);

    sendText(userID, 'Request complete');
}
      
// ------------------------------------
