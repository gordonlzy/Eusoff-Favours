function subscribedUsers() {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = users_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var searchRange = users_sheet.getRange(1, 1, lastRow, 6);
    var rangeValues = searchRange.getValues();
  
    var res = [];
  
    for (i = 0; i < lastRow; i++) {
      if (rangeValues[i][5] === 'Yes') {
            res.push(parseInt(rangeValues[i][0]));
        }
    }
    return res;
  
}
