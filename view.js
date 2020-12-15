// view
function view(userID) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var active_requests = '';
    
    for (i = 0; i < lastRow - 1; i++) {
        var ref = rangeValues[i][0]
        var request = rangeValues[i][1];
        var credit = rangeValues[i][2];
      
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
        var remark = rangeValues[i][7];
      
        var curr_user = userExists(rangeValues[i][3]);
        var name = curr_user.name;
      if (rangeValues[i][4] === 'Available') {
        active_requests = active_requests + ref + '. ' + request + " - " + credit + " credit(s) \nmade by " + name + 
          " at " + request_time.slice(0, -2) + ', ' + request_date.slice(0, -2) + ' ' + '\n' + 'Remark: ' + remark + '\n\n';
      }  
    }
    sendText(userID, active_requests);
}
