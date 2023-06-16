<!-- 创建一个产品详情页，包括产品名称，产品详情，产品名称 -->
```jsx
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
```

<!-- 将上面代码的变量使用recoil存储 -->
```jsx
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
        subTitle={`$${price}`}
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
```

<!-- 创建接口返回上面代码需要的数据 -->
```jsx
interface Product {
  name: string;
  description: string;
  price: number;
}

const getProductData = async (): Promise<Product> => {
  // 假设从后端获取数据
  const response = await fetch('/api/product');
  const data = await response.json();
  
  return {
    name: data.name,
    description: data.description,
    price: data.price,
  };
};

export default getProductData;
```

<!-- 将上面接口融合到代码当中调用 -->
```jsx
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState } from '../recoil/atoms';
import getProductData from '../api/product';

const ProductDetail: React.FC = () => {
  const setProductState = useSetRecoilState(productState);

  useEffect(() => {
    const fetchData = async () => {
      const productData = await getProductData();
      setProductState(productData);
    };

    fetchData();
  }, [setProductState]);

  const { name, description, price } = useRecoilValue(productState);

  return (
    <>
      <PageHeader
        title={name}
        subTitle={`$${price}`}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default ProductDetail;
```

<!-- 增加产品发布时间字段 -->
```jsx
// atoms.ts

import { atom } from 'recoil';

export interface Product {
  name: string;
  description: string;
  price: number;
  publishTime: Date;
}

export const productState = atom<Product>({
  key: 'productState',
  default: {
    name: '',
    description: '',
    price: 0,
    publishTime: new Date(),
  },
});

// api/product.ts

const getProductData = async (): Promise<Product> => {
  const response = await fetch('/api/product');
  const data = await response.json();

  return {
    name: data.name,
    description: data.description,
    price: data.price,
    publishTime: new Date(data.publishTime),
  };
};

export default getProductData;

// ProductDetail.tsx

import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { productState, Product } from '../recoil/atoms';
import getProductData from '../api/product';

const ProductDetail: React.FC = () => {
  const setProductState = useSetRecoilState(productState);

  useEffect(() => {
    const fetchData = async () => {
      const productData: Product = await getProductData();
      setProductState(productData);
    };

    fetchData();
  }, [setProductState]);

  const { name, description, price, publishTime } = useRecoilValue(productState);

  return (
    <>
      <PageHeader
        title={name}
        subTitle={`Price: $${price}`}
        extra={[
          <div key="publish-time">Published on {publishTime.toLocaleDateString()}</div>
        ]}
      />
      <Descriptions bordered>
        <Descriptions.Item label="Product Description" span={3}>
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default ProductDetail;
```


<!-- 生成mock数据 -->
```jsx
import Mock from 'mockjs';

const mockData = Mock.mock({
  'name': '@ctitle(5, 10)',
  'description': '@cparagraph(3, 6)',
  'price|1-9999': 1,
  'publishTime': '@datetime',
});

export default mockData;
```