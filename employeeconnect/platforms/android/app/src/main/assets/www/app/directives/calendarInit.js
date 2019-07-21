angular.module('app')
.directive("calendarShow", function($location, $route, Dashboard) {
  return { 
    restrict: 'A',
    link: function (scope, oElement, attrs) {

      scope.resetVariables = function(){
        scope.edit = true;
        scope.getTitle = '';
        scope.getStartTime = "";
        scope.getDate = "";
        scope.getEndTime = "";
        scope.setSelectedDate = "";
        scope.end_time = "";
        scope.start_time = "";
        scope.event_date = "";
        scope.event_title = "";
        scope.event_color = "#ccc";
      }
    
      
      scope.init = function() {
          var date = new Date();
          var d = date.getDate();
          var m = date.getMonth();
          var y = date.getFullYear();
          
          console.log("eventClick", Dashboard.AllHolidays)
          let all_events = []
          _.each(Dashboard.AllHolidays, (holidays)=>{
            all_events.push({
              type: 'holiday',
              status: null,
              id: holidays.id,
              name: holidays.occassion,
              title: holidays.occassion + " (Holiday)",
              start: moment(holidays.from_date, "DD MMM YYYY"),
              end: moment(holidays.to_date, "DD MMM YYYY"),
              backgroundColor: 'green',
              allDay: true
            })
          })
          
          _.each(Dashboard.AllLeaves, (leaves)=>{
            leaves.title = leaves.reason + " " + (leaves.approved == 0?"(Pending)":leaves.approved == 1?"(Declined)":"(Approved)")
            console.log(leaves.title)
            all_events.push({
              type: 'leave',
              id: leaves.id,
              status: leaves.approved,
              name: leaves.reason,
              title: leaves.title,
              start: moment(leaves.from_date, "DD MMM YYYY"),
              end: moment(leaves.to_date, "DD MMM YYYY"),
              backgroundColor: '#ccc',
              textColor: 'black',
              allDay: true
            })
          })
          

          var calendar = $('#calendar').fullCalendar({
            header: {
              left: 'prev,month',
              center: 'title',
              // right: 'month,agendaDay',
              right: 'agendaDay,next'
            },
            editable:false,
            selectable: true,
            selectHelper: true,
            select: function(start, end, allDay) {
              $("#eventCreate").modal().show();
              calendar.fullCalendar('unselect'); 
            },
            dayClick: function(date, jsEvent, view) {
              scope.setSelectedDate = date.format("YYYY-MM-DD");
              scope.$apply();
            },
        
            eventClick: function(calEvent, jsEvent, view) {
              scope.getLeaveID = calEvent.id
              scope.getTitle = calEvent.name;
              scope.getStartDate = moment(calEvent.start).format("DD MMM YYYY");
              scope.getEndDate = moment(calEvent.start).format("DD MMM YYYY");
              scope.getStatus = calEvent.status
              if(calEvent.type == 'leave'){
                $("#eventDetails").modal().show();                
              }
              scope.$apply();
            },
            events: all_events
            // events: [{
            //   title: 'All Day Event',
            //   start: new Date(y, m, 1),
            //   backgroundColor: '#ccc'
            // }, {
            //   title: 'Long Event',
            //   start: new Date(y, m, d - 5),
            //   end: new Date(y, m, d - 2),
            //   backgroundColor: 'green'
            // }, {
            //   id: 999,
            //   title: 'Repeating Event',
            //   start: new Date(y, m, d - 3, 16, 0),
            //   allDay: false,
            //   backgroundColor: 'black',
            //   textColor: "#fff"
            // }, {
            //   id: 999,
            //   title: 'Repeating Event',
            //   start: new Date(y, m, d + 4, 16, 0),
            //   allDay: false
            // }, {
            //   title: 'Meeting',
            //   start: new Date(y, m, d, 10, 30),
            //   allDay: false
            // }, {
            //   title: 'Lunch',
            //   start: new Date(y, m, d, 12, 0),
            //   end: new Date(y, m, d, 14, 0),
            //   allDay: false,
            //   textColor: "yellow"
            // }, {
            //   title: 'Birthday Party',
            //   start: new Date(y, m, d + 1, 19, 0),
            //   end: new Date(y, m, d + 1, 22, 30),
            //   allDay: false
            // }, {
            //   title: 'Click for Google',
            //   start: new Date(y, m, 28),
            //   end: new Date(y, m, 29)
            // }]
          });
          }();
      
      scope.deleteLeave = function(id){
        Dashboard.deleteLeave(id).then((result)=>{
          $("#eventDetails").modal().hide(); 
          $('body').removeClass('modal-open');
          $('.modal-backdrop').remove();
          $location.url('/calendar')
          $route.reload()
        })
      }

      scope.addNewEvent = function(){
        console.log(angular.element("#calendar"))
        if (scope.event_title)
					{
					  var _eDate = moment(scope.setSelectedDate).format("YYYY-MM-DD");
					  var newEvent = {};
            newEvent.title = scope.event_title;
            if(scope.start_time===""){
              newEvent.start = _eDate;
              newEvent.end = _eDate;
              newEvent.allDay = true;
            }else{
              newEvent.start = _eDate+"T"+moment(scope.start_time).format("HH:MM:SS");
              newEvent.end = _eDate+"T"+moment(scope.end_time).format("HH:MM:SS");
              newEvent.allDay = false;
            }
            newEvent.backgroundColor = scope.event_color;
          	angular.element("#calendar").fullCalendar('renderEvent',newEvent);
  					$("#eventCreate").modal().hide();
  					scope.resetVariables();
					}
      };
      scope.resetVariables();
    }
  }
})