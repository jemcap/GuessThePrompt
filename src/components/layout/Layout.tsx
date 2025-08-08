import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/Header";

function Layout() {
  const location = useLocation();

  const hideHeader = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <Outlet />
    </div>
  );
}

export default Layout;