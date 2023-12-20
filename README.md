# ant-codeAI

项目通过使用AI技术生成高可用代码，（React，Vue，Tailwind CSS）等代码，使用GPT-4 Vision生成，通过截图转化到代码，可以自定义prompt生成可控代码。

截图

https://github.com/sparrow-js/ant-codeAI/assets/59440091/810c6b55-ed85-4ef1-a49d-090ae6d478eb

白板绘制

https://github.com/sparrow-js/ant-codeAI/assets/59440091/b80cedac-68e1-4de9-ac2f-ec960c09b135




## 🚀 试用
可以下载下来本地运行，[临时线上体验地址，图片最大可上传200KB](https://service-1fiqz1da-1253530766.gz.tencentapigw.com/release/)。
```bash
cd client
yarn dev


cd service
npm run start:dev
```
## 🛠 设置
<img width="558" alt="Pasted Graphic 1" src="https://github.com/sparrow-js/firefly/assets/59440091/2daf0da1-dc53-4c2a-b450-2667abcf940b">

- OpenAI API Key
- OpenAI Base URL(代理地址，默认：https://api.openai.com/v1)
- Mock AI Response(mock AI返回的数据，不直接请求AI)，直接请求OpenAI 接口会消耗费用


## 🔥 使用场景
- 中后台项目
- 快速验证方案，对还原度要求不高的项目
- 输出代码后自补全细节

<img width="500" alt="截屏2023-12-11 下午8 48 49" src="https://github.com/sparrow-js/firefly-codeAI/assets/59440091/781e496e-6141-413b-804a-72e7c17f0fe1">


## 生成对比
| 原图 | 生成网页 |
| --- | --- |
| <img width="1090" alt="截屏2023-12-16 上午12 14 18" src="https://github.com/sparrow-js/ant-codeAI/assets/59440091/0620753c-9c48-4878-a40f-3d79e40f1230"> | <img width="910" alt="截屏2023-12-16 上午8 41 15" src="https://github.com/sparrow-js/ant-codeAI/assets/59440091/18fd642c-9f92-4b76-a20d-7a59c6905256"> |
| <img width="1091" alt="截屏2023-12-17 下午1 38 21" src="https://github.com/sparrow-js/ant-codeAI/assets/59440091/e973ba23-3dc8-484f-9aed-793271a286e8"> | <img width="1055" alt="截屏2023-12-17 下午1 38 48" src="https://github.com/sparrow-js/ant-codeAI/assets/59440091/414fd1fd-6288-4e20-9f7e-9d279ab3808c"> |





##  🙋‍♂️ 合作
- 如果有合作意向欢迎加wx：sparrow777-js，不闲聊，没有具体事情请不要加🙏。
- 如果不知道怎么获取OpenAI key和 OpenAI proxy url有需要可以先加微信充几块钱体验下。
- bug，意见等直接提交到git上即可


[reference material screenshot-to-code](https://github.com/abi/screenshot-to-code)