import ProductForm from "../pages/ProductForm";
import { RouteObject, createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Test from "../pages/test";
const routeList: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/ProductForm",
    element: <ProductForm />,
  },
];
export const router = createBrowserRouter(routeList);
