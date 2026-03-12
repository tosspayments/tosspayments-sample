<%@ Language="VBScript" CODEPAGE="65001"%>

<!DOCTYPE html>

<!--#include file="../payment/json2.asp"-->
<!--#include file="../payment/base64.asp"-->

<%
call initCodecs

' 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
' 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
paymentKey = trim(request("paymentKey"))
orderId = trim(request("orderId"))
amount = trim(request("amount"))

' TODO: secretKey는 개발자센터의 결제위젯 연동 키 > 시크릿 키로 바꾸세요.
' secretKey를 외부에 노출하지 않도록 주의하세요.
' @docs https://docs.tosspayments.com/reference/using-api/api-keys
secretkey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:"

' 결제를 승인하면 결제수단에서 금액이 차감돼요.
' @docs https://docs.tosspayments.com/reference#결제-승인
url = "https://api.tosspayments.com/v1/payments/confirm"

' 결제 승인 API 요청 바디를 JSON 문자열로 준비합니다.
data = "{""paymentKey"" : """ & paymentKey & """, ""orderId"" : """ & orderId & """, ""amount"" : """ & amount & """}"

' 시크릿 키를 Base64로 인코딩해 Basic 인증 헤더를 만듭니다.
authorization = "Basic " & base64Encode(secretkey)

' 토스페이먼츠 결제 승인 API를 호출합니다.
set req = Server.CreateObject("MSXML2.ServerXMLHTTP")
req.open "POST", url, false
req.setRequestHeader "Authorization", authorization
req.setRequestHeader "Content-Type", "application/json;charset=UTF-8"

req.send data

' 응답 결과를 JSON으로 파싱하고 HTTP 상태 코드를 확인합니다.
set myJSON = JSON.parse(req.responseText)
httpCode = req.status
%>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="https://static.toss.im/icons/png/4x/icon-toss-logo.png" />
    <link rel="stylesheet" type="text/css" href="../payment/style.css" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>토스페이먼츠 샘플 프로젝트</title>
  </head>

  <body>
    <% if httpCode=200 then %>
    <div class="box_section" style="width: 600px">
      <img width="100px" src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" />
      <h2>결제를 완료했어요</h2>

      <div class="p-grid typography--p" style="margin-top: 50px">
        <div class="p-grid-col text--left"><b>결제금액</b></div>
        <div class="p-grid-col text--right"><%= amount %>원</div>
      </div>
      <div class="p-grid typography--p" style="margin-top: 10px">
        <div class="p-grid-col text--left"><b>주문번호</b></div>
        <div class="p-grid-col text--right"><%= orderId %></div>
      </div>
      <div class="p-grid typography--p" style="margin-top: 10px">
        <div class="p-grid-col text--left"><b>paymentKey</b></div>
        <div class="p-grid-col text--right" style="white-space: initial; width: 250px"><%= paymentKey %></div>
      </div>
      <div class="p-grid" style="margin-top: 30px">
        <button class="button p-grid-col5" onclick="location.href='https://docs.tosspayments.com/guides/v2/payment-widget/integration';">연동 문서</button>
        <button class="button p-grid-col5" onclick="location.href='https://discord.gg/A4fRFXQhRu';" style="background-color: #e8f3ff; color: #1b64da">실시간 문의</button>
      </div>
    </div>

    <div class="box_section" style="width: 600px; text-align: left">
      <b>Response Data :</b>
      <div style="white-space: initial"><pre><%= req.responseText %></pre></div>
    </div>
    <% else %>
    <div class="box_section" style="width: 600px">
      <img width="100px" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" />
      <h2>결제를 실패했어요</h2>

      <div class="p-grid typography--p" style="margin-top: 50px">
        <div class="p-grid-col text--left"><b>에러메시지</b></div>
        <div class="p-grid-col text--right"><%= myJSON.message %></div>
      </div>
      <div class="p-grid typography--p" style="margin-top: 10px">
        <div class="p-grid-col text--left"><b>에러코드</b></div>
        <div class="p-grid-col text--right"><%= myJSON.code %></div>
      </div>
      <div class="p-grid" style="margin-top: 30px">
        <button class="button p-grid-col5" onclick="location.href='https://docs.tosspayments.com/guides/v2/payment-widget/integration';">연동 문서</button>
        <button class="button p-grid-col5" onclick="location.href='https://discord.gg/A4fRFXQhRu';" style="background-color: #e8f3ff; color: #1b64da">실시간 문의</button>
      </div>
    </div>
    <% end if %>
  </body>
</html>
