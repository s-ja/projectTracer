/**
 * 이슈 데이터를 간결하게 포맷팅
 * @param {Array} issues - GitHub API에서 가져온 이슈 데이터
 * @returns {Array} - 포맷팅된 이슈 데이터
 */
function formatIssues(issues) {
  if (!Array.isArray(issues)) {
    console.warn("이슈 데이터가 올바른 형식이 아닙니다:", issues);
    return [];
  }

  return issues.map((issue) => ({
    number: issue.number,
    title: issue.title,
    state: issue.state,
    created_at: issue.created_at,
    closed_at: issue.closed_at,
    url: issue.html_url,
    labels: issue.labels.map((label) => label.name),
    body: issue.body,
    comments_count: issue.comments,
  }));
}

/**
 * PR 데이터를 간결하게 포맷팅
 * @param {Array} prs - GitHub API에서 가져온 PR 데이터
 * @returns {Array} - 포맷팅된 PR 데이터
 */
function formatPRs(prs) {
  if (!Array.isArray(prs)) {
    console.warn("PR 데이터가 올바른 형식이 아닙니다:", prs);
    return [];
  }

  return prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    created_at: pr.created_at,
    merged_at: pr.merged_at,
    closed_at: pr.closed_at,
    url: pr.html_url,
    body: pr.body,
    comments_count: pr.comments,
    review_comments_count: pr.review_comments,
    changed_files: pr.changed_files,
    additions: pr.additions,
    deletions: pr.deletions,
  }));
}

/**
 * 커밋 데이터를 간결하게 포맷팅
 * @param {Array} commits - GitHub API에서 가져온 커밋 데이터
 * @returns {Array} - 포맷팅된 커밋 데이터
 */
function formatCommits(commits) {
  if (!Array.isArray(commits)) {
    console.warn("커밋 데이터가 올바른 형식이 아닙니다:", commits);
    return [];
  }

  return commits.map((commit) => ({
    sha: commit.sha,
    short_sha: commit.sha.substring(0, 7),
    message: commit.commit.message,
    date: commit.commit.author.date,
    url: commit.html_url,
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
    },
  }));
}

/**
 * 기여자 통계를 포맷팅
 * @param {Array} stats - GitHub API에서 가져온 기여자 통계
 * @param {string} username - 특정 사용자의 통계만 반환하려면 입력
 * @returns {Object|Array} - 포맷팅된 기여자 통계
 */
function formatContributorStats(stats, username = null) {
  if (!stats || !Array.isArray(stats)) {
    console.warn("기여자 통계 데이터가 올바른 형식이 아닙니다:", stats);
    return username ? null : [];
  }

  const formattedStats = stats.map((stat) => ({
    username: stat.author.login,
    total_commits: stat.total,
    weekly_contributions: stat.weeks.map((week) => ({
      week: new Date(week.w * 1000).toISOString().substring(0, 10),
      additions: week.a,
      deletions: week.d,
      commits: week.c,
    })),
  }));

  // 특정 사용자의 통계만 반환
  if (username) {
    return formattedStats.find((stat) => stat.username === username) || null;
  }

  return formattedStats;
}

/**
 * 코멘트 데이터를 간결하게 포맷팅
 * @param {Array} comments - GitHub API에서 가져온 코멘트 데이터
 * @returns {Array} - 포맷팅된 코멘트 데이터
 */
function formatComments(comments) {
  return comments.map((comment) => ({
    id: comment.id,
    user: comment.user.login,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    body: comment.body,
    url: comment.html_url,
  }));
}

/**
 * 프로젝트 데이터를 포트폴리오에 활용하기 좋은 형태로 요약
 * @param {Object} data - 모든 가공된 데이터
 * @returns {Object} - 포트폴리오용 요약 데이터
 */
function createPortfolioSummary(data) {
  if (!data) {
    console.warn("포트폴리오 데이터가 없습니다.");
    return null;
  }

  const summary = {
    issues: {
      total: data.issues?.length || 0,
      open: data.issues?.filter((i) => i.state === "open").length || 0,
      closed: data.issues?.filter((i) => i.state === "closed").length || 0,
    },
    pull_requests: {
      total: data.prs?.length || 0,
      open: data.prs?.filter((pr) => pr.state === "open").length || 0,
      closed: data.prs?.filter((pr) => pr.state === "closed").length || 0,
      merged: data.prs?.filter((pr) => pr.merged_at).length || 0,
    },
    commits: {
      total: data.commits?.length || 0,
    },
    contributor_stats: data.contributorStats || null,
  };

  return summary;
}

module.exports = {
  formatIssues,
  formatPRs,
  formatCommits,
  formatContributorStats,
  formatComments,
  createPortfolioSummary,
};
