import type { RouteObject } from "react-router-dom";
import DefaultLayout from "@layouts/DefaultLayout";
import RoomLayout from "@layouts/RoomLayout";
import { Admin } from "@pages/admin";

const adminRoutes: RouteObject[] = [
  {
    element: <DefaultLayout />,
    children: [{ path: "admin", element: <Admin /> }],
  },
  {
    element: <RoomLayout />,
    children: [{ path: "admin/:meetingId", element: <Admin /> }],
  },
];

export default adminRoutes;
