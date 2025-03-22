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
  const { issues, prs, commits, contributorStats } = data;

  // 작업 기간 계산
  const allDates = [
    ...issues.map((i) => new Date(i.created_at)),
    ...prs.map((p) => new Date(p.created_at)),
    ...commits.map((c) => new Date(c.date)),
  ].sort((a, b) => a - b);

  const firstActivity = allDates[0];
  const lastActivity = allDates[allDates.length - 1];

  // 주요 PR 추출 (코드 변경이 많은 순)
  const significantPRs = [...prs]
    .sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions))
    .slice(0, 5);

  // 커밋 메시지 분석 (어떤 유형의 작업을 했는지)
  const commitTypes = commits.reduce(
    (acc, commit) => {
      const message = commit.message.toLowerCase();
      if (message.includes("fix") || message.includes("bug")) acc.bug_fixes++;
      else if (message.includes("feat") || message.includes("add"))
        acc.features++;
      else if (message.includes("refactor")) acc.refactoring++;
      else if (message.includes("test")) acc.testing++;
      else if (message.includes("docs") || message.includes("document"))
        acc.documentation++;
      else acc.other++;
      return acc;
    },
    {
      bug_fixes: 0,
      features: 0,
      refactoring: 0,
      testing: 0,
      documentation: 0,
      other: 0,
    }
  );

  return {
    summary: {
      project_duration: {
        start_date: firstActivity.toISOString().substring(0, 10),
        end_date: lastActivity.toISOString().substring(0, 10),
        duration_days: Math.ceil(
          (lastActivity - firstActivity) / (1000 * 60 * 60 * 24)
        ),
      },
      contribution_stats: {
        total_issues: issues.length,
        total_prs: prs.length,
        total_commits: commits.length,
        lines_added: prs.reduce((sum, pr) => sum + (pr.additions || 0), 0),
        lines_deleted: prs.reduce((sum, pr) => sum + (pr.deletions || 0), 0),
      },
      work_breakdown: commitTypes,
    },
    significant_contributions: {
      top_prs: significantPRs.map((pr) => ({
        number: pr.number,
        title: pr.title,
        url: pr.url,
        changes: (pr.additions || 0) + (pr.deletions || 0),
      })),
      active_periods: contributorStats
        ? contributorStats.weekly_contributions
            .filter((week) => week.commits > 0)
            .sort((a, b) => b.commits - a.commits)
            .slice(0, 3)
        : [],
    },
  };
}

module.exports = {
  formatIssues,
  formatPRs,
  formatCommits,
  formatContributorStats,
  formatComments,
  createPortfolioSummary,
};
