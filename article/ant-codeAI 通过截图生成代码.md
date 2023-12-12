### 一、✨简介
最近开源项目screenshot-to-code火爆，在screenshot-to-code基础上将后端代码改为node，开源地址[ant-codeAI](https://github.com/sparrow-js/ant-codeAI)，提供截图生成代码的功能，使用GPT-4 Vision生成，在原有（React，Tailwind CSS）等代码基础上，新增react/ant design的代码输出，后续会逐步迭代自己的创意。
### 二、🚀 本地试用
可以先下载下来本地运行尝试，将尽快找服务器部署到线上，（有没有免费的部署环境帮推荐一个🤦‍♂️）。腾讯云有部署如需要尝试可以私聊。
```shell
cd client
yarn dev


cd service
npm run start:dev
```
### 三、🛠 设置
![289367350-2daf0da1-dc53-4c2a-b450-2667abcf940b.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702350602213-cb05d7ce-c7c2-4697-b3d3-ed4956991cb2.png#averageHue=%23fefefe&clientId=u9659d4b8-50be-4&from=drop&height=396&id=uf0b7c3b5&originHeight=914&originWidth=1116&originalType=binary&ratio=2&rotation=0&showTitle=false&size=107612&status=done&style=none&taskId=u595b0047-4951-413f-81bf-739df9bdb11&title=&width=484)

- OpenAI API Key
- OpenAI Base URL：代理地址，默认：[https://api.openai.com/v1](https://api.openai.com/v1)
- Mock AI Response：模拟 AI返回的数据，不直接请求openAI，请求OpenAI 接口会消耗费用。
### 四、🔥 使用场景
试用通过图片生成的代码细节准确度不高。可以用于快速验证方案、对细节不敏感的项目、在生成的代码基础上自行补全细节。

- 中后台项目
- 快速验证方案，对还原度要求不高的项目
- 生成代码后二次开发

![289540880-781e496e-6141-413b-804a-72e7c17f0fe1.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702350890010-508d61d6-b2bd-4bde-9aec-43762f77cda6.png#averageHue=%23fbfbfb&clientId=u9659d4b8-50be-4&from=drop&id=uffc45433&originHeight=1338&originWidth=2694&originalType=binary&ratio=2&rotation=0&showTitle=false&size=304904&status=done&style=none&taskId=u3bae4fe3-35e8-418e-8657-62aa68977dd&title=)
### 五、⌨️ 输出代码
```html
<html>
<head>
  <title>Registration Form</title>
  <link rel="stylesheet" href="https://unpkg.com/antd@5.12.1/dist/antd.min.css">
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/dayjs@1.11.10/dayjs.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.js"></script>
  <script src="https://unpkg.com/antd@5.12.1/dist/antd.min.js"></script>

  <script type="text/babel">
    const { Form, Input, Cascader, Checkbox, Button,  Select} = antd;

    const residenceOptions = [
      {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [
              {
                value: 'westlake',
                label: 'West Lake',
              },
            ],
          },
        ],
      },
      // ...other province options
    ];

    function RegistrationForm() {
      return (
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
        >
          <Form.Item label="Nickname" required tooltip="This is a required field">
            <Input placeholder="" />
          </Form.Item>
          <Form.Item label="Habitual Residence" required>
            <Cascader
              options={residenceOptions}
              defaultValue={['zhejiang', 'hangzhou', 'westlake']}
              placeholder="Please select your habitual residence"
            />
          </Form.Item>
          <Form.Item label="Phone Number" required>
            <Input addonBefore={<Select defaultValue="+86" style={{ width: 70 }}>
              {/* Add other country codes as needed */}
            </Select>} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Donation" required>
            <Input placeholder="" />
          </Form.Item>
          <Form.Item label="Website" required>
            <Input placeholder="website" />
          </Form.Item>
          <Form.Item label="Intro" required>
            <Input.TextArea showCount maxLength={100} />
          </Form.Item>
          <Form.Item label="Gender" required>
            <Select placeholder="select your gender">
              {/* Add gender options as needed */}
            </Select>
          </Form.Item>
          <Form.Item label="Captcha" extra="We must make sure that your are a human.">
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Checkbox>I have read the agreement</Checkbox>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary">Register</Button>
          </Form.Item>
        </Form>
      );
    }

    ReactDOM.render(<RegistrationForm />, document.getElementById('root'));
  </script>
</body>
</html>
```
### 六、🙋‍♂️ 开源地址
[ant-codeAI](https://github.com/sparrow-js/ant-codeAI)
### 七、🤝 合作试用
可以私聊联系，请求openAI接口需要消耗费用，所以需要一定费用
## 
