from django.urls import path
from . import views

urlpatterns = [
    path('', views.widgetCheckout),
    path('widget/checkout', views.widgetCheckout),
    path('widget/success', views.widgetSuccess),

    path('payment/checkout', views.paymentCheckout),
    path('payment/success', views.paymentSuccess),

    path('brandpay/checkout', views.brandpayCheckout),
    path('brandpay/success', views.brandpaySuccess),
    path('callback-auth', views.callback_auth),
    
    path('payment/billing', views.paymentBilling),
    path('issue-billing-key', views.issueBillingKey),
    path('confirm-billing', views.confirm_billing),

    path('fail', views.fail),
]

