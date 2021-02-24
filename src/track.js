var Track = SpreadsheetApp.openById(sheet_id).getSheetByName('Track');

var trackRangeData = Track.getDataRange();
var trackLastColumn = trackRangeData.getLastColumn();
var trackLastRow = trackRangeData.getLastRow();
var trackSearchRange = Track.getRange(2, 1, trackLastRow - 1, trackLastColumn);
var trackRangeValues = trackSearchRange.getValues();

var cap = 5;

function addUserToTrack(userId) {
  var next = userLastRow();
  Track.appendRow([userId]);
  var temp = Track.getRange(trackLastRow + 1, 1).getValues();
  Track.getRange(1, next).setValue(temp);
}

function calculateCaps() {
  var num = userLastRow();
  for (i = 2; i <= num; i++) {
    var sum = 0;
    for (j = 2; j <= num; j++) {
      var n = Track.getRange(i, j).getValues()[0][0];
      sum += (n > cap) ? 5 : n;
    }
    Users.getRange(i, 9).setValue(sum);
  }
}

function inc(simp, requestor) {
  var old = parseInt(Track.getRange(simp, requestor).getValues());
  Track.getRange(simp, requestor).setValue(old + 1);
}  

