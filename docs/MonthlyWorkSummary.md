距离前端与ChatGPT的融合探索过去一个月，这一个月演进到什么程度了？下面分享下。

一、输出预期代码
什么都不做，直接使用gpt输出的结果不可控，如果希望输出的内容是可控的，目前有两种形式：
1.prompt；
prompt 通过提示设计让gpt输出想要的结果；
2.fine-ture；
微调模型，这种形式目前没有实践效果

system：
你是一个react工程师，使用antd作为UI库。使用recoil库作为状态管理。
1.返回结果只需输出代码，不需要文字解释。
2.开发语言使用typescript

我们先看下直接提问gpt
可以看下如下示例结果：

```jsx
import React from 'react';
import { Form, Input, Button } from 'antd';
import { useRecoilState } from 'recoil';
import { userState } from './recoil/atoms';

const UserForm: React.FC = () => {
  const [user, setUser] = useRecoilState(userState);

  const onFinish = (values: any) => {
    setUser(values);
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        label="User Name"
        name="name"
        rules={[{ required: true, message: 'Please input your user name!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="User Details"
        name="details"
        rules={[{ required: true, message: 'Please input user details!' }]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
```

```jsx
// recoil/atoms.ts
import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: {
    name: '',
    details: '',
  },
});
```

```jsx
// App.tsx
import React from 'react';
import { RecoilRoot } from 'recoil';
import UserForm from './UserForm';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <UserForm />
    </RecoilRoot>
  );
};

export default App;
```

加上prompt的结果


```jsx
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

```
不用prompt输出的内容不可控，使用prompt后输出的内容会按照意愿输出。

输出的代码更像是一个静态页。日常开发要展示服务端数据，这就需要使用chain模拟开发。

二、模拟输出日常开发代码
使用chain概念，可以直接使用langchain项目
比如开发一个表单需要：
1.编写界面
2.store存储数据
3.api请求服务端数据
4.mock数据
...

需要顺序执行chain任务，最后输出想要的代码。
录入chain prompt
![任务链截图](./prompt_chain.png)

执行chain，结果如下：

```jsx
// UserForm.tsx
import React from 'react';
import { Form, Input, Button } from 'antd';
import { useRecoilState } from 'recoil';
import { userState } from '../recoil/atoms';

const { TextArea } = Input;

const UserForm = () => {
  const [user, setUser] = useRecoilState(userState);

  const onFinish = (values) => {
    console.log('Form values:', values);
    setUser(values);
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
// atoms.ts
import { atom } from 'recoil';

type User = {
  username: string;
  userDetails: string;
}

export const userState = atom<User>({
  key: 'userState',
  default: {
    username: '',
    userDetails: '',
  },
});

```
录入了page和store的prompt后输出的代码如上。

三、找到相似任务，创建场景
录入多个场景的prompt后，需要通过输入内容找到相似的prompt，使用向量数据库存储prompt，存储格式如下：
```jsx
{
    pageContent: '创建一个产品详情页，包括产品名称，产品详情，产品名称',
    metadata: {
        qustion: '',
        output: '',
        custom: ''
    }

}
```
pageContent: 向量数据库搜素的内容，支持{custom}，{code}任务链中上一次的内容会放到code里；
qustion：提出的问题
output：希望给出的结果
custom: 可以自定义其他字段

数据目前存储到本地的chroma里，所以如果尝试使用需要安装chroma；

四、修改已有页面
由于产物是源码，源码可手动修改，怎么实现增、删、改
增加：
方式1.取出源码查找向量数据库里的相似代码，code search code，找到prompt给gpt。
方式2.为上一次的操作存储元数据，查找原有任务链上的修改任务prompt

删除：
删除可以直接提供可视化的源码编辑能力，方便快捷，删除后可以使用gpt优化代码；


修改：
选中需要修改的部分，描述需要修改的内容找到prompt进行修改，执行修改chain

上诉逻辑目前只实现了核心代码，还需进一步开发。如下图片让可视项目提供可编辑。修改状态下直接与gpt交互不见得是好的。

![任务链截图](./prompt_chain.png)


五、后续探索
1.录入任务分解
录入需要把如任务先拆解成模块分别输出代码，在合成到一起。
2.录入prompt分析，优化调整
目前只是开发了链路，录入的prompt要怎么维护管理，评价prompt的质量还没有
3.现有项目学习拆解
自行录入prompt还需要人为录入教。能不能自动分析现有项目，自动录入学习。
4.model fine-tures
直接微调模型是否可以减少prompt录入。

目前还处于项目的早期阶段，还有很多问题待解决

开源地址：https://github.com/sparrow-js/firefly










