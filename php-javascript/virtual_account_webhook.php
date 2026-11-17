<?php
// 가상계좌 입금 상태가 바뀌면 토스페이먼츠가 이 주소로 결과를 보내요.
// @docs https://docs.tosspayments.com/guides/v2/webhook
$postData = file_get_contents('php://input');
$json = json_decode($postData);

$secret = $json->secret ?? null;
$status = $json->status ?? null;
$orderId = $json->orderId ?? null;

// TODO: 결제 승인 응답으로 받아 서버에 저장해 둔 secret 과 같은지 확인하세요. 다르면 처리하지 마세요.
// 예시)
// $savedPayment = findSavedPayment($orderId); // 결제 승인 때 저장한 결제 정보
// if ($savedPayment === null || !hash_equals($savedPayment['secret'], (string) $secret)) {
//     http_response_code(400);
//     exit;
// }

// TODO: 결제 조회 API(GET /v1/payments/orders/{orderId})로 결제 상태를 한 번 더 확인한 뒤 주문 상태를 바꾸세요.

// 받은 값을 다시 출력하지 말고, 잘 받았다는 응답만 보내세요.
http_response_code(200);
