import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Select, message, Spin } from "antd";
import { getProducts } from "../api/ApiClient";
import { useCart } from "../context/CartProvider";
import ProductCard from "../components/ProductCard";
import "../index.css";

const { Title } = Typography;
const { Option } = Select;

export default function Vitrine() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts();
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
      <div style={{ textAlign: "center", marginTop: 120, color: "#fff", fontFamily: "'Poiret One', cursive" }}>
        <Spin size="large" />
        <Title level={3} style={{ color: "#4ae0ff", marginTop: 20 }}>
          Chargement des créations...
        </Title>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "60px 60px",
        maxWidth: 1400,
        margin: "auto",
        background: "radial-gradient(circle at top left, #2e3b4e, #374a5e, #3f556b)",
        minHeight: "100vh",
      }}
    >
      {/* Titre et select alignés */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <Title
          level={3}
          style={{
            textAlign: "left",
            marginBottom: 0,
            color: "#faf8f5", 
            fontFamily: "'Playfair Display', serif",
            letterSpacing: 1.2,
            fontWeight: 500,
          }}
        >
          L’Atelier de Pierrot
        </Title>

        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="select-categories"
        >
          <Option value="all" style={{ color: "#555" }}>Toutes catégories</Option>
          {categories.map(c => (
            <Option key={c} value={c}>{c}</Option>
          ))}
        </Select>
      </div>

      <Row gutter={[32, 32]} justify="start">
        {filteredProducts.map(p => (
          <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
            <ProductCard
              product={{
                ...p,
                description: p.description,
              }}
              onAddToCart={addToCart}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}
