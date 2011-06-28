# Installation

Install node.

Install npm.

<pre>
$ git clone repo
$ cd node.couchapp.js
$ npm link .
</pre>

<pre>
$ couchapp help
couchapp -- utility for creating couchapps

Usage:
  couchapp &lt;command> app.js http://localhost:5984/dbname

Commands:
  push : Push app once to server.
  sync : Push app then watch local files for changes.
</pre>

app.js example:

<pre>
  var couchapp = require('couchapp')
    , path = require('path');

  ddoc = {
      _id: '_design/app'
    , views: {}
    , lists: {}
    , shows: {} 
  }

  module.exports = ddoc;

  ddoc.views.byType = {
    map: function(doc) {
      emit(doc.type, null);
    },
    reduce: '_count'
  }

  ddoc.views.peopleByName = {
    map: function(doc) {
      if(doc.type == 'person') {
        emit(doc.name, null);
      }
    }
  }

  ddoc.lists.people = function(head, req) {
    start({
      headers: {"Content-type": "text/html"}
    });
    send("&lt;ul id='people'>\n");
    while(row = getRow()) {
      doc = row.doc;
      send("\t&lt;li class='person name'>" + doc.name + "&lt;/li>\n");
    }
    send("&lt;/li>\n")
  }

  ddoc.shows.person = function(doc, req) {
    return {
      headers: {"Content-type": "text/html"},
      body: "&lt;h1 id='person' class='name'>" + doc.name + "&lt;/h1>\n"
    }
  }

  couchapp.loadAttachments(ddoc, path.join(__dirname, '_attachments'));
</pre>

If you use features present in spidermonkey and absent from v8, such
as E4X, do the following in app.js:

      var couchapp = require('couchapp')
    
      ddoc = {
        _id: '_design/app',
        __source: 'ddoc.js'
      }
    
      module.exports = ddoc;

Create a file ddoc.js at the same level as app.js:

    var ddoc = { // important: must be called 'ddoc'
      lists: {
        all: function(head, req) {
          provides('html', function() {
            var message = 'Hello, world!';
            var page = <html xmlns="http://www.w3.org/1999/xhtml">
              <head/>
              <body>{message}</body>
              </html>;
            send('<!DOCTYPE html>');
            send(view);
          });
        }
      }
    }
    
And ddoc.js will be parsed by spidermonkey. The 'couchjs' binary must
be installed and available in $PATH.
