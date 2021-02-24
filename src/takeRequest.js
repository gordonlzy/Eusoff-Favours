function processRequest(userID) {
    var rangeValues = requestRange();
    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < requestLastRow() - 1; i++) {
      var req = requestInfo(rangeValues[i][0])
      var user = userInfo(rangeValues[i][3]);
      var name = user.name;
    
      if (req.userId !== userID && req.status === "Available") {
          keyboard[count] = [
              {
                text: req.status + " (" + req.credits + " cr) " 
                + name + '\n '+ req.time.slice(0, -2),
                callback_data: 'take_request-' + i,
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

function takeRequest(userID, refId) {
    var rangeValues = requestRange();

    var requestor_id = rangeValues[refId - 1][3];
    var req = requestInfo(rangeValues[refId - 1][0]);

    if (req.status == "Taken") {
      sendText(userID, "Sorry, this request has already been taken. Too slow!");
    } else if (req.userId === userID) {
      sendText(userID, "Sorry, you can't take your own request!");
    } else {
      setRequestStatus(refId, "Taken");
      setRequestSlave(refId, userID);
      setRequestPending(refId, req.credits); 

      var slave = userInfo(userID);
      var str1 = 'You have taken a new request!'.bold() + '\nRequest taken: ' + req.request + '\nCredit(s): ' + req.credits + '\nRef number: ' + req.ref + '\nRemark: ' + req.remark;
      var str2 = 'Your request has been taken'.bold() + '\nRequest taken: ' + req.request + '\nTaken by: ' + slave.name + ' (' + slave.room + ') \nCredit(s): ' + req.credits + '\nRef number: ' + req.ref + '\nRemark: ' + req.remark;
      
      sendText(userID, str1);
      sendText(requestor_id, str2);    
    }
}
