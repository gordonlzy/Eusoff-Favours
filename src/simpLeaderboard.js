function getSimpLeaderboardRow(userID) {
  var simp_leaderboard_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName("Simp_Leaderboard");
  var rangeData = simp_leaderboard_sheet.getDataRange();
  var lastRow = rangeData.getLastRow();
  var lastColumn = rangeData.getLastColumn();
  var searchRange = simp_leaderboard_sheet.getRange(2, 1, lastRow - 1, lastColumn);
  var rangeValues = searchRange.getValues();
  var result = "Simp Leaderboards" + '\n';
  
  for (i = 0; i < 3; i++) {
      var name = rangeValues[i][0];
      var room = rangeValues[i][1];
      var simpCount = rangeValues[i][3];
      result = result + (i+1).toString() + ". " + name + " (" + room + ") " +  ": " + simpCount + " Counts" + '\n';
  } 
  return result;
}

function sendSimpLeaderboard(chatID, userID) {
  var backkeyboard = [
          [
            {
              text: 'Back',
              callback_data: 'back-',
            },
          ]
  ]
  sendText(chatID, getSimpLeaderboardRow(userID), {inline_keyboard: backkeyboard});
}
