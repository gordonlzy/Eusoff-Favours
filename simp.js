// Simp
// ---------------------------------------
function processSimpRequest(userID) {
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];

    var curr_user = userExists(userID);
    var userFloor = curr_user.room.slice(1, 2);
  
    for (i = 0; i < lastRow - 1; i++) {
        var requestor = userExists(rangeValues[i][3]);
        var requestorName = requestor.name;
        var requestorFloor = requestor.room.slice(1, 2);
      
        var request_time = rangeValues[i][6];
        var gender_diff = oppositeGender(userFloor, requestorFloor);
      
        if (rangeValues[i][3] !== userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " 
                  + requestorName + '\n '+ request_time.slice(0, -2),
                  callback_data: 'simp-' + i + ' ' + gender_diff,
                },
            ];
            count++;
        }
    }
              
    var simpKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return simpKeyboard;
    }
}
              
function takeSimpRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');

    var user = userExists(userID);
    var simp_points = user.simp_points;
    var new_simp_points = simp_points + 1;    

    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = active_request_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1].split(' ')[0]);
    var gender_diff = data_arr[1].split(' ')[1];
    var pending_credit = rangeValues[ref_id][8];

    var userRow = parseInt(findUserRow(userID));
          
    active_request_sheet.getRange(ref_id + 2, 9).setValue(0);
    active_request_sheet.getRange(ref_id + 2, 5).setValue("Taken");
    active_request_sheet.getRange(ref_id + 2, 10).setValue(userID);
    
    users_sheet.getRange(userRow, 5).setValue(new_simp_points);

    sendText(userID, 'Request taken! What a simp ( ͡° ͜ʖ ͡°)...');
}


// ---------------------------------------
