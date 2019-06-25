var Decimal = require("decimal.js");
Decimal8 = Decimal.clone({ precision:8, rounding:8 });

var currencyUnits = [
	{
		type:"native",
		name:"MGD",
		multiplier:1,
		default:true,
		values:["", "btc", "MGD"],
		decimalPlaces:8
	},
	{
		type:"native",
		name:"mMGD",
		multiplier:1000,
		values:["mbtc"],
		decimalPlaces:5
	},
	{
		type:"native",
		name:"μMGD",
		multiplier:1000000,
		values:["μMGD"],
		decimalPlaces:2
	},
	{
		type:"native",
		name:"sat",
		multiplier:100000000,
		values:["sat", "satoshi"],
		decimalPlaces:0
	},
	{
		type:"exchanged",
		name:"USD",
		multiplier:"usd",
		values:["usd"],
		decimalPlaces:2,
		symbol:"$"
	},
	{
		type:"exchanged",
		name:"EUR",
		multiplier:"eur",
		values:["eur"],
		decimalPlaces:2,
		symbol:"€"
	},
];

module.exports = {
	name:"MassGrid",
	ticker:"MGD",
	logoUrl:"/img/logo/mgd1.png",
	siteTitle:"MassGrid Explorer",
	siteDescriptionHtml:"<b>MGD Explorer</b> is <a href='https://github.com/wanyvic/mgd-rpc-explorer). If you run your own [MassGrid Full Node](https://MassGrid.com), **MGD Explorer** can easily run alongside it, communicating via RPC calls. See the project [ReadMe](https://github.com/wanyvic/mgd-rpc-explorer) for a list of features and instructions for running.",
	nodeTitle:"MassGrid Full Node",
	nodeUrl:"https://bitcoin.org/en/full-node",
	demoSiteUrl: "https://btc.chaintools.io",
	miningPoolsConfigUrls:[
		// "https://raw.githubusercontent.com/btccom/Blockchain-Known-Pools/master/pools.json",
		// "https://raw.githubusercontent.com/blockchain/Blockchain-Known-Pools/master/pools.json"
	],
	maxBlockWeight: 4000000,
	targetBlockTimeSeconds: 600,
	currencyUnits:currencyUnits,
	currencyUnitsByName:{"MGD":currencyUnits[0], "mMGD":currencyUnits[1], "μMGD":currencyUnits[2], "sat":currencyUnits[3]},
	baseCurrencyUnit:currencyUnits[3],
	defaultCurrencyUnit:currencyUnits[0],
	feeSatoshiPerByteBucketMaxima: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 150],
	genesisBlockHash: "000006cda968d9b220b264050676efed86e2db52e29619ed3ef94fcf23cd86f4",
	genesisCoinbaseTransactionId: "010150a88cf516ade90a91f9198bc80eb59a110134c1f84abe75377165f82dc0",
	genesisCoinbaseTransaction: {
        "hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4004ffff001d0104384d4c47422063726561746520666972737420626c6f636b20696e205368656e7a68656e2c206f6e2032377468204a756c792e2c2032303137ffffffff0100f2052a0100000043410486661df18672bc959f622d09ad550f56154a4b3c812671ea601aff934324ed1cf8457b9015290d3c94fb6c140e92f3c1a59dddb07e49a12df41b2f2ea687b8e6ac00000000",
		"txid": "010150a88cf516ade90a91f9198bc80eb59a110134c1f84abe75377165f82dc0",
		"hash": "010150a88cf516ade90a91f9198bc80eb59a110134c1f84abe75377165f82dc0",
		"size": 191,
		"vsize": 191,
		"version": 1,
		"confirmations":175000,
		"vin": [
			{
				"coinbase": "04ffff001d0104384d4c47422063726561746520666972737420626c6f636b20696e205368656e7a68656e2c206f6e2032377468204a756c792e2c2032303137",
				"sequence": 4294967295
			}
		],
		"vout": [
			{
				"value": 50,
				"n": 0,
				"scriptPubKey": {
					"asm": "0486661df18672bc959f622d09ad550f56154a4b3c812671ea601aff934324ed1cf8457b9015290d3c94fb6c140e92f3c1a59dddb07e49a12df41b2f2ea687b8e6 OP_CHECKSIG",
					"hex": "410486661df18672bc959f622d09ad550f56154a4b3c812671ea601aff934324ed1cf8457b9015290d3c94fb6c140e92f3c1a59dddb07e49a12df41b2f2ea687b8e6ac",
					"reqSigs": 1,
					"type": "pubkey",
					"addresses": [
						"MNRfd5p2YLoQsyPPTYDS5VNXGDtStnTwdA"
					]
				}
			}
		],
		"blockhash": "000006cda968d9b220b264050676efed86e2db52e29619ed3ef94fcf23cd86f4",
		"time": 1507956294,
		"blocktime": 1507956294
	},
	historicalData: [
		{
			type: "blockheight",
			date: "2017-10-14",
			blockHeight: 0,
			blockHash: "000006cda968d9b220b264050676efed86e2db52e29619ed3ef94fcf23cd86f4",
			summary: "The MassGrid Genesis Block.",
			alertBodyHtml: "This is the first block in the MassGrid blockchain, known as the 'Genesis Block'. This block was mined by MassGrid's creator Satoshi Nakamoto. You can read more about <a href='https://en.bitcoin.it/wiki/Genesis_block'>the genesis block</a>.",
			referenceUrl: "https://en.bitcoin.it/wiki/Genesis_block"
		}
	],
	exchangeRateData:{
		jsonUrl:"https://api.coindesk.com/v1/bpi/currentprice.json",
		responseBodySelectorFunction:function(responseBody) {
			//console.log("Exchange Rate Response: " + JSON.stringify(responseBody));

			var exchangedCurrencies = ["USD", "GBP", "EUR"];

			if (responseBody.bpi) {
				var exchangeRates = {};

				for (var i = 0; i < exchangedCurrencies.length; i++) {
					if (responseBody.bpi[exchangedCurrencies[i]]) {
						exchangeRates[exchangedCurrencies[i].toLowerCase()] = responseBody.bpi[exchangedCurrencies[i]].rate_float;
					}
				}

				return exchangeRates;
			}
			
			return null;
		}
	},
	blockRewardFunction:function(blockHeight) {
		var eras = [ new Decimal8(50) ];
		for (var i = 1; i < 34; i++) {
			var previous = eras[i - 1];
			eras.push(new Decimal8(previous).dividedBy(2));
		}

		var index = Math.floor(blockHeight / 420768);

		return eras[index];
	}
};