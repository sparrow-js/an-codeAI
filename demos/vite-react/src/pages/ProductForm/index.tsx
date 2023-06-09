import React from "react";
import { Form, Input, Button, DatePicker } from "antd";

const { TextArea } = Input;

const ProductForm = () => {
  const onFinish = (values) => {
    console.log("Form values:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form error:", errorInfo);
  };

  return (
    <Form
      name="productForm"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="产品名称"
        name="productName"
        rules={[{ required: true, message: "请输入产品名称" }]}
      >
        <Input placeholder="请输入产品名称" />
      </Form.Item>

      <Form.Item
        label="产品详情"
        name="productDetail"
        rules={[{ required: true, message: "请输入产品详情" }]}
      >
        <TextArea rows={4} placeholder="请输入产品详情" />
      </Form.Item>

      <Form.Item
        label="发布时间"
        name="publishTime"
        rules={[{ required: true, message: "请选择发布时间" }]}
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交产品
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
