var TOKEN = "1488628659:AAGG49VW24lhVNx1ZcBkB-e_ciI7Zi4T7f4";
var sheet_id = "1MiPByQzVG-Zwe0vDSYjFSU-gfTt5uwH8JKQY61tk9JQ";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbz_PUrcc0lgCfoTFSMd5DtkiU1x0rf5HntUvJ67YuD9jJ5vcm8/exec";

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
            sendText(listOfSubs[i], 'Request made: ' + info[1] + ' \n' + info[2] + ' credit(s)\nRef number: ' + (parseInt(info[3]) - 2) + '\nRemark: ' + text.slice(7));
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

// register
// ------------------------------------
function register(userID) {
    var user = userExists(userID);
    var text = 'failed';
  
    if (Object.getOwnPropertyNames(user).length === 0) {
      text =
        "Welcome to Eusoff Favours Bot. You do not exist in our system yet. Let's change that." +
        '\n\n' +
        '<b> What is your name and room number? </b>';
      sendText(userID, text);
      text =
        'Please input in the format: <b> Name A101 </b>, for example: John A101';
    } else {
      text =
        'Welcome back ' +
        user.name +
        '!!' +
        '\n\n' +
        'Your room number is ' +
        user.room +
        '\n\n' +
        "To view active requests /view \n" + 
        "To delete your current requests /cancel\n" +
        "To mark a request as complete /complete\n" +
        "To make request /make_request\n" + 
        "To take request /take_request\n\n" + 
        "To simp /simp\n" +
        "To view the leaderboards /leaderboard\n" +
        "To view the simp leaderboards /simp_leaderboard\n" + 
        "To subscribe to favour updates /subscribe\n" + 
        "To unsubscribe from updates /unsubscribe\n";
    }
    sendText(userID, text);
}

function addUser(data) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
  
    var raw_user_data = data.message.text;
    var user_data_arr = raw_user_data.split(" ");

    var name = user_data_arr[0];
    var room = user_data_arr[1];
    var id = data.message.chat.id;
    var total_credits = 5;
    var init_simp_count = 0;
  
    sheet.appendRow([id, name, room, total_credits, init_simp_count, 'No']);
  
    var text =
        'Hello ' +
        name +
        '! You are successfully added to Favours Bot.' +
        '\n\n' +
        'Please check your details.' +
        '\n' +
        'Name: ' +
        name +
        '\n' +
        'Room: ' +
        room +
        '\n\n' +
        "To view active requests /view \n" + 
        "To delete your current requests /cancel\n" +
        "To mark a request as complete /complete\n" +
        "To make request /make_request\n" + 
        "To take request /take_request\n\n" + 
        "To simp /simp\n" +
        "To view the leaderboards /leaderboard\n" +
        "To view the simp leaderboards /simp_leaderboard\n" + 
        "To subscribe to favour updates /subscribe\n" + 
        "To unsubscribe from updates /unsubscribe\n";
  
      sendText(id, text);
}
// ------------------------------------

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

// delete
// ------------------------------------
function viewOwn(userID) {
    var curr_user = userExists(userID);
    var room = curr_user.room;
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
        var remark = rangeValues[i][7];
      
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " + '\n '+ request_time.slice(0, -2) + ", " + request_date.slice(0, -2),
                  callback_data: 'cancel-' + i,
                },
            ];
            count++;
        }
    }
  
    var cancelKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return cancelKeyboard;
    }
}

function cancelRequest(row_data, userID) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var curr_user = userExists(userID);
    // some gross programming here
    var row = parseInt(row_data) + 2; // add 2 to offset the array index start and the column headings
    var requestID = active_request_sheet.getRange(row, 4).getValue();
    var status = active_request_sheet.getRange(row, 5).getValue();
    
    if (requestID === userID && status === 'Available') {
        active_request_sheet.getRange(row, 5).setValue('Cancelled');
        return 'Request cancelled!';
    } else {
        return 'You have no active requests!';
    }
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

// make_request
// ------------------------------------
function chooseCategory(userID) {
    var category_keyboard = {
        inline_keyboard: [
          [
            {
              text: 'Dabao',
              callback_data: 'category-Dabao',
            },
          ],
          [
            {
              text: 'Collect Laundry',
              callback_data: 'category-Collect_Laundry',
            },
          ],
          [
            {
              text: 'Borrow Item',
              callback_data: 'category-Borrow_Item',
            },
          ],
          [
            {
              text: 'Open Gate',
              callback_data: 'category-Open_Gate',
            },
          ],
          [
            {
              text: 'Distract Barbara',
              callback_data: 'category-Distract_Barbara',
            },
          ],
          [
            {
              text: 'Miscellaneous',
              callback_data: 'category-Miscellaneous',
            },
          ],
        ],
    };

    sendText(userID, 'What Category?', category_keyboard);
}

function giveCredit(userID, data) {
            // data - category-dabao
    var data_arr = data.split("-");
            // dabao
    var category = data_arr[1];
            
    var curr_user = userExists(userID);
    var credits = curr_user.total_credits;
            
    var keyboard_1 = {
        inline_keyboard: [
            [
            {
                text: '1',
                 // credit-dabao 1
                callback_data: 'credit-' + category + ' 1',
            },
            ],
            [
            {
                text: '2',
                callback_data: 'credit-' + category + ' 2',
            },
            ],
            [
            {
                text: '3',
                callback_data: 'credit-' + category + ' 3',
            },
            ],
        ],
    };
    
    var keyboard = [];
    for (i = 1; i <= credits; i++) {
          keyboard[i - 1] = [
              {
                text: i,
                callback_data: 'credit-' + category + ' ' + i,
              },
          ];
    }
      
    var keyboard_2 = {
      inline_keyboard: keyboard,
    };
              
    if (credits >= 3) {
        sendText(userID, 'How many credits?', keyboard_1);
    } else {
        sendText(userID, 'How many credits?', keyboard_2);
    }
}

function addRemark(userID, data) {
    var data_arr = data.split("-");
    var category_number = data_arr[1];
    var remark_keyboard = {
        inline_keyboard: [
              [
              {
                  text: 'Yes',
                  callback_data: 'remark-' + category_number + ' 1',
              },
              ],
              [
              {
                  text: 'No',
                  callback_data: 'remark-' + category_number + ' 0',
              },
              ],
            ],
        };           
    
    sendText(userID, 'Do you want to add any remarks?', remark_keyboard);
}
                
function makeRequest(userID, data, remark) {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();

    var curr_user = userExists(userID);
    var total_credits = curr_user.total_credits;

    var data_arr = data.split('-');
    var category_number_remark = data_arr[1];
    var request = category_number_remark.split(' ')[0];
    var deducted_credit = category_number_remark.split(' ')[1];
    var remark_placeholder = '-';

    var new_credits = parseInt(total_credits) - parseInt(deducted_credit);
      
    var status = 'Available'    
    var now = currentDateTime();

    active_request_sheet.appendRow([lastRow, request, deducted_credit, userID, status, now[0], now[1], remark_placeholder, deducted_credit]);
    // update the user's new credits after minus the credits used
    var userRow = findUserRow(userID);
    
    users_sheet.getRange(userRow, 4).setValue(new_credits);
  
    var listOfSubs = subscribedUsers();

    if (remark === 0) {
      sendText(userID, 'Request made: ' + request + ' \n' + credits + ' credit(s)' +'\nRef number: ' + lastRow);
      for (i = 0; i < listOfSubs.length; i++) {        
        if (listOfSubs[i] !== userID) {
            sendText(listOfSubs[i], 'Request made: ' + request + ' \n' + credits + ' credit(s)' +'\nRef number: ' + lastRow);
        }
      }
    }
}
    
function subscribedUsers() {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = users_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var searchRange = users_sheet.getRange(1, 1, lastRow, 6);
    var rangeValues = searchRange.getValues();
  
    var res = [];
  
    for (i = 1; i < lastRow; i++) {
      if (rangeValues[i][5] === 'Yes') {
            res.push(parseInt(rangeValues[i][0]));
        }
    }
    return res;
  
}

function findUserRow(userID) {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var rangeData = users_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();
    
    var searchRange = users_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
  
    for (i = 1; i < lastRow; i++) {
        if (rangeValues[i][0] === userID) {
            return i + 2;
        }
    }
}
// ------------------------------------

// take request
// ------------------------------------
function processRequest(userID) {
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        var curr_user = userExists(rangeValues[i][3]);
        var name = curr_user.name;
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
      
        if (rangeValues[i][3] !== userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " 
                  + name + '\n '+ request_time.slice(0, -2),
                  callback_data: 'take_request-' + i,
                },
            ];
            count++;
        }
    }
              
    var takeRequestKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return takeRequestKeyboard;
    }
}
              
function takeRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1]) + 2;
          
    active_request_sheet.getRange(ref_id, 5).setValue("Taken");
    active_request_sheet.getRange(ref_id, 10).setValue(userID);

    sendText(userID, 'Request taken');
}
// ------------------------------------
  
// return the curretn date and time
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
// ------------------------------------

// complete request
// ------------------------------------
function viewOwnTaken(userID) {
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];
  
    for (i = 0; i < lastRow - 1; i++) {
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
      
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Taken") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr), " + request_time.slice(0, -2) + ", " + request_date.slice(0, -2),
                  callback_data: 'complete-' + i,
                },
            ];
            count++;
        }
    }
  
    var takenKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return takenKeyboard;
    }
}

function completeRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1]);
          
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = active_request_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();
    
    var slaveID = rangeValues[ref_id][9];
    var slaveRow = findSlaveRow(userID, slaveID);
    var slave = userExists(slaveID);
    var credit = slave.total_credits;
          
    var pending_credit = rangeValues[ref_id][8];
    var new_credits = credit + parseInt(pending_credit);
    
    var ref_plus_one = parseInt(ref_id) + 2;
    var row_plus_one = parseInt(slaveRow) + 1;

    active_request_sheet.getRange(ref_plus_one, 5).setValue('Completed');
    active_request_sheet.getRange(ref_plus_one, 9).setValue(0);
    users_sheet.getRange(row_plus_one + 1, 4).setValue(new_credits);

    sendText(userID, 'Request complete');
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
// ------------------------------------

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
            if (floor === '1' || floor === '2' || floor === '3' || floor === '4') {
                return false;
            } else {
                return false;
            }
    } else {
        return false;
    }
}
// ---------------------------------------

// ---------------------------------------
// Leaderboard
function getLeaderboardRow(userID) {
  var leaderboard_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName("Normal_Leaderboard");
  var rangeData = leaderboard_sheet.getDataRange();
  var lastRow = rangeData.getLastRow();
  var lastColumn = rangeData.getLastColumn();
  var searchRange = leaderboard_sheet.getRange(2, 1, lastRow - 1, lastColumn);
  var rangeValues = searchRange.getValues();
  var result = "Leaderboards" + '\n';
  
  for (i = 0; i < 3; i++) {
      var name = rangeValues[i][0];
      var room = rangeValues[i][1];
      var totalCredits = rangeValues[i][2];
      result = result + (i+1).toString() + ". " + name + " (" + room + ") " +  ": " + totalCredits + " Credits" + '\n';
  } 
  return result;
 
}
// ---------------------------------------
   
// ---------------------------------------
// Simp Leaderboard
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
// ---------------------------------------

// Simp
// ---------------------------------------
function processSimpRequest(userID) {
    
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var count = 0;
    var keyboard = [];

    var curr_user = userExists(userID);
    var userFloor = curr_user.room.slice(1, 2);
  
    for (i = 0; i < lastRow - 1; i++) {
        var requestor = userExists(rangeValues[i][3]);
        var requestorName = requestor.name;
        var requestorFloor = requestor.room.slice(1, 2);

        var request_time = rangeValues[i][6];

        var gender_diff = oppositeGender(userFloor, requestorFloor);
      
        if (rangeValues[i][3] !== userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + " (" + rangeValues[i][2] + " cr) " 
                  + requestorName + '\n '+ request_time.slice(0, -2),
                  callback_data: 'simp-' + i + ' ' + gender_diff,
                },
            ];
            count++;
        }
    }
              
    var simpKeyboard = {
      inline_keyboard: keyboard,
    };
    if (count === 0) {
      return false;
    } else {
      return simpKeyboard;
    }
}
              
function takeSimpRequest(userID, data) {
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');

    var user = userExists(userID);
    var simp_points = user.simp_points;
    var new_simp_points = simp_points + 1;      

    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();
    var lastColumn = rangeData.getLastColumn();

    var searchRange = active_request_sheet.getRange(2, 1, lastRow - 1, lastColumn);
    var rangeValues = searchRange.getValues();

    var data_arr = data.split('-');
    var ref_id = parseInt(data_arr[1].split(' ')[0]);
    var gender_diff = data_arr[1].split(' ')[1];
    var pending_credit = rangeValues[ref_id][8];

    var userRow = parseInt(findUserRow(userID));
          
    active_request_sheet.getRange(ref_id + 2, 9).setValue(0);
    active_request_sheet.getRange(ref_id + 2, 5).setValue("Taken");
    active_request_sheet.getRange(ref_id + 2, 10).setValue(userID);
    
    users_sheet.getRange(userRow, 5).setValue(new_simp_points);

    sendText(userID, 'Request taken');
}

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
// ----------------------------------------
