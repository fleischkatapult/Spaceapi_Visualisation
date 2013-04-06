var http = require('http');
var util = require('util');
var crypto = require('crypto');

var getOpts = {
	host : "localhost",
	port : 5984,
	method : "GET",
};

var putOpts = {
	host : "localhost",
	port : 5984,
	method : "PUT",
	headers : {
		"content-type" : "application/json",
	},
};

function update(obj, dbpath, cb) {
	if(obj["_id"] == null) {
		obj["_id"] = null;
		var hash = crypto.createHash('sha256');
		hash.update("" + JSON.stringify(obj));
		obj["_id"] = hash.digest('hex');
	}

	getOpts.path = dbpath + obj["_id"];
	http.get(getOpts, function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data = data + chunk;
		});
		res.on('end', function() {
			if(res.statusCode < 300) {
				obj["_rev"] = JSON.parse(data)["_rev"];
			}
			putOpts.path = dbpath + obj["_id"];
			var req = http.request(putOpts, cb);
			req.end(JSON.stringify(obj));
		});
	});
}

module.exports.update = update;
