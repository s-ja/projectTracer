# GitHub 데이터 추출기

GitHub 저장소에서 사용자 기여 내역을 분석하고 포트폴리오용 데이터를 생성하는 CLI 도구입니다.

## 기능

- 사용자가 생성한 이슈 추출
- 사용자가 생성한 PR 추출
- 사용자의 커밋 내역 추출
- 기여자 통계 추출
- 포트폴리오용 마크다운 문서 자동 생성
- JSON, CSV, 마크다운 형식으로 데이터 내보내기

## 설치 방법

```bash
# 저장소 복제
git clone https://github.com/your-username/github-data-explorer.git
cd github-data-explorer

# 의존성 설치
npm install

# 전역 설치 (선택 사항)
npm install -g .
```

## 환경 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# GitHub API 인증 토큰 (Personal Access Token)
GITHUB_TOKEN=your_github_token_here

# 추출할 저장소 정보
REPO_OWNER=organization-name
REPO_NAME=repository-name
USER_TO_TRACK=github-username

# 출력 설정
OUTPUT_FORMAT=json
OUTPUT_DIR=./output
```

## GitHub 토큰 발급 방법

1. GitHub 계정으로 로그인
2. 우측 상단의 프로필 아이콘 > Settings
3. 좌측 메뉴 하단의 Developer settings
4. Personal access tokens > Tokens (classic)
5. Generate new token > Generate new token (classic)
6. 권한 설정: `repo` (저장소 접근 권한)
7. 생성된 토큰을 `.env` 파일에 복사

## 사용 방법

```bash
# 기본 사용법 (환경변수에 설정된 값 사용)
node src/index.js

# 커맨드라인 옵션으로 설정 변경
node src/index.js -o "organization-name" -r "repository-name" -u "username"

# 특정 데이터만 추출
node src/index.js --issues --commits

# 포트폴리오용 마크다운 생성
node src/index.js --portfolio

# 도움말 보기
node src/index.js --help
```

### 명령어 옵션

```
Options:
  -o, --owner <owner>       저장소 소유자/조직명
  -r, --repo <repo>         저장소 이름
  -u, --user <username>     추적할 사용자명
  -f, --format <format>     출력 형식 (json, csv, markdown)
  -d, --dir <directory>     출력 디렉토리
  --issues                  이슈 데이터 가져오기
  --prs                     PR 데이터 가져오기
  --commits                 커밋 데이터 가져오기
  --stats                   기여자 통계 가져오기
  --all                     모든 데이터 가져오기
  --portfolio               포트폴리오용 데이터 생성
  -h, --help                도움말 표시
  -V, --version             버전 정보 표시
```

## 출력 파일

모든 출력 파일은 기본적으로 `output` 디렉토리에 저장됩니다:

- `issues.json` / `issues.csv` - 이슈 데이터
- `pull_requests.json` / `pull_requests.csv` - PR 데이터
- `commits.json` / `commits.csv` - 커밋 데이터
- `contributor_stats.json` / `contributor_stats.csv` - 기여자 통계
- `portfolio_data.json` - 포트폴리오용 요약 데이터
- `portfolio.md` - 포트폴리오용 마크다운 문서

## 포트폴리오 활용 방법

자동 생성된 `portfolio.md` 파일은 다음과 같은 정보를 포함합니다:

- 프로젝트 참여 기간 및 기본 정보
- 기여 통계 (이슈, PR, 커밋 수)
- 작업 유형 분석 (기능 개발, 버그 수정, 리팩토링 등)
- 주요 기여 목록
- 프로젝트에서 발휘한 역량 및 성과

이 정보를 이력서 및 포트폴리오 작성에 활용하시면 됩니다.

## 라이센스

MIT
