import Vue from "vue";
import moment from "moment";

Vue.filter("calendarDate", function (value) {
  return moment(value).calendar(null, {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    lastWeek: 'dddd, DD MMMM',
    sameElse: 'L'
  });
});

Vue.filter("timeOnly", function (value) {
  return moment(value).format("HH:mm");
});