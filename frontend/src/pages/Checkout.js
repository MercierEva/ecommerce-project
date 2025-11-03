// src/pages/Checkout.js
import React, { useState } from "react";
import { Form, Input, Button, Typography, Divider, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "../api/ApiClient";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";

const { Title } = Typography;

export default function Checkout() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const onFinish = async (values) => {
    if (!cart || cart.length === 0) {
      message.warning("Votre panier est vide !");
      return;
    }

    setLoading(true);
    try {
      // ✅ Création de la session Stripe
      const data = await createCheckoutSession(cart, values);

      if (data?.url) {
        window.location.href = data.url; // redirection Stripe
      } else if (data?.success) {
        window.location.href = `/success?order_id=${data.order_id}`;
      } else {
        message.error("Erreur lors de la création de la session de paiement");
      }
    } catch (err) {
      console.error("Erreur paiement:", err);
      message.error(err.message || "Erreur serveur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Title level={3}>Veuillez vous connecter pour finaliser votre commande.</Title>
        <Button type="primary" onClick={() => navigate("/login?redirect=/checkout")}>
          Se connecter
        </Button>
        <Divider>ou</Divider>
        <Button onClick={() => navigate("/register?redirect=/checkout")}>Créer un compte</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <Title level={2}>Adresse de livraison</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="full_name" label="Nom complet" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Adresse" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="city" label="Ville" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="postal_code" label="Code postal" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Téléphone">
          <Input />
        </Form.Item>
        <Divider />
        <Title level={4}>Total : {total.toFixed(2)} €</Title>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Payer
        </Button>
      </Form>
    </div>
  );
}
