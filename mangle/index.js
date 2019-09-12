const path = require("path");
const fs = require("fs");
const axios = require("axios");
const mangleJson = require("./mangle.json");

function getMangleContent(preactMangle) {
  preactMangle.props.props = Object.assign({}, preactMangle.props.props, mangleJson.props.props);

  return JSON.stringify(preactMangle, null, 2);
}

axios
  .get("https://raw.githubusercontent.com/preactjs/preact/master/mangle.json")
  .then(function(response) {
    fs.writeFile(path.resolve(__dirname, "../mangle.json"), getMangleContent(response.data), function(err) {
      if (err) {
        process.exit(1);
      }

      process.exit(0);
    });
  })
  .catch(function(err) {
    console.error(err);
    process.exit(1);
  });

process.stdin.resume();
