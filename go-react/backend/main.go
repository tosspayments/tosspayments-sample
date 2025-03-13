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
	Amount        string `json:"amount"`
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

	r := gin.Default()
	r.Use(gin.Logger())

	// 결제 위젯 승인
	r.POST("/confirm/widget", func(c *gin.Context) {
		var request PaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := confirmPayment(encryptedWidgetSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	// 결제창 승인
	r.POST("/confirm/payment", func(c *gin.Context) {
		var request PaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := confirmPayment(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	// 브랜드페이 승인
	r.POST("/confirm/brandpay", func(c *gin.Context) {
		var request BrandPayRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := confirmBrandPay(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	// 빌링키 발급
	r.POST("/issue-billing-key", func(c *gin.Context) {
		var request BillingKeyRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := issueBillingKey(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	// 카드 자동결제 승인
	r.POST("/confirm-billing", func(c *gin.Context) {
		var request BillingPaymentRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		response, err := confirmBillingPayment(encryptedApiSecretKey, request)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, response)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "4001"
	}

	log.Printf("🚀 Server running at http://localhost:%s/", port)
	r.Run(":" + port)
}

// 결제 승인 요청
func confirmPayment(authKey string, request PaymentRequest) (map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/payments/confirm"
	return postRequest(authKey, url, request)
}

// 브랜드페이 승인 요청
func confirmBrandPay(authKey string, request BrandPayRequest) (map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/brandpay/payments/confirm"
	return postRequest(authKey, url, request)
}

// 빌링키 발급
func issueBillingKey(authKey string, request BillingKeyRequest) (map[string]interface{}, error) {
	url := "https://api.tosspayments.com/v1/billing/authorizations/issue"
	return postRequest(authKey, url, request)
}

// 카드 자동결제 승인
func confirmBillingPayment(authKey string, request BillingPaymentRequest) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://api.tosspayments.com/v1/billing/%s", request.CustomerKey)
	return postRequest(authKey, url, request)
}

// 공통 API 요청 함수
func postRequest(authKey string, url string, data interface{}) (map[string]interface{}, error) {
	jsonData, _ := json.Marshal(data)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", authKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)

	return result, nil
}
