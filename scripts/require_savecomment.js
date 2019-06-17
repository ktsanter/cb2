define(function (require) {
  require('savecomment');
  require('create_element');
  require('markdowntohtml');
  
  document.addEventListener('DOMContentLoaded', app.init());
});