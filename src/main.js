var TOKEN = "1488628659:AAGG49VW24lhVNx1ZcBkB-e_ciI7Zi4T7f4";
var sheet_id = "1MiPByQzVG-Zwe0vDSYjFSU-gfTt5uwH8JKQY61tk9JQ";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbyaPIctzmVCp-ZVzNueI2vEgPxvXas1eoqPluQ0rgaYCkKZzPSl/exec";

// main function to deal with users
function doPost(e) {
    var contents = JSON.parse(e.postData.contents);
  
    if (contents.callback_query) {
      var idCallback = contents.callback_query.message.chat.id;
      var name = contents.callback_query.from.first_name;
      var userID = contents.callback_query.from.id;
      var data = contents.callback_query.data;
      var command = data.split('-')[0];
      
      if (command === 'category') {
        giveCredit(idCallback, data);
      } else if (command === 'credit') {
        addRemark(idCallback, data);
      } else if (command === 'cancel') {
        sendText(idCallback, cancelRequest(data.split('-')[1], userID));
      } else if (command === 'remark') {
        var rem = data.split('-')[1].split(' ')[2];
        if (rem === "0") { 
          makeRequest(idCallback, data, 0);
        } else {
          sendText(userID, 'Please key in "/remark YourRemark"!');
          makeRequest(idCallback, data, 1);
        }
      } else if (command === 'take_request') {
        takeRequest(idCallback, data);
      } else if (command === 'complete') {
        completeRequest(idCallback, data);
      } else if (command === 'simp') {
        takeSimpRequest(idCallback, data);
      }

    } else if (contents.message) {
      var chatID = contents.message.chat.id;
      var text = contents.message.text;
      var userId = contents.message.from.id;
      
      if (text === '/register') {
        register(userId);
      } else if (text === '/make_request'){
        if (Object.getOwnPropertyNames(userExists(userId)).length !== 0) {
          if (userExists(userId).total_credits > 0) {
            chooseCategory(userId);
          } else {
            sendText(userId, "You do not have any credits left, go do some good.");
          }
        } else {
          sendText(userId, "You are not registered, to sign up use /register");
        }
      } else if (text === '/start') {
        sendText(
          chatID,
          "Welcome to Eusoff's Favours Bot! \nTo sign up /register \n" +
          "To view active requests /view \n" + 
          "To delete your current requests /cancel\n" +
          "To mark a request as complete /complete\n\n" +
          "To make request /make_request\n" + 
          "To take request /take_request\n" + 
          "To simp /simp\n" +
          "To view the leaderboards /leaderboard\n\n" +
          "To view the simp leaderboards /simp_leaderboard\n" + 
          "To subscribe to favour updates /subscribe\n" + 
          "To unsubscribe from updates /unsubscribe\n"
          );
      } else if (text === '/view') {
        view(userId);
      } else if (text === '/cancel') {
        if (viewOwn(userId) === false) {
            sendText(chatID, 'You have no requests to cancel');
        } else {
            sendText(chatID, 'Which request do you want to cancel?', viewOwn(userId));
        }
      } else if (text === '/take_request') {
        if (processRequest(userId) === false) {
          sendText(chatID, 'You have no requests to take');
        } else {
          sendText(chatID, 'Which request do you want to take?', processRequest(userId));
        }
      } else if (text === '/complete') {
        if (viewOwnTaken(userId) === false) {
            sendText(chatID, 'You have no requests that are taken');
        } else {
            sendText(chatID, 'Which request do you want to mark as complete?', viewOwnTaken(userId));
        }
      } else if (text.slice(0, 7) === '/remark') {
        var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
        var info = locateFinalUserCredit(userId);
        active_request_sheet.getRange(info[0], 8).setValue(text.slice(7));    
        
        var listOfSubs = subscribedUsers();
        
        sendText(userId, 'Request made: ' + info[1] + ' \n' + info[2] + ' credit(s)\nRef number: ' + (parseInt(info[3]) - 2) + '\nRemark: ' + text.slice(7));
        for (i = 0; i < listOfSubs.length; i++) {        
          if (listOfSubs[i] !== userId) {
            var data = userExists(userId);
            var name = data.name;
            sendText(listOfSubs[i], 'Request made by ' + name + ': ' + info[1] + ' \n' + info[2] + ' credit(s)\nRef number: ' + (parseInt(info[3]) - 2) + '\nRemark: ' + text.slice(7));
          }
        }
        
      } else if (text === '/subscribe') {
        var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
        var row = findUserRow(userId);
        users_sheet.getRange(row, 6).setValue('Yes'); 
        
        sendText(userId, "Successfully subscribed to Favours Bot. You will be notified whenever a new favour is requested!");      
      } else if (text === '/unsubscribe') {
        var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
        var row = findUserRow(userId);
        users_sheet.getRange(row, 6).setValue('No'); 
        
        sendText(userId, "Unsubscribed :( Who hurt you?");        
      } else if (text === '/leaderboard') {
        sendText(chatID, getLeaderboardRow(userID));
      } else if (text === '/simp_leaderboard') {
        sendText(chatID, getSimpLeaderboardRow(userID));
      } else if (text === '/simp') {
        if (processSimpRequest(userId) === false) {
            sendText(chatID, 'You have no requests to take');
          } else {
            sendText(chatID, 'Which request do you want to take?', processSimpRequest(userId));
          }
      } else if (text === '/check') {
        var data = userExists(userId);
        var credits = data.total_credits;
        var name = data.name;
        var room = data.room;
        var simp = data.simp_points
        if (credits === 0) {
          sendText(userId, "Hi " + name + "(" + room + ") !" + "You have 0 credits:( Do some good! \nSimp Count: " + simp);
        } else {
          sendText(userId, "Hi " + name + "(" + room + ") !" + "You have " + credits + " credits!\nSimp Count: " + simp);
        }
        
      } else {
        if (check_name_room_validity(text)) {
          addUser(contents);
        } else {
          sendText(chatID, 'Invalid');
        }
      }
    }
}

// webhook
// ------------------------------------
function setWebhook() {
    var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
    var response = UrlFetchApp.fetch(url);
}

function deleteWebhook() {
    var url = telegramUrl + "/deleteWebhook";
    var response = UrlFetchApp.fetch(url);
}
// ------------------------------------






function locateFinalUserCredit(userID) {  
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();
    
    var searchRange = active_request_sheet.getRange(2, 1, lastRow, 4);
    var rangeValues = searchRange.getValues();
  
    for (i = lastRow - 1; i > 0; i--) {
        if (rangeValues[i][3] === userID) {
            var row = parseInt(i) + 2;
            var ref = rangeValues[i][0];
            var request = rangeValues[i][1];
            var credit = rangeValues[i][2];          
            return [row, request, credit, ref];          
        }
    }  
}              


    

function findUserRow(userID) {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = users_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();
    
    var searchRange = users_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
  
    for (i = 0; i < lastRow; i++) {
        if (rangeValues[i][0] === userID) {
            return i + 2;
        }
    }
}


  
// return the current date and time
// ---------------------------------------
function currentDateTime() {
    var dateObj = new Date();
    var month = dateObj.getMonth() + 1;
    var day = String(dateObj.getDate()).padStart(2, '0');
    var year = dateObj.getFullYear();
    var date = day + '/' + month  + '/'+ year + 'Ew';
    var hour = dateObj.getHours();
    var min  = dateObj.getMinutes();
    var time = (hour < 10 ? "0" + hour : hour) + ':' + (min < 10 ? "0" + min : min) + 'Ew';
  
    
    return [date, time];
}
// ---------------------------------------

// returns the user data so that we can use methods like user.name or user.total_credits
// ------------------------------------
function userExists(userID) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = sheet.getDataRange();
    var lastColumn = rangeData.getLastColumn();
    var lastRow = rangeData.getLastRow();
  
    if (lastRow === 0) {
      return {};
    }
  
    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
  
    var person = {};
  
    for (j = 0; j < lastRow - 1; j++) {
      if (rangeValues[j][0] === userID) {
        person.chatID = rangeValues[j][0];
        person.name = rangeValues[j][1];
        person.room = rangeValues[j][2];
        person.total_credits = rangeValues[j][3];
        person.simp_points = rangeValues[j][4];
        break;
      }
    }
    return person;
}



function findSlaveRow(userID, slaveID) {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = users_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();
    
    var searchRange = users_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
  
    for (i = 0; i < lastRow; i++) {
        if (rangeValues[i][0] === slaveID) {
            return i;
        }
    }
}


// send text function
// ---------------------------------------
function sendText(chatId, text, keyBoard) {
    var data = {
      method: 'post',
      payload: {
        method: 'sendMessage',
        chat_id: String(chatId),
        text: text,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(keyBoard),
      },
    };
    return UrlFetchApp.fetch(telegramUrl + '/', data);
}
// ---------------------------------------

// checks input validity
// ---------------------------------------
function check_name_room_validity(text) {
    if (is_one_word(text)) {
      return false;
    } else {
      var arr = text.split(' ');
      var name = arr[0];
      var first_letter_of_name = name.slice(0, 1);
  
      var room = arr[1];
      var block = room.slice(0, 1);
      var floor = parseInt(room.slice(1, 2));
  
      if (first_letter_of_name !== '/' && is_valid_room(block, floor)) {
          return true;
      } else {
          return false;
      }
    }  
}
      
function is_one_word(text) {
  var arr = text.split(' ');
  if (arr == text) {
    return true;
  } else {
    return false;
  }
}

function is_valid_room(block, floor) {
    if (block === 'A' || block === 'B' || block === 'C' || block === 'D' || block === 'E' ||
        block === 'a' || block === 'b' || block === 'c' || block === 'd' || block === 'e') {
            if (floor >= 1 && floor <= 4) {
                return true;
            } else {
                return false;
            }
    } else {
        return false;
    }
}
// ---------------------------------------

function oppositeGender(userFloor, requestorFloor) {
    if (requestorFloor === '2' || requestorFloor === '3') {
        if (userFloor === '1' || userFloor === '4') {
            return 'o';
        } else {
            return 's';
        }
    } else {
        if (userFloor === '2' || userFloor === '3') {
            return 'o';
        } else {
            return 's';
        }
    }
}


