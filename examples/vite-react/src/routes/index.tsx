import { RouteObject, createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home';

const routeList: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
];
export const router = createBrowserRouter(routeList);
