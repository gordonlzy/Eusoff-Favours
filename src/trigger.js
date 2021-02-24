// two options remove by day or by hour, just comment one and uncomment the other to swap
function removeOldPosts() {
  var current = getDateTime();
  var recycleDays = 1;
  var recycleHours = 6;

  var requestsRangeData = Requests.getDataRange();
  var requestsLastRow = requestsRangeData.getLastRow();

  for (i = 1; i < requestsLastRow; i++) {
    var request = requestInfo(i);
    var rawRequestDate = request.date;;
    var rawRequestTime = request.time;
    var requestDate = processDate(rawRequestDate);
    var requestTime = processTime(rawRequestTime);


    // if (isOldPostByDay(current, requestDate, recycleDays) && request.status === "Available") {
    //   setRequestStatus(i, "Cancelled");
    // }

    if (isOldPostByHour(current, requestDate, requestTime, recycleHours) && request.status === "Available") {
      setRequestStatus(i, "Cancelled");
    }
  }
}

function isOldPostByDay(current, requestDate, recycleDays) {
  if (current.month === requestDate.month) {
    if (current.day - requestDate.day > recycleDays) {
      return true;
    } else {
      // still relatively new
      return false;
    }
  } else {
    // different month
    return true;
  }
}

function isOldPostByHour(current, requestDate, requestTime, recycleHours) {
  if (current.year > requestDate.year) {
    if (current.year - requestDate.year > 1) {
      // more than 1 year
      return true;
    } else {
      if ((12 - requestDate.month + current.month) > 1) {
        return true;
      } else {
        // one month difference
        var requestEOM = endOfMonth(requestDate.month, requestDate.year);
        if (requestEOM - requestDate.day + current.day > 1) {
          return true;
        } else {
          return hourDiff(current, requestTime, recycleHours);
        }
      }
    }
  } else {
    // same year
    if (current.month > requestDate.month) {
      if (current.month - requestDate.month > 1) {
        // more than 1 month
        return true;
      } else {
        // one month older
        var requestEOM = endOfMonth(requestDate.month, requestDate.year);
        if (requestEOM - requestDate.day + current.day > 1) {
          return true;
        } else {
          return hourDiff(current, requestTime, recycleHours);
        }
      }
    } else {
      // same month
      return dayDiff(current, requestDate, requestTime, recycleHours);
    }
  }
}

function hourDiff(current, requestTime, recycleHours) {
  if (current.hour + (24 - requestTime) > recycleHours) {
    return true;
  } else {
    return false;
  }
}

function dayDiff(current, requestDate, requestTime, recycleHours) {
  if (current.day > requestDate.day) {
    if (current.day - requestDate.day > 1) {
      // more than 1 day
      return true;
    } else {
      return hourDiff(current, requestTime, recycleHours);
    }
  } else {
    // same day
    if (current.hour - requestTime.hour > recycleHours) {
      return true;
    } else {
      return false;
    }
  }
}

function endOfMonth(month, year) {
  if (month === 1 || month === 3 || month === 5 || month === 7 || 
      month === 8 || month === 10 || month === 12) {
      return 31;
  } else {
    if (month === 4 || month === 6 || month === 9 || month === 11) {
      return 30;
    } else {
      return (year % 4 === 0)? 29 : 28;
    }
  }
}
