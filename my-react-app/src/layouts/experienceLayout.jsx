import { Outlet } from "react-router-dom";
import PrivateLayout from "./privateLayout";

const ExperienceLayout = () => {
    return (
        <PrivateLayout>
            <Outlet />
        </PrivateLayout>
    );
};

export default ExperienceLayout;
