var TOKEN = "1326277324:AAGIGMpXIega-CnhljzToqZAZ-cV4RGPkmQ";
var sheet_id = "1MiPByQzVG-Zwe0vDSYjFSU-gfTt5uwH8JKQY61tk9JQ";
var telegramUrl = "https://api.telegram.org/bot" + TOKEN;
var webAppUrl = "https://script.google.com/macros/s/AKfycbyP7yjkj0kTjpODuAlFUQvZFVxjxziJO-8qOmwByAmjBGL5EHA/exec";

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
        giveFavours(idCallback, data);
      } else if (command === 'favour') {
        addRemark(idCallback, data);
      } else if (command === 'cancel') {
        sendText(idCallback, cancelRequest(data.split('-')[1], userID));
      } else if (command === 'remark') {
        makeRequest(idCallback, data, userExists(idCallback).room);
      } else if (command === 'take_request') {
        takeRequest(idCallback, data);
      } else if (command === 'complete') {
        completeRequest(idCallback, data);
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
          "Welcome to Eusoff's Favour Bot! \nTo sign up /register \n" +
          "To view active requests /view \nTo delete your current requests /cancel\nTo make request /make_request\n To take request /take_request\n To complete /complete"
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
          sendText(chatID, 'You have no requests to cancel');
        } else {
          sendText(chatID, 'Which request do you want to take?', processRequest(userId));
        }
      } else if (text === '/complete') {
        if (viewOwnTaken(userId) === false) {
            sendText(chatID, 'You have no requests that are taken');
        } else {
            sendText(chatID, 'Which request do you want to complete?', viewOwnTaken(userId));
        }
      } else {
        addUser(contents);
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
function register(id) {
    var user = userExists(id);
    var text = 'failed';
  
    if (Object.getOwnPropertyNames(user).length === 0) {
      text =
        "Welcome to Eusoff Favour Bot. You do not exist in our system yet. Let's change that." +
        '\n\n' +
        '<b> What is your name and room number? </b>';
      sendText(id, text);
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
        'Would you like to make a request? /make_request' +
        '\n' +
        'Would you like to cancel your booking? /cancel' +
        '\n' +
        'Would you like to check the active requests? /view';
    }
    sendText(id, text);
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
  
    sheet.appendRow([id, name, room, total_credits, init_simp_count]);
  
    var text =
        'Hello ' +
        name +
        '! You are successfully added to FavourBot.' +
        '\n\n' +
        'Please check your details.' +
        '\n' +
        'Name: ' +
        name +
        '\n' +
        'Room: ' +
        room +
        '\n' +
        'To make a request, use /make_request, view active requests use /viewActiveRequest & to delete a booking /delete';
  
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
        var favour = rangeValues[i][2];
      
        var request_date = rangeValues[i][5];
        var request_time = rangeValues[i][6];
      
        var curr_user = userExists(rangeValues[i][3]);
        var name = curr_user.name;
      if (rangeValues[i][4] === 'Available') {
        active_requests = active_requests + ref + '. ' + request + "    " + favour + " favour(s) made by " + name + 
          " at " + request_time.slice(0, -2) + ' ' + request_date.slice(0, -2) + ' ' + '\n\n';
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
      
        if (rangeValues[i][3] === userID && rangeValues[i][4] === "Available") {
            keyboard[count] = [
                {
                  text: rangeValues[i][1] + "    " + rangeValues[i][2] + " favour(s) made at " + request_time.slice(0, -2) + ' ' + request_date.slice(0, -2) + '\n',
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
        ],
    };

    sendText(userID, 'What Category?', category_keyboard);
}

function giveFavours(userID, data) {
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
                 // favour-dabao 1
                callback_data: 'favour-' + category + ' 1',
            },
            ],
            [
            {
                text: '2',
                callback_data: 'favour-' + category + ' 2',
            },
            ],
            [
            {
                text: '3',
                callback_data: 'favour-' + category + ' 3',
            },
            ],
        ],
    };
    
    var keyboard = [];
    for (i = 1; i <= credits; i++) {
          keyboard[i - 1] = [
              {
                text: i,
                callback_data: 'favour-' + category + ' ' + i,
              },
          ];
    }
      
    var keyboard_2 = {
      inline_keyboard: keyboard,
    };
              
    if (credits >= 3) {
        sendText(userID, 'How many favours?', keyboard_1);
    } else {
        sendText(userID, 'How many favours?', keyboard_2);
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

function makeRequest(userID, data, room) {
    var users_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Users');
    var active_request_sheet = SpreadsheetApp.openById(sheet_id).getSheetByName('Active_Request');
    var rangeData = active_request_sheet.getDataRange();
    var lastRow = rangeData.getLastRow();

    var curr_user = userExists(userID);
    var credits = curr_user.total_credits;

    var data_arr = data.split('-');
    var category_number_remark = data_arr[1];
    var request = category_number_remark.split(' ')[0];
    var favours = category_number_remark.split(' ')[1];
    var remark = category_number_remark.split(' ')[2];

    var new_credits = parseInt(credits) - parseInt(favours);
      
    var status = 'Available'    
    var now = currentDateTime();

    active_request_sheet.appendRow([lastRow, request, favours, userID, status, now[0], now[1], remark, favours]);
    // update the user's new credits after minus the favour used
    var userRow = findUserRow(userID);
    
    users_sheet.getRange(userRow, 4).setValue(new_credits);

    sendText(userID, 'Request made: ' + request + ' \n' + favours + ' favour(s)' +'\nRef number: ' + lastRow);
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
                  text: rangeValues[i][1] + "    " + rangeValues[i][2] + " favour(s) made by " + name + ' at '+ request_time.slice(0, -2) + ' ' + request_date.slice(0, -2) + '\n',
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
//
// returns the user data so that we can use methods like user.name or user.total_credits
// ------------------------------------
function userExists(id) {
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
      if (rangeValues[j][0] === id) {
        person.chatID = rangeValues[j][0];
        person.name = rangeValues[j][1];
        person.room = rangeValues[j][2];
        person.total_credits = rangeValues[j][3];
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
                  text: rangeValues[i][1] + "    " + rangeValues[i][2] + " favour(s) made at " + request_time.slice(0, -2) + ' ' + request_date.slice(0, -2) + '\n',
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
  
    for (i = 1; i < lastRow; i++) {
        if (rangeValues[i][0] === slaveID) {
            return i;
        }
    }
}
// ------------------------------------

// send text function
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