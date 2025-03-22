# GitHub Data Explorer

GitHub API를 사용하여 저장소 데이터를 수집하고 분석하는 도구입니다.

## 기능

- GitHub API를 통한 저장소 데이터 수집
- 데이터 포맷팅 및 가공
- JSON 및 CSV 형식으로 데이터 내보내기

## 설치 방법

1. 저장소를 클론합니다:

```bash
git clone [repository-url]
cd github-data-explorer
```

2. 의존성을 설치합니다:

```bash
npm install
```

3. 환경 변수를 설정합니다:

- `.env` 파일을 생성하고 GitHub 토큰을 설정합니다:

```
GITHUB_TOKEN=your_github_token_here
GITHUB_API_URL=https://api.github.com
```

4. 출력 디렉토리를 생성합니다:

```bash
mkdir output
```

## 사용 방법

### 1. 기본 사용법

```bash
node src/index.js
```

### 2. 특정 저장소와 사용자 지정

```bash
node src/index.js -o "저장소소유자" -r "저장소이름" -u "사용자명"
```

### 3. 포트폴리오용 마크다운 생성

```bash
node src/index.js --portfolio
```

### 4. 특정 데이터만 추출

```bash
node src/index.js --issues --commits
```

## 프로젝트 설정 방법

### 1. .env 파일을 통한 설정

`.env` 파일에 기본값을 설정할 수 있습니다:

```
GITHUB_TOKEN=your_github_token_here
GITHUB_API_URL=https://api.github.com
REPO_OWNER=기본저장소소유자
REPO_NAME=기본저장소이름
USER_TO_TRACK=기본사용자명
OUTPUT_DIR=./output
OUTPUT_FORMAT=json
```

### 2. 명령줄 인자를 통한 설정

각 실행 시마다 다른 저장소나 사용자를 추적하고 싶다면 명령줄 인자를 사용합니다:

```bash
# 예시 1: Mt-NextJs 저장소의 s-ja 사용자 추적
node src/index.js -o "Mt-NextJs" -r "linkle" -u "s-ja"

# 예시 2: 다른 프로젝트 추적
node src/index.js -o "다른소유자" -r "다른저장소" -u "다른사용자"
```

## 출력 파일

모든 출력 파일은 `output` 디렉토리에 저장됩니다:

- `issues.json` / `issues.csv`: 이슈 데이터
- `pull_requests.json` / `pull_requests.csv`: PR 데이터
- `commits.json` / `commits.csv`: 커밋 데이터
- `contributor_stats.json` / `contributor_stats.csv`: 기여자 통계
- `portfolio_data.json`: 포트폴리오용 요약 데이터
- `portfolio.md`: 포트폴리오용 마크다운 문서

## 주의사항

1. `output` 디렉토리는 `.gitignore`에 포함되어 있어 Git에 업로드되지 않습니다.
2. GitHub API 토큰은 반드시 `.env` 파일에 안전하게 보관해야 합니다.
3. API 호출 제한에 주의하세요. GitHub API는 시간당 요청 제한이 있습니다.

## 라이선스

ISC
