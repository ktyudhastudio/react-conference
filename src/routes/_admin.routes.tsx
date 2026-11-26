import type { RouteObject } from "react-router-dom";
import { Admin } from "@pages/admin";

const adminRoutes: RouteObject[] = [
  { path: "admin", element: <Admin /> },
  { path: "admin/:meetingId", element: <Admin /> },
];

export default adminRoutes;
