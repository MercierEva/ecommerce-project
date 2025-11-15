import React, { useState, useEffect } from "react";
import {
  List,
  Button,
  Typography,
  Divider,
  message,
  Form,
  Input,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { createCheckoutSession } from "../api/ApiClient";

const { Title, Text } = Typography;

export default function CartCheckout() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 🧮 Calcul des frais d’expédition
  const shippingCost = cart.reduce((acc, item) => {
    const category = item.category?.toLowerCase();
    if (category === "tableau") return acc + 5;
    if (category === "bijou" || category === "bijoux") return acc + 3;
    return acc;
  }, 0);

  const total = cart.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const grandTotal = total + shippingCost;

  // 🧾 Gestion du paiement / checkout
  const onFinish = async (values) => {
    if (!cart.length) {
      message.warning("Votre panier est vide !");
      return;
    }

    setSubmitting(true);
    try {
      const data = await createCheckoutSession(cart, values);
      if (data?.url) {
        window.location.href = data.url; // redirection Stripe
      } else if (data?.success) {
        message.success("Commande enregistrée avec succès !");
        clearCart();
        navigate(`/success?order_id=${data.order_id}`);
      } else {
        message.error("Erreur lors du paiement");
      }
    } catch (err) {
      console.error("❌ Paiement échoué :", err);
      message.error(err.message || "Erreur serveur lors du paiement");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Message international
  const internationalMessage = (
    <Text type="secondary" style={{ fontSize: 14 }}>
      🌍 Pour les livraisons à l’international, veuillez contacter l’artiste
      directement par e-mail ou téléphone.
    </Text>
  );

  // 🔹 Si le panier est vide
  if (!cart.length) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Title level={3}>Votre panier est vide 🛒</Title>
        <Button type="primary" onClick={() => navigate("/")}>
          Continuer mes achats
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        padding: 40,
        alignItems: "start",
      }}
    >
      <div>
        <Title level={2}>Votre panier</Title>
        <List
          itemLayout="horizontal"
          dataSource={cart}
          renderItem={(item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const total = price * quantity;

            return (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    onClick={() => removeFromCart(item)}
                  >
                    Supprimer
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  }
                  title={item.name || "Produit inconnu"}
                  description={`${price.toFixed(2)} € × ${quantity}`}
                />
                <div style={{ minWidth: 70, textAlign: "right" }}>
                  {total.toFixed(2)} €
                </div>
              </List.Item>
            );
          }}
        />
        <Divider />
        <Text>
          Frais de port : <b>{shippingCost.toFixed(2)} €</b> (5 € / tableau, 3 € / bijou)
        </Text>
        <br />
        {internationalMessage}
        <Divider />
        <Title level={3}>Total : {grandTotal.toFixed(2)} €</Title>
      </div>

      <div>
        <Title level={2}>Livraison & Paiement</Title>

        {!user ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Title level={4}>
              Connectez-vous pour finaliser votre commande
            </Title>
            <Button
              type="primary"
              onClick={() => navigate("/login?redirect=/cart-checkout")}
            >
              Se connecter
            </Button>
            <Divider>ou</Divider>
            <Button onClick={() => navigate("/register?redirect=/cart-checkout")}>
              Créer un compte
            </Button>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ background: "#fff", padding: 24, borderRadius: 12 }}
          >
            <Form.Item
              name="full_name"
              label="Nom complet"
              rules={[{ required: true, message: "Veuillez entrer votre nom complet" }]}
            >
              <Input placeholder="Jean Dupont" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Adresse"
              rules={[{ required: true, message: "Veuillez entrer votre adresse" }]}
            >
              <Input placeholder="10 rue de Paris" />
            </Form.Item>
            <Form.Item
              name="city"
              label="Ville"
              rules={[{ required: true, message: "Veuillez entrer votre ville" }]}
            >
              <Input placeholder="Paris" />
            </Form.Item>
            <Form.Item
              name="postal_code"
              label="Code postal"
              rules={[{ required: true, message: "Veuillez entrer votre code postal" }]}
            >
              <Input placeholder="75000" />
            </Form.Item>
            <Form.Item name="phone" label="Téléphone (optionnel)">
              <Input placeholder="+33 6 12 34 56 78" />
            </Form.Item>

            <Divider />
            <Title level={4} style={{ textAlign: "right" }}>
              Total à payer : {grandTotal.toFixed(2)} €
            </Title>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
              size="large"
            >
              Payer maintenant
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
