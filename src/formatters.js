function formatData(data) {
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
  }));
}

module.exports = {
  formatData,
};
