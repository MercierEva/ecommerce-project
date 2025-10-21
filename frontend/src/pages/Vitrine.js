// src/components/Vitrine.js
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Typography, Select, message } from "antd";
import { getProducts } from "../api/ApiClient";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Vitrine({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const bijoux = products.filter(p => p.category === "bijoux");
  const tableaux = products.filter(p => p.category === "tableau");


  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts(); // utilisation de ApiClient.js
        setProducts(data);
        const cats = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
        setCategories(cats);
      } catch (err) {
        console.error("Erreur de chargement produits:", err);
        message.error("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Title level={3}>Chargement des produits...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: 60, maxWidth: 1200, margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
        Les Créations de Pierrot
      </Title>

      <Select
        value={selectedCategory}
        onChange={setSelectedCategory}
        style={{ marginBottom: 30, width: 200 }}
      >
        <Option value="all">Toutes catégories</Option>
        {categories.map(c => (
          <Option key={c} value={c}>
            {c}
          </Option>
        ))}
      </Select>

      <Row gutter={[24, 24]}>
        {filteredProducts.map(p => (
          <Col xs={24} sm={12} md={8} key={p.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={p.name}
                  src={p.image_url}
                  style={{ height: 280, objectFit: "cover", borderRadius: 8 }}
                />
              }
              style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
            >
              <Title level={4}>{p.name}</Title>
              <Text strong>{p.price} €</Text>
              <br />
              <Text type="secondary">{p.category}</Text>
              <br />
              <Button
                type="primary"
                style={{ marginTop: 12 }}
                onClick={() => onAddToCart(p)}
              >
                Ajouter au panier
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
