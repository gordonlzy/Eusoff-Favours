function getDateTime() {
  var dateObj = new Date();
  var month = parseInt(dateObj.getMonth() + 1);
  var day = parseInt(String(dateObj.getDate() + 1).padStart(2, '0'));
  var year = parseInt(dateObj.getFullYear());
  // var hour = parseInt(dateObj.getHours());  
  var hour = (parseInt(dateObj.getHours()) + 1 > 12) 
              ? parseInt(dateObj.getHours()) + 1 - 12 
              : parseInt(dateObj.getHours()) + 1 + 12;
  var min  = parseInt(dateObj.getMinutes());

  var date = day + '/' + month  + '/'+ year;
  var time = (hour < 10 ? "0" + hour : hour) + ':' + (min < 10 ? "0" + min : min);  
  
  var current = {};
  current.month = month;
  current.day = day;
  current.year = year;
  current.hour = hour;
  current.min = min;
  current.date = date;
  current.time = time;

  return current;
}

function processDate(ewDate) {
  // 13/12/2020Ew
  var splitDate = ewDate.split("/");
  var day = parseInt(splitDate[0]);
  var month = parseInt(splitDate[1]);
  var year = parseInt(splitDate[2].substring(0, 4));

  var requestDate = {};
  requestDate.day = day;
  requestDate.month = month;
  requestDate.year = year;
  
  return requestDate;
}

function processTime(ewTime) {
  // 15:11Ew
  var splitTime = ewTime.split(":");
  var hour = parseInt(splitTime[0]);
  var minute = parseInt(splitTime[1]);

  var requestTime = {};
  requestTime.hour = hour;
  requestTime.minute = minute;
  
  return requestTime;
}
