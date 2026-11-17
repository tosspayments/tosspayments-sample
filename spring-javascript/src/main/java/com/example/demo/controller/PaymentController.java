package com.example.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Controller
public class PaymentController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static final String WIDGET_SECRET_KEY = "{WIDGET_SECRET_KEY}";
    private static final String API_SECRET_KEY = "{SECRET_KEY}";
    private final Map<String, String> billingKeyMap = new HashMap<>();

    @PostMapping(value = {"/confirm/widget", "/confirm/payment"})
    public ResponseEntity<JSONObject> confirmPayment(HttpServletRequest request, @RequestBody String jsonBody) throws Exception {
        String secretKey = request.getRequestURI().contains("/confirm/payment") ? API_SECRET_KEY : WIDGET_SECRET_KEY;
        JSONObject requestData = parseRequestData(jsonBody);

        // TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
        // 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
        // 예시)
        // Order savedOrder = findSavedOrder((String) requestData.get("orderId")); // 결제를 요청하기 전에 저장한 주문 정보
        // if (savedOrder == null || savedOrder.getAmount() != Long.parseLong(String.valueOf(requestData.get("amount")))) {
        //     JSONObject error = new JSONObject();
        //     error.put("code", "INVALID_AMOUNT");
        //     error.put("message", "주문 금액이 일치하지 않아요.");
        //     return ResponseEntity.status(400).body(error);
        // }

        JSONObject response = sendRequest(requestData, secretKey, "https://api.tosspayments.com/v1/payments/confirm");
        int statusCode = response.containsKey("error") ? 400 : 200;
        return ResponseEntity.status(statusCode).body(response);
    }

    // 샘플에서 자동결제 승인 결과를 바로 확인할 수 있도록 만든 데모용 API 예요.
    // 실제 서비스에서는 이 API 를 브라우저에 열지 마세요. 결제 대상 구매자와 금액은 서버가 정해요.
    // 서버에 저장한 빌링키와 customerKey 로, 서버의 스케줄러가 결제 주기에 맞춰 자동결제 승인 API 를 호출하세요.
    // @docs https://docs.tosspayments.com/guides/v2/billing/integration
    @PostMapping(value = "/confirm-billing")
    public ResponseEntity<JSONObject> confirmBilling(@RequestBody String jsonBody) throws Exception {
        // TODO: customerKey 는 요청값 대신 로그인한 구매자 정보로 정하세요.
        String customerKey = (String) parseRequestData(jsonBody).get("customerKey");
        String billingKey = billingKeyMap.get(customerKey);
        if (billingKey == null) {
            JSONObject error = new JSONObject();
            error.put("code", "NOT_FOUND_BILLING_KEY");
            error.put("message", "빌링키를 찾을 수 없어요.");
            return ResponseEntity.status(404).body(error);
        }

        // 결제 금액, 주문번호, 주문명, 구매자 정보는 브라우저에서 받지 말고 서버에서 정하세요.
        JSONObject requestData = new JSONObject();
        requestData.put("customerKey", customerKey);
        requestData.put("amount", 4900);
        requestData.put("orderId", "billing-" + System.currentTimeMillis());
        requestData.put("orderName", "토스 프라임 구독");
        requestData.put("customerEmail", "customer123@gmail.com");
        requestData.put("customerName", "김토스");

        JSONObject response = sendRequest(requestData, API_SECRET_KEY, "https://api.tosspayments.com/v1/billing/" + billingKey);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @PostMapping(value = "/issue-billing-key")
    public ResponseEntity<JSONObject> issueBillingKey(@RequestBody String jsonBody) throws Exception {
        JSONObject requestData = parseRequestData(jsonBody);
        // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.
        JSONObject response = sendRequest(requestData, API_SECRET_KEY, "https://api.tosspayments.com/v1/billing/authorizations/issue");

        if (!response.containsKey("error")) {
            billingKeyMap.put((String) requestData.get("customerKey"), (String) response.get("billingKey"));
        }

        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @RequestMapping(value = "/callback-auth", method = RequestMethod.GET)
    public ResponseEntity<JSONObject> callbackAuth(@RequestParam String customerKey, @RequestParam String code) throws Exception {
        // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.
        JSONObject requestData = new JSONObject();
        requestData.put("grantType", "AuthorizationCode");
        requestData.put("customerKey", customerKey);
        requestData.put("code", code);
        
        String url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token";
        JSONObject response = sendRequest(requestData, API_SECRET_KEY, url);

        logger.info("Response Data: {}", response);

        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @RequestMapping(value = "/confirm/brandpay", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<JSONObject> confirmBrandpay(@RequestBody String jsonBody) throws Exception {
        JSONObject requestData = parseRequestData(jsonBody);
        // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

        // TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
        // 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
        // 예시)
        // Order savedOrder = findSavedOrder((String) requestData.get("orderId")); // 결제를 요청하기 전에 저장한 주문 정보
        // if (savedOrder == null || savedOrder.getAmount() != Long.parseLong(String.valueOf(requestData.get("amount")))) {
        //     JSONObject error = new JSONObject();
        //     error.put("code", "INVALID_AMOUNT");
        //     error.put("message", "주문 금액이 일치하지 않아요.");
        //     return ResponseEntity.status(400).body(error);
        // }

        String url = "https://api.tosspayments.com/v1/brandpay/payments/confirm";
        JSONObject response = sendRequest(requestData, API_SECRET_KEY, url);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    private JSONObject parseRequestData(String jsonBody) {
        try {
            return (JSONObject) new JSONParser().parse(jsonBody);
        } catch (ParseException e) {
            logger.error("JSON Parsing Error", e);
            return new JSONObject();
        }
    }

    private JSONObject sendRequest(JSONObject requestData, String secretKey, String urlString) throws IOException {
        HttpURLConnection connection = createConnection(secretKey, urlString);
        try (OutputStream os = connection.getOutputStream()) {
            os.write(requestData.toString().getBytes(StandardCharsets.UTF_8));
        }

        try (InputStream responseStream = connection.getResponseCode() == 200 ? connection.getInputStream() : connection.getErrorStream();
             Reader reader = new InputStreamReader(responseStream, StandardCharsets.UTF_8)) {
            return (JSONObject) new JSONParser().parse(reader);
        } catch (Exception e) {
            logger.error("Error reading response", e);
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("error", "Error reading response");
            return errorResponse;
        }
    }

    private HttpURLConnection createConnection(String secretKey, String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestProperty("Authorization", "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8)));
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        return connection;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String index() {
        return "/widget/index";
    }

    @RequestMapping(value = "/fail", method = RequestMethod.GET)
    public String failPayment(HttpServletRequest request, Model model) {
        model.addAttribute("code", request.getParameter("code"));
        model.addAttribute("message", request.getParameter("message"));
        return "/fail";
    }
}
