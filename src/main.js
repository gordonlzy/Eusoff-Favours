function doPost(e) {
    var contents = JSON.parse(e.postData.contents);
  
    if (contents.callback_query) {
      var idCallback = contents.callback_query.message.chat.id;
      var name = contents.callback_query.from.first_name;
      var userID = contents.callback_query.from.id;
      var data = contents.callback_query.data;
      var command = data.split('-')[0];
      var message_id = contents.callback_query.message.message_id;
      
      if (command === 'category') {
        giveCredit(idCallback, data);
      } else if (command === 'credit') {
        setUserOngoing(userID, "1");    
        sendText(userID, 'Please key in a remark/details!');     
        makeRequest(idCallback, data);       
      } else if (command === 'cancel') {
        sendText(idCallback, cancelRequest(data.split('-')[1], userID));
//         sendMenu(userID);
      } else if (command === 'take_request') {
        var data_arr = data.split('-');
        var refId = parseInt(data_arr[1]) + 1;
        takeRequest(idCallback, refId);
      } else if (command === 'complete') {
        completeRequest(idCallback, data);
      } else if (command === 'simp') {
        var data_arr = data.split('-');
        var refId = parseInt(data_arr[1].split(' ')[0]) + 1;
        takeSimpRequest(idCallback, refId);
      } else if (command === 'toggleView') {
        updateView(idCallback, data, message_id);
      } else if (command === 'back') {
        updateText(idCallback, message_id, getMenu());
      } else if (command === 'toggleProfile') {
        updateProfile(idCallback, data, message_id);
      } else if (command === 'register') {
        register(idCallback);
      } else if (command === 'viewCategory') {
        view(idCallback, data)
      }

    } else if (contents.message) {
      var chatID = contents.message.chat.id;
      var text = contents.message.text;
      var userId = contents.message.from.id;
      
      if (text === '/register') {
        register(userId);
      } else if (text === '/make_request'){
        if (Object.getOwnPropertyNames(userInfo(userId)).length !== 0) {
          if (userInfo(userId).total_credits > 0) {
            chooseCategory(userId);
          } else {
            sendText(userId, "You do not have any credits left, go do some good.");
          }
        } else {
          sendText(userId, "You are not registered, to sign up use /register");
        }
      } else if (text === '/start') {
        // sendMenu(userId);
        begin(userId);
      } else if (text === '/help') {
        sendMenu(userId);
      } else if (text === '/view') {
        // view(userId);
        chooseViewCategory(userId);
      } else if (text === '/cancel') {
        if (viewOwn(userId) === false) {
            sendText(chatID, 'You have no requests to cancel');
//             sendMenu(userId);
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
      } else if (text === '/subscribe') {
        setUserSubscribe(userId, "Yes");        
        sendText(userId, "Successfully subscribed to Favours Bot. You will be notified whenever a new favour is requested!");      
      } else if (text === '/unsubscribe') {
        setUserSubscribe(userId, "No");        
        sendText(userId, "Unsubscribed :( Who hurt you?");        
      } else if (text === '/leaderboard') {
        sendLeaderboard(chatID, userId);
      } else if (text === '/simp_leaderboard') {
        sendSimpLeaderboard(chatID, userId);
      } else if (text === '/simp') {
        if (processSimpRequest(userId) === false) {
            sendText(chatID, 'You have no requests to take');
          } else {
            sendText(chatID, 'Which request do you want to take?', processSimpRequest(userId));
          }
      } else if (text.slice(0, 6) === '/take_') {
        var ref = parseInt(text.substr(6));
        takeRequest(userId, ref);
      } else if (text.slice(0, 6) === '/simp_') {
        var ref = parseInt(text.substr(6));
        takeSimpRequest(userId, ref);
      } else if (text === '/profile') {
        sendText(userId, getProfile(userId)[0], {inline_keyboard: getProfileKeyboard(1)});
      } else {
        if (check_name_room_validity(text)) {
          addUser(contents);
        } else if (userInfo(userId).ongoing === 1) {
          broadcast(userId, text);
        } else {
          sendText(chatID, 'Invalid! 🥴');
        }
      }
    } 
}

function setWebhook() {
    var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
    var response = UrlFetchApp.fetch(url);
}

function deleteWebhook() {
    var url = telegramUrl + "/deleteWebhook";
    var response = UrlFetchApp.fetch(url);
}

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

function getMenu() {
  var str = "Welcome to Eusoff's Favours Bot! \n" +
          "To view profile /profile \n" +
          "To view active requests /view \n" + 
          "To make request /make_request\n\n" + 
          "To view the leaderboards /leaderboard\n" +
          "To view the simp leaderboards /simp_leaderboard\n\n" + 
          "To subscribe to favour updates /subscribe\n" + 
          "To unsubscribe from updates /unsubscribe\n" +
          "To mark a request as complete /complete\n\n" +
          "To delete your current requests /cancel\n";
  return str;
}

function sendMenu(chatID) {
  sendText(chatID, getMenu());
}

function updateText(chat_id, message_id, text, keyBoard) {
  var data = {
      method: 'post',
      payload: {
        method: 'editMessageText',
        chat_id: String(chat_id),
        message_id: String(message_id),
        text: text,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(keyBoard),
      },
    };
    return UrlFetchApp.fetch(telegramUrl + '/', data);
}

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

function sendGuide(userId) {
  var registerKeyboard = [
          [
            {
              text: 'Register',
              callback_data: 'register-',
            },
          ]
  ]
  var str = "Hi new user, let's get started with the bot.\n\n" +
            "To begin, click the button below to be registered as a user.";
  sendText(userId, str, {inline_keyboard: registerKeyboard});
}

function begin(userId) {
  var user = userInfo(userId);
  if (Object.getOwnPropertyNames(user).length === 0) {
    sendGuide(userId)
  } else {
    sendMenu(userId);
  }
}
