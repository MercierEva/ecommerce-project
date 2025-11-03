import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Typography, Spin, Tag, Button, message } from "antd";
import { getOrderById } from "../api/ApiClient";

const { Title, Text } = Typography;

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error("Erreur chargement commande:", err);
        message.error("Impossible de charger la commande.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Title level={3}>Commande introuvable</Title>
        <Button onClick={() => navigate("/account")}>Retour à mon compte</Button>
      </div>
    );
  }

  const columns = [
    { title: "Produit", dataIndex: "product_name", key: "product_name" },
    { title: "Quantité", dataIndex: "quantity", key: "quantity" },
    {
      title: "Prix unitaire",
      dataIndex: "price",
      key: "price",
      render: p => `${p.toFixed(2)} €`,
    },
    {
      title: "Sous-total",
      render: (_, item) => `${(item.price * item.quantity).toFixed(2)} €`,
    },
  ];

  const color =
    order.status === "paid"
      ? "green"
      : order.status === "pending"
      ? "orange"
      : order.status === "cancelled"
      ? "red"
      : "blue";

  return (
    <div style={{ maxWidth: 800, margin: "50px auto", padding: "0 20px" }}>
      <Card
        title={<Title level={3}>Commande #{order.id}</Title>}
        extra={<Tag color={color}>{order.status.toUpperCase()}</Tag>}
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <p><Text strong>Date :</Text> {new Date(order.created_at).toLocaleString()}</p>
        <p><Text strong>Total :</Text> {order.total.toFixed(2)} €</p>

        <Title level={4} style={{ marginTop: 30 }}>Articles</Title>
        <Table
          dataSource={order.items || []}
          columns={columns}
          rowKey="id"
          pagination={false}
        />

        <Title level={4} style={{ marginTop: 30 }}>Livraison</Title>
        <p><Text strong>Nom :</Text> {order.shipping_name}</p>
        <p><Text strong>Adresse :</Text> {order.shipping_address}</p>
        <p><Text strong>Ville :</Text> {order.shipping_city}</p>
        <p><Text strong>Code postal :</Text> {order.shipping_postal_code}</p>
        <p><Text strong>Téléphone :</Text> {order.shipping_phone}</p>

        <Button style={{ marginTop: 20 }} onClick={() => navigate("/account")}>
          Retour à mes commandes
        </Button>
      </Card>
    </div>
  );
}
