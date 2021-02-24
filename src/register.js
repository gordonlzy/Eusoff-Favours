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
        "To view profile /profile \n" + 
        "To view active requests /view \n" + 
        "To make request /make_request\n\n" + 
        "To view the leaderboards /leaderboard\n" +
        "To view the simp leaderboards /simp_leaderboard\n\n" + 
        "To subscribe to favour updates /subscribe\n" + 
        "To unsubscribe from updates /unsubscribe\n\n" + 
        "To mark a request as complete /complete\n" +
        "To delete your current requests /cancel\n" ;
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
        "To view your profile /profile \n" +
        "To view active requests /view \n" + 
        "To make request /make_request\n\n" + 
        "To view the leaderboards /leaderboard\n" +
        "To view the simp leaderboards /simp_leaderboard\n\n" + 
        "To subscribe to favour updates /subscribe\n" + 
        "To unsubscribe from updates /unsubscribe\n\n" +
        "To mark a request as complete /complete\n" +
        "To delete your current requests /cancel\n";
  
      sendText(id, text);
}
