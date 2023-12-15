### 一、背景

由于裁员失业在家最近也没有面试机会，所以有时间写写开源项目，花了两天时间把screenshot-to-code的后端代码改成了node [开源地址](https://github.com/sparrow-js/ant-codeAI)，用了一天时间研究了下腾讯云部署，把项目成功部署到腾讯云，这两天为ant-codeAI增加了自定义prompt 例子的新能力，让输出的代码更可控更有用武之地。

### 二、新功能介绍

使用其他功能可以参考这篇文章：[点这里](https://juejin.cn/post/7311343229207609395)
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf28642dfeb6452fa97b3511cf3d4041~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2782\&h=986\&s=136557\&e=png\&b=fcfcfc)
新增prompt 示例功能是因为输出的代码和希望输出的代码不符，所以通过提供示例的方式让openAI输出相似的代码。下面来看下添加示例后的效果：

#### 示例一

##### 1.原图

![截屏2023-12-12 下午6.51.54.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e385129dd203418bb1798eceed10743a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1898\&h=590\&s=111158\&e=png\&b=fdfdfd)

##### 2.不使用prompt 示例：

生成的网页，图片右侧
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/08bc38068ff44d2db0a9752cdd5d184c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2848\&h=1434\&s=247375\&e=png\&b=fdfdfd)
输出的代码：[点这里](https://github.com/sparrow-js/ant-codeAI/blob/main/example/row-form-1.html)

##### 3.使用prompt 示例：

生成的网页，图片右侧
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/110baddd81e94e188bd318ac3ed1650a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2842\&h=1464\&s=259810\&e=png\&b=fefefe)
输出的代码: [点这里](https://github.com/sparrow-js/ant-codeAI/blob/main/example/row-form-2.html)

#### 示例二

##### 1.原图

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/586bde562bf342859178ac2e2794df09~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2724\&h=792\&s=140062\&e=png\&b=fdfdfd)

##### 2.不使用prompt

![截屏2023-12-14 下午8.57.20.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/477caae4ebdf40d89b8690418bf638fa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2732\&h=1424\&s=366246\&e=png\&b=fefefe)
输出的代码：[点这里](https://github.com/sparrow-js/ant-codeAI/blob/main/example/table-edit-1.html)

##### 3.使用prompt

可见使用prompt后Edit是可以有逻辑的。prompt详情内容可以点击小锤子查看。
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fce64d211bbf4c8b82c969c5e25a45be~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2654\&h=1406\&s=275387\&e=png\&b=fefefe)
输出的代码：[点这里](https://github.com/sparrow-js/ant-codeAI/blob/main/example/table-edit-2.html)

### 三、录入prompt

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b80bcb3f1bb43cba8b9ee53f4efef7e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1104\&h=1036\&s=93670\&e=png\&b=fefefe)

*   promp example：prompt 的示例，（必填项）
*   prompt name：展示的名称（非必填）
*   prompt des：详情（非必填）
*   prompt img url：展示的图片地址

### 四、试用感受

*   输出内容不稳定可能相同的输入信息每次返回的信息不一样。
*   prompt 目前的调试成本比较高，调好一个prompt需要多次请求openAI尝试。
*   对于前端开发来说，辅助开发可以，看接受度是否愿意尝试使用还是完全自己手写。
*   需要支付费用，每次调用openAI 接口大概需要0.3元。
*   英文截图生成的效果比中文截图好，截图上的中文文字读取错误高。
*   对于运营，对还原效果有一定容忍度可以作为运营生成静态页面推广文章等用途使用。

### 五、总结

更多能力持续解锁探索中，openAI非常依赖prompt的质量，逐步优化丰富中，欢迎大牛提供宝贵意见开拓思路，共同丰富prompt，如果感兴趣也可以一起合作试试。
源代码地址：[点这里](https://github.com/sparrow-js/ant-codeAI)

