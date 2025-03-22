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

## 사용 방법

프로그램을 실행하려면 다음 명령어를 사용합니다:

```bash
npm start
```

## 출력 파일

- `output.json`: JSON 형식의 데이터
- `output.csv`: CSV 형식의 데이터

## 라이선스

ISC
