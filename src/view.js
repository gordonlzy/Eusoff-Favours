function view(userID, data) {
  var data_arr = data.split('-');
  var category = data_arr[1];

  var next = 1;
  var keyboard = [
          [
            {
              text: 'Next',
              callback_data: 'toggleView-' + next + ' ' + category,
            },
          ],
  ]
  sendText(userID, getTestView(0, category), {inline_keyboard: keyboard});
}

function updateView(userID, data, message_id) {
  var data_arr = data.split('-');
  var index_category = data_arr[1];
  var index_category_arr = index_category.split(" ");
  var index = index_category_arr[0];
  var category = index_category_arr[1];
  var previous = parseInt(index) - 1;
  var next = parseInt(index) + 1;
  var keyboard = [
          [
            {
              text: 'Previous',
              callback_data: 'toggleView-' + previous + ' ' + category,
            },
            {
              text: 'Next',
              callback_data: 'toggleView-' + next + ' ' + category,
            },
          ],
        ]
  var finalkeyboard = [
          [
            {
              text: 'Previous',
              callback_data: 'toggleView-' + previous + ' ' + category,
            },
          ]
  ]
  var firstkeyboard = [
          [
            {
              text: 'Next',
              callback_data: 'toggleView-' + next + ' ' + category,
            },
          ],
  ]
  var str = getTestView(index, category);
  var text = (category === "All")
              ? "Showing All Active Requests\n\n"
              : "Showing All Active " + category + " Requests\n\n";
  if (str === text) {
    var endText = (category === "All")
                    ? "That's all the active requests!"
                    : "That's all the active " + category + " requests!";
    updateText(userID, message_id, endText, { inline_keyboard: finalkeyboard });
  } else if (index === "0") {
    updateText(userID, message_id, getTestView(index, category), {inline_keyboard: firstkeyboard});
  } else {    
    updateText(userID, message_id, getTestView(index, category), {inline_keyboard: keyboard});
  }
}

function getTestView(index, category) {
    var rangeValues = requestRange();
    var str = (category === "All")
                ? "Showing All Active Requests\n\n"
                : "Showing All Active " + category + " Requests\n\n";
    str = str.bold();
    var count = 0;
    var max = 3;

    for (i = 0; i < requestLastRow() - 1; i++) {
      var req = requestInfo(rangeValues[i][0]);
      var user = userInfo(req.userId);
      
      if (category === "All") {
        if (req.status === "Available") {
          if (count >= index*max && count < (index*max + max)) { 
          str += req.ref + ". " + req.request + " - " + req.credits + " credit(s)\nmade by " + 
            user.name + " at " + req.time.slice(0, -2) + ", " + req.date.slice(0, -2) + "\nRemark: " + 
            req.remark + "\n" + "Take Request: /take_" + req.ref + "\nSimp: /simp_" + req.ref + "\n\n";
          }
          count++;
        }
      } else {
        if (req.status === "Available" && req.request === category) {
          if (count >= index*max && count < (index*max + max)) { 
            str += req.ref + ". " + req.remark + " - " + req.credits + " credit(s)\nmade by " + 
            user.name + " at " + req.time.slice(0, -2) + ", " + req.date.slice(0, -2) + 
            "\n" + "Take Request: /take_" + req.ref + "\nSimp: /simp_" + req.ref + "\n\n";
          }
          count++;
        }
      }
    }
    return str;
}

function chooseViewCategory(userID) {
    var category_keyboard = {
        inline_keyboard: [
          [
            {
              text: 'View All',
              callback_data: 'viewCategory-All',
            },
          ],
          [
            {
              text: 'Dabao',
              callback_data: 'viewCategory-Dabao',
            },
          ],
          [
            {
              text: 'Borrow Item',
              callback_data: 'viewCategory-Borrow_Item',
            },
          ],
          [
            {
              text: 'Open Gate',
              callback_data: 'viewCategory-Open_Gate',
            },
          ],
          [
            {
              text: 'Collect Parcel',
              callback_data: 'viewCategory-Collect_Parcel',
            },
          ],
          [
            {
              text: 'Miscellaneous',
              callback_data: 'viewCategory-Miscellaneous',
            },
          ],
        ],
    };

    sendText(userID, 'What Category?', category_keyboard);
}
