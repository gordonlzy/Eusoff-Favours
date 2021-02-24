function getProfile(userID) {
  var data = userInfo(userID);
  var credits = data.total_credits;
  var name = data.name;
  var room = data.room;
  var simp = data.simp_count;

  var rangeValues = requestRange();
  var strReqMade = "\n\nRequests Made: \n".bold();
  var strReqTaken = "\nRequests Taken: ".bold();
  var strFinal = '';

  for (i = 0; i < requestLastRow() - 1; i++) {
    var req = requestInfo(rangeValues[i][0])
    var user = userInfo(rangeValues[i][3]);

    if (req.userId == userID && req.status !== "Completed" && req.status !== "Cancelled") {
      strReqMade += '\n' + req.request + '\nCredit(s): ' + req.credits + '\nRef number: ' 
      + req.ref + '\nRemark: ' + req.remark + '\n';
    } else if (req.slaveId == userID && req.status == "Taken") {
      strReqTaken += '\n\n' + req.request + '\nCredit(s): ' + req.credits + '\nMade by: ' + user.name +
      '\nRef number: ' + req.ref + '\nRemark: ' + req.remark + '\n';
    }
  }

  if (credits === 0) {
    strFinal = "Hi " + name + "(" + room + ")! " + "You have 0 credits:( Do some good! \nSimp Count: " + simp;
  } else {
    strFinal = "Hi " + name + "(" + room + ")! " + "You have " + credits + " credits!\nSimp Count: " + simp;
  }
  var strArr = [strFinal, strReqMade, strReqTaken];
  return strArr;
}

function updateProfile(userID, data, message_id) {
  var data_arr = data.split('-');
  var keyboardNumber = data_arr[1];
  
  var keyboard = getProfileKeyboard(keyboardNumber);

  if (keyboardNumber == 1) {
    updateText(userID, message_id, getProfile(userID)[0], {inline_keyboard: keyboard});
  } else if (keyboardNumber == 2) {
    updateText(userID, message_id, getProfile(userID)[1], {inline_keyboard: keyboard});
  } else {    
    updateText(userID, message_id, getProfile(userID)[2], {inline_keyboard: keyboard});
  }
}

function getProfileKeyboard(keyboardNumber) {
  var firstKeyboard = [
          [
            {
              text: 'Check Own Requests',
              callback_data: 'toggleProfile-' + 2,
            },
            {
              text: 'Check Requests Taken',
              callback_data: 'toggleProfile-' + 3,
            },
          ],
          [
            {
              text: 'Back',
              callback_data: 'back-',
            },
          ],
        ]
  var secondKeyboard = [
          [
            {
              text: 'Main',
              callback_data: 'toggleProfile-' + 1,
            },
            {
              text: 'Check Requests Taken',
              callback_data: 'toggleProfile-' + 3,
            },
          ],
          [
            {
              text: 'Back',
              callback_data: 'back-',
            },
          ],
  ]
  var thirdKeyboard = [
          [
            {
              text: 'Main',
              callback_data: 'toggleProfile-' + 1,
            },
            {
              text: 'Check Own Requests',
              callback_data: 'toggleProfile-' + 2,
            },
          ],
          [
            {
              text: 'Back',
              callback_data: 'back-',
            },
          ],
  ]
  if (keyboardNumber == 1) {
    return firstKeyboard;
  } else {
    if (keyboardNumber == 2) {
      return secondKeyboard;
    } else {
      return thirdKeyboard;
    }
  }
}
