<%@ Language="VBScript" CODEPAGE="65001"%>

<!DOCTYPE html>

<!--#include file="json2.asp"-->
<!--#include file="base64.asp"-->

<%
call initCodecs

paymentKey = trim(request("paymentKey"))
orderId = trim(request("orderId"))
amount = trim(request("amount"))

' TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
' 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
' 예시)
' savedAmount = FindSavedAmount(orderId) ' 결제를 요청하기 전에 저장한 주문 금액
' If IsEmpty(savedAmount) Or CStr(savedAmount) <> amount Then
'     Response.Redirect "fail.asp?code=INVALID_AMOUNT&message=" & Server.URLEncode("주문 금액이 일치하지 않아요.")
' End If
' TODO: 시크릿 키는 소스에 적지 말고 환경 변수나 웹 루트 밖 설정에서 읽으세요.
secretkey = "{SECRET_KEY}:"
url = "https://api.tosspayments.com/v1/payments/confirm"

' 요청 본문은 문자열을 이어 붙이지 말고 JSON 으로 직렬화하세요.
set body = JSON.parse("{}")
body.set "paymentKey", paymentKey
body.set "orderId", orderId
body.set "amount", amount
data = JSON.stringify(body)
authorization = "Basic " & base64Encode(secretkey)

set req = Server.CreateObject("MSXML2.ServerXMLHTTP")
req.open "POST", url, false
req.setRequestHeader "Authorization", authorization
req.setRequestHeader "Content-Type", "application/json;charset=UTF-8"

req.send data

set myJSON = JSON.parse(req.responseText)
httpCode = req.status
%>
<html lang="ko">
  <head>
    <title>결제 성공</title>
    <meta charset="UTF-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  </head>

  <body>
    <section>
      <% if httpCode=200 then %>
      <h1>결제 성공</h1>
      <p>orderName : <%= Server.HTMLEncode(myJSON.orderName & "") %></p>
      <p>method : <%= Server.HTMLEncode(myJSON.method & "") %></p>
      <p>
        <% if myJSON.method = "카드" then response.write Server.HTMLEncode(myJSON.card.number & "") end if %> <% if myJSON.method = "가상계좌" then response.write Server.HTMLEncode(myJSON.virtualAccount.accountNumber & "") end if %> <% if
        myJSON.method = "계좌이체" then response.write Server.HTMLEncode(myJSON.transfer.bank & "") end if %> <% if myJSON.method = "휴대폰" then response.write Server.HTMLEncode(myJSON.mobilePhone.customerMobilePhone & "") end if %>
      </p>
      <% else %>
      <h1>결제 실패</h1>
      <p>에러메시지 : <%= Server.HTMLEncode(myJSON.message & "") %></p>
      <span>에러코드: <%= Server.HTMLEncode(myJSON.code & "") %></span>
      <% end if %>
    </section>
  </body>
</html>
