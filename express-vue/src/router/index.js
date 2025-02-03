import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      component: () => import("../views/widget/WidgetCheckout.vue"),
    },
    {
      path: "/checkout",
      name: "root-checkout",
      component: () => import("../views/widget/WidgetCheckout.vue"),
    },
    {
      path: "/fail",
      name: "root-fail",
      component: () => import("../views/Fail.vue"),
    },
    {
      path: "/widget",
      name: "widget",
      children: [
        {
          path: "checkout",
          name: "widget-checkout",
          component: () => import("../views/widget/WidgetCheckout.vue"),
        },
        {
          path: "success",
          name: "widget-success",
          component: () => import("../views/widget/WidgetSuccess.vue"),
        },
      ],
    },
    {
      path: "/brandpay",
      name: "brandpay",
      children: [
        {
          path: "checkout",
          name: "brandpay-checkout",
          component: () => import("../views/brandpay/BrandpayCheckout.vue"),
        },
        {
          path: "success",
          name: "brandpay-success",
          component: () => import("../views/brandpay/BrandpaySuccess.vue"),
        },
      ],
    },
    {
      path: "/payment",
      name: "payment",
      children: [
        {
          path: "checkout",
          name: "payment-checkout",
          component: () => import("../views/payment/PaymentCheckout.vue"),
        },
        {
          path: "billing",
          name: "payment-billing",
          component: () => import("../views/payment/PaymentBilling.vue"),
        },
        {
          path: "success",
          name: "payment-success",
          component: () => import("../views/payment/PaymentSuccess.vue"),
        },
      ],
    },
  ],
});

export default router;
