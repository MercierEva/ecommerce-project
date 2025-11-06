import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Typography, Space, Spin, Select } from "antd";
import { getAllOrders, updateOrderStatusAdmin, deleteOrderAdmin } from "../api/ApiClient";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data.map(order => ({
        ...order,
        items: order.items.map(i => ({
          ...i,
          product_name: i.product?.name || "Produit supprimé"
        }))
      })));
    } catch (err) {
      console.error(err);
      message.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchOrders();
  }, [authLoading, user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await deleteOrderAdmin(id);
      message.success("Commande supprimée");
      fetchOrders();
    } catch {
      message.error("Erreur lors de la suppression");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatusAdmin(id, { status: newStatus });
      message.success("Statut mis à jour");
      fetchOrders();
    } catch {
      message.error("Erreur lors de la mise à jour du statut");
    }
  };

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

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", sorter: (a,b)=>a.id-b.id },
    { title: "Client", dataIndex: "user_email", key: "client", render: (text) => text || "Inconnu" }, 
    { title: "Total (€)", dataIndex: "total", key: "total", render: t => t.toFixed(2), sorter: (a,b)=>a.total-b.total },
    { 
      title: "Statut", 
      dataIndex: "status", 
      key: "status",
      render: (status, record) => (
        <Space>
          <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record.id, value)}
            size="small"
            style={{ width: 120 }}
          >
            <Option value="pending">Pending</Option>
            <Option value="paid">Paid</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Space>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Paid", value: "paid" },
        { text: "Shipped", value: "shipped" },
        { text: "Delivered", value: "delivered" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    { title: "Produits", dataIndex: "items", key: "items", render: items => items.map(i => i.product_name).join(", ") },
    { 
      title: "Actions", key: "actions", 
      render: (_, record) => (
        <Space>
          <Button onClick={() => navigate(`/admin/orders/${record.id}`)}>Détails</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Supprimer</Button>
        </Space>
      )
    },
  ];

  if (authLoading || loading) {
    return <div style={{textAlign:"center", padding:80}}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3}>Dashboard des commandes</Title>
      <Space style={{ marginBottom: 16 }}>
        <span>Filtrer par statut :</span>
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
          <Option value="all">Tous</Option>
          <Option value="pending">Pending</Option>
          <Option value="paid">Paid</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </Space>
      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        bordered
      />
    </div>
  );
}
