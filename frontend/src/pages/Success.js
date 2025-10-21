// src/pages/Success.js
import React, { useEffect, useState } from "react";
import { Typography, Spin, Result, Button, message } from "antd";
import { getMyOrders } from "../api/ApiClient";

const { Title } = Typography;

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("order_id");
        if (!orderId) throw new Error("Aucun ID de commande fourni");

        const orders = await getMyOrders(); // récupère toutes les commandes de l'utilisateur
        const currentOrder = orders.find((o) => o.id.toString() === orderId);

        if (!currentOrder) throw new Error("Commande introuvable");

        setOrder(currentOrder);
      } catch (err) {
        console.error(err);
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <Result
          status="error"
          title="Commande introuvable"
          subTitle="Nous n'avons pas pu retrouver votre commande."
          extra={[
            <Button type="primary" href="/" key="home">
              Retour à la boutique
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <Result
        status="success"
        title="Paiement réussi 🎉"
        subTitle={`Merci pour votre commande #${order.id}. Vous recevrez un e-mail de confirmation sous peu.`}
        extra={[
          <Button type="primary" href="/" key="home">
            Retour à la boutique
          </Button>,
        ]}
      />
    </div>
  );
}
