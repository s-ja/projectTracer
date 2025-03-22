const fs = require("fs").promises;
const { Parser } = require("json2csv");

async function exportToJSON(data, filename) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`JSON 파일이 생성되었습니다: ${filename}`);
  } catch (error) {
    throw new Error(`JSON 파일 생성 중 오류 발생: ${error.message}`);
  }
}

async function exportToCSV(data, filename) {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    await fs.writeFile(filename, csv);
    console.log(`CSV 파일이 생성되었습니다: ${filename}`);
  } catch (error) {
    throw new Error(`CSV 파일 생성 중 오류 발생: ${error.message}`);
  }
}

module.exports = {
  exportToJSON,
  exportToCSV,
};
