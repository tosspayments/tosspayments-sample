<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.Base64" %>
<%@ page import="java.util.Base64.Encoder" %>
<%@ page import="java.net.HttpURLConnection" %>
<%@ page import="java.net.URL" %>
<%@ page import="org.json.simple.JSONObject" %>
<%@ page import="org.json.simple.parser.JSONParser" %>
<%@ page import="java.io.OutputStream" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.Reader" %>

<%
    // TODO: 개발자센터의 API 개별 연동 키 > 시크릿 키로 바꾸세요. 결제위젯 연동 키가 아닌 API 개별 연동 키를 사용해야 합니다.
    String secretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R:";
    Encoder encoder = Base64.getEncoder();
    byte[] encodedBytes = encoder.encode(secretKey.getBytes("UTF-8"));
    String authorizations = "Basic " + new String(encodedBytes, 0, encodedBytes.length);

    String customerKey = request.getParameter("customerKey");
    String code = request.getParameter("code");

    URL url = new URL("https://api.tosspayments.com/v1/brandpay/authorizations/access-token");
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    connection.setRequestProperty("Authorization", authorizations);
    connection.setRequestProperty("Content-Type", "application/json");
    connection.setRequestMethod("POST");
    connection.setDoOutput(true);

    JSONObject obj = new JSONObject();
    obj.put("grantType", "AuthorizationCode");
    obj.put("customerKey", customerKey);
    obj.put("code", code);

    OutputStream outputStream = connection.getOutputStream();
    outputStream.write(obj.toString().getBytes("UTF-8"));

    int responseCode = connection.getResponseCode();
    boolean isSuccess = responseCode == 200;

    InputStream responseStream = isSuccess ? connection.getInputStream() : connection.getErrorStream();
    Reader reader = new InputStreamReader(responseStream, "UTF-8");
    JSONParser parser = new JSONParser();
    JSONObject jsonObject = (JSONObject) parser.parse(reader);
    responseStream.close();


    response.setStatus(isSuccess ? 200 : 400);
    out.print(jsonObject.toJSONString());
%>
