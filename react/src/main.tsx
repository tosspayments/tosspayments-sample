import ReactDOM from "react-dom/client";
import { CheckoutPage } from "./pages/Checkout";
import { PaymentCheckoutPage } from "./pages/PaymentCheckout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SuccessPage } from "./pages/Success";
import { FailPage } from "./pages/Fail";

const router = createBrowserRouter([
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/payment/checkout",
    element: <PaymentCheckoutPage />,
  },
  {
    path: "/success",
    element: <SuccessPage />,
  },
  {
    path: "/fail",
    element: <FailPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />  
);
