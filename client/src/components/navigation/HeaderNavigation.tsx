import { useLocation, useNavigate } from "react-router-dom"

export const HeaderNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleNavigate = (path: string) => {
        navigate(path);
    }

    return (<header className=""></header>);

}