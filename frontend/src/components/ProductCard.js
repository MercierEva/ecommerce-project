import React from "react";
import { Card, Button, Typography } from "antd";
import "../index.css"; // Assure que les styles globaux sont pris en compte

const { Text } = Typography;

export default function ProductCard({ product, onAddToCart }) {
  return (
    <Card
      hoverable
      cover={<img alt={product.name} src={product.image_url} className="product-card-img" />}
      className="product-card"
    >
      <Card.Meta
        title={<Text strong style={{ fontSize: "1rem", color: "#2e3b4e" }}>{product.name}</Text>}
        description={<Text className="product-card-description">{product.description}</Text>}
      />
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", color: "#ffb347" }}>{product.price.toFixed(2)} €</Text>
        <Button
          onClick={() => onAddToCart?.(product)}
          className="product-card-button"
        >
          Ajouter
        </Button>
      </div>
    </Card>
  );
}
