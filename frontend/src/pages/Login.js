import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password);

      message.success(`Bienvenue ${user.email} !`);
      navigate(user.is_admin ? "/admin" : "/");
    } catch (err) {
      if (err.message.includes("introuvable")) {
        message.info("Cet email n'existe pas. Vous pouvez créer un compte.");
        navigate("/register");
      } else if (err.message.includes("passe incorrect")) {
        message.warning(
          "Mot de passe incorrect. Veuillez réessayer ou utiliser 'Mot de passe oublié ?'."
        );
      } else {
        message.error(err.message || "Erreur serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Connexion</Title>
      <Form layout="vertical" onFinish={onFinish} autoComplete="on">
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Veuillez entrer un email valide" }]}
        >
          <Input name="email" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[{ required: true, message: "Veuillez entrer votre mot de passe" }]}
        >
          <Input.Password name="password" autoComplete="current-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Se connecter
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => navigate("/forgot-password")}>
            Mot de passe oublié ?
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => navigate("/register")}>
            Créer un compte
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
