var Requests = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
var Users = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');

var usersRangeData = Users.getDataRange();
var usersLastColumn = usersRangeData.getLastColumn();
var usersLastRow = usersRangeData.getLastRow();
var usersSearchRange = Users.getRange(2, 1, usersLastRow - 1, usersLastColumn);
var usersRangeValues = usersSearchRange.getValues();

var requestsRangeData = Requests.getDataRange();
var requestsLastColumn = requestsRangeData.getLastColumn();
var requestsLastRow = requestsRangeData.getLastRow();
var requestsSearchRange = Requests.getRange(2, 1, requestsLastRow - 1, requestsLastColumn);
var requestsRangeValues = requestsSearchRange.getValues();

function requestRange() {
  return requestsRangeValues;
}

function userRange() {
  return usersRangeValues;
}

function requestLastRow() {
  return requestsLastRow;
}

function userLastRow() {
  return usersLastRow;
}

function setUserCredits(userId, new_credits) {
  for (j = 0; j < usersLastRow - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      Users.getRange(j + 2, 4).setValue(new_credits);
      return;
    }
  }
}

function setUserSimpCount(userId, simp_count) {
  for (j = 0; j < usersLastRow - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      Users.getRange(j + 2, 5).setValue(simp_count);
      return;
    }
  }
}

function setUserSubscribe(userId, state) {
  for (j = 0; j < usersLastRow - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      Users.getRange(j + 2, 6).setValue(state);
      return;
    }
  }
}

function setUserOngoing(userId, state) {
  for (j = 0; j < usersLastRow - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      Users.getRange(j + 2, 8).setValue(state);
      return;
    }
  }
}

function setRequestStatus(refId, stat) {
  Requests.getRange(refId + 1, 5).setValue(stat);
}

function setRequestPending(refId, pend) {
  Requests.getRange(refId + 1, 9).setValue(pend);
}

function setRequestSlave(refId, slaveId) {
  Requests.getRange(refId + 1, 10).setValue(slaveId);
}

function setRequestRemark(refId, stat) {
  Requests.getRange(refId + 1, 8).setValue(stat);
}

function setRequestString(refId, stat) {
  Requests.getRange(refId + 1, 11).setValue(stat);
}

function getLastUserRequest(userId) {  
  for (i = requestsLastRow - 2; i >= 0; i--) {
    if (requestsRangeValues[i][3] === userId) {
        return requestInfo(parseInt(requestsRangeValues[i][0]));
    }
  }  
  return false;
}

function getView() {
  return requestsRangeValues[1][11];
}

function userInfo(userId) {  
  if (usersLastRow === 0) {
    return {};
  } 
    
  var user = {};

  for (j = 0; j < usersLastRow - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      user.userId = usersRangeValues[j][0];
      user.name = usersRangeValues[j][1];
      user.room = usersRangeValues[j][2];
      user.total_credits = parseInt(usersRangeValues[j][3]);
      user.simp_count = parseInt(usersRangeValues[j][4]);
      user.subscribed = usersRangeValues[j][5];
      user.tele = usersRangeValues[j][6];
      user.ongoing = usersRangeValues[j][7];
      break;
    }
  }
  return user;
}

function requestInfo(refId) {
  if (requestsLastRow === 0) {
      return {};
  }
    
  var request = {};

  for (j = 0; j < requestsLastRow - 1; j++) {
    if (requestsRangeValues[j][0] === refId) {
      request.ref = parseInt(requestsRangeValues[j][0]);
      request.request = requestsRangeValues[j][1];
      request.credits = parseInt(requestsRangeValues[j][2]);
      request.userId = requestsRangeValues[j][3];
      request.status = requestsRangeValues[j][4];
      request.date = requestsRangeValues[j][5];
      request.time = requestsRangeValues[j][6];
      request.remark = requestsRangeValues[j][7];
      request.pending = parseInt(requestsRangeValues[j][8]);
      request.slaveId = requestsRangeValues[j][9];
      break;
    }
  }
  return request;  
}

function newUser(userId, name, room, tele_handle) {
  Users.appendRow([userId, name, room, 5, 0, 'No', tele_handle, "0"]);
}

function newRequest(refId, request, credits, userId, status, date, time, remark, pend, slave, str) {
  Requests.appendRow([refId, request, credits, userId, status, date, time, remark, pend, slave, str]);
}
