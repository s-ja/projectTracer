const fs = require("fs").promises;
const path = require("path");

/**
 * 데이터를 JSON 파일로 저장
 * @param {Object} data - 저장할 데이터
 * @param {string} filename - 파일 이름
 * @param {string} outputDir - 출력 디렉토리
 */
async function saveAsJSON(data, filename, outputDir = "./output") {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`JSON 파일이 저장되었습니다: ${filePath}`);
  } catch (error) {
    console.error("JSON 파일 저장 실패:", error.message);
  }
}

/**
 * 데이터를 CSV 파일로 저장
 * @param {Array} data - 저장할 데이터 배열
 * @param {string} filename - 파일 이름
 * @param {string} outputDir - 출력 디렉토리
 */
async function saveAsCSV(data, filename, outputDir = "./output") {
  if (!Array.isArray(data)) {
    console.error("CSV로 저장할 데이터가 배열이 아닙니다.");
    return;
  }

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${filename}.csv`);

    // 헤더 추출
    const headers = Object.keys(data[0] || {});

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const cell = row[header];
            return typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : cell;
          })
          .join(",")
      ),
    ].join("\n");

    await fs.writeFile(filePath, csvContent);
    console.log(`CSV 파일이 저장되었습니다: ${filePath}`);
  } catch (error) {
    console.error("CSV 파일 저장 실패:", error.message);
  }
}

/**
 * 포트폴리오용 마크다운 파일 생성
 * @param {Object} data - 포트폴리오 데이터
 * @param {string} outputDir - 출력 디렉토리
 */
async function generatePortfolioMarkdown(data, outputDir = "./output") {
  try {
    const { issues, pull_requests, commits, contributor_stats } = data;

    const markdown = `# GitHub 프로젝트 포트폴리오

## 프로젝트 기여 통계

### 이슈 관리
- 총 이슈: ${issues.total}개
- 열린 이슈: ${issues.open}개
- 닫힌 이슈: ${issues.closed}개

### Pull Request 활동
- 총 PR: ${pull_requests.total}개
- 열린 PR: ${pull_requests.open}개
- 닫힌 PR: ${pull_requests.closed}개
- 병합된 PR: ${pull_requests.merged}개

### 커밋 활동
- 총 커밋: ${commits.total}개

${
  contributor_stats
    ? `
### 기여자 통계
- 총 커밋: ${contributor_stats.total_commits}개
- 코드 추가: ${
        contributor_stats.weekly_contributions?.reduce(
          (sum, week) => sum + week.additions,
          0
        ) || 0
      } 줄
- 코드 삭제: ${
        contributor_stats.weekly_contributions?.reduce(
          (sum, week) => sum + week.deletions,
          0
        ) || 0
      } 줄
`
    : ""
}

## 주요 기여 내용

1. 이슈 및 PR 관리
   - 이슈 생성 및 관리를 통한 프로젝트 진행 상황 추적
   - PR을 통한 코드 리뷰 및 품질 관리 참여

2. 코드 기여
   - 기능 개발 및 버그 수정
   - 코드 품질 개선 및 리팩토링

3. 프로젝트 관리
   - 문서화 작업
   - 코드 리뷰 참여
`;

    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, "portfolio.md");
    await fs.writeFile(filePath, markdown);
    console.log(`포트폴리오 마크다운이 생성되었습니다: ${filePath}`);
  } catch (error) {
    console.error("포트폴리오 마크다운 생성 실패:", error.message);
  }
}

module.exports = {
  saveAsJSON,
  saveAsCSV,
  generatePortfolioMarkdown,
};
