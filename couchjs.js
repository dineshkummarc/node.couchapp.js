var spawn = require('child_process').spawn;
var fs = require('fs');

// Feed couchjs a javascript source representing a design doc and a
// function to turn it into a JSON object
// (couchjs_jsSourceToDesignDoc()). The name of the variable
// referencing the design doc must be specified.
//
// Example:
//
// ddoc.js:
//
//   var ddoc = { views: {}, lists: {}, shows: {}}
//
// Call to stringify it (assuming it's been read into string named
// 'source'):
//
//   node_jsToDesignDoc(source, 'ddoc', function(err, ddoc) {
//     console.dir(ddoc);
//   })

function node_jsSourceToDesignDoc(source, objectName, callback) {
    var couchjs = spawn('couchjs', ['-']);
    var output = '';
    var error = '';

    couchjs.stdout.on('data', function(data) {
        output += data;
    });

    couchjs.stderr.on('data', function(data) {
        // current couchjs always reports this error, ignore it
        if('Unable to destroy invalid CouchHTTP instance.' == data.toString().replace(/^\s*|\s*$/g, ''))
            return;

        error += data;
    });

    couchjs.on('exit', function(code) {
        if(error)
            callback(error);
        else
            callback(null, JSON.parse(output));
    });

    couchjs.stdin.write(source);
    couchjs.stdin.write('\n\n' + couchjs_jsSourceToDesignDoc.toString() + '\n\n');
    couchjs.stdin.write('print(JSON.stringify(couchjs_jsSourceToDesignDoc(' + objectName + ')));');
    couchjs.stdin.end();
}

// This gets serialized and evaluated in couchjs.

function couchjs_jsSourceToDesignDoc(val) {
    switch(typeof(val)) {
    case 'object':
        var obj;
        if('length' in val) {
            obj = [];
            for(var i=0,l=val.length; i<l; i++)
                obj[i] = arguments.callee(val[i]);
        } else {
            obj = {};
            for(var n in val)
                if(n[0] != '_')
                    obj[n] = arguments.callee(val[n]);
        }
        return obj;
        break;
    case 'xml':
        return val.toXMLString();
        break;
    default:
        return val.toString();
    }
}


module.exports.jsSourceToDesignDoc = node_jsSourceToDesignDoc;
