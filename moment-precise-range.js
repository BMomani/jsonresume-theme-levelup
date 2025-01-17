if (typeof moment === "undefined" && typeof require === 'function') {
  var moment = require('moment');
}

(function(moment) {
  var STRINGS = {
    nodiff: '',
    year: 'year',
    years: 'years',
    month: 'month',
    months: 'months',
    day: 'day',
    days: 'days',
    hour: 'hour',
    hours: 'hours',
    minute: 'minute',
    minutes: 'minutes',
    second: 'second',
    seconds: 'seconds',
    delimiter: ' '
  };

  function pluralize(num, word) {
    return num + ' ' + STRINGS[word + (num === 1 ? '' : 's')];
  }

  function buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff){
    var result = [];

    if (yDiff) {
      result.push(pluralize(yDiff, 'year'));
    }
    if (mDiff) {
      result.push(pluralize(mDiff, 'month'));
    }
    if (dDiff) {
      result.push(pluralize(dDiff, 'day'));
    }
    // if (hourDiff) {
    //   result.push(pluralize(hourDiff, 'hour'));
    // }
    // if (minDiff) {
    //   result.push(pluralize(minDiff, 'minute'));
    // }
    // if (secDiff) {
    //   result.push(pluralize(secDiff, 'second'));
    // }

    return result.join(STRINGS.delimiter);
  }

  function buildValueObject(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff, firstDateWasLater) {
    return {
      "years"   : yDiff,
      "months"  : mDiff,
      "days"    : dDiff,
      "hours"   : hourDiff,
      "minutes" : minDiff,
      "seconds" : secDiff,
      "firstDateWasLater" : firstDateWasLater
    }
  }
  moment.fn.preciseDiff = function(d2, returnValueObject) {
    return moment.preciseDiff(this, d2, returnValueObject);
  };

  moment.preciseDiff = function(d1, d2, returnValueObject) {
    var m1 = moment(d1), m2 = moment(d2), firstDateWasLater;

    // https://github.com/mudassir0909/jsonresume-theme-elegant/commit/436134aa2790b0d00e1f8578947e042edaf6f00f
    /*
        The difference between two dates say 01-02-2016 & 31-03-2016 comes out as 1 month 30days
        because technically it's the different between 01-02-2016:00:00:00 & 31-03-2016:00:00:00
        But when someone enters start date & end date in resume, they mean start of the start date
        and end of the end date.
        The next two lines makes that correction, the start date is set as the start of the day, while
        end date is set as start of the day of the very next day. Basically in the above example, instead
        of making 31-03-2016:00:00:00 to 31-03-2016:23:59:59 which will get duration as 1 month 29days 23hours 59minutes 59sections
        It is changed to 01-04-2016:00:00:00 instead, to get the precise calculation
    */
    m1 = m1.startOf('day');
    m2 = m2.add(1, 'day').startOf('day');

    m1.add(m2.utcOffset() - m1.utcOffset(), 'minutes'); // shift timezone of m1 to m2

    if (m1.isSame(m2)) {
      if (returnValueObject) {
        return buildValueObject(0, 0, 0, 0, 0, 0, false);
      } else {
        return STRINGS.nodiff;
      }
    }
    if (m1.isAfter(m2)) {
      var tmp = m1;
      m1 = m2;
      m2 = tmp;
      firstDateWasLater = true;
    } else {
      firstDateWasLater = false;
    }

    var yDiff = m2.year() - m1.year();
    var mDiff = m2.month() - m1.month();
    var dDiff = m2.date() - m1.date();
    var hourDiff = m2.hour() - m1.hour();
    var minDiff = m2.minute() - m1.minute();
    var secDiff = m2.second() - m1.second();

    if (secDiff < 0) {
      secDiff = 60 + secDiff;
      minDiff--;
    }
    if (minDiff < 0) {
      minDiff = 60 + minDiff;
      hourDiff--;
    }
    if (hourDiff < 0) {
      hourDiff = 24 + hourDiff;
      dDiff--;
    }
    if (dDiff < 0) {
      var daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();
      if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
        dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
      } else {
        dDiff = daysInLastFullMonth + dDiff;
      }
      mDiff--;
    }
    if (mDiff < 0) {
      mDiff = 12 + mDiff;
      yDiff--;
    }

    if (returnValueObject) {
      return buildValueObject(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff, firstDateWasLater);
    } else {
      return buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff);
    }


  };
}(moment));
