# 토스페이먼츠 JSP + JavaScript 샘플 프로젝트

토스페이먼츠 JavaScript SDK로 결제 과정을 구현한 JSP + JavaScript 샘플 프로젝트입니다. 자세한 연동 방법과 결제 과정은 [공식 연동 문서](https://docs.tosspayments.com/guides/v2/get-started)에서 확인하세요.


## 준비하기


- [Java](https://www.oracle.com/kr/java/technologies/downloads/)
- [Apache Tomcat](https://tomcat.apache.org/download-90.cgi)

## 실행하기
- payment : 결제창 샘플입니다. 
- widget : 결제위젯 샘플입니다. 

** 세부 실행 방법은 각 폴더의 README를 참고바랍니다.

## 계좌자동결제(퀵계좌이체 빌링) 테스트

정기 결제 화면에서 `카드 자동결제`, `계좌 자동결제`를 선택해 `requestBillingAuth()`를 테스트할 수 있습니다.

- `CARD` 또는 `TRANSFER`를 선택한 뒤 자동결제 수단 등록을 진행하세요.
- 성공 URL 쿼리의 `customerKey`, `authKey`, `billingMethod`를 사용해 서버에서 빌링키 발급을 호출하세요.
- 빌링키 발급/승인 응답에서 `method`와 `card` 또는 `transfers`(혹은 `transfer`) 필드를 확인하세요.
- `NOT_SUPPORTED_METHOD` 오류가 발생하면 자동결제 계약된 MID/키인지 확인하세요.
- 이번 샘플에는 `BILLING_DELETED` 웹훅 엔드포인트가 포함되지 않습니다. 운영에서는 별도 웹훅 연동을 권장합니다.

관련 문서: [자동결제(빌링) 이해하기](https://docs.tosspayments.com/guides/v2/billing/integration), [자동결제 API 레퍼런스](https://docs.tosspayments.com/reference/billing)
