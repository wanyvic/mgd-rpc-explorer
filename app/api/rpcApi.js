var debug = require('debug');

var debugLog = debug("btcexp:rpc");

var hexEnc = require("crypto-js/enc-hex");
var sha256 = require("crypto-js/sha256");
var async = require("async");

var utils = require("../utils.js");
var config = require("../config.js");
var coins = require("../coins.js");

var activeQueueTasks = 0;

var rpcQueue = async.queue(function(task, callback) {
	activeQueueTasks++;
	//debugLog("activeQueueTasks: " + activeQueueTasks);

	task.rpcCall(function() {
		callback();

		activeQueueTasks--;
		//debugLog("activeQueueTasks: " + activeQueueTasks);
	});

}, config.rpcConcurrency);



function getBlockchainInfo() {
	return getRpcData("getblockchaininfo");
}

function getNetworkInfo() {
	return getRpcData("getnetworkinfo");
}

function getNetTotals() {
	return getRpcData("getnettotals");
}

function getMempoolInfo() {
	return getRpcData("getmempoolinfo");
}

function getMiningInfo() {
	return getRpcData("getmininginfo");
}

function getUptimeSeconds() {
	return getRpcData("uptime");
}

function getPeerInfo() {
	return getRpcData("getpeerinfo");
}

function getRawMempool() {
	return getRpcDataWithParams({method:"getrawmempool", parameters:[true]});
}

function getChainTxStats(blockCount) {
	return getRpcDataWithParams({method:"getchaintxstats", parameters:[blockCount]});
}

function getBlockByHeight(blockHeight) {
	return new Promise(function(resolve, reject) {
		getRpcDataWithParams({method:"getblockhash", parameters:[blockHeight]}).then(function(blockhash) {
			getBlockByHash(blockhash).then(function(block) {
				resolve(block);

			}).catch(function(err) {
				reject(err);
			});
		}).catch(function(err) {
			reject(err);
		});
	});
}

function getBlockByHash(blockHash) {
	debugLog("getBlockByHash: %s", blockHash);

	return new Promise(function(resolve, reject) {
		getRpcDataWithParams({method:"getblock", parameters:[blockHash]}).then(function(block) {
			getRawTransaction(block.tx[0]).then(function(tx) {
				block.coinbaseTx = tx;
				block.totalFees = utils.getBlockTotalFeesFromCoinbaseTxAndBlockHeight(tx, block.height);
				block.miner = utils.getMinerFromCoinbaseTx(tx);

				resolve(block);

			}).catch(function(err) {
				reject(err);
			});
		}).catch(function(err) {
			reject(err);
		});
	});
}

function getAddress(address) {
	return getRpcDataWithParams({method:"validateaddress", parameters:[address]});
}

function getRawTransaction(txid) {
	debugLog("getRawTransaction: %s", txid);

	return new Promise(function(resolve, reject) {
		if (coins[config.coin].genesisCoinbaseTransactionId && txid == coins[config.coin].genesisCoinbaseTransactionId) {
			// copy the "confirmations" field from genesis block to the genesis-coinbase tx
			getBlockchainInfo().then(function(blockchainInfoResult) {
				var result = coins[config.coin].genesisCoinbaseTransaction;
				result.confirmations = blockchainInfoResult.blocks;

				resolve(result);

			}).catch(function(err) {
				reject(err);
			});

		} else {
			getRpcDataWithParams({method:"getrawtransaction", parameters:[txid, 1]}).then(function(result) {
				if (result == null || result.code && result.code < 0) {
					reject(result);

					return;
				}
				result.vsize = result.size;
				resolve(result);

			}).catch(function(err) {
				reject(err);
			});
		}
	});
}

function getHelp() {
	return getRpcData("help");
}

function getRpcMethodHelp(methodName) {
	return getRpcDataWithParams({method:"help", parameters:[methodName]});
}



function getRpcData(cmd) {
	return new Promise(function(resolve, reject) {
		debugLog(`RPC: ${cmd}`);

		rpcCall = function(callback) {
			client.command(cmd, function(err, result, resHeaders) {
				if (err) {
					utils.logError("32euofeege", err, {cmd:cmd});

					reject(err);

					callback();

					return;
				}

				resolve(result);

				callback();
			});
		};
		
		rpcQueue.push({rpcCall:rpcCall});
	});
}

function getRpcDataWithParams(request) {
	return new Promise(function(resolve, reject) {
		debugLog(`RPC: ${JSON.stringify(request)}`);

		rpcCall = function(callback) {
			client.command([request], function(err, result, resHeaders) {
				if (err != null) {
					utils.logError("38eh39hdee", err, {result:result, headers:resHeaders});

					reject(err);

					callback();

					return;
				}

				resolve(result[0]);

				callback();
			});
		};
		
		rpcQueue.push({rpcCall:rpcCall});
	});
}


function getAddressDetails(address, scriptPubkey, sort, limit, offset) {
	return new Promise(function(resolve, reject) {
		
		var promises = [];

		var txidData = null;
		var balanceData = null;
		promises.push(new Promise(function(resolve, reject) {
			getAddressTxids(address).then(function(result) {
				if(result)
					txidData = result;
				resolve();

			}).catch(function(err) {
				utils.logError("2397wgs0sgse", err);

				reject(err);
			});
		}));

		promises.push(new Promise(function(resolve, reject) {
			getAddressBalance(address).then(function(result) {
				if(result)
					balanceData = result;
				resolve();
				
			}).catch(function(err) {
				utils.logError("21307ws70sg", err);

				reject(err);
			});
		}));

		Promise.all(promises.map(utils.reflectPromise)).then(function(results) {
			var addressDetails = {};
			if (txidData) {
				addressDetails.txCount = txidData.length;

				addressDetails.txids = [];
				addressDetails.blockHeightsByTxid = {};

				if (sort == "desc") {
					txidData.reverse();
				}

				for (var i = offset; i < Math.min(txidData.length, limit + offset); i++) {
					addressDetails.txids.push(txidData[i]);
					// addressDetails.blockHeightsByTxid[txidData[i].tx_hash] = txidData[i].height;
				}
			}

			if (balanceData) {
				addressDetails.balanceSat = balanceData.balance;
			}

			var errors = [];
			results.forEach(function(x) {
				if (x.status == "rejected") {
					errors.push(x);
				}
 			});

			debugLog(addressDetails)
			resolve({addressDetails:addressDetails, errors:errors});
		});
	});
}

function getAddressTxids(address) {

	debugLog(`getAddressTxids=${utils.ellipsize(JSON.stringify(address), 200)}`);
	return new Promise(function(resolve, reject) {
		var arg = {"addresses": [address]};
		getRpcDataWithParams({method:"getaddresstxids", parameters:[arg]}).then(function(results) {
			if (address == coinConfig.genesisCoinbaseOutputAddress) {
				for (var i = 0; i < results.length; i++) {
					results[i].result.unshift({tx_hash:coinConfig.genesisCoinbaseTransactionId, height:0});
				}
			}

			resolve(results);
		}).catch(function(err) {
			reject(err);
		});
	});
}

function getAddressBalance(address) {

	debugLog(`getAddressBalance=${JSON.stringify(address)}`);
	return new Promise(function(resolve, reject) {
		var arg = {"addresses": [address]};
		getRpcDataWithParams({method:"getaddressbalance", parameters:[arg]}).then(function(results) {
			if (address == coinConfig.genesisCoinbaseOutputAddress) {
				for (var i = 0; i < results.length; i++) {
					var coinbaseBlockReward = coinConfig.blockRewardFunction(0);
					
					results[i].result.confirmed += (coinbaseBlockReward * coinConfig.baseCurrencyUnit.multiplier);
				}
			}
			resolve(results);
		}).catch(function(err) {
			reject(err);
		});
	});
}
module.exports = {
	getBlockchainInfo: getBlockchainInfo,
	getNetworkInfo: getNetworkInfo,
	getNetTotals: getNetTotals,
	getMempoolInfo: getMempoolInfo,
	getMiningInfo: getMiningInfo,
	getBlockByHeight: getBlockByHeight,
	getBlockByHash: getBlockByHash,
	getRawTransaction: getRawTransaction,
	getRawMempool: getRawMempool,
	getUptimeSeconds: getUptimeSeconds,
	getHelp: getHelp,
	getRpcMethodHelp: getRpcMethodHelp,
	getAddress: getAddress,
	getPeerInfo: getPeerInfo,
	getChainTxStats: getChainTxStats,
	getAddressDetails:getAddressDetails
};