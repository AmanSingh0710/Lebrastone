import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import { ToastProvider } from "./context/ToastContext.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import GlobalImageLazyLoader from "./components/common/GlobalImageLazyLoader.jsx";

// ✅ Client ID Verified
const CLIENT_ID =
  "672824511284-h4kjr87o3undb66s34vtn9k2p343gt9o.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  // ✅ ERROR FIX: React.StrictMode ko hata diya hai taaki ReactQuill
  // ka 'findDOMNode' issue solve ho jaye.
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <BrowserRouter>
      <ScrollToTop />
      <GlobalImageLazyLoader />
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
);
