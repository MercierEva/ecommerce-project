// src/pages/AdminLayout.js
import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.includes("orders")
    ? "orders"
    : "products";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        width={220}
        style={{
          borderRight: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "1.2rem",
          }}
        >
          🖼️ Pierrot Admin
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            {
              key: "products",
              icon: <ShoppingOutlined />,
              label: "Produits",
              onClick: () => navigate("/admin/products"),
            },
            {
              key: "orders",
              icon: <UnorderedListOutlined />,
              label: "Commandes",
              onClick: () => navigate("/admin/orders"),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            textAlign: "right",
            borderBottom: "1px solid #eee",
          }}
        >
          <Button
            icon={<LogoutOutlined />}
            danger
            onClick={onLogout}
          >
            Déconnexion
          </Button>
        </Header>

        <Content style={{ margin: "20px", padding: 20, background: "#fff", borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
