// src/pages/AdminOrders.js
import React, { useEffect, useState } from "react";
import { List, Card, Typography, message, Tag } from "antd";
import { getAllOrders } from "../api/ApiClient";

const { Title } = Typography;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch {
      message.error("Impossible de charger les commandes");
    }
  };

  return (
    <div>
      <Title level={3}>Commandes clients</Title>
      <List
        dataSource={orders}
        renderItem={(order) => (
          <List.Item>
            <Card
              title={`Commande #${order.id}`}
              style={{ width: "100%" }}
            >
              <p><b>Client :</b> {order.user?.email || "N/A"}</p>
              <p><b>Total :</b> {order.total} €</p>
              <p>
                <b>Statut :</b>{" "}
                <Tag color={order.status === "pending" ? "orange" : "green"}>
                  {order.status}
                </Tag>
              </p>
              <p>
                <b>Produits :</b>
              </p>
              <ul>
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.product?.name} × {item.quantity} — {item.price} €
                  </li>
                ))}
              </ul>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
