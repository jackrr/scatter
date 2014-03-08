/**
 *
 * TODO:
 *   remove extra column from table: this will require a change in the dot placement logic
 *
 *   add labels to table
 *      hours on left and right of table
 *      days below
 *
 *   fix calendar picker:
 *      add ok/cancel buttons
 *      match style
 *
 *   add calendar icon
 *
 *   add fonts
 *
 *   cleaner way to grab json data?
 *
 *   sort out duplicate ride requests
**/



$(document).ready(function() {

  var days = ['sun', 'mon', 'tues', 'wed', 'thur', 'fri', 'sat'];
  buildTable();
  // TODO: customize calendar plugin to match styling, buttons
  var startDatePicker = new datepickr('dateSelectFirst');
  var endDatePicker = new datepickr('dateSelectSecond');

  $('#calIcon').click(function() {
    var startDate =  getTime($('#dateSelectFirst').val());
    var endDate = getTime($('#dateSelectSecond').val());
    var chart = new Chart(getRides(startDate,endDate));
    chart.showRides();
    chart.drawDots();
  });

  function Chart(data) {
    var rides = data.rides;
    var unmetRequests = data.unmetRequests;

    this.totalEvents = rides.length + unmetRequests.length;
    this.sharedRides = 0;
    this.soloRides = 0;
    this.dots = [];

    for (var index in rides) {
      var dot = new Dot(index, rides[index]);

      if (dot.solo) {
        this.soloRides++;
      } else {
        this.sharedRides++;
      }
      this.dots.push(dot);
    }

    for (var index in unmetRequests) {
      var dot = new Dot(index, unmetRequests[index]);
      this.dots.push(dot);
    }

    this.showRides = function() {
      $("#totalEvents .count").html(this.totalEvents);
      $("#sharedRides .count").html(this.sharedRides);
      $("#soloRides .count").html(this.soloRides);
    }

    this.drawDots = function() {
      for (var index in this.dots) {
        this.dots[index].draw();
      }
    };
  }

  function Dot(index, ride) {
    if (ride.ride_requests) {
      if (ride.ride_requests.length == 1) {
        this.solo = true;
        this.html = '<div id="index'+index+'" class="dot solo"></div>';
      } else {
        this.solo = false;
        this.html = '<div id="index'+index+'" class= "dot shared"></div>';
      }
      this.time = new Date(ride.pickup_time);
    } else {
      this.html = '<div id="index'+index+'" class= "dot request"></div>';
      this.time = new Date(ride._time);
    }

    this.index = index;

    this.draw = function() {
      var day = days[this.time.getDay()];
      var hour = this.time.getHours();
      var cell = "#dotHolder ." + hour + " ." + day;
      var top = this.time.getMinutes()/60 * 100 + "%";
      $(cell).append(this.html);
      $('#index'+this.index).css('top', top);
    };
  }

  function getRides(startDate, endDate) {
    var rides = [];
    for (var index in manifests) {
      var mani = manifests[index];
      if (mani.pickup_time >= startDate && mani.pickup_time <= endDate) {
        rides.push(mani);
      }
    }

    var unmetRequests = [];
    // TODO: filter out requests in manifest
    for (var index in requests) {
      var request = requests[index];

      //TODO: reduce nested if's
      if (request.dropoff_window.preferred != -1) {
        if (request.dropoff_window.preferred >= startDate && request.dropoff_window.preferred <= endDate) {
          request._time = request.dropoff_window.preferred;
          unmetRequests.push(request);
        }
      } else {
        if (request.request_time >= startDate && request.request_time <= endDate) {
          request._time = request.request_time;
          unmetRequests.push(request);
        }
      }
    }
    return {rides: rides, unmetRequests: unmetRequests};
  }

  function buildTable() {
    var hour = 24;
    while (hour > 0) {
      var row = '<tr class="hour ' + hour + '">';

      for (var i in days) {
        row += '<td class="day ' + days[i] + '"></td>';
      }
      row += '</tr>';
      $('#dotHolder').append(row);
      hour--;
    }
  }

  function getTime(string) {
    return new Date(string.replace(/[a-z]{2},/,',')).getTime();
  }
});
