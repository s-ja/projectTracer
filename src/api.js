const axios = require("axios");
require("dotenv").config();

// API 기본 설정
const baseUrl = "https://api.github.com";
const token = process.env.GITHUB_TOKEN;

// axios 인스턴스 생성
const github = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  },
});

/**
 * 재시도 로직이 포함된 API 호출 함수
 * @param {string} url - API 엔드포인트
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} retryDelay - 재시도 간격 (밀리초)
 * @returns {Promise<any>} - API 응답 데이터
 */
async function fetchWithRetry(url, maxRetries = 3, retryDelay = 1000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await github.get(url);
      return response.data;
    } catch (error) {
      if (error.response) {
        // 202 상태코드는 GitHub가 데이터를 계산 중임을 의미
        if (error.response.status === 202) {
          console.log(`데이터 계산 중... ${retries + 1}/${maxRetries} 재시도`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retries++;
          continue;
        }

        // API 제한에 걸린 경우
        if (error.response.status === 403) {
          console.error(
            "API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      }

      if (retries === maxRetries - 1) {
        throw error;
      }

      retries++;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error(`최대 재시도 횟수(${maxRetries})에 도달했습니다.`);
}

/**
 * 페이지네이션을 처리하여 모든 결과를 가져오는 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} params - 요청 파라미터
 * @returns {Promise<Array>} - 모든 결과의 배열
 */
async function fetchAllPages(endpoint, params = {}) {
  let page = 1;
  let allResults = [];
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await github.get(endpoint, {
        params: { ...params, page, per_page: 100 },
      });

      const results = response.data;
      allResults = allResults.concat(results);

      // 결과가 없거나 마지막 페이지인 경우 종료
      if (results.length < 100) {
        hasMorePages = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`API 요청 오류 (${endpoint}):`, error.message);
      hasMorePages = false;
    }
  }

  return allResults;
}

/**
 * 사용자가 생성한 이슈 목록 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @param {string} username - 추적할 사용자명
 * @returns {Promise<Array>} - 이슈 목록
 */
async function fetchUserIssues(owner, repo, username) {
  try {
    const issues = await fetchWithRetry(
      `/repos/${owner}/${repo}/issues?creator=${username}&state=all`
    );
    return issues;
  } catch (error) {
    console.error("이슈 데이터 가져오기 실패:", error.message);
    return [];
  }
}

/**
 * 사용자가 생성한 PR 목록 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @param {string} username - 추적할 사용자명
 * @returns {Promise<Array>} - PR 목록
 */
async function fetchUserPRs(owner, repo, username) {
  try {
    const prs = await fetchWithRetry(
      `/repos/${owner}/${repo}/pulls?creator=${username}&state=all`
    );
    return prs;
  } catch (error) {
    console.error("PR 데이터 가져오기 실패:", error.message);
    return [];
  }
}

/**
 * 사용자의 커밋 목록 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @param {string} username - 추적할 사용자명
 * @returns {Promise<Array>} - 커밋 목록
 */
async function fetchUserCommits(owner, repo, username) {
  try {
    const commits = await fetchWithRetry(
      `/repos/${owner}/${repo}/commits?author=${username}`
    );
    return commits;
  } catch (error) {
    console.error("커밋 데이터 가져오기 실패:", error.message);
    return [];
  }
}

/**
 * 저장소 기여자 통계 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @returns {Promise<Array>} - 기여자 통계
 */
async function fetchContributorStats(owner, repo) {
  let retries = 0;

  while (retries < 3) {
    try {
      const response = await github.get(
        `/repos/${owner}/${repo}/stats/contributors`
      );

      // 202 상태코드는 GitHub가 통계를 계산 중임을 의미
      if (response.status === 202) {
        console.log(`통계 계산 중... ${retries + 1}/3 재시도`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries++;
        continue;
      }

      return response.data;
    } catch (error) {
      console.error("기여자 통계 가져오기 실패:", error.message);

      // API 제한에 걸린 경우
      if (error.response && error.response.status === 403) {
        console.error(
          "API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
        );
      }

      return [];
    }
  }

  console.warn("최대 재시도 횟수(3)에 도달했습니다.");
  return [];
}

/**
 * 특정 PR에 대한 리뷰 코멘트 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @param {number} prNumber - PR 번호
 * @returns {Promise<Array>} - 리뷰 코멘트 목록
 */
async function fetchPRReviewComments(owner, repo, prNumber) {
  return fetchAllPages(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`);
}

/**
 * 특정 이슈/PR에 대한 코멘트 가져오기
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @param {number} issueNumber - 이슈/PR 번호
 * @returns {Promise<Array>} - 코멘트 목록
 */
async function fetchIssueComments(owner, repo, issueNumber) {
  return fetchAllPages(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments`
  );
}

module.exports = {
  fetchUserIssues,
  fetchUserPRs,
  fetchUserCommits,
  fetchContributorStats,
  fetchPRReviewComments,
  fetchIssueComments,
};
