import type { RouteObject } from "react-router-dom";
import { Room } from "@pages/room";

const roomRoutes: RouteObject[] = [{ path: "room/:meetingId", element: <Room /> }];

export default roomRoutes;
