import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

const GoodsForm = () => {
  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form error:', errorInfo);
  };

  return (
    <Form
      name="goodsForm"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="货物名称"
        name="goodsName"
        rules={[{ required: true, message: '请输入货物名称' }]}
      >
        <Input placeholder="请输入货物名称" />
      </Form.Item>

      <Form.Item
        label="货物详情"
        name="goodsDetails"
        rules={[{ required: true, message: '请输入货物详情' }]}
      >
        <TextArea rows={4} placeholder="请输入货物详情" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default GoodsForm;