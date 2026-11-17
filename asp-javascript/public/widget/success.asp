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
secretkey = "{WIDGET_SECRET_KEY}:"
url = "https://api.tosspayments.com/v1/payments/confirm"

data = "{""paymentKey"" : """ & paymentKey & """, ""orderId"" : """ & orderId & """, ""amount"" : """ & amount & """}"
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
      <p>결과 데이터 : <%= req.responseText %></p>
      <p>orderName : <%= myJSON.orderName%></p>
      <p>method : <%= myJSON.method%></p>
      <p>
        <% if myJSON.method = "카드" then response.write myJSON.card.number end if %> <% if myJSON.method = "가상계좌" then response.write myJSON.virtualAccount.accountNumber end if %> <% if
        myJSON.method = "계좌이체" then response.write myJSON.transfer.bank end if %> <% if myJSON.method = "휴대폰" then response.write myJSON.mobilePhone.customerMobilePhone end if %>
      </p>
      <% else %>
      <h1>결제 실패</h1>
      <p>에러메시지 : <%= myJSON.message%></p>
      <span>에러코드: <%= myJSON.code%></span>
      <% end if %>
    </section>
  </body>
</html>
