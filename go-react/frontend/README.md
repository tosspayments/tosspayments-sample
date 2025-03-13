# 토스페이먼츠 Express + React 샘플 프로젝트

토스페이먼츠 JavaScript SDK로 결제 과정을 구현한 Express + React 샘플 프로젝트입니다. 자세한 연동 방법과 결제 과정은 [공식 연동 문서](https://docs.tosspayments.com/guides/v2/get-started)에서 확인하세요.

## 준비하기

샘플 프로젝트를 사용하려면 [Node.js](https://nodejs.org/ko/) 18.0.0 이상의 버전이 필요합니다. 먼저 내 컴퓨터의 Node.js 버전을 확인하세요. Node.js가 없다면 [Node.js 홈페이지](https://nodejs.org/ko/download/)에서 다운로드하거나 [nvm](https://github.com/nvm-sh/nvm#about)(Node Version Manager)을 사용해서 설치하세요.

```sh
$ node -v
$ v18.18.2
```

## 실행하기

1. 샘플 프로젝트 레포지토리를 클론(Clone)하고 express-react 폴더로 진입하세요.

   ```sh
   $ git clone https://github.com/tosspayments/tosspayments-sample # 샘플 프로젝트 클론
   $ cd tosspayments-sample/express-react
   ```

2. 의존성 패키지를 다운로드하고 서버를 실행합니다.

   ```sh
   $ npm install # 의존성 패키지 다운로드
   $ npm run dev # 클라이언트 및 서버 실행
   ```

3. 로컬 환경에서 샘플 프로젝트를 확인하세요.

| 제품                      | 링크                                    |
| ------------------------- | --------------------------------------- |
| 결제위젯                  | http://localhost:3000/widget/checkout   |
| 결제창(일반결제/정기결제) | http://localhost:3000/payment/checkout  |
| 브랜드페이                | http://localhost:3000/brandpay/checkout |

## 인증하기

샘플에 있는 키로 연동이 가능하지만, 내 테스트 연동 키를 사용하면 테스트 결제내역, 웹훅 기능을 사용할 수 있어요. 내 테스트 연동 키는 [개발자센터](https://developers.tosspayments.com/my/api-keys)에서 확인할 수 있습니다. 더 자세한 내용은 [API 키 가이드](https://docs.tosspayments.com/reference/using-api/api-keys)를 참고하세요.

- **클라이언트 키**

  - `pages/Checkout.jsx` 파일에 있는 `clientKey`를 내 결제위젯 연동 클라이언트 키로 수정하세요.
  - `pages/payment/PaymentCheckout.jsx`, `pages/brandpay/BrandpayCheckout.jsx` 파일에 있는 `clientKey`를 내 API 개별 연동 클라이언트 키로 수정하세요.

- **시크릿 키**

  - **결제위젯**: `server.js` 파일에 있는 `widgetSecretKey`를 내 결제위젯 시크릿 키로 수정하세요.
  - **결제창 및 브랜드페이**: `server.js` 파일에 있는 `apiSecretKey`를 내 API 개별 연동 시크릿 키로 수정하세요.

  \* 시크릿 키는 외부에 절대 노출되면 안 됩니다.

- **브랜드페이**

  - 브랜드페이를 테스트하고 싶다면 반드시 클라이언트 키, 시크릿 키를 내 키로 바꿔주세요.
  - 개발자센터의 브랜드페이 메뉴에서 리다이렉트 URL도 반드시 등록해야 됩니다. `pages/brandpay/BrandpayCheckout.jsx` 파일을 참고해주세요.

## 더 알아보기

- [토스페이먼츠 공식 문서](https://docs.tosspayments.com/guides/v2/get-started)
- [1:1 채팅(Discord)](https://discord.com/invite/VdkfJnknD9)
