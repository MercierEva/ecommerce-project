import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { resetPassword } from "../api/ApiClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ new_password }) => {
    setLoading(true);
    try {
      await resetPassword(token, new_password);
      message.success("Mot de passe mis à jour !");
      navigate("/login");
    } catch (err) {
      message.error(err.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="new_password"
        label="Nouveau mot de passe"
        rules={[{ required: true, message: "Veuillez entrer un mot de passe" }]}
      >
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        Réinitialiser
      </Button>
    </Form>
  );
}
