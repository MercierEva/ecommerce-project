// src/pages/AdminLayout.js
import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthProvider";

const { Header, Sider, Content, Footer } = Layout;

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const location = useLocation();
  const selectedKey = location.pathname.includes("orders") ? "orders" : "products";

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
          onClick={({ key }) => {
            navigate(`/admin/${key}`);
          }}
          items={[
            { key: "products", icon: <ShoppingOutlined />, label: "Produits" },
            { key: "orders", icon: <UnorderedListOutlined />, label: "Commandes" },
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
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Header>
        <Content style={{ margin: "20px", padding: 20, background: "#fff", borderRadius: 8 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: "center", background: "#fafafa" }}>
          © 2025 Pierrot Admin – E-commerce Dashboard
        </Footer>
      </Layout>
    </Layout>
  );
}
