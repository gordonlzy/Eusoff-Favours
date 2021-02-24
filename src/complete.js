function viewOwnTaken(userID) {
  var rangeValues = requestRange();
  var count = 0;
  var keyboard = [];

  for (i = 0; i < requestLastRow() - 1; i++) {
    var refId = rangeValues[i][0];
    var req = requestInfo(refId);    
    if (req.userId === userID && req.status === "Taken") {
        keyboard[count] = [
            {
              text: req.ref + '. ' + req.request + " (" + req.credits + " cr), " + req.time.slice(0, -2) + ", " + req.date.slice(0, -2),
              callback_data: 'complete-' + i,
            },
        ];
        count++;
    }
  }

  if (count === 0) {
    return false;
  } else {
    return {inline_keyboard: keyboard};
  }
}

function completeRequest(userID, data) {
    var data_arr = data.split('-');
    
    var refId = parseInt(data_arr[1]) + 1;
    var req = requestInfo(refId);
    var slave = userInfo(req.slaveId);
    var pending = parseInt(req.pending);
    var new_credits = parseInt(slave.total_credits) + pending;
    var user = userInfo(userID);

    if (pending === 0) {      
      setUserSimpCount(slave.userId, slave.simp_count + 1);
      setRequestStatus(refId, "Completed");
      setRequestPending(refId, 0);
      setUserCredits(req.slaveId, new_credits);
      inc(locateUserRow(req.slaveId), locateUserRow(userID));

      sendText(userID, 'You have confirmed the completion: '.bold() + '\nRequest: ' + req.request + '\nSimped by: ' + slave.name + ' (' + slave.room + ') ' + '\nRef number: ' + req.ref + '\nRemark: ' + req.remark);
      sendText(slave.userId, 'Thank you for simping for ' + user.name + '\nRequest: ' + req.request + '\nRef number: ' + req.ref + '\nRemark: ' + req.remark);
    } else {
      setRequestStatus(refId, "Completed");
      setRequestPending(refId, 0);
      setUserCredits(req.slaveId, new_credits);
      inc(locateUserRow(req.slaveId), locateUserRow(userID));

      sendText(userID, 'You have confirmed the completion: '.bold() + '\nRequest: ' + req.request + '\nTaken by: ' + slave.name + ' (' + slave.room + ') \nCredit(s): ' + req.credits + '\nRef number: ' + req.ref + '\nRemark: ' + req.remark);
      sendText(slave.userId, 'Thank you for helping ' + user.name + "\nYou've received " + req.credits + ' credit(s)' + '\nYou currently have ' + user.total_credits + ' credit(s)');
    }
}

function locateUserRow(userId) {
  for (j = 0; j < userLastRow() - 1; j++) {
    if (usersRangeValues[j][0] === userId) {
      return j + 2;
    }
  }
}
