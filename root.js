const axios = require("axios");
const cheerio = require("cheerio");
const urlBuilder = page =>
  `http://opac.nlai.ir/opac-prod/search/bibliographicSimpleSearchProcess.do?simpleSearch.value=%D8%B1%D9%85%D8%A7%D9%86&bibliographicLimitQueryBuilder.biblioDocType=&command=I&simpleSearch.tokenized=true&classType=0&pageStatus=0&bibliographicLimitQueryBuilder.useDateRange=null&bibliographicLimitQueryBuilder.year=&documentType=&pageSize=50&pageNumber=${page}`;
const { dbWorker } = require("./dbWorker");

async function fetchData(url) {
  console.log("Crawling data...");
  let response = await axios(url).catch(err => console.log(err));

  if (response.status !== 200) {
    console.log("Error occurred while fetching data");
    return;
  }
  return response;
}

const mainFunc = async pageNumber => {
  const url = urlBuilder(pageNumber);
  console.log("start fetching page ", pageNumber);
  let res = await fetchData(url);
  if (!res.data) {
    console.log("Invalid data Obj");
    return;
  }
  const html = res.data;
  let dataArr = [];
  const $ = cheerio.load(html);

  const statsTable = $("#table > tbody > tr");
  statsTable.each(function() {
    let title = $(this)
      .find("td")
      .text();
    let newStr = title
      .split("\n")
      .map(item => item.trim())
      .filter(item => !!item);
    formatStr(newStr, dataArr);
  });

  return dataArr;
};

const crawler = async () => {
  for (let page = 26; page <= 222; page++) {
    const data = await mainFunc(page);
    console.log("Fetching Done.");
    dbWorker(data);

    await timer(10000);
  }
};

const timer = time => {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve();
    }, time);
  });
};

function formatStr(arr, dataArr) {
  const [name, publisher, year = ""] = arr;
  let formattedYear = "";
  for (let char of year) {
    if (["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"].includes(char)) {
      formattedYear += char;
    }
  }

  dataArr.push([name, publisher, formattedYear]);
}

crawler();
