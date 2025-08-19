import { useState } from "react";
import Sidebar from "../layouts/Sidebar";
import { HouseHolderButton } from "../components/HouseHolderButton";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const openSidebar = () => {
        setSidebarOpen(true);
    }

    const closeSidebar = () => {
        setSidebarOpen(false);
    }

    return (
        <>

            <HouseHolderButton title={"Deine Bereiche"} onClick={openSidebar}></HouseHolderButton>
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}></Sidebar>
        </>
    )
}