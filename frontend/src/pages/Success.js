import React, { useEffect, useState } from "react";
import { Result, Button, Spin } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartProvider";

export default function Success() {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const idStr = params.get("order_id");
    const id = idStr ? parseInt(idStr, 10) : null;
    setOrderId(id);

    setTimeout(() => setLoading(false), 1000);
  }, [params]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" tip="Validation du paiement..." />
      </div>
    );
  }

  return (
    <Result
      status="success"
      title="🎉 Paiement réussi !"
      subTitle={`Votre commande #${orderId} a bien été payée. Vous recevrez un e-mail de confirmation sous peu.`}
      extra={[
        <Button type="primary" key="home" onClick={() => navigate("/")}>
          Retour à la boutique
        </Button>,
        <Button key="orders" onClick={() => navigate("/account")}>
          Voir mes commandes
        </Button>,
      ]}
      style={{ marginTop: 80 }}
    />
  );
}
