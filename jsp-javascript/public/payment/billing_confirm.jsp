<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.Base64" %>
<%@ page import="java.util.Base64.Encoder" %>
<%@ page import="java.net.HttpURLConnection" %>
<%@ page import="java.net.URL" %>
<%@ page import="org.json.simple.JSONObject" %>
<%@ page import="org.json.simple.parser.JSONParser" %>
<%@ page import="org.json.simple.parser.ParseException" %>
<%@ page import="java.io.OutputStream" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.Reader" %>
<%@ page import="java.nio.charset.StandardCharsets" %>
<%@ page import="java.net.URLEncoder" %>

<%
    // 결제 승인 API 호출하기
    String customerKey = request.getParameter("customerKey");
    String authKey = request.getParameter("authKey");
    String billingMethod = request.getParameter("billingMethod");
    if (billingMethod == null || billingMethod.isEmpty()) {
        billingMethod = "CARD";
    }
    String billingMethodLabel = "CARD".equals(billingMethod) ? "카드 자동결제" : "계좌 자동결제";
    String secretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:";

    Encoder encoder = Base64.getEncoder();
    byte[] encodedBytes = encoder.encode(secretKey.getBytes("UTF-8"));
    String authorizations = "Basic " + new String(encodedBytes, 0, encodedBytes.length);

    authKey = URLEncoder.encode(authKey, StandardCharsets.UTF_8);

    // API URL 설정
    URL url = new URL("https://api.tosspayments.com/v1/billing/authorizations/issue");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestProperty("Authorization", authorizations);
    connection.setRequestProperty("Content-Type", "application/json");
    connection.setRequestMethod("POST");
    connection.setDoOutput(true);

    // JSON 객체 생성
    JSONObject obj = new JSONObject();
    obj.put("authKey", authKey);
    obj.put("customerKey", customerKey);

    // 요청 데이터 전송
    OutputStream outputStream = connection.getOutputStream();
    outputStream.write(obj.toString().getBytes("UTF-8"));

    // 응답 코드 확인
    int code = connection.getResponseCode();
    boolean isSuccess = code == 200;

    // 응답 데이터 읽기
    InputStream responseStream = isSuccess ? connection.getInputStream() : connection.getErrorStream();
    Reader reader = new InputStreamReader(responseStream, StandardCharsets.UTF_8);

    // JSON 파싱
    JSONParser parser = new JSONParser();
    JSONObject jsonObject = (JSONObject) parser.parse(reader);

    // 응답 스트림 닫기
    responseStream.close();
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <title>자동결제 수단 등록</title>
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
</head>
<body>
    <section>
        <% if (isSuccess) { %>
            <h1><%= billingMethodLabel %> 등록 성공</h1>
            <p>결과 데이터 : <%= jsonObject.toJSONString() %></p>
            <p>method : <%= jsonObject.get("method") %></p>
            <p>billingKey : <%= jsonObject.get("billingKey") %></p>
            <p>card : <%= jsonObject.get("card") %></p>
            <p>transfers : <%= jsonObject.get("transfers") %></p>
        <% } else { %>
            <h1>자동결제 수단 등록 실패</h1>
            <p><%= jsonObject.get("message") %></p>
            <span>에러코드: <%= jsonObject.get("code") %></span>
        <% } %>
    </section>
</body>
</html>
