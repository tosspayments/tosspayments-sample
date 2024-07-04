import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { BrandpayCheckoutPage } from "./pages/brandpay/BrandpayCheckout";
import { FailPage } from "./pages/Fail";
import { PaymentBillingPage } from "./pages/payment/PaymentBilling";
import { PaymentCheckoutPage } from "./pages/payment/PaymentCheckout";
import { PaymentSuccessPage } from "./pages/payment/PaymentSuccess";
import { BrandpaySuccessPage } from "./pages/brandpay/BrandpaySuccess";
import { WidgetCheckoutPage } from "./pages/widget/WidgetCheckout";
import { WidgetSuccessPage } from "./pages/widget/WidgetSuccess";

const router = createBrowserRouter([
  {
    path: "/",
    element: <WidgetCheckoutPage />,
  },
  {
    path: "widget",
    children: [
      {
        path: "checkout",
        element: <WidgetCheckoutPage />,
      },
      {
        path: "success",
        element: <WidgetSuccessPage />,
      },
    ],
  },
  {
    path: "checkout",
    element: <WidgetCheckoutPage />,
  },
  {
    path: "brandpay",
    children: [
      {
        path: "checkout",
        element: <BrandpayCheckoutPage />,
      },
      {
        path: "success",
        element: <BrandpaySuccessPage />,
      },
    ],
  },
  {
    path: "payment",
    children: [
      {
        path: "checkout",
        element: <PaymentCheckoutPage />,
      },
      {
        path: "billing",
        element: <PaymentBillingPage />,
      },
      {
        path: "success",
        element: <PaymentSuccessPage />,
      },
    ],
  },
  {
    path: "fail",
    element: <FailPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
