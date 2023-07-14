import React from 'react';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;

const UserForm = () => {
  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form error:', errorInfo);
  };

  return (
    <Form
      name="userForm"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="用户名称"
        name="username"
        rules={[{ required: true, message: '请输入用户名称' }]}
      >
        <Input placeholder="请输入用户名称" />
      </Form.Item>

      <Form.Item
        label="用户详情"
        name="userDetails"
        rules={[{ required: true, message: '请输入用户详情' }]}
      >
        <TextArea rows={4} placeholder="请输入用户详情" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;