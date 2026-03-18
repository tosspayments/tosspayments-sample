// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  css: ["~/assets/main.css"],
  runtimeConfig: {
    // TODO: 개발자센터에 로그인해서 내 결제위젯 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
    // @docs https://docs.tosspayments.com/reference/using-api/api-keys
    widgetSecretKey: "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6",
    // TODO: 개발자센터에 로그인해서 내 API 개별 연동 키 > 시크릿 키를 입력하세요. 시크릿 키는 외부에 공개되면 안돼요.
    apiSecretKey: "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R",
  },
});
