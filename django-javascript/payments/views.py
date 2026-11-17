from django.shortcuts import render
import requests, json, base64, time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os

# TODO: 개발자센터에서 확인한 시크릿 키를 환경 변수로 넣으세요. 시크릿 키는 외부에 공개되면 안돼요.
# @docs https://docs.tosspayments.com/reference/using-api/api-keys
WIDGET_SECRET_KEY = os.environ.get("WIDGET_SECRET_KEY", "{WIDGET_SECRET_KEY}")
API_SECRET_KEY = os.environ.get("API_SECRET_KEY", "{SECRET_KEY}")

# 브라우저에는 화면에 필요한 값만 보내세요. 가상계좌 웹훅 검증에 쓰는 secret, 브랜드페이 토큰은 서버에만 저장하세요.
def omit_keys(data, *keys):
    return {key: value for key, value in data.items() if key not in keys}

billing_key_map = {}

# API 요청에 헤더를 생성하는 함수
def create_headers(secret_key):
    # 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
    # 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
    # @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
    userpass = f"{secret_key}:"
    encoded_u = base64.b64encode(userpass.encode()).decode()
    return {
        "Authorization": f"Basic {encoded_u}",
        "Content-Type": "application/json"
    }

# API 요청을 호출하고 응답 핸들링하는 함수
def send_payment_request(url, params, headers):
    response = requests.post(url, json=params, headers=headers)
    return response.json(), response.status_code

# 성공 및 실패 페이지 렌더링하는 함수
def handle_response(request, resjson, status_code, success_template, fail_template):
    if status_code == 200:
        return render(request, success_template, {
            "res": json.dumps(omit_keys(resjson, "secret"), indent=4),
            "respaymentKey": resjson.get("paymentKey"),
            "resorderId": resjson.get("orderId"),
            "restotalAmount": resjson.get("totalAmount")
        })
    else:
        return render(request, fail_template, {
            "code": resjson.get("code"),
            "message": resjson.get("message")
        })

# 페이지 렌더링 함수
def widgetIndex(request):
    return render(request, './widget/index.html')

def widgetCheckout(request):
    return render(request, './widget/checkout.html')

def widgetCheckoutWindow(request):
    return render(request, './widget/checkout-window.html')

def brandpayCheckout(request):
    return render(request, './brandpay/checkout.html')

def paymentCheckout(request):
    return render(request, './payment/checkout.html')

def paymentBilling(request):
    return render(request, './payment/billing.html')

# 결제 성공 및 실패 핸들링
# TODO: 개발자센터에 로그인해서 내 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
# @docs https://docs.tosspayments.com/reference/using-api/api-keys
def widgetSuccess(request):
    return process_payment(request, WIDGET_SECRET_KEY, './widget/success.html')

def paymentSuccess(request):
    return process_payment(request, API_SECRET_KEY, './payment/success.html')

def brandpaySuccess(request):
    return process_payment(request, API_SECRET_KEY, './brandpay/success.html')

# 결제 승인 호출하는 함수
# @docs https://docs.tosspayments.com/guides/v2/payment-widget/integration#3-결제-승인하기
def process_payment(request, secret_key, success_template):
    orderId = request.GET.get('orderId')
    amount = request.GET.get('amount')
    paymentKey = request.GET.get('paymentKey')

    # TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
    # 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
    # 예시)
    # saved_order = find_saved_order(orderId)  # 결제를 요청하기 전에 저장한 주문 정보
    # if saved_order is None or saved_order['amount'] != int(amount):
    #     return render(request, 'fail.html', {"code": "INVALID_AMOUNT", "message": "주문 금액이 일치하지 않아요."})

    url = "https://api.tosspayments.com/v1/payments/confirm"
    headers = create_headers(secret_key)
    params = {
        "orderId": orderId,
        "amount": amount,
        "paymentKey": paymentKey
    }

    resjson, status_code = send_payment_request(url, params, headers)
    return handle_response(request, resjson, status_code, success_template, 'fail.html')

# Fail page rendering view
def fail(request):
    return render(request, "fail.html", {
        "code": request.GET.get('code'),
        "message": request.GET.get('message')
    })

# 빌링키 발급
# AuthKey 로 빌링키 발급 API 를 호출하세요
# @docs https://docs.tosspayments.com/guides/v2/billing/integration
@csrf_exempt
def issueBillingKey(request):
    try:
        data = json.loads(request.body)
        customerKey = data.get('customerKey')
        authKey = data.get('authKey')

        if not customerKey or not authKey:
            raise ValueError("Missing parameters")

        # TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    url = "https://api.tosspayments.com/v1/billing/authorizations/issue"
    secret_key = API_SECRET_KEY
    headers = create_headers(secret_key)
    params = {
        "customerKey": customerKey,
        "authKey": authKey
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        billing_key_map[customerKey] = resjson.get('billingKey')
    
    return JsonResponse(resjson, status=status_code)

# 자동결제 승인
# 샘플에서 자동결제 승인 결과를 바로 확인할 수 있도록 만든 데모용 API 예요.
# 실제 서비스에서는 이 API 를 브라우저에 열지 마세요. 결제 대상 구매자와 금액은 서버가 정해요.
# 서버에 저장한 빌링키와 customerKey 로, 서버의 스케줄러가 결제 주기에 맞춰 자동결제 승인 API 를 호출하세요.
# @docs https://docs.tosspayments.com/guides/v2/billing/integration
@csrf_exempt
def confirm_billing(request):
    try:
        data = json.loads(request.body)
        # TODO: customerKey 는 요청값 대신 로그인한 구매자 정보로 정하세요.
        customerKey = data.get('customerKey')

        if not customerKey:
            raise ValueError("Missing parameters")

        # 저장해두었던 빌링키로 자동결제 승인 API 를 호출하세요.
        billingKey = billing_key_map.get(customerKey)
        if not billingKey:
            return JsonResponse({'error': 'Billing key not found'}, status=404)
        
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    # 결제 금액, 주문번호, 주문명, 구매자 정보는 브라우저에서 받지 말고 서버에서 정하세요.
    amount = 4900
    orderId = f"billing-{int(time.time() * 1000)}"
    orderName = "토스 프라임 구독"
    customerEmail = "customer123@gmail.com"
    customerName = "김토스"

    url = f"https://api.tosspayments.com/v1/billing/{billingKey}"
    secret_key = API_SECRET_KEY
    headers = create_headers(secret_key)
    params = {
        "customerKey": customerKey,
        "amount": amount,
        "orderId": orderId,
        "orderName": orderName,
        "customerEmail": customerEmail,
        "customerName": customerName
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        return JsonResponse(omit_keys(resjson, "secret"), status=status_code)
    else:
        return JsonResponse(omit_keys(resjson, "secret"), status=status_code)

# 브랜드페이 Access Token 발급
def callback_auth(request):
    customerKey = request.GET.get('customerKey')
    code = request.GET.get('code')

    if not customerKey or not code:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    # TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

    url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token"
    secret_key = API_SECRET_KEY
    headers = create_headers(secret_key)
    params = {
        "grantType": "AuthorizationCode",
        "customerKey": customerKey,
        "code": code
    }

    resjson, status_code = send_payment_request(url, params, headers)

    # TODO: 발급받은 Access Token, Refresh Token 은 서버에 저장하고 브라우저로 보내지 마세요.
    if status_code == 200:
        return JsonResponse(omit_keys(resjson, "accessToken", "refreshToken"), status=status_code)
    else:
        return JsonResponse(omit_keys(resjson, "accessToken", "refreshToken"), status=status_code)