import React from "react";
import { Result, Button } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Cancel() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  return (
    <Result
      status="error"
      title="💳 Paiement annulé"
      subTitle={
        orderId
          ? `Le paiement pour la commande #${orderId} a été annulé. Vous pouvez réessayer ou modifier votre panier.`
          : "Le paiement a été annulé avant validation."
      }
      extra={[
        <Button type="primary" key="retry" onClick={() => navigate("/cart-checkout")}>
          Réessayer le paiement
        </Button>,
        <Button key="home" onClick={() => navigate("/")}>
          Retour à la boutique
        </Button>,
      ]}
      style={{ marginTop: 80 }}
    />
  );
}
