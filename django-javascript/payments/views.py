from django.shortcuts import render
import requests, json, base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

billing_key_map = {}

# Helper function to create headers for API requests
def create_headers(secret_key):
    userpass = f"{secret_key}:"
    encoded_u = base64.b64encode(userpass.encode()).decode()
    return {
        "Authorization": f"Basic {encoded_u}",
        "Content-Type": "application/json"
    }

# Helper function to send API requests and handle response
def send_payment_request(url, params, headers):
    response = requests.post(url, json=params, headers=headers)
    return response.json(), response.status_code

# Helper function to handle success and fail rendering
def handle_response(request, resjson, status_code, success_template, fail_template):
    if status_code == 200:
        return render(request, success_template, {
            "res": json.dumps(resjson, indent=4),
            "respaymentKey": resjson.get("paymentKey"),
            "resorderId": resjson.get("orderId"),
            "restotalAmount": resjson.get("totalAmount")
        })
    else:
        return render(request, fail_template, {
            "code": resjson.get("code"),
            "message": resjson.get("message")
        })

# Pages rendering views
def widgetCheckout(request):
    return render(request, './widget/checkout.html')

def brandpayCheckout(request):
    return render(request, './brandpay/checkout.html')

def paymentCheckout(request):
    return render(request, './payment/checkout.html')

def paymentBilling(request):
    return render(request, './payment/billing.html')

# Payment success and failure handling views
def widgetSuccess(request):
    return process_payment(request, "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6", './widget/success.html')

def paymentSuccess(request):
    return process_payment(request, "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R", './payment/success.html')

def brandpaySuccess(request):
    return process_payment(request, "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R", './brandpay/success.html')

# Common function to process payments
def process_payment(request, secret_key, success_template):
    orderId = request.GET.get('orderId')
    amount = request.GET.get('amount')
    paymentKey = request.GET.get('paymentKey')

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

# Billing key issuance view
@csrf_exempt
def issueBillingKey(request):
    try:
        data = json.loads(request.body)
        customerKey = data.get('customerKey')
        authKey = data.get('authKey')

        if not customerKey or not authKey:
            raise ValueError("Missing parameters")
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    url = "https://api.tosspayments.com/v1/billing/authorizations/issue"
    secret_key = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
    headers = create_headers(secret_key)
    params = {
        "customerKey": customerKey,
        "authKey": authKey
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        billing_key_map[customerKey] = resjson.get('billingKey')
    
    return JsonResponse(resjson, status=status_code)

@csrf_exempt
def confirm_billing(request):
    try:
        data = json.loads(request.body)
        customerKey = data.get('customerKey')
        amount = data.get('amount')
        orderId = data.get('orderId')
        orderName = data.get('orderName')
        customerEmail = data.get('customerEmail')
        customerName = data.get('customerName')

        if not all([customerKey, amount, orderId, orderName, customerEmail, customerName]):
            raise ValueError("Missing parameters")

        # Fetch the billingKey from the map
        billingKey = billing_key_map.get(customerKey)
        if not billingKey:
            return JsonResponse({'error': 'Billing key not found'}, status=400)
        
    except (json.JSONDecodeError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=400)

    # API call to TossPayments for auto-payment approval
    url = f"https://api.tosspayments.com/v1/billing/{billingKey}"
    secret_key = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"
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
        return JsonResponse(resjson, status=status_code)
    else:
        return JsonResponse(resjson, status=status_code)

# 브랜드페이
def callback_auth(request):
    customerKey = request.GET.get('customerKey')
    code = request.GET.get('code')

    if not customerKey or not code:
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token"
    secret_key = "test_sk_aBX7zk2yd8yoXwoJ0gqVx9POLqKQ"
    headers = create_headers(secret_key)
    params = {
        "grantType": "AuthorizationCode",
        "customerKey": customerKey,
        "code": code
    }

    resjson, status_code = send_payment_request(url, params, headers)

    if status_code == 200:
        return JsonResponse(resjson, status=status_code)
    else:
        return JsonResponse(resjson, status=status_code)