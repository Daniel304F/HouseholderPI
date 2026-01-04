import { BrowserRouter } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

const AppRoutes = async () => {
    return useRoutes(routes);
}

export const App = () => {
    return (<BrowserRouter><AppRoutes></AppRoutes></BrowserRouter>)
}