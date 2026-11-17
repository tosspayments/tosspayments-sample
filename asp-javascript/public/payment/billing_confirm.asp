<%@ Language="VBScript" CODEPAGE="65001" %>

<!DOCTYPE html>

<!--#include file="json2.asp"-->
<!--#include file="base64.asp"-->

<%
call initCodecs

customerKey = trim(request("customerKey"))
' TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.
authKey = trim(request("authKey"))
billingMethod = trim(request("billingMethod"))
if billingMethod = "" then
    billingMethod = "CARD"
end if
if billingMethod = "TRANSFER" then
    billingMethodLabel = "계좌 자동결제"
else
    billingMethodLabel = "카드 자동결제"
end if
' TODO: 시크릿 키는 소스에 적지 말고 환경 변수나 웹 루트 밖 설정에서 읽으세요.
secretKey = "{SECRET_KEY}:"
url = "https://api.tosspayments.com/v1/billing/authorizations/issue"

' 요청 본문은 문자열을 이어 붙이지 말고 JSON 으로 직렬화하세요.
set body = JSON.parse("{}")
body.set "authKey", authKey
body.set "customerKey", customerKey
data = JSON.stringify(body)
authorization = "Basic " & base64Encode(secretKey)

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
    <title>자동결제 수단 등록</title>
    <meta charset="UTF-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
</head>

<body>
    <section>
        <% if httpCode = 200 then %>
            <h1><%= billingMethodLabel %> 등록 성공</h1>
            <p>method : <%= Server.HTMLEncode(myJSON.method & "") %></p>
            <p>billingKey : <%= Server.HTMLEncode(myJSON.billingKey & "") %></p>
            <p>card : <%= Server.HTMLEncode(JSON.stringify(myJSON.card) & "") %></p>
            <p>transfers : <%= Server.HTMLEncode(JSON.stringify(myJSON.transfers) & "") %></p>
        <% else %>
            <h1>자동결제 수단 등록 실패</h1>
            <p>에러메시지 : <%= Server.HTMLEncode(myJSON.message & "") %></p>
            <span>에러코드: <%= Server.HTMLEncode(myJSON.code & "") %></span>
        <% end if %>
    </section>
</body>
</html>
