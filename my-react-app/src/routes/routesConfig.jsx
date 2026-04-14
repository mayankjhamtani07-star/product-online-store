import { lazy } from "react";
const Logout = lazy(() => import("../pages/private/logout"));
const Login = lazy(() => import("../pages/public/login"));
const SignUp = lazy(() => import("../pages/public/signUp"));
const ForgotPassword = lazy(() => import("../pages/public/forgotPassword"));
const ResetPassword = lazy(() => import("../pages/public/resetPassword"));

import { 
  FiHome, FiShoppingBag, FiZap, FiLogOut, FiHeart, FiCamera, 
  FiMessageCircle, FiUser, FiShoppingCart, FiPackage 
} from "react-icons/fi";

const Capture = lazy(() => import("../pages/capture"));
const Home = lazy(() => import("../pages/home"));
const Experience = lazy(() => import("../pages/private/experience"));
const FullExperience = lazy(() => import("../pages/private/fullExperience"));
const ArchivedExperience = lazy(() => import("../pages/private/archieveExperience"));
const Wishlist = lazy(() => import("../pages/private/wishlist"));
const Cart = lazy(() => import("../pages/private/cart"));
const Orders = lazy(() => import("../pages/private/orders"));
const Ticket = lazy(() => import("../pages/private/tickets"));
const TicketDetail = lazy(() => import("../pages/private/ticketDetail"));
const TicketFire = lazy(() => import("../pages/private/ticketsfire"));
const TicketDetailFire = lazy(() => import("../pages/private/ticketDetailfire"));
const Products = lazy(() => import("../pages/products"));
const MyProfile = lazy(() => import("../pages/private/myProfile"));

export const routesConfig = [
  {
    path: "/",
    element: <Home />,
    icon: FiHome,
    layout: "dynamic",
    label: "Home",
    navSection: "left",
    sidebarSection: "top",
    footerSection: "links",
  },
  {
    path: "/product",
    element: <Products />,
    icon: FiShoppingBag,
    layout: "dynamic",
    label: "Products",
    navSection: "left",
    sidebarSection: "top",
    footerSection: "links",
  },
  {
    path: "/experience",
    element: <Experience />,
    icon: FiZap,
    layout: "private",
    label: "Experience",
    navSection: null,
    sidebarSection: "top",
    footerSection: null,
  },
  {
    path: "archived",
    element: <ArchivedExperience />,
    layout: "private",
    parentPath: "/experience",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: ":expId",
    element: <FullExperience />,
    layout: "private",
    parentPath: "/experience",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/ticket",
    element: <Ticket />,
    icon: FiMessageCircle,
    label: "Ticket",
    layout: "private",
    navSection: null,
    sidebarSection: "top",
    footerSection: null,
  },
  {
    path: ":ticketId",
    element: <TicketDetail />,
    layout: "private",
    parentPath: "/ticket",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/ticket-fire",
    element: <TicketFire />,
    icon: FiMessageCircle,
    label: "Ticket (Firebase)",
    layout: "private",
    navSection: null,
    sidebarSection: "top",
    footerSection: null,
  },
  {
    path: ":ticketId",
    element: <TicketDetailFire />,
    layout: "private",
    parentPath: "/ticket-fire",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/wishlist",
    element: <Wishlist />,
    icon: FiHeart,
    layout: "private",
    label: "Wishlist",
    navSection: null,
    sidebarSection: "top",
  },
  {
    path: "/cart",
    element: <Cart />,
    icon: FiShoppingCart,
    layout: "private",
    label: "Cart",
    navSection: null,
    sidebarSection: "top",
  },
  {
    path: "/orders",
    element: <Orders />,
    icon: FiPackage,
    layout: "private",
    label: "Orders",
    navSection: null,
    sidebarSection: "top",
  },
  {
    path: "/capture",
    element: <Capture />,
    icon: FiCamera,
    layout: "dynamic",
    label: "Capture",
    navSection: "left",
    sidebarSection: "top",
    footerSection: "links",
  },
  {
    path: "/login",
    element: <Login />,
    layout: "public",
    access: "guest",
    label: "Login",
    navSection: "right",
    navStyle: "button",
    sidebarSection: null,
  },
  {
    path: "/signup",
    element: <SignUp />,
    layout: "public",
    access: "guest",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    layout: "public",
    access: "guest",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
    layout: "public",
    navSection: null,
    sidebarSection: null,
  },
  {
    path: "/profile",
    element: <MyProfile />,
    layout: "private",
    access: "private",
    icon: FiUser,
    label: "My Profile",
    navSection: "dropdown",
    sidebarSection: null,
  },
  {
    path: "/logout",
    element: <Logout />,
    icon: FiLogOut,
    layout: "private",
    label: "Logout",
    navSection: "dropdown",
    sidebarSection: "bottom",
  },
];
