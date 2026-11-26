import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "@layouts/DefaultLayout";
import { Home } from "@pages/landing";
import { NotFound } from "@pages/global";
import roomRoutes from "./_room.routes";
import adminRoutes from "./_admin.routes";

const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  ...roomRoutes,
  ...adminRoutes,
]);

export default router;
