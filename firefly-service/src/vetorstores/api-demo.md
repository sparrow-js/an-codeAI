// 

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



//

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




//
分析以下代码创建需要的请求接口：
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { userState } from '../recoil/atoms';

const UserDetail: React.FC = () => {
  const { name, description, age } = useRecoilValue(userState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="User Description" span={3}>
          {description}
        </Descriptions.Item>
        <Descriptions.Item label="User Age" span={3}>
          {age}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default UserDetail;

// atoms.ts

import { atom } from 'recoil';

type User = {
  name: string;
  description: string;
  age: number;
}

export const productState = atom<User>({
  key: 'userState',
  default: {
    name: '',
    description: '',
    age: 0,
  },
}); 



// api.ts
import {  useGetOne } from "./request";

const userResource = '/users';
export interface User {
    id: number;
    name: string;
    description?: string;
    age: number;
}

export const useGetUserDetail = (id: string) => {
    return useGetOne<User>(
        "UserDetail",
        userResource,
        id,
    );
}






//

分析以下代码将接口
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
使用到下面代码当中
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



//


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


// 


分析以下代码将接口
import {  useGetOne } from "./request";

const userResource = '/users';
export interface User {
    id: number;
    name: string;
    description?: string;
    age: number;
}

export const useGetUserDetail = (id: string) => {
    return useGetOne<User>(
        "UserDetail",
        userResource,
        id,
    );
}

使用到下面代码当中
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { userState } from '../recoil/atoms';

const UserDetail: React.FC = () => {
  const { name, description, age } = useRecoilValue(userState);
  
  return (
    <>
      <PageHeader
        title={name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="User Description" span={3}>
          {description}
        </Descriptions.Item>
        <Descriptions.Item label="User Age" span={3}>
          {age}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default UserDetail;

// atoms.ts

import { atom } from 'recoil';

type User = {
  name: string;
  description: string;
  age: number;
}

export const productState = atom<User>({
  key: 'userState',
  default: {
    name: '',
    description: '',
    age: 0,
  },
});










//




import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { PageHeader, Descriptions } from 'antd';
import { userState } from '../recoil/atoms';
import { useGetUserDetail } from "./api";


const UserDetail: React.FC = () => {
  const [user, setUser] = useRecoilState(userState);
  
  useEffect(() => {
    useGetUserDetail('/api/user').then((response) => {
      setUser(response.data);
    });
  }, [setUser]);
  
  return (
    <>
      <PageHeader
        title={user.name}
        subTitle={'title'}
      />
      <Descriptions bordered>
        <Descriptions.Item label="User Description" span={3}>
          {user.description}
        </Descriptions.Item>
        <Descriptions.Item label="User Age" span={3}>
          {user.age}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

export default UserDetail;

// atoms.ts

import { atom } from 'recoil';

type User = {
  name: string;
  description: string;
  age: number;
}

export const userState = atom<User>({
  key: 'userState',
  default: {
    name: '',
    description: '',
    age: 0,
  },
});

// api.ts

import {  useGetOne } from "./request";

const userResource = '/users';
export interface User {
    id: number;
    name: string;
    description?: string;
    age: number;
}

export const useGetUserDetail = (id: string) => {
    return useGetOne<User>(
        "UserDetail",
        userResource,
        id,
    );
}