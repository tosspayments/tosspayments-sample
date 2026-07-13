package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

// TODO: 개발자센터에 로그인해서 내 결제위젯 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
// @docs https://docs.tosspayments.com/reference/using-api/api-keys
const widgetSecretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6"
const apiSecretKey = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"

// 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
// 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
// @docs https://docs.tosspayments.com/reference/using-api/authorization#인증
var encryptedWidgetSecretKey = "Basic " + base64.StdEncoding.EncodeToString([]byte(widgetSecretKey+":"))
var encryptedApiSecretKey = "Basic " + base64.StdEncoding.EncodeToString([]byte(apiSecretKey+":"))

// 발급된 빌링키를 구매자 정보로 찾을 수 있도록 저장해둡니다.
var billingKeyMap = map[string]string{}

func main() {
	mux := http.NewServeMux()

	// 결제위젯 승인
	mux.HandleFunc("POST /confirm/widget", func(w http.ResponseWriter, r *http.Request) {
		proxyTossRequest(w, r, encryptedWidgetSecretKey, "https://api.tosspayments.com/v1/payments/confirm")
	})

	// 결제창 승인
	mux.HandleFunc("POST /confirm/payment", func(w http.ResponseWriter, r *http.Request) {
		proxyTossRequest(w, r, encryptedApiSecretKey, "https://api.tosspayments.com/v1/payments/confirm")
	})

	// 브랜드페이 승인
	mux.HandleFunc("POST /confirm/brandpay", func(w http.ResponseWriter, r *http.Request) {
		proxyTossRequest(w, r, encryptedApiSecretKey, "https://api.tosspayments.com/v1/brandpay/payments/confirm")
	})

	// 브랜드페이 Access Token 발급
	mux.HandleFunc("GET /callback-auth", handleCallbackAuth)

	// 빌링키 발급
	mux.HandleFunc("POST /issue-billing-key", handleIssueBillingKey)

	// 자동결제 승인
	mux.HandleFunc("POST /confirm-billing", handleConfirmBilling)

	log.Println("🚀 Server running at http://localhost:4000/")
	log.Fatal(http.ListenAndServe(":4000", mux))
}

// 브랜드페이 Access Token 발급
// @docs https://docs.tosspayments.com/reference/brandpay#access-token-발급
func handleCallbackAuth(w http.ResponseWriter, r *http.Request) {
	// 요청으로 받은 customerKey 와 요청한 주체가 동일인인지 검증 후 Access Token 발급 API 를 호출하세요.
	reqBody, _ := json.Marshal(map[string]string{
		"grantType":   "AuthorizationCode",
		"customerKey": r.URL.Query().Get("customerKey"),
		"code":        r.URL.Query().Get("code"),
	})

	forwardTossResponse(w, encryptedApiSecretKey, "https://api.tosspayments.com/v1/brandpay/authorizations/access-token", reqBody)
}

// 빌링키 발급
// @docs https://docs.tosspayments.com/guides/v2/billing/integration
func handleIssueBillingKey(w http.ResponseWriter, r *http.Request) {
	var reqData struct {
		CustomerKey string `json:"customerKey"`
		AuthKey     string `json:"authKey"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	reqBody, _ := json.Marshal(reqData)
	status, respBody, err := postJSON("https://api.tosspayments.com/v1/billing/authorizations/issue", encryptedApiSecretKey, reqBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if status >= 200 && status < 300 {
		var result struct {
			BillingKey string `json:"billingKey"`
		}
		if err := json.Unmarshal(respBody, &result); err == nil {
			billingKeyMap[reqData.CustomerKey] = result.BillingKey
		}
	}

	writeJSON(w, status, respBody)
}

// 자동결제 승인
func handleConfirmBilling(w http.ResponseWriter, r *http.Request) {
	var reqData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	customerKey, _ := reqData["customerKey"].(string)
	billingKey := billingKeyMap[customerKey]

	reqBody, _ := json.Marshal(reqData)
	forwardTossResponse(w, encryptedApiSecretKey, "https://api.tosspayments.com/v1/billing/"+billingKey, reqBody)
}

// 결제 승인 API를 호출하세요.
// 결제를 승인하면 결제수단에서 금액이 차감돼요.
// @docs https://docs.tosspayments.com/guides/v2/payment-widget/integration#3-결제-승인하기
func proxyTossRequest(w http.ResponseWriter, r *http.Request, authKey, url string) {
	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	forwardTossResponse(w, authKey, url, reqBody)
}

func forwardTossResponse(w http.ResponseWriter, authKey, url string, reqBody []byte) {
	status, respBody, err := postJSON(url, authKey, reqBody)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println(string(respBody))
	writeJSON(w, status, respBody)
}

func postJSON(url, authKey string, body []byte) (int, []byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewReader(body))
	if err != nil {
		return 0, nil, err
	}
	req.Header.Set("Authorization", authKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, err
	}

	return resp.StatusCode, respBody, nil
}

func writeJSON(w http.ResponseWriter, status int, body []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(body)
}
