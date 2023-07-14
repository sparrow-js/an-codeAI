import UserForm from "../pages/UserForm";
import { RouteObject, createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
const routeList: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/UserForm",
    element: <UserForm />,
  },
];
export const router = createBrowserRouter(routeList);
