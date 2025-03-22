require("dotenv").config();
const { fetchGitHubData } = require("./api");
const { formatData } = require("./formatters");
const { exportToJSON, exportToCSV } = require("./exporters");

async function main() {
  try {
    // GitHub API에서 데이터 가져오기
    const data = await fetchGitHubData();

    // 데이터 포맷팅
    const formattedData = formatData(data);

    // 데이터 내보내기
    await exportToJSON(formattedData, "output.json");
    await exportToCSV(formattedData, "output.csv");

    console.log("데이터 처리가 완료되었습니다.");
  } catch (error) {
    console.error("오류가 발생했습니다:", error.message);
  }
}

main();
