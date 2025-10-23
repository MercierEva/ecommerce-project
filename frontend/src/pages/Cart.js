// src/pages/Cart.js
import React from "react";
import { List, Button, Typography, Divider, message } from "antd";
import { createCheckoutSession } from "../api/ApiClient";
import { useCart } from "../context/CartContext";

const { Title } = Typography;

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart(); // ✅ context
  const total = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleCheckout = async () => {
    if (!cart.length) {
      message.warning("Votre panier est vide !");
      return;
    }

    try {
      const data = await createCheckoutSession(cart);
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.success) {
        window.location.href = `/success?order_id=${data.order_id}`;
      } else {
        message.error("Erreur lors du paiement");
      }
    } catch (err) {
      console.error("Erreur paiement:", err);
      message.error("Erreur serveur lors du paiement");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
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
                  <Button type="link" danger onClick={() => removeFromCart(item.id)}>
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
            Payer
          </Button>
          <Button block onClick={clearCart} style={{ marginTop: 10 }}>
            Vider le panier
          </Button>
        </>
      )}
    </div>
  );
}
