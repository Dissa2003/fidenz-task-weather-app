import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

//sdbuhnisdjakosinasikamso,

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Auth0Provider
  domain="dev-33o66yvqg068ies0.us.auth0.com"
  clientId="sXJhGuYUiy1Re5BKhLjVX86koIKSSK30"
  authorizationParams={{
    redirect_uri: window.location.origin
  }}
>
  <App />
</Auth0Provider>
  </React.StrictMode>
);
