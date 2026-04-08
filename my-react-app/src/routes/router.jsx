import { Routes, Route, Navigate } from "react-router-dom";
import { routesConfig } from "./routesConfig";
import { Suspense } from "react";
import PageLoader from "../components/PageLoader";

import PublicRoute from "./publicRoute";
import PrivateRoute from "./privateRoute";

import PublicLayout from "../layouts/publicLayout";
import PrivateLayout from "../layouts/privateLayout";
import LayoutSwitcher from "../layouts/LayoutResolver";
import { Outlet } from "react-router-dom";

const layoutWrappers = {
  private: (children) => <PrivateLayout>{children}</PrivateLayout>,
  public: (children) => <PublicLayout>{children}</PublicLayout>,
  dynamic: (children) => <LayoutSwitcher>{children}</LayoutSwitcher>,
};

const accessWrappers = {
  private: (el) => <PrivateRoute>{el}</PrivateRoute>,
  guest: (el) => <PublicRoute>{el}</PublicRoute>,
};

const applyWrappers = (element, layout, access) => {
  if (layoutWrappers[layout]) element = layoutWrappers[layout](element);
  if (accessWrappers[access]) element = accessWrappers[access](element);
  return element;
};

const AppRouter = () => {
  const parentRoutes = routesConfig.filter(r => !r.parentPath);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          {parentRoutes.map((route) => {
            const children = routesConfig.filter(r => r.parentPath === route.path);

            if (children.length > 0) {
              const layoutEl = layoutWrappers[route.layout] ? layoutWrappers[route.layout](<Outlet />) : <Outlet />;
              const parentEl = accessWrappers[route.access] ? accessWrappers[route.access](layoutEl) : layoutEl;
              return (
                <Route key={route.path} path={route.path} element={parentEl}>
                  <Route index element={route.element} />
                  {children.map(child => (
                    <Route key={child.path} path={child.path} element={child.element} />
                  ))}
                </Route>
              );
            }

            return (
              <Route
                key={route.path}
                path={route.path}
                element={applyWrappers(route.element, route.layout, route.access)}
              />
            );
          })}

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;