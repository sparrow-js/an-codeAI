export const demo = [
  {
    pageContent: '创建一个产品详情页，包括产品名称，产品详情，产品名称',
    metadata: {
      source: 1,
      output: `
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
      output: `
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
      output: `
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
      output: `
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
  {
    pageContent: '将代码的变量使用recoil存储:{code}',
    metadata: {
      source: 4,
      question: `
将代码的变量使用recoil存储:
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
      output: `
// page.tsx
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState } from '../recoil/atoms';

const ProductDetail: React.FC = () => {
  const { name, description, price } = useRecoilValue(productState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default ProductDetail;

// store.ts

import { atom } from 'recoil';

type Product = {
  name: string;
  description: string;
  price: number;
}

export const productState = atom<Product>({
  key: 'productState',
  default: {
    name: '',
    description: '',
    price: 0,
  },
});
      `,
    },
  },
  {
    pageContent: `
分析以下代码生成mock数据：

// api.ts

import {  useGetOne } from "./request";

const projectResource = '/projects';
export interface Project {
    id: number;
    name: string;
    description?: string;
}

export const useGetProjectDetail = (id: string) => {
    return useGetOne<Project>(
        "ProjectDetail",
        projectResource,
        id,
    );
}  
    `,
    metadata: {
      source: 4,
      output: `
// mock.ts
import { MockMethod } from 'vite-plugin-mock';

const mockProjects = {
  total: 200,
  list: [
    {
      id: 1,
      name: 'Project1',
      description: 'description',
    },
    {
      id: 2,
      name: 'Project2',
      description: 'description',
    },
  ]
}

export default [
  {
    url: '/api/v1/projectDetail',
    method: 'get',
    response: ({ query }) => {
      return mockProjects;
    },
  },
] as MockMethod[];
      `,
    },
  },
  {
    pageContent: '分析以下代码创建所需要的请求接口：{code}',
    metadata: {
      source: 1,
      question: `
分析以下代码创建需要的请求接口：
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState } from '../recoil/atoms';

const ProductDetail: React.FC = () => {
  const { name, description, price } = useRecoilValue(productState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default ProductDetail;

// atoms.ts

import { atom } from 'recoil';

type Product = {
  name: string;
  description: string;
  price: number;
}

export const productState = atom<Product>({
  key: 'productState',
  default: {
    name: '',
    description: '',
    price: 0,
  },
});
          `,
      output: `
// api.ts
import {  useGetOne } from "./request";

const projectResource = '/projects';
export interface Project {
    id: number;
    name: string;
    description?: string;
}

export const useGetProjectDetail = (id: string) => {
    return useGetOne<Project>(
        "ProjectDetail",
        projectResource,
        id,
    );
}
      `,
    },
  },
  {
    pageContent: '分析以下代码将接口{api}使用到下面代码当中:{code}',
    metadata: {
      source: 1,
      question: `
分析以下代码将接口: 
// api.ts
import {  useGetOne } from "./request";

const projectResource = '/projects';
export interface Project {
    id: number;
    name: string;
    description?: string;
}

export const useGetProjectDetail = (id: string) => {
    return useGetOne<Project>(
        "ProjectDetail",
        projectResource,
        id,
    );
}
使用到下面代码当中:
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState } from '../recoil/atoms';

const ProductDetail: React.FC = () => {
  const { name, description, price } = useRecoilValue(productState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default ProductDetail;

// atoms.ts

import { atom } from 'recoil';

type Product = {
  name: string;
  description: string;
  price: number;
}

export const productState = atom<Product>({
  key: 'productState',
  default: {
    name: '',
    description: '',
    price: 0,
  },
});
      `,
      api: `
// api.ts
import {  useGetOne } from "./request";

const projectResource = '/projects';
export interface Project {
    id: number;
    name: string;
    description?: string;
}

export const useGetProjectDetail = (id: string) => {
    return useGetOne<Project>(
        "ProjectDetail",
        projectResource,
        id,
    );
}
      `,
      code: `
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState } from '../recoil/atoms';

const ProductDetail: React.FC = () => {
  const { name, description, price } = useRecoilValue(productState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default ProductDetail;

// atoms.ts

import { atom } from 'recoil';

type Product = {
  name: string;
  description: string;
  price: number;
}

export const productState = atom<Product>({
  key: 'productState',
  default: {
    name: '',
    description: '',
    price: 0,
  },
});
      `,
      output: `
      import React, { useEffect } from 'react';
      import { useRecoilState } from 'recoil';
      import { PageHeader, Descriptions } from 'antd';
      import { productState } from '../recoil/atoms';
      import { useGetProjectDetail } from "./api";
      
      
      const ProductDetail: React.FC = () => {
        const [product, setProduct] = useRecoilState(productState);
        
        useEffect(() => {
          useGetProjectDetail('/api/product').then((response) => {
            setProduct(response.data);
          });
        }, [setProduct]);
        
        return (
          <>
            <PageHeader
              title={product.name}
              subTitle={'product.price'}
            />
            <Descriptions bordered>
              <Descriptions.Item label="Product Description" span={3}>
                {product.description}
              </Descriptions.Item>
            </Descriptions>
          </>
        );
      }
      
      export default ProductDetail;
      
      // atoms.ts
      
      import { atom } from 'recoil';
      
      type Product = {
        name: string;
        description: string;
        price: number;
      }
      
      export const productState = atom<Product>({
        key: 'productState',
        default: {
          name: '',
          description: '',
          price: 0,
        },
      });
      
      // api.ts
      
      import {  useGetOne } from "./request";
      
      const projectResource = '/projects';
      export interface Project {
          id: number;
          name: string;
          description?: string;
      }
      
      export const useGetProjectDetail = (id: string) => {
          return useGetOne<Project>(
              "ProjectDetail",
              projectResource,
              id,
          );
      }
          `,
    },
  },
];
