// src/components/ProductCard.js
import React from "react";
import { Card, Button } from "antd";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <Card
      hoverable
      cover={
        <img
          alt={product.name}
          src={product.image_url}
          style={{ height: 200, objectFit: "cover" }}
        />
      }
      style={{ marginBottom: 16 }}
    >
      <Card.Meta title={product.name} description={product.description} />
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>
          {product.price.toFixed(2)} €
        </span>
        <Button type="primary" onClick={() => addToCart(product)}>
          Ajouter
        </Button>
      </div>
    </Card>
  );
}
