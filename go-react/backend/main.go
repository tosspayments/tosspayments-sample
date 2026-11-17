package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// 결제 승인 요청 구조체
type PaymentRequest struct {
	OrderId    string `json:"orderId"`
	PaymentKey string `json:"paymentKey"`
	Amount     string `json:"amount"`
}

// 브랜드페이 승인 요청
type BrandPayRequest struct {
	OrderId     string `json:"orderId"`
	PaymentKey  string `json:"paymentKey"`
	Amount      string `json:"amount"`
	CustomerKey string `json:"customerKey"`
}

// 빌링키 발급 요청
type BillingKeyRequest struct {
	CustomerKey string `json:"customerKey"`
	AuthKey     string `json:"authKey"`
}

// 카드 자동결제 요청
type BillingPaymentRequest struct {
	CustomerKey   string `json:"customerKey"`
	Amount        int    `json:"amount"`
	OrderId       string `json:"orderId"`
	OrderName     string `json:"orderName"`
	CustomerEmail string `json:"customerEmail"`
	CustomerName  string `json:"customerName"`
}

func main() {
	// 환경 변수 로드
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found.")
	}

	widgetSecretKey := os.Getenv("WIDGET_SECRET_KEY")
	apiSecretKey := os.Getenv("API_SECRET_KEY")

	// Toss Payments API 인증키 인코딩
	encryptedWidgetSecretKey := "Basic " + base64.StdEncoding.EncodeToString([]byte(widgetSecretKey+":"))
	encryptedApiSecretKey := "Basic " + base64.StdEncoding.EncodeToString([]byte(apiSecretKey+":"))

	// 빌링키 저장소 (샘플이라 메모리에 저장해요)
	var billingKeyMap sync.Map

	r := gin.Default()
	r.Use(gin.Logger())

	// 결제 위젯 승인
	r.POST("/confirm/widget", func(c *gin.Context) {
		var request PaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
		// 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
		// 예시)
		// savedOrder, ok := findSavedOrder(request.OrderId) // 결제를 요청하기 전에 저장한 주문 정보
		// if !ok || savedOrder.Amount != request.Amount {
		// 	c.JSON(http.StatusBadRequest, gin.H{"code": "INVALID_AMOUNT", "message": "주문 금액이 일치하지 않아요."})
		// 	return
		// }

		status, response, err := confirmPayment(encryptedWidgetSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 가상계좌 웹훅 검증에 쓰는 secret 은 서버에만 저장하고 브라우저로 보내지 마세요.
		delete(response, "secret")
		c.JSON(status, response)
	})

	// 결제창 승인
	r.POST("/confirm/payment", func(c *gin.Context) {
		var request PaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
		// 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
		// 예시)
		// savedOrder, ok := findSavedOrder(request.OrderId) // 결제를 요청하기 전에 저장한 주문 정보
		// if !ok || savedOrder.Amount != request.Amount {
		// 	c.JSON(http.StatusBadRequest, gin.H{"code": "INVALID_AMOUNT", "message": "주문 금액이 일치하지 않아요."})
		// 	return
		// }

		status, response, err := confirmPayment(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 가상계좌 웹훅 검증에 쓰는 secret 은 서버에만 저장하고 브라우저로 보내지 마세요.
		delete(response, "secret")
		c.JSON(status, response)
	})

	// 브랜드페이 승인
	r.POST("/confirm/brandpay", func(c *gin.Context) {
		var request BrandPayRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

		// TODO: 결제를 요청하기 전에 서버에 저장한 orderId, amount 와 요청으로 받은 값이 같은지 확인하세요.
		// 값이 다르면 결제 승인 API 를 호출하지 말고 실패로 응답하세요.
		// 예시)
		// savedOrder, ok := findSavedOrder(request.OrderId) // 결제를 요청하기 전에 저장한 주문 정보
		// if !ok || savedOrder.Amount != request.Amount {
		// 	c.JSON(http.StatusBadRequest, gin.H{"code": "INVALID_AMOUNT", "message": "주문 금액이 일치하지 않아요."})
		// 	return
		// }

		status, response, err := confirmBrandPay(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 가상계좌 웹훅 검증에 쓰는 secret 은 서버에만 저장하고 브라우저로 보내지 마세요.
		delete(response, "secret")
		c.JSON(status, response)
	})

	// 빌링키 발급
	r.POST("/issue-billing-key", func(c *gin.Context) {
		var request BillingKeyRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// TODO: 요청으로 받은 customerKey 가 로그인한 구매자의 것인지 확인하세요.

		status, response, err := issueBillingKey(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// TODO: 발급된 빌링키를 구매자 정보로 찾을 수 있도록 저장해두고, 결제가 필요한 시점에 조회하여 자동결제 승인 API 를 호출합니다.
		if billingKey, ok := response["billingKey"].(string); ok && status == http.StatusOK {
			billingKeyMap.Store(request.CustomerKey, billingKey)
		}

		c.JSON(status, response)
	})

	// 카드 자동결제 승인
	// 샘플에서 자동결제 승인 결과를 바로 확인할 수 있도록 만든 데모용 API 예요.
	// 실제 서비스에서는 이 API 를 브라우저에 열지 마세요. 결제 대상 구매자와 금액은 서버가 정해요.
	// 서버에 저장한 빌링키와 customerKey 로, 서버의 스케줄러가 결제 주기에 맞춰 자동결제 승인 API 를 호출하세요.
	// @docs https://docs.tosspayments.com/guides/v2/billing/integration
	r.POST("/confirm-billing", func(c *gin.Context) {
		// TODO: customerKey 는 요청값 대신 로그인한 구매자 정보로 정하세요.
		var body struct {
			CustomerKey string `json:"customerKey"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 저장해두었던 빌링키로 자동결제 승인 API 를 호출하세요.
		billingKey, ok := billingKeyMap.Load(body.CustomerKey)
		if !ok {
			c.JSON(http.StatusNotFound, gin.H{"error": "Billing key not found"})
			return
		}

		// 결제 금액, 주문번호, 주문명, 구매자 정보는 브라우저에서 받지 말고 서버에서 정하세요.
		request := BillingPaymentRequest{
			CustomerKey:   body.CustomerKey,
			Amount:        4900,
			OrderId:       fmt.Sprintf("billing-%d", time.Now().UnixMilli()),
			OrderName:     "토스 프라임 구독",
			CustomerEmail: "customer123@gmail.com",
			CustomerName:  "김토스",
		}

		status, response, err := confirmBillingPayment(encryptedApiSecretKey, billingKey.(string), request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 가상계좌 웹훅 검증에 쓰는 secret 은 서버에만 저장하고 브라우저로 보내지 마세요.
		delete(response, "secret")
		c.JSON(status, response)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("🚀 Server running at http://localhost:%s/", port)
	r.Run(":" + port)
}

// 결제 승인 요청
func confirmPayment(authKey string, request PaymentRequest) (int, map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/payments/confirm"
	return postRequest(authKey, url, request)
}

// 브랜드페이 승인 요청
func confirmBrandPay(authKey string, request BrandPayRequest) (int, map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/brandpay/payments/confirm"
	return postRequest(authKey, url, request)
}

// 빌링키 발급
func issueBillingKey(authKey string, request BillingKeyRequest) (int, map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/billing/authorizations/issue"
	return postRequest(authKey, url, request)
}

// 카드 자동결제 승인
func confirmBillingPayment(authKey string, billingKey string, request BillingPaymentRequest) (int, map[string]interface{}, error) {
	url := fmt.Sprintf("https://api.tosspayments.com/v1/billing/%s", billingKey)
	return postRequest(authKey, url, request)
}

// 공통 API 요청 함수
func postRequest(authKey string, url string, data interface{}) (int, map[string]interface{}, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return 0, nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, nil, err
	}
	req.Header.Set("Authorization", authKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, err
	}
	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, nil, err
	}

	// 토스페이먼츠 응답 상태 코드를 그대로 돌려줘서, 승인 실패를 성공으로 처리하지 않게 해요.
	return resp.StatusCode, result, nil
}
