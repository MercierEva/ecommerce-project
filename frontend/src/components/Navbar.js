import React from "react";
import { Layout, Menu, Badge, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import "../index.css";

const { Header } = Layout;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.length;

  // Menu utilisateur
  const userMenu = {
    items: [
      { key: "account", label: <Link to="/account">Mon compte</Link> },
      {
        key: "logout",
        label: (
          <span onClick={logout} style={{ cursor: "pointer" }}>
            <LogoutOutlined style={{ marginRight: 6, color: "#ff4d4f" }} />
            <span style={{ color: "#ff4d4f" }}>Se déconnecter</span>
          </span>
        ),
      },
    ].filter(Boolean),
  };

  return (
    <Header className="navbar-header">
      {/* Logo “A” */}
      <Link to="/" className="nav-logo">
        A
      </Link>

      {/* Menu principal */}
      <Menu
        mode="horizontal"
        style={{
          display: "flex",
          alignItems: "center",
          background: "transparent",
          borderBottom: "none",
          flex: 1,
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <Menu.Item key="home">
          <Link className="nav-link" to="/">Vitrine</Link>
        </Menu.Item>

        <Menu.Item key="cart">
          <Link className="nav-link" to="/cart">
            <Badge count={cartCount} size="small">
              <ShoppingCartOutlined style={{ fontSize: "18px", color: "#faf8f5" }} />
            </Badge>
          </Link>
        </Menu.Item>

        {user ? (
          <Menu.Item key="user">
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <span className="nav-link">
                <UserOutlined style={{ marginRight: 6 }} />
                {user.email}
              </span>
            </Dropdown>
          </Menu.Item>
        ) : (
          <>
            <Menu.Item key="login">
              <Link className="nav-link" to="/login">Connexion</Link>
            </Menu.Item>
            <Menu.Item key="register">
              <Link className="nav-link" to="/register">S’inscrire</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
}
