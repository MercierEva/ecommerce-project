// src/pages/AdminLayout.js
import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ShoppingOutlined, UnorderedListOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";


export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.includes("orders") ? "orders" : "products";
  const { Header, Sider, Content } = Layout;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={220} style={{ borderRight: "1px solid #eee", paddingTop: 20 }}>
        <div style={{ fontWeight: "bold", textAlign: "center", marginBottom: 20, fontSize: "1.2rem" }}>
          🖼️ Pierrot Admin
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: "products", icon: <ShoppingOutlined />, label: "Produits", onClick: () => navigate("/admin/products") },
            { key: "orders", icon: <UnorderedListOutlined />, label: "Commandes", onClick: () => navigate("/admin/orders") },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 20px", textAlign: "right", borderBottom: "1px solid #eee" }}>
          <Button icon={<LogoutOutlined />} danger onClick={() => { logout(); navigate("/login"); }}>
            Déconnexion
          </Button>
        </Header>

        <Content style={{ margin: 20, padding: 20, background: "#fff", borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
