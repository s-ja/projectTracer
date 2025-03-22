const fs = require("fs");
const path = require("path");

/**
 * 데이터를 JSON 파일로 저장
 * @param {Object} data - 저장할 데이터
 * @param {string} filename - 파일 이름
 * @param {string} outputDir - 출력 디렉토리
 */
function saveAsJSON(data, filename, outputDir = "./output") {
  // 출력 디렉토리가 없으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`JSON 파일이 저장되었습니다: ${filePath}`);
}

/**
 * 데이터를 CSV 파일로 저장
 * @param {Array} data - 저장할 데이터 배열
 * @param {string} filename - 파일 이름
 * @param {string} outputDir - 출력 디렉토리
 */
function saveAsCSV(data, filename, outputDir = "./output") {
  if (!data || data.length === 0) {
    console.error("CSV로 저장할 데이터가 없습니다.");
    return;
  }

  // 출력 디렉토리가 없으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${filename}.csv`);

  // 헤더 생성
  const headers = Object.keys(data[0]);

  // CSV 내용 생성
  const csvContent = [
    headers.join(","),
    ...data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          // 객체나 배열을 문자열로 변환하고 CSV 이스케이프 처리
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // 문자열에 쉼표, 큰따옴표, 줄바꿈이 있는 경우 이스케이프
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          // undefined나 null은 빈 문자열로 처리
          if (value === undefined || value === null) {
            return "";
          }
          return value;
        })
        .join(",");
    }),
  ].join("\n");

  fs.writeFileSync(filePath, csvContent, "utf8");
  console.log(`CSV 파일이 저장되었습니다: ${filePath}`);
}

/**
 * 포트폴리오용 마크다운 파일 생성
 * @param {Object} data - 포트폴리오 데이터
 * @param {Object} projectInfo - 프로젝트 기본 정보
 * @param {string} filename - 파일 이름
 * @param {string} outputDir - 출력 디렉토리
 */
function generatePortfolioMarkdown(
  data,
  projectInfo,
  filename = "portfolio",
  outputDir = "./output"
) {
  const { summary, significant_contributions } = data;
  const { repo_owner, repo_name, user_name } = projectInfo;

  // 출력 디렉토리가 없으면 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${filename}.md`);

  // 마크다운 내용 생성
  const markdown = `# ${repo_name} 프로젝트 기여 내역

## 프로젝트 개요
- **저장소**: [${repo_owner}/${repo_name}](https://github.com/${repo_owner}/${repo_name})
- **기여자**: [${user_name}](https://github.com/${user_name})
- **참여 기간**: ${summary.project_duration.start_date} ~ ${
    summary.project_duration.end_date
  } (${summary.project_duration.duration_days}일)

## 기여 통계
- **이슈 생성**: ${summary.contribution_stats.total_issues}개
- **PR 생성**: ${summary.contribution_stats.total_prs}개
- **커밋**: ${summary.contribution_stats.total_commits}개
- **코드 변경**: +${summary.contribution_stats.lines_added}줄, -${
    summary.contribution_stats.lines_deleted
  }줄

## 작업 유형 분석
- 기능 개발: ${summary.work_breakdown.features}건
- 버그 수정: ${summary.work_breakdown.bug_fixes}건
- 리팩토링: ${summary.work_breakdown.refactoring}건
- 테스트: ${summary.work_breakdown.testing}건
- 문서화: ${summary.work_breakdown.documentation}건
- 기타: ${summary.work_breakdown.other}건

## 주요 기여
${significant_contributions.top_prs
  .map(
    (pr) => `
### [#${pr.number}: ${pr.title}](${pr.url})
- 변경 사항: ${pr.changes}줄
`
  )
  .join("")}

## 프로젝트 역량 및 성과
- 프로젝트 기간 동안 적극적인 이슈 관리 및 PR 생성을 통해 팀 내 개발 진행 상황을 효과적으로 추적
- 코드 리뷰 및 피드백을 통한 코드 품질 향상에 기여
- 프로젝트 문서화 및 지식 공유를 통한 팀 생산성 향상

*이 문서는 GitHub API를 통해 자동으로 생성되었습니다.*
`;

  fs.writeFileSync(filePath, markdown, "utf8");
  console.log(`마크다운 파일이 저장되었습니다: ${filePath}`);
}

module.exports = {
  saveAsJSON,
  saveAsCSV,
  generatePortfolioMarkdown,
};
