import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/ApiClient";

const { Title } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Les mots de passe ne correspondent pas");
        return;
      }

      await registerUser({ email: values.email, password: values.password });
      message.success("Compte créé avec succès !");
      navigate("/login");
    } catch (err) {
      if (err.message.includes("Email déjà utilisé")) {
        message.info("Cet email est déjà enregistré, veuillez vous connecter.");
        navigate("/login");
      } else {
        message.error(err.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title level={3} style={{ textAlign: "center" }}>Créer un compte</Title>
      <Form layout="vertical" onFinish={onFinish} autoComplete="on">
        <Form.Item
          name="email"
          label="Adresse e-mail"
          rules={[{ required: true, message: "Veuillez entrer un e-mail" }]}
        >
          <Input name="email" autoComplete="email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mot de passe"
          rules={[{ required: true, message: "Veuillez entrer un mot de passe" }]}
        >
          <Input.Password name="password" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirmer le mot de passe"
          dependencies={['password']}
          rules={[
            { required: true, message: "Veuillez confirmer le mot de passe" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error("Les mots de passe ne correspondent pas"));
              },
            }),
          ]}
        >
          <Input.Password name="confirmPassword" autoComplete="new-password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            S’inscrire
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="link" onClick={() => navigate("/login")}>
            Déjà un compte ? Connectez-vous
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
