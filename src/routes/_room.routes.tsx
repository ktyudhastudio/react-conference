import type { RouteObject } from "react-router-dom";
import RoomLayout from "@layouts/RoomLayout";
import { Room } from "@pages/room";

const roomRoutes: RouteObject[] = [
  {
    element: <RoomLayout />,
    children: [{ path: "room/:meetingId", element: <Room /> }],
  },
];

export default roomRoutes;
