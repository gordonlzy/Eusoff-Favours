function viewOwn(userID) { 
  var rangeValues = requestRange();
  var count = 0;
  var keyboard = [];

  for (i = 0; i < requestLastRow() - 1; i++) {
    var refId = rangeValues[i][0];
    var req = requestInfo(refId);    
    if (req.userId === userID && req.status === "Available") {
        keyboard[count] = [
            {
              text: req.request + " (" + req.credits + " cr) " + '\n '+ req.time.slice(0, -2) + ", " + req.date.slice(0, -2),
              callback_data: 'cancel-' + i,
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

function cancelRequest(row_data, userID) {
    // some gross programming here, edit : its beautiful
    var refId = parseInt(row_data) + 1;
    var req = requestInfo(refId);
    
    var user = userInfo(userID)
    var total_credits = user.total_credits;
    
    if (req.userId === userID && req.status === 'Available') {
      setRequestStatus(refId, "Cancelled");
      var pending = req.pending;
      var newCredits = total_credits + pending;
      setRequestPending(refId, 0);
      setUserCredits(userID, newCredits);

      var str = 'Request cancelled!'.bold() + '\nRequest: ' + req.request + ' \n' + req.credits + ' credit(s)\nRef number: ' + req.ref + '\nRemark: ' + req.remark;
      return str;
    } else {
      return 'You have no active requests to cancel!';
    }
}
