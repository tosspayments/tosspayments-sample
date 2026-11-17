<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.Base64"%>
<%@ page import="java.util.Base64.Encoder"%>
<%@ page import="java.net.HttpURLConnection"%>
<%@ page import="java.net.URL" %>
<%@ page import="org.json.simple.JSONObject" %>
<%@ page import="org.json.simple.parser.JSONParser" %>
<%@ page import="org.json.simple.parser.ParseException" %>
<%@ page import="java.io.*" %>
<%@ page import="java.nio.charset.StandardCharsets" %>
<%
	InputStream responseStream = request.getInputStream();
    Reader reader = new InputStreamReader(responseStream, StandardCharsets.UTF_8);
    
    JSONParser parser = new JSONParser();
    JSONObject jsonObject = (JSONObject) parser.parse(reader);
    responseStream.close();

    String secret = (String) jsonObject.get("secret");
    String status = (String) jsonObject.get("status");
    String orderId = (String) jsonObject.get("orderId");

    // TODO: 결제 승인 응답으로 받아 서버에 저장해 둔 secret 과 같은지 확인하세요. 다르면 처리하지 마세요.
    // 예시)
    // String savedSecret = findSavedSecret(orderId); // 결제 승인 때 저장한 secret
    // if (savedSecret == null || !MessageDigest.isEqual(savedSecret.getBytes(StandardCharsets.UTF_8), String.valueOf(secret).getBytes(StandardCharsets.UTF_8))) {
    //     response.setStatus(400);
    //     return;
    // }

    // TODO: 결제 조회 API(GET /v1/payments/orders/{orderId})로 결제 상태를 한 번 더 확인한 뒤 주문 상태를 바꾸세요.

    // 받은 값을 다시 출력하지 말고, 잘 받았다는 응답만 보내세요.
    response.setStatus(200);
%>
