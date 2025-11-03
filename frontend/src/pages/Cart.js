// src/pages/Cart.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { List, Button, Typography, Divider, message } from "antd";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";

const { Title } = Typography;

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleCheckout = () => {
    if (!cart.length) {
      message.warning("Votre panier est vide !");
      return;
    }

    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Votre Panier
      </Title>

      {cart.length === 0 ? (
        <p style={{ textAlign: "center" }}>Votre panier est vide 🛒</p>
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={cart}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" danger onClick={() => removeFromCart(item)}>
                    Supprimer
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: 60, height: 60, objectFit: "cover" }}
                    />
                  }
                  title={item.name}
                  description={`${item.price.toFixed(2)} € x ${item.quantity || 1}`}
                />
              </List.Item>
            )}
          />
          <Divider />
          <Title level={3} style={{ textAlign: "right" }}>
            Total : {total.toFixed(2)} €
          </Title>
          <Button type="primary" block onClick={handleCheckout}>
            Passer à la livraison
          </Button>
        </>
      )}
    </div>
  );
}
