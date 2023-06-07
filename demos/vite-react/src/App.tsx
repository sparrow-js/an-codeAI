import { useState } from 'react';
import fireflyLogo from './assets/firefly.svg';
import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from 'react-router-dom';
import { router } from './routes';


function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
export default App;
