$(document).ready(function () {
  updateMonthTitle();
});

function updateMonthTitle() {
  const now = new Date();
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  $("#month-title").text(`${currentMonth} ${currentYear} NEWS`);
}
