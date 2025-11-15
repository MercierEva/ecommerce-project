import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { changePassword } from "../api/ApiClient";

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.old_password,
        newPassword: values.new_password
      });
      message.success("Mot de passe mis à jour !");
    } catch (err) {
      message.error(err.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Ancien mot de passe"
        name="old_password"
        rules={[{ required: true, message: "Veuillez entrer l'ancien mot de passe" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Nouveau mot de passe"
        name="new_password"
        rules={[{ required: true, message: "Veuillez entrer le nouveau mot de passe" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Changer le mot de passe
        </Button>
      </Form.Item>
    </Form>
  );
}
