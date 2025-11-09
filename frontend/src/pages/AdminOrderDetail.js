import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Typography, Spin, Tag, Button, Space, Select, message } from "antd";
import { getOrderByIdAdmin, updateOrderStatusAdmin, deleteOrderAdmin } from "../api/ApiClient";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrderByIdAdmin(id);
      // Préparer product_name pour chaque item
      data.items = data.items.map(i => ({
        ...i,
        product_name: i.product?.name || "Produit supprimé"
      }));
      setOrder(data);
    } catch (err) {
      console.error(err);
      message.error("Impossible de charger la commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatusAdmin(order.id, { status: newStatus });
      message.success("Statut mis à jour");
      fetchOrder();
    } catch {
      message.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await deleteOrderAdmin(order.id);
      message.success("Commande supprimée");
      navigate("/admin/orders");
    } catch {
      message.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <div style={{textAlign:"center", padding:80}}><Spin size="large" /></div>;
  if (!order) return (
    <div style={{textAlign:"center", padding:80}}>
      <Title level={3}>Commande introuvable</Title>
      <Button onClick={() => navigate("/admin/orders")}>Retour aux commandes</Button>
    </div>
  );

  const statusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "paid": return "green";
      case "shipped": return "blue";
      case "delivered": return "purple";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const columns = [
    { title: "Produit", dataIndex: "product_name", key: "product_name" },
    { title: "Quantité", dataIndex: "quantity", key: "quantity" },
    { title: "Prix unitaire", dataIndex: "price", key: "price", render: p => `${p.toFixed(2)} €` },
    { title: "Sous-total", key: "subtotal", render: (_, item) => `${(item.price * item.quantity).toFixed(2)} €` },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <Card
        title={<Title level={3}>Commande #{order.id}</Title>}
        extra={
          <Space>
            <Tag color={statusColor(order.status)}>{order.status.toUpperCase()}</Tag>
            <Select 
              value={order.status} 
              onChange={handleStatusChange} 
              size="small"
              style={{ width: 140 }}
              loading={updatingStatus}
            >
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Button danger onClick={handleDelete}>Supprimer</Button>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <p><Text strong>Date :</Text> {new Date(order.created_at).toLocaleString()}</p>
        <p><Text strong>Client :</Text> {order.user_email || "Inconnu"}</p>
        <p><Text strong>Total :</Text> {order.total.toFixed(2)} €</p>

        <Title level={4} style={{ marginTop: 20 }}>Articles</Title>
        <Table
          dataSource={order.items || []}
          columns={columns}
          rowKey="id"
          pagination={false}
        />

        <Title level={4} style={{ marginTop: 20 }}>Livraison</Title>
        <p><Text strong>Nom :</Text> {order.shipping_name}</p>
        <p><Text strong>Adresse :</Text> {order.shipping_address}</p>
        <p><Text strong>Ville :</Text> {order.shipping_city}</p>
        <p><Text strong>Code postal :</Text> {order.shipping_postal_code}</p>
        {order.shipping_phone && <p><Text strong>Téléphone :</Text> {order.shipping_phone}</p>}

        <Button style={{ marginTop: 20 }} onClick={() => navigate("/admin/orders")}>
          Retour aux commandes
        </Button>
      </Card>
    </div>
  );
}
