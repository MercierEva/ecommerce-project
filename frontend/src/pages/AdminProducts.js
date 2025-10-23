import React, { useEffect, useState } from "react";
import {
  Row,
  List,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Typography,
  Space,
} from "antd";
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
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
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      message.error("Impossible de charger les produits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setFile(null);
    setIsModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      message.success("Produit supprimé !");
      loadProducts();
    } catch (err) {
      message.error("Impossible de supprimer le produit");
    }
  };

  const handleSaveProduct = async (values) => {
    try {
      let image_url = editingProduct?.image_url;
      if (file) {
        const uploaded = await uploadImage(file);
        image_url = uploaded.url;
      }

      const payload = { ...values, price: parseFloat(values.price), image_url };

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

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={2}>Gestion des produits</Title>
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={openCreateModal}>
          Nouveau produit
        </Button>
      </Row>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={products}
        loading={loading}
        renderItem={(p) => (
          <List.Item>
            <Card
              hoverable
              cover={<img src={p.image_url} alt={p.name} style={{ height: 220, objectFit: "cover", borderRadius: 8 }} />}
              actions={[
                <EditOutlined key="edit" onClick={() => openEditModal(p)} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(p.id)} />,
              ]}
            >
              <Card.Meta title={p.name} description={`${p.price} €`} />
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
        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Nom du produit" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Description du produit" />
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
          <Upload beforeUpload={(f) => { setFile(f); return false; }} maxCount={1}>
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
