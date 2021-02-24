function register(userID) {
    var user = userInfo(userID);
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
        "/profile - To check your profile details  \n\n" +
        "/view - To view, take or simp for active requests  \n" + 
        "/make_request - To make a request \n" + 
        "/complete - To mark your request as complete \n" +
        "/cancel - To delete your current requests that are not taken \n\n" +
        "/leaderboard - To view the leaderboards \n\n" +
        "/subscribe - To get notified of new favours \n" + 
        "/unsubscribe - To unsubscribe from updates \n";
    }
    sendText(userID, text);
}

function addUser(data) {  
    var raw_user_data = data.message.text;
    var user_data_arr = raw_user_data.split(" ");

    var name = user_data_arr[0];
    var room = user_data_arr[1];
    var id = data.message.chat.id;
  
    newUser(id, name, room);
    addUserToTrack(id);
  
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
        "/profile - To check your profile details  \n\n" +
        "/view - To view, take or simp for active requests  \n" + 
        "/make_request - To make a request \n" + 
        "/complete - To mark your request as complete \n" +
        "/cancel - To delete your current requests that are not taken \n\n" +
        "/leaderboard - To view the leaderboards \n\n" +
        "/subscribe - To get notified of new favours \n" + 
        "/unsubscribe - To unsubscribe from updates \n";
  
      sendText(id, text);
}
