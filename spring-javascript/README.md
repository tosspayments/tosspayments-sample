# 토스페이먼츠 Spring + JavaScript 샘플 프로젝트

결제위젯 JavaScript SDK로 결제 과정을 구현한 Spring 샘플 프로젝트입니다. 자세한 연동 방법과 결제 과정은 [공식 연동 문서](https://docs.tosspayments.com/guides/payment-widget/integration)에서 확인하세요.

## 실행하기

1. IntelliJ로 샘플 프로젝트를 빌드하고 실행하세요.

2. 로컬 환경에서 샘플 프로젝트를 확인하세요.

| 제품                      | 링크                                               |
| ------------------------- | -------------------------------------------------- |
| 결제위젯                  | http://localhost:4000/widget/checkout.html  |
| 결제창(일반결제/정기결제) | http://localhost:4000/payment/checkout.html |

## 인증하기

샘플에 있는 키로 연동이 가능하지만, 내 테스트 연동 키를 사용하면 테스트 결제내역, 웹훅 기능을 사용할 수 있어요. 내 테스트 연동 키는 [개발자센터](https://developers.tosspayments.com/my/api-keys)에서 확인할 수 있습니다. 더 자세한 내용은 [API 키 가이드](https://docs.tosspayments.com/reference/using-api/api-keys)를 참고하세요.

- **클라이언트 키**

  - **결제위젯**: `src/main/resources/templates/widget/checkout.html` 파일에 있는 `clientKey`를 내 결제위젯 클라이언트 키로 수정하세요.
  - **결제창**: `src/main/resources/templates/payment/checkout.html` 파일에 있는 `clientKey`를 내 결제위젯 클라이언트 키로 수정하세요.

- **시크릿 키**

  - **결제위젯**: `src/main/java/com/example/demo/controller/PaymentController.java` 파일에 있는 `WIDGET_SECRET_KEY`를 내 결제위젯 시크릿 키로 수정하세요.
  - **결제위젯**: `src/main/java/com/example/demo/controller/PaymentController.java` 파일에 있는 `API_SECRET_KEY`를 내 결제위젯 시크릿 키로 수정하세요.

## 계좌자동결제(퀵계좌이체 빌링) 테스트

정기 결제 화면에서 `카드 자동결제`, `계좌 자동결제`를 선택해 `requestBillingAuth()`를 테스트할 수 있습니다.

- `CARD` 또는 `TRANSFER`를 선택한 뒤 자동결제 수단 등록을 진행하세요.
- 성공 URL 쿼리의 `customerKey`, `authKey`, `billingMethod`를 사용해 서버에서 빌링키 발급을 호출하세요.
- 빌링키 발급/승인 응답에서 `method`와 `card` 또는 `transfers`(혹은 `transfer`) 필드를 확인하세요.
- `NOT_SUPPORTED_METHOD` 오류가 발생하면 자동결제 계약된 MID/키인지 확인하세요.
- 이번 샘플에는 `BILLING_DELETED` 웹훅 엔드포인트가 포함되지 않습니다. 운영에서는 별도 웹훅 연동을 권장합니다.

관련 문서: [자동결제(빌링) 이해하기](https://docs.tosspayments.com/guides/v2/billing/integration), [자동결제 API 레퍼런스](https://docs.tosspayments.com/reference/billing)

## 더 알아보기

- [토스페이먼츠 공식 문서](https://docs.tosspayments.com/guides/v2/get-started)
- [1:1 채팅(Discord)](https://discord.com/invite/VdkfJnknD9)
