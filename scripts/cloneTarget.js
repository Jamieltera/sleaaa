const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const os = require("os");
const crypto = require("crypto");
const ethereumjs = require("ethereumjs-util"); // You'll need ethereumjs for the original function
const chalk = require("chalk");
const Logger = console; // Assuming Logger is a custom logging class

// Function to generate a vanity wallet
function generateVanityWallet({ prefix, suffix, isChecksum, isContract }) {
  const getRandomWallet = function () {
    const randbytes = crypto.randomBytes(32);
    const address =
      "0x" + ethereumjs.privateToAddress(randbytes).toString("hex");
    return { address: address, privKey: randbytes.toString("hex") };
  };

  const getDeterministicContractAddress = function (address) {
    return (
      "0x" +
      ethereumjs
        .keccak256(ethereumjs.rlp.encode([address, 0]))
        .slice(12)
        .toString("hex")
    );
  };

  const isValidVanityWallet = function (wallet) {
    let _add = wallet.address;

    if (isContract) {
      let _contractAdd = getDeterministicContractAddress(_add);
      _contractAdd = isChecksum
        ? ethereumjs.toChecksumAddress(_contractAdd)
        : _contractAdd;
      return _contractAdd.startsWith(prefix) && _contractAdd.endsWith(suffix);
    }

    _add = isChecksum ? ethereumjs.toChecksumAddress(_add) : _add;
    return _add.substr(2, prefix.length) === prefix && _add.endsWith(suffix);
  };

  let wallet = getRandomWallet();
  while (!isValidVanityWallet(wallet)) {
    wallet = getRandomWallet();
  }

  return wallet;
}

if (isMainThread) {
  async function cloneTarget(address, prefixLength, suffixLength) {
    Logger.log(
      `Cloning target for address ${address} with prefixLength ${prefixLength} and suffixLength ${suffixLength}.`
    );

    const prefix = address.substr(2, prefixLength);
    const suffix = address.substr(-suffixLength);

    const totalLength = parseInt(prefixLength) + parseInt(suffixLength);
    if (totalLength > address.length) {
      throw new Error(
        "Combined prefix and suffix length exceeds the target address length."
      );
    }

    const cpuCount = os.cpus().length;
    Logger.log(`Using ${cpuCount} CPUs for parallel processing.`);

    const promises = [];

    // Create workers and start searching for a vanity address in parallel
    for (let i = 0; i < cpuCount * 2; i++) {
      // Increasing the number of workers
      promises.push(
        new Promise((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: {
              prefix,
              suffix,
              isChecksum: false,
              isContract: false,
            },
          });

          worker.on("message", (wallet) => {
            worker.terminate();
            resolve(wallet); // Resolve as soon as one worker finds a valid wallet
          });

          worker.on("error", (err) => reject(err));

          worker.on("exit", (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
      );
    }

    const startTime = process.hrtime.bigint();
    const vanityWallet = await Promise.race(promises); // Stop when one worker finds the address
    const endTime = process.hrtime.bigint();
    const durationInMilliseconds = Number(endTime - startTime) / 1e6; // convert to ms

    Logger.log(`Target Address: ${chalk.magenta(address)}`);
    Logger.log(`Vanity Wallet Found: ${chalk.blue(vanityWallet.address)}`);
    Logger.log(`Private Key: ${chalk.blue(vanityWallet.privKey)}`);
    Logger.log(
      `Time taken: ${chalk.cyanBright(
        durationInMilliseconds.toFixed(2) + " ms"
      )}`
    );
    Logger.log(`${chalk.gray("-----------------------------------")}`);

    return vanityWallet;
  }

  module.exports = { cloneTarget }; // Export the function for testing or other use
} else {
  // Worker thread logic
  const { prefix, suffix, isChecksum, isContract } = workerData;

  const wallet = generateVanityWallet({
    prefix,
    suffix,
    isChecksum,
    isContract,
  });
  parentPort.postMessage(wallet); // Send the generated wallet back to the main thread
}
