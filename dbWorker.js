const fs = require("fs");

const writeOnFile = data =>
  fs.appendFile("data.csv", data, function(err) {
    if (err) throw err;
    console.log("Write Successfully.");
  });

const formatArrayToWrite = dataArray => {
  let string = "";
  for (let item of dataArray) {
    string += `${item[0]},${item[1]},${item[2]}\n`;
  }
  return string;
};

const dbWorker = data => {
  const writeString = formatArrayToWrite(data);
  writeOnFile(writeString);
};

module.exports = { dbWorker };
