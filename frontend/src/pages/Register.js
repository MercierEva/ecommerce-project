import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/ApiClient";
import { useAuth } from "../context/AuthContext";


const { Title } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await registerUser(values);
      message.success("Compte créé avec succès !");
      await login(values.email, values.password); // connexion automatique
      navigate("/");
    } catch (err) {
      message.error(err.message || "Erreur à l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Créer un compte</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Adresse e-mail"
          rules={[{ required: true, message: "Veuillez entrer un e-mail" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[{ required: true, message: "Veuillez entrer un mot de passe" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}  disabled={loading} block>
            S’inscrire
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
