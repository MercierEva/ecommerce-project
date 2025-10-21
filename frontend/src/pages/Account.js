// src/pages/Account.js
import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, Spin, message } from "antd";
import { getMyOrders } from "../api/ApiClient";

const { Title, Text } = Typography;

export default function Account({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Erreur récupération commandes:", err);
        message.error("Erreur lors du chargement des commandes.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const columns = [
    {
      title: "Commande #",
      dataIndex: "id",
      key: "id",
      render: id => <Text strong>#{id}</Text>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: "Montant total",
      dataIndex: "total_price",
      key: "total_price",
      render: price => `${price.toFixed(2)} €`,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: status => {
        const color =
          status === "livrée"
            ? "green"
            : status === "expédiée"
            ? "blue"
            : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Title level={3}>Veuillez vous connecter pour voir votre compte.</Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "50px auto", padding: "0 20px" }}>
      <Card
        title={<Title level={3}>Mon compte</Title>}
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 12 }}
      >
        <p><Text strong>Email :</Text> {user.email}</p>
        <p><Text strong>Rôle :</Text> {user.is_admin ? "Administrateur" : "Client"}</p>
        <p>
          <Text strong>Date d’inscription :</Text>{" "}
          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
        </p>
      </Card>

      <Card
        title={<Title level={4}>Historique de mes commandes</Title>}
        style={{ marginTop: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 12 }}
      >
        {orders.length > 0 ? (
          <Table dataSource={orders} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
        ) : (
          <p style={{ textAlign: "center", margin: "20px 0" }}>
            Vous n’avez pas encore passé de commande.
          </p>
        )}
      </Card>
    </div>
  );
}
