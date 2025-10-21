import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ import du composant principal
import { ConfigProvider } from "antd";
import frFR from "antd/locale/fr_FR";
import "antd/dist/reset.css"; // ✅ styles Ant Design
import "./index.css"; // si tu as un CSS global

// Crée la racine React
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={frFR}
      theme={{
        token: {
          colorPrimary: "#1677ff",
          colorBgBase: "#faf8f5",
          borderRadius: 10,
        },
      }}
    >
      <App /> {/* ✅ ton application principale */}
    </ConfigProvider>
  </React.StrictMode>
);
