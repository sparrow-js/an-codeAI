export const demo = [
  {
    pageContent: '创建一个产品详情页，包括产品名称，产品详情，产品名称',
    metadata: {
      source: 1,
      code: `
        import React from 'react';
        import { PageHeader, Descriptions } from 'antd';
        
        type ProductDetailProps = {
          name: string;
          description: string;
          price: number;
        }
        
        const ProductDetail: React.FC<ProductDetailProps> = ({ name, description, price }) => {
          return (
            <>
              <Descriptions bordered>
                <Descriptions.Item label="Product Description" span={3}>
                  {description}
                </Descriptions.Item>
              </Descriptions>
            </>
          );
        }
        
        export default ProductDetail;        
        `,
    },
  },
  {
    pageContent: '新增产品详情页，产品修改人',
    metadata: {
      source: 2,
      code: `
        import React from 'react';
        import { PageHeader, Descriptions } from 'antd';
        
        type ProductDetailProps = {
          name: string;
          description: string;
          fixTime: string;
          price: number;
        }
        
        const ProductDetail: React.FC<ProductDetailProps> = ({ name, description, price }) => {
          return (
            <>
              <Descriptions bordered>
                <Descriptions.Item label="Product Description" span={3}>
                  {description}
                </Descriptions.Item>
                <Descriptions.Item label="Product Fix Time" span={3}>
                  {fixTime}
                </Descriptions.Item>
              </Descriptions>
            </>
          );
        }
        
        export default ProductDetail;        
        `,
    },
  },
  {
    pageContent: `
创建用户表格，包括
1.名称
2.年龄
3.地址
4.标签，使用标签组件，如果标签等于loser使用volcano，其他使用green
5.动作，包括：邀请，删除
    `,
    metadata: {
      source: 3,
      code: `
import React from 'react';
import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const App: React.FC = () => <Table columns={columns} dataSource={data} />;

export default App;
      `,
    },
  },
  {
    pageContent: `
创建用户表单，包括以下字段
注释
性别：包括（男，女，其他），使用选择器
操作按钮包括：提交，重置

选择男，注释设置为：Hi, man!
选择女，注释设置为：Hi, lady!
选择其他，注释设置为：Hi there!
        `,
    metadata: {
      source: 4,
      code: `
import { Button, Form, Input, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const UserForm: React.FC = () => {
  const [form] = Form.useForm();

  const onGenderChange = (value: string) => {
    switch (value) {
      case 'male':
        form.setFieldsValue({ note: 'Hi, man!' });
        break;
      case 'female':
        form.setFieldsValue({ note: 'Hi, lady!' });
        break;
      case 'other':
        form.setFieldsValue({ note: 'Hi there!' });
        break;
      default:
    }
  };

  const onFinish = (values: any) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      {...layout}
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item name="note" label="Note" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
        <Select
          placeholder="Select a option and change input text above"
          onChange={onGenderChange}
          allowClear
        >
          <Option value="male">male</Option>
          <Option value="female">female</Option>
          <Option value="other">other</Option>
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}
      >
        {({ getFieldValue }) =>
          getFieldValue('gender') === 'other' ? (
            <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
      `,
    },
  },
];
