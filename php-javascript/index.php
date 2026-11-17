<?php

if ($_SERVER['REQUEST_URI'] === '/') {
    header("Location: /public/widget/index.html");
	exit;
}

$widgetSecretKey = "{WIDGET_SECRET_KEY}";
$apiSecretKey = "{SECRET_KEY}";

$encryptedWidgetSecretKey = "Basic " . base64_encode($widgetSecretKey . ":");
$encryptedApiSecretKey = "Basic " . base64_encode($apiSecretKey . ":");

// 빌링키 저장소 (샘플이라 PHP 세션에 저장해요. 실제 서비스에서는 DB 에 저장하세요)
session_start();
$_SESSION['billingKeyMap'] = $_SESSION['billingKeyMap'] ?? [];

// Set JSON content type header for all responses
header("Content-Type: application/json");

// Main router logic
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestUri) {
    case '/confirm/widget':
        if ($requestMethod === 'POST') {
            confirmPayment($encryptedWidgetSecretKey);
        }
        break;
    
    case '/confirm/payment':
        if ($requestMethod === 'POST') {
            confirmPayment($encryptedApiSecretKey);
        }
        break;
    
    case '/confirm/brandpay':
        if ($requestMethod === 'POST') {
            confirmBrandPay($encryptedApiSecretKey);
        }
        break;
    
    case '/callback-auth':
        if ($requestMethod === 'GET') {
            getAuthToken($encryptedApiSecretKey);
        }
        break;

    case '/issue-billing-key':
        if ($requestMethod === 'POST') {
            issueBillingKey($encryptedApiSecretKey);
        }
        break;
    
    case '/confirm-billing':
        if ($requestMethod === 'POST') {
            confirmBilling($encryptedApiSecretKey, $_SESSION['billingKeyMap']);
        }
        break;

    default:
        echo json_encode(["error" => "Route not found"]);
        http_response_code(404);
        break;
}

function confirmPayment($authKey) {
    $data = json_decode(file_get_contents("php://input"), true);

    // TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
    // 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
    // 예시)
    // $savedOrder = findSavedOrder($data['orderId']); // 결제를 요청하기 전에 저장한 주문 정보
    // if ($savedOrder === null || (int) $savedOrder['amount'] !== (int) $data['amount']) {
    //     http_response_code(400);
    //     echo json_encode(['code' => 'INVALID_AMOUNT', 'message' => '주문 금액이 일치하지 않아요.']);
    //     return;
    // }
    
    $postData = json_encode([
        'orderId' => $data['orderId'],
        'amount' => $data['amount'],
        'paymentKey' => $data['paymentKey']
    ]);

    $response = sendRequest("https://api.tosspayments.com/v1/payments/confirm", $authKey, $postData);
    echo $response;

    // 응답 데이터를 JSON 형식으로 파싱
    $responseData = json_decode($response, true);

    // 주요 파라미터 추출
    $orderId = $responseData['orderId'] ?? null;
    $status = $responseData['status'] ?? null;
    $receiptUrl = $responseData['receipt']['url'] ?? null;
}

function confirmBrandPay($authKey) {
    $data = json_decode(file_get_contents("php://input"), true);

    // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

    // TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
    // 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
    // 예시)
    // $savedOrder = findSavedOrder($data['orderId']); // 결제를 요청하기 전에 저장한 주문 정보
    // if ($savedOrder === null || (int) $savedOrder['amount'] !== (int) $data['amount']) {
    //     http_response_code(400);
    //     echo json_encode(['code' => 'INVALID_AMOUNT', 'message' => '주문 금액이 일치하지 않아요.']);
    //     return;
    // }

    $postData = json_encode([
        'orderId' => $data['orderId'],
        'amount' => $data['amount'],
        'paymentKey' => $data['paymentKey'],
        'customerKey' => $data['customerKey']
    ]);

    $response = sendRequest("https://api.tosspayments.com/v1/brandpay/payments/confirm", $authKey, $postData);
    echo $response;
    
    // 응답 데이터를 JSON 형식으로 파싱
    $responseData = json_decode($response, true);

    // 주요 파라미터 추출
    $orderId = $responseData['orderId'] ?? null;
    $status = $responseData['status'] ?? null;
    $receiptUrl = $responseData['receipt']['url'] ?? null;
}

function getAuthToken($authKey) {
    $customerKey = $_GET['customerKey'];
    // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.
    $code = $_GET['code'];

    $postData = json_encode([
        'grantType' => 'AuthorizationCode',
        'customerKey' => $customerKey,
        'code' => $code
    ]);

    $response = sendRequest("https://api.tosspayments.com/v1/brandpay/authorizations/access-token", $authKey, $postData);
    echo $response;
}

function issueBillingKey($authKey) {
    $data = json_decode(file_get_contents("php://input"), true);

    // TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

    $postData = json_encode([
        'customerKey' => $data['customerKey'],
        'authKey' => $data['authKey']
    ]);

    $response = sendRequest("https://api.tosspayments.com/v1/billing/authorizations/issue", $authKey, $postData);
    $result = json_decode($response, true);

    if (isset($result['billingKey'])) {
        $_SESSION['billingKeyMap'][$data['customerKey']] = $result['billingKey'];
    }

    echo $response;
}

// 샘플에서 자동결제 승인 결과를 바로 확인할 수 있도록 만든 데모용 API 예요.
// 실제 서비스에서는 이 API 를 브라우저에 열지 마세요. 결제 대상 구매자와 금액은 서버가 정해요.
// 서버에 저장한 빌링키와 customerKey 로, 서버의 스케줄러가 결제 주기에 맞춰 자동결제 승인 API 를 호출하세요.
// @docs https://docs.tosspayments.com/guides/v2/billing/integration
function confirmBilling($authKey, $billingKeyMap) {
    $data = json_decode(file_get_contents("php://input"), true);

    // TODO: customerKey 는 요청값 대신 로그인한 구매자 정보로 정하세요.

    $billingKey = $billingKeyMap[$data['customerKey']] ?? null;

    if ($billingKey) {
        $postData = json_encode([
            'customerKey' => $data['customerKey'],
            // 결제 금액, 주문번호, 주문명, 구매자 정보는 브라우저에서 받지 말고 서버에서 정하세요.
            'amount' => 4900,
            'orderId' => 'billing-' . round(microtime(true) * 1000),
            'orderName' => '토스 프라임 구독',
            'customerEmail' => 'customer123@gmail.com',
            'customerName' => '김토스'
        ]);

        $response = sendRequest("https://api.tosspayments.com/v1/billing/$billingKey", $authKey, $postData);
        echo $response;
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Billing key not found for customerKey"]);
    }
}

function sendRequest($url, $authKey, $postData) {
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: $authKey",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}
?>
