import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { forgotPassword } from "../api/ApiClient";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      message.success("Si l'utilisateur existe, un email de réinitialisation a été envoyé");
    } catch (err) {
      message.error(err.message || "Erreur lors de la demande de réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, type: "email", message: "Veuillez entrer un email valide" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Réinitialiser le mot de passe
        </Button>
      </Form.Item>
    </Form>
  );
}
