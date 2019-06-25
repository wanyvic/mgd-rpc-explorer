var btc = require("./coins/btc.js");
var ltc = require("./coins/ltc.js");
var mgd = require("./coins/mgd.js");

module.exports = {
	"BTC": btc,
	"LTC": ltc,
	"MGD": mgd,

	"coins":["BTC", "LTC", "MGD"]
};