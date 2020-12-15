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
      sendText(userID, 'Request made: ' + request + ' \n' + new_credits + ' credit(s)' +'\nRef number: ' + lastRow);
      for (i = 0; i < listOfSubs.length; i++) {        
        if (listOfSubs[i] !== userID) {
            var data = userExists(userID);
            var name = data.name;
            sendText(listOfSubs[i], 'Request made by ' + name + ': ' + request + ' \n' + new_credits + ' credit(s)' +'\nRef number: ' + lastRow);
        }
      }
    }
}
// ------------------------------------
