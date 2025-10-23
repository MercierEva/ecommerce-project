// src/pages/AdminProducts.js
import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Upload,
  List,
  message,
  Card,
  Modal,
  Form,
  Row,
  Space,
  Input,
  Select,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../api/ApiClient";

const { Title } = Typography;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      message.error("Impossible de charger les produits");
    }
  };

  const handleSaveProduct = async (values) => {
    try {
      let image_url = editingProduct?.image_url;
      if (file) {
        const uploaded = await uploadImage(file);
        image_url = uploaded.url;
      }

      const payload = {
        ...values,
        price: parseFloat(values.price),
        image_url,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        message.success("Produit mis à jour !");
      } else {
        await createProduct(payload);
        message.success("Produit créé !");
      }

      form.resetFields();
      setFile(null);
      setEditingProduct(null);
      setIsModalVisible(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      message.error(err.message || "Erreur lors de la sauvegarde du produit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      message.success("Produit supprimé");
      loadProducts();
    } catch {
      message.error("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 30 }}>
        <Title level={3}>Produits</Title>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingProduct(null);
            setIsModalVisible(true);
          }}
        >
          Nouveau produit
        </Button>
      </Row>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={products}
        renderItem={(p) => (
          <List.Item>
            <Card
              cover={
                <img
                  src={p.image_url}
                  alt={p.name}
                  style={{ height: 220, objectFit: "cover", borderRadius: "8px" }}
                />
              }
              actions={[
                <EditOutlined key="edit" onClick={() => {
                  setEditingProduct(p);
                  form.setFieldsValue(p);
                  setIsModalVisible(true);
                }} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(p.id)} />,
              ]}
            >
              <Card.Meta
                title={<b>{p.name}</b>}
                description={<span>{p.price} €</span>}
              />
              <p style={{ marginTop: 8, color: "#666" }}>{p.description}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingProduct ? "Modifier le produit" : "Créer un produit"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSaveProduct}>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Prix (€)" rules={[{ required: true }]}>
            <Input type="number" min="0" step="0.01" />
          </Form.Item>
          <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
            <Select placeholder="Choisir une catégorie">
              <Select.Option value="bijoux">Bijoux</Select.Option>
              <Select.Option value="tableau">Tableaux</Select.Option>
            </Select>
          </Form.Item>
          <Upload beforeUpload={(f) => (setFile(f), false)} maxCount={1}>
            <Button icon={<UploadOutlined />}>Uploader une image</Button>
          </Upload>
          <Button type="primary" htmlType="submit" block style={{ marginTop: 15 }}>
            {editingProduct ? "Mettre à jour" : "Créer"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
