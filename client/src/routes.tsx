import type { RouteObject } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Homepage } from "./pages/Homepage";

export const routes: RouteObject[] = [{
    element: <AppLayout></AppLayout>,
    children: [{
        path: '/',
        element: <Homepage />
    }]
}]