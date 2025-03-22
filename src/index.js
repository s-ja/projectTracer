#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
require("dotenv").config();

const api = require("./api");
const formatters = require("./formatters");
const exporters = require("./exporters");

// 환경변수에서 기본값 가져오기
const DEFAULT_OWNER = process.env.REPO_OWNER || "";
const DEFAULT_REPO = process.env.REPO_NAME || "";
const DEFAULT_USER = process.env.USER_TO_TRACK || "";
const DEFAULT_OUTPUT_DIR = process.env.OUTPUT_DIR || "./output";
const DEFAULT_OUTPUT_FORMAT = process.env.OUTPUT_FORMAT || "json";

// CLI 설정
program
  .name("github-data-explorer")
  .description("GitHub 프로젝트 데이터 추출 및 분석 도구")
  .version("1.0.0");

program
  .option("-o, --owner <owner>", "저장소 소유자/조직명", DEFAULT_OWNER)
  .option("-r, --repo <repo>", "저장소 이름", DEFAULT_REPO)
  .option("-u, --user <username>", "추적할 사용자명", DEFAULT_USER)
  .option(
    "-f, --format <format>",
    "출력 형식 (json, csv, markdown)",
    DEFAULT_OUTPUT_FORMAT
  )
  .option("-d, --dir <directory>", "출력 디렉토리", DEFAULT_OUTPUT_DIR)
  .option("--issues", "이슈 데이터 가져오기", false)
  .option("--prs", "PR 데이터 가져오기", false)
  .option("--commits", "커밋 데이터 가져오기", false)
  .option("--stats", "기여자 통계 가져오기", false)
  .option("--all", "모든 데이터 가져오기", false)
  .option("--portfolio", "포트폴리오용 데이터 생성", false);

program.parse();

const options = program.opts();

// 필수 인자 검증
if (!options.owner || !options.repo || !options.user) {
  console.error(
    "오류: 저장소 소유자(-o), 저장소 이름(-r), 사용자명(-u)은 필수입니다."
  );
  program.help();
  process.exit(1);
}

// all 옵션이 있으면 모든 데이터 가져오기 활성화
if (options.all) {
  options.issues = true;
  options.prs = true;
  options.commits = true;
  options.stats = true;
}

// 어떤 데이터도 선택되지 않았으면 기본적으로 모두 가져오기
if (
  !options.issues &&
  !options.prs &&
  !options.commits &&
  !options.stats &&
  !options.portfolio
) {
  options.all = true;
  options.issues = true;
  options.prs = true;
  options.commits = true;
  options.stats = true;
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("GitHub 데이터 추출 시작...");
  console.log(`저장소: ${options.owner}/${options.repo}`);
  console.log(`사용자: ${options.user}`);

  const data = {};

  try {
    // 이슈 데이터 가져오기
    if (options.issues) {
      console.log("이슈 데이터 가져오는 중...");
      const issues = await api.fetchUserIssues(
        options.owner,
        options.repo,
        options.user
      );
      data.issues = formatters.formatIssues(issues);
      console.log(`이슈 ${data.issues.length}개를 가져왔습니다.`);

      // 출력 포맷에 따라 저장
      if (options.format === "json") {
        exporters.saveAsJSON(data.issues, "issues", options.dir);
      } else if (options.format === "csv") {
        exporters.saveAsCSV(data.issues, "issues", options.dir);
      }
    }

    // PR 데이터 가져오기
    if (options.prs) {
      console.log("PR 데이터 가져오는 중...");
      const prs = await api.fetchUserPRs(
        options.owner,
        options.repo,
        options.user
      );
      data.prs = formatters.formatPRs(prs);
      console.log(`PR ${data.prs.length}개를 가져왔습니다.`);

      // 출력 포맷에 따라 저장
      if (options.format === "json") {
        exporters.saveAsJSON(data.prs, "pull_requests", options.dir);
      } else if (options.format === "csv") {
        exporters.saveAsCSV(data.prs, "pull_requests", options.dir);
      }
    }

    // 커밋 데이터 가져오기
    if (options.commits) {
      console.log("커밋 데이터 가져오는 중...");
      const commits = await api.fetchUserCommits(
        options.owner,
        options.repo,
        options.user
      );
      data.commits = formatters.formatCommits(commits);
      console.log(`커밋 ${data.commits.length}개를 가져왔습니다.`);

      // 출력 포맷에 따라 저장
      if (options.format === "json") {
        exporters.saveAsJSON(data.commits, "commits", options.dir);
      } else if (options.format === "csv") {
        exporters.saveAsCSV(data.commits, "commits", options.dir);
      }
    }

    // 기여자 통계 가져오기
    if (options.stats) {
      console.log("기여자 통계 가져오는 중...");
      try {
        const stats = await api.fetchContributorStats(
          options.owner,
          options.repo
        );

        if (stats && Array.isArray(stats)) {
          data.contributorStats = formatters.formatContributorStats(
            stats,
            options.user
          );
          console.log("기여자 통계를 가져왔습니다.");

          // 출력 포맷에 따라 저장
          if (options.format === "json" && data.contributorStats) {
            exporters.saveAsJSON(
              data.contributorStats,
              "contributor_stats",
              options.dir
            );
          } else if (
            options.format === "csv" &&
            data.contributorStats &&
            data.contributorStats.weekly_contributions
          ) {
            exporters.saveAsCSV(
              data.contributorStats.weekly_contributions,
              "contributor_stats",
              options.dir
            );
          }
        } else {
          console.warn(
            "기여자 통계를 가져올 수 없습니다. API 응답이 예상과 다릅니다."
          );
        }
      } catch (error) {
        console.error("기여자 통계 가져오기 실패:", error.message);
        // 전체 프로그램은 계속 실행
      }
    }

    // 포트폴리오 데이터 생성
    if (options.portfolio) {
      console.log("포트폴리오 데이터 생성 중...");
      const portfolioData = formatters.createPortfolioSummary(data);
      exporters.saveAsJSON(portfolioData, "portfolio_data", options.dir);
      exporters.generatePortfolioMarkdown(
        portfolioData,
        {
          repo_owner: options.owner,
          repo_name: options.repo,
          user_name: options.user,
        },
        "portfolio",
        options.dir
      );
      console.log("포트폴리오 데이터가 생성되었습니다.");
    }

    console.log("모든 작업이 완료되었습니다.");
  } catch (error) {
    console.error("오류가 발생했습니다:", error.message);
    process.exit(1);
  }
}

main();
