# 토스페이먼츠 ASP + JavaScript 샘플 프로젝트

토스페이먼츠 JavaScript SDK로 결제 과정을 구현한 ASP + JavaScript 샘플 프로젝트입니다. 자세한 연동 방법과 결제 과정은 [공식 연동 문서](https://docs.tosspayments.com/guides/v2/get-started)에서 확인하세요.


## 준비하기

로컬에 IIS를 설치하고 ASP 관련 설정을 완료하세요.

## 실행하기

1. `/asp-javascipt/public` 샘플을 `inetpub/wwwroot`에 복사하고 실행하면 샘플 코드를 http://127.0.0.1/payment/index.html 주소에서 테스트 가능합니다.

## 인증하기

샘플에 있는 키로 연동이 가능하지만, 내 테스트 연동 키를 사용하면 테스트 결제내역, 웹훅 기능을 사용할 수 있어요. 내 테스트 연동 키는 [개발자센터](https://developers.tosspayments.com/my/api-keys)에서 확인할 수 있습니다. 더 자세한 내용은 [API 키 가이드](https://docs.tosspayments.com/reference/using-api/api-keys)를 참고하세요.

- **클라이언트 키**

  - **결제위젯&브랜드페이**: ASP는 결제위젯 및 브랜드페이 샘플을 제공하지 않습니다. 
  - **결제창**: `public/payment/index.html` 파일에 있는 `clientKey`를 내 API 개별 연동 클라이언트 키로 수정하세요.

- **시크릿 키**

  - **결제위젯&브랜드페이**: ASP는 결제위젯 및 브랜드페이 샘플을 제공하지 않습니다. 
  - **결제창**: `public/payment/success.asp` 및 `public/payment/billing_confirm.asp` 파일에 있는 `secretKey`를 내 API 개별 연동 시크릿 키로 수정하세요.

  \* 시크릿 키는 외부에 절대 노출되면 안 됩니다.