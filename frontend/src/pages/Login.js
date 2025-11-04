import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/ApiClient";
import { useAuth } from "../context/AuthProvider";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth()

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await loginUser({ email: values.email, password: values.password });

      if (data && data.user) {
        // Stockage du token et de l’admin flag
        setUser(data.user);

        message.success(`Bienvenue ${data.user.email} !`);

        // 🔹 Redirection automatique selon le rôle
        if (data.user.is_admin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        throw new Error("Erreur de connexion");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      message.error(err.message || "Erreur serveur");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Connexion</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Veuillez entrer un email valide" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[{ required: true, message: "Veuillez entrer votre mot de passe" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Se connecter
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
