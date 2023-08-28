import { useState } from 'react';
import './home.css';

function Comp() {
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <h1>辅助前1开发</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        本项目提供辅助前端开发功能，让普通的源码react、vue项目可以编辑，陆续会接入chatGPT，探索生成式落实到前端的方案，
        <br />
        本项目是在lowcode-engine基础上做的修改，如果想了解原理可先行看lowcode-engine文档
      </p>
    </div>
  );
}
export default Comp;
