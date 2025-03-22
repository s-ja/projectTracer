const axios = require("axios");
require("dotenv").config();

// API 기본 설정
const GITHUB_API_URL = process.env.GITHUB_API_URL || "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// axios 인스턴스 생성
const github = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
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
 * @param {string} url - API 엔드포인트
 * @param {Object} params - 요청 파라미터
 * @returns {Promise<Array>} - 모든 결과의 배열
 */
async function fetchAllPages(url, params = {}) {
  let page = 1;
  let allData = [];
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(`API 요청: ${url} (페이지 ${page})`);
      const response = await github.get(url, {
        params: { ...params, page, per_page: 30 },
      });

      console.log("응답 상태:", response.status);
      console.log("응답 헤더:", response.headers);

      const linkHeader = response.headers.link;
      hasMore = linkHeader && linkHeader.includes('rel="next"');

      const data = response.data;
      console.log(
        `데이터 개수: ${Array.isArray(data) ? data.length : "배열 아님"}`
      );

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("더 이상 데이터가 없습니다.");
        break;
      }

      allData = allData.concat(data);
      page++;

      // API 호출 제한을 피하기 위한 지연
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.response?.status === 403) {
        console.error(
          "API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
        );
        console.error(
          "Rate Limit 정보:",
          error.response.headers["x-ratelimit-limit"],
          error.response.headers["x-ratelimit-remaining"]
        );
        break;
      }
      console.error(`데이터 가져오기 실패 (페이지 ${page}):`, error.message);
      if (error.response) {
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);
      }
      break;
    }
  }

  return allData;
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
    const issues = await fetchAllPages(`/repos/${owner}/${repo}/issues`, {
      creator: username,
      state: "all",
    });
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
    const prs = await fetchAllPages(`/repos/${owner}/${repo}/pulls`, {
      creator: username,
      state: "all",
    });
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
    const commits = await fetchAllPages(`/repos/${owner}/${repo}/commits`, {
      author: username,
    });
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
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} retryDelay - 재시도 간격 (밀리초)
 * @returns {Promise<Array>} - 기여자 통계
 */
async function fetchContributorStats(
  owner,
  repo,
  maxRetries = 3,
  retryDelay = 1000
) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await github.get(
        `/repos/${owner}/${repo}/stats/contributors`
      );

      if (response.status === 202) {
        console.log(`통계 계산 중... ${retries + 1}/${maxRetries} 재시도`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retries++;
        continue;
      }

      return response.data;
    } catch (error) {
      console.error("기여자 통계 가져오기 실패:", error.message);

      if (error.response?.status === 403) {
        console.error(
          "API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요."
        );
      }

      if (retries === maxRetries - 1) {
        return [];
      }

      retries++;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.warn(`최대 재시도 횟수(${maxRetries})에 도달했습니다.`);
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
