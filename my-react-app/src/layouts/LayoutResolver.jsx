import PrivateLayout from "./privateLayout";
import PublicLayout from "./publicLayout";
import { useAuth } from "../context/authContext";

const LayoutResolver = ({ children }) => {
  const { token } = useAuth();

  return token
    ? <PrivateLayout>{children}</PrivateLayout>
    : <PublicLayout>{children}</PublicLayout>;
};

export default LayoutResolver;