document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  M.FormSelect.init(elems);
  var elems = document.querySelectorAll('.datepicker');
  M.Datepicker.init(elems);
});
