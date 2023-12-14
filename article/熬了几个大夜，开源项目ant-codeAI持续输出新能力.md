### 一、背景
由于裁员失业在家最近也没有面试机会，所以有时间写写开源项目，花了两天时间把screenshot-to-code的后端代码改成了node [开源地址](https://github.com/sparrow-js/ant-codeAI)，用了一天时间研究了下腾讯云部署，把项目成功部署到腾讯云[临时地址](https://service-1fiqz1da-1253530766.gz.tencentapigw.com/release/)，这两天为ant-codeAI增加了自定义prompt 例子的新能力，让输出的代码更可控有用武之地。
### 二、新功能介绍
使用可以参考这篇文章：[点这里](https://juejin.cn/post/7311343229207609395)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702530592972-871069a3-12cb-43ef-9fe3-3893802e6241.png#averageHue=%23fcfcfc&clientId=u657c84d7-cbf1-4&from=paste&height=204&id=u5Wgp&originHeight=986&originWidth=2782&originalType=binary&ratio=2&rotation=0&showTitle=false&size=136557&status=done&style=none&taskId=u782a0a61-2342-4482-9a04-6be16af93c6&title=&width=575)
新增prompt 示例功能是因为输出的代码和希望输出的代码不符，所以通过提供示例的方式让openAI输出相似的代码。下面来看下添加示例后的效果：
#### 1.原图
![截屏2023-12-12 下午6.51.54.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702532533466-26ae1ef1-b154-4bd7-845f-ac6d0d5ea6dd.png#averageHue=%23fcfcfc&clientId=u657c84d7-cbf1-4&from=drop&height=168&id=u7eeb399d&originHeight=590&originWidth=1898&originalType=binary&ratio=2&rotation=0&showTitle=false&size=111158&status=done&style=none&taskId=u0d956795-30b6-4404-9571-f793b4e5864&title=&width=539)
#### 2.不使用prompt 示例：
生成的网页，图片右侧
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702532192281-7f5efdb0-25f9-4743-ab04-0cb608d845aa.png#averageHue=%23fafafa&clientId=u657c84d7-cbf1-4&from=paste&height=282&id=u311a4126&originHeight=1434&originWidth=2848&originalType=binary&ratio=2&rotation=0&showTitle=false&size=247375&status=done&style=none&taskId=uafefb667-2d21-48af-924e-ddcb2b3431b&title=&width=560)
输出的代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ant Design Form Example</title>
    <script src="https://registry.npmmirror.com/react/18.2.0/files/umd/react.development.js"></script>
    <script src="https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.development.js"></script>
    <script src="https://registry.npmmirror.com/@babel/standalone/7.23.6/files/babel.js"></script>
    <script src="https://registry.npmmirror.com/dayjs/1.11.10/files/dayjs.min.js"></script>
    <script src="https://registry.npmmirror.com/antd/5.12.2/files/dist/antd.js"></script>
    <script src="https://registry.npmmirror.com/@ant-design/pro-components/2.6.43/files/dist/pro-components.min.js"></script>
    <link rel="stylesheet" href="https://registry.npmmirror.com/antd/5.12.2/files/dist/antd.css">
</head>
<body>
<div id="container"></div>

<script type="text/babel">
    const { ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormSwitch } = ProComponents;
    const { Card } = antd;

    function App() {
        return (
            <div style={{ background: '#ECECEC', padding: '30px' }}>
                <Card title="任务管理" bordered={false} style={{ width: '100%' }}>
                    <ProForm layout="horizontal" submitter={false}>
                        <ProForm.Group>
                            <ProFormText width="md" name="taskName" label="任务名" placeholder="Please enter" />
                            <ProFormText width="md" name="taskDesc" label="任务描述" placeholder="Please enter" />
                            <ProFormSelect width="md" name="executor" label="执行人" placeholder="Please select" />
                        </ProForm.Group>
                        <ProForm.Group>
                            <ProFormDatePicker width="md" name="startDate" label="生效日期" placeholder="请选择日期" />
                            <ProFormSwitch name="status" label="生效启用" />
                            <ProFormSelect width="md" name="taskType" label="任务类型" placeholder="Please select" />
                        </ProForm.Group>
                    </ProForm>
                </Card>
            </div>
        );
    }

    ReactDOM.render(<App />, document.getElementById('container'));
</script>
</body>
</html>

```
#### 3.使用prompt 示例：
生成的网页，图片右侧
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702532436756-67b9f7d4-e373-4bf4-87f0-e705b0226040.png#averageHue=%23fbfbfb&clientId=u657c84d7-cbf1-4&from=paste&height=732&id=u3bd27553&originHeight=1464&originWidth=2842&originalType=binary&ratio=2&rotation=0&showTitle=false&size=259810&status=done&style=none&taskId=ucc60ab77-4592-4c88-92d6-75b9fb6ef64&title=&width=1421)
输出的代码
```html
<html>
<head>
  <meta charset="UTF-8">
  <title>Form Layout</title>
  <style>
    #app {
      background-color: #f0f2f5;
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .ant-row {
      margin-bottom: 24px;
    }
    .ant-col-8 {
      padding-right: 8px;
    }
    .ant-col-16 {
      padding-left: 8px;
    }
  </style>
  <script src="https://registry.npmmirror.com/react/18.2.0/files/umd/react.development.js"></script>
  <script src="https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.development.js"></script>
  <script src="https://registry.npmmirror.com/@babel/standalone/7.23.6/files/babel.js"></script>
  <script src="https://registry.npmmirror.com/dayjs/1.11.10/files/dayjs.min.js"></script>
  <script src="https://registry.npmmirror.com/antd/5.12.2/files/dist/antd.js"></script>
  <script src="https://registry.npmmirror.com/@ant-design/pro-components/2.6.43/files/dist/pro-components.min.js"></script>
</head>
<body>
<div id="app"></div>

<script type="text/babel">
  const { Card, Col, Row } = antd;
  const { ProForm, ProFormText, ProFormSelect, ProFormSwitch, ProFormDatePicker } = ProComponents;

  function App() {
    return (
      <ProForm>
        <Card title="任务管理" bordered={false}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="taskName"
                label="任务名"
                placeholder="Please enter"
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="taskDesc"
                label="任务描述"
                placeholder="Please enter"
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="executor"
                label="执行人"
                placeholder="Please select"
                options={[
                  { label: '请选择', value: 'option1' },
                  { label: '选项二', value: 'option2' },
                  { label: '选项三', value: 'option3' }
                ]}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormSelect
                name="approver"
                label="审批人"
                placeholder="Please select"
                options={[
                  { label: '请选择审批人员', value: 'option1' },
                  { label: '审批人员二', value: 'option2' },
                  { label: '审批人员三', value: 'option3' }
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormDatePicker
                name="startDate"
                label="生效日期"
                placeholder="请选择日期"
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="taskType"
                label="任务类型"
                placeholder="Please select"
                options={[
                  { label: '请选择任务类型', value: 'option1' },
                  { label: '类型二', value: 'option2' },
                  { label: '类型三', value: 'option3' }
                ]}
              />
            </Col>
          </Row>
        </Card>
      </ProForm>
    );
  }

  ReactDOM.render(<App />, document.getElementById('app'));
</script>
</body>
</html>
```

三、录入prompt
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34596612/1702533652077-c7020c60-a9a2-4620-a106-cf8d686b576a.png#averageHue=%23fefefe&clientId=u657c84d7-cbf1-4&from=paste&height=518&id=ud471e751&originHeight=1036&originWidth=1104&originalType=binary&ratio=2&rotation=0&showTitle=false&size=93670&status=done&style=none&taskId=u8e81da2f-98b9-44d9-9df3-6166edcd86e&title=&width=552)

- promp example：prompt 的示例，（必填项）
- prompt name：展示的名称（非必填）
- prompt des：详情（非必填）
- prompt img url：展示的图片地址
### 四、试用感受

- 输出内容不稳定可能相同的输入信息每次返回的信息不一样。
- 对于前端开发来说，辅助开发可以，看接受度是否愿意尝试使用还是完全自己手写。
- 需要支付费用，每次调用openAI 接口大概需要0.3元。
- 英文截图生成的效果比中文截图好。
- 对于运营，对还原效果有一定容忍度可以作为运营生成静态页面推广文章等用途使用。
### 五、总结
更多能力持续解锁探索中，openAI非常依赖prompt的质量逐步优化丰富中，欢迎大牛提供宝贵建议开拓思路，如果感兴趣也可以一起试试。
源代码地址：[点这里](https://github.com/sparrow-js/ant-codeAI)

