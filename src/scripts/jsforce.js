var jsforce = require('jsforce');
var conn = new jsforce.Connection();
conn.login('bsteele@arcbtech.devdata', 'C@thySt33l3!2022WwANufl28GzqILHP90t5AjcE', function(err, res) {
  if (err) { return console.error(err); }
  conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    console.log(res);
  });
});