const axios = require("axios");

const GITHUB_API_URL = process.env.GITHUB_API_URL;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

async function fetchGitHubData() {
  try {
    // 예시: 사용자의 저장소 목록 가져오기
    const response = await axios.get(`${GITHUB_API_URL}/user/repos`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(`GitHub API 호출 중 오류 발생: ${error.message}`);
  }
}

module.exports = {
  fetchGitHubData,
};
