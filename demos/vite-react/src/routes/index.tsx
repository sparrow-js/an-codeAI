import { RouteObject, createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home';
import Test from '../pages/test';


const routeList: RouteObject[] = [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/test',
      element: <Test />,
    },
];
export const router = createBrowserRouter(routeList);

