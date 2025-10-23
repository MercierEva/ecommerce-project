import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✅ Hook pour gérer l'auth
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password); // la fonction login vient du AuthContext
      message.success("Connecté avec succès !");
      navigate("/"); // redirection après login
    } catch (err) {
      console.error(err);
      message.error("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: "Veuillez saisir votre email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[{ required: true, message: "Veuillez saisir votre mot de passe" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Connexion
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
