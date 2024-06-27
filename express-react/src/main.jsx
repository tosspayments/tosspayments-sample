import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { BrandpayCheckoutPage } from "./pages/brandpay/BrandpayCheckout";
import { CheckoutPage } from "./pages/Checkout";
import { FailPage } from "./pages/Fail";
import { PaymentBillingPage } from "./pages/payment/PaymentBilling";
import { PaymentCheckoutPage } from "./pages/payment/PaymentCheckout";
import { SuccessPage } from "./pages/Success";

const router = createBrowserRouter([
  {
    path: "checkout",
    element: <CheckoutPage />,
  },
  {
    path: "brandpay",
    children: [
      {
        path: "checkout",
        element: <BrandpayCheckoutPage />,
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
    ],
  },
  {
    path: "success",
    element: <SuccessPage />,
  },
  {
    path: "fail",
    element: <FailPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
