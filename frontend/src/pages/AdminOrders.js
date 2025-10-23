import React, { useEffect, useState } from "react";
import { Table, Typography, Tag, message, Spin } from "antd";
import { getMyOrders } from "../api/ApiClient";

const { Title, Text } = Typography;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders(); // tu peux créer une route adminOrders si besoin
        setOrders(data);
      } catch (err) {
        console.error(err);
        message.error("Impossible de charger les commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    {
      title: "Commande #",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Montant total",
      dataIndex: "total",
      key: "total",
      render: (price) => `${price.toFixed(2)} €`,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "paid"
            ? "green"
            : status === "pending"
            ? "orange"
            : status === "cancelled"
            ? "red"
            : "blue";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 20 }}>
        Gestion des commandes
      </Title>
      {orders.length > 0 ? (
        <Table dataSource={orders} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      ) : (
        <p style={{ textAlign: "center" }}>Aucune commande enregistrée.</p>
      )}
    </div>
  );
}
