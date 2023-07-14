import UserForm from "../pages/UserForm";
import GoodsForm from "../pages/GoodsForm";
import { RouteObject, createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
const routeList: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/GoodsForm",
    element: <GoodsForm />,
  },
  {
    path: "/UserForm",
    element: <UserForm />,
  },
];
export const router = createBrowserRouter(routeList);
