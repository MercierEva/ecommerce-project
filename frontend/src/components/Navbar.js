import React from "react";
import { Layout, Menu, Badge, Button, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.length;

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

        <Menu.Item key="cart" style={{ marginLeft: "10px" }}>
          <Link to="/cart">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: "18px" }} />
            </Badge>
          </Link>
        </Menu.Item>

        {/* 👤 Si connecté → menu utilisateur, sinon boutons Login/Register */}
        {user ? (
          <Menu.Item key="user" style={{ marginLeft: "15px" }}>
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Button
                type="text"
                icon={<UserOutlined />}
                style={{ color: "#2c2c2c", fontWeight: "500" }}
              >
                {user.email}
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
