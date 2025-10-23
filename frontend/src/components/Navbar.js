import React from "react";
import { Layout, Menu, Badge, Button, Dropdown, Typography } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const { Header } = Layout;
const { Text } = Typography;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  // 🔹 Compter les articles dans le panier
  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // 🔒 Menu utilisateur
  const userMenu = {
    items: [
      {
        key: "account",
        label: <Link to="/account">Mon compte</Link>,
      },
      user?.is_admin && {
        key: "admin",
        label: <Link to="/admin">Administration</Link>,
      },
      {
        key: "logout",
        label: (
          <Button
            type="link"
            danger
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ padding: 0 }}
          >
            Se déconnecter
          </Button>
        ),
      },
    ].filter(Boolean),
  };

  return (
    <Header
      style={{
        background: "linear-gradient(90deg, #fdfcfb, #e2d1c3)",
        padding: "0 50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* 🏠 Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.8rem",
            color: "#2c2c2c",
            margin: 0,
          }}
        >
          Pierrot Créations
        </h1>
      </Link>

      {/* 🔗 Menu principal */}
      <Menu
        mode="horizontal"
        style={{
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Menu.Item key="home">
          <Link to="/">Vitrine</Link>
        </Menu.Item>

        {/* 🛒 Icône panier */}
        <Menu.Item key="cart" style={{ marginLeft: "10px" }}>
          <Link to="/cart">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: "18px" }} />
            </Badge>
          </Link>
        </Menu.Item>

        {/* 👤 Utilisateur connecté */}
        {user ? (
          <Menu.Item key="user" style={{ marginLeft: "15px" }}>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Button
                type="text"
                icon={<UserOutlined />}
                style={{ color: "#2c2c2c", fontWeight: "500" }}
              >
                <Text>{user.email}</Text>
              </Button>
            </Dropdown>
          </Menu.Item>
        ) : (
          <>
            <Menu.Item key="login">
              <Button type="link" onClick={() => navigate("/login")}>
                Connexion
              </Button>
            </Menu.Item>
            <Menu.Item key="register">
              <Button type="primary" onClick={() => navigate("/register")}>
                S’inscrire
              </Button>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
}
