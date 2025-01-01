import React, { useEffect, useState } from "react";
import { Breadcrumb } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import "./Navbar.scss";
import Search from "./search/Search";
import { routePath } from "@/routes/routePath";

const Navbar = () => {
  const location = useLocation(); // Lấy location để biết trang hiện tại
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    { name: "Dashboard", path: "/" }
  ]);

  const findBreadcrumb = (path: any) => {
    let result: { name: any; path: string }[] = [];
    const searchRoutes = (
      routes: any,
      currentPath: string,
      parentPath = ""
    ) => {
      for (const route of routes) {
        const fullPath = parentPath + "/" + route.path;
        if (currentPath.startsWith(fullPath)) {
          result.push({
            name: route.title || "Unnamed",
            path: fullPath
          });
          if (route.children) {
            searchRoutes(route.children, currentPath, fullPath);
          }
        }
      }
    };
    searchRoutes(routePath, path);
    return result;
  };

  useEffect(() => {
    const breadcrumbs = findBreadcrumb(location.pathname);
    if (breadcrumbs.length === 0) {
      setBreadcrumbItems([{ name: "Dashboard", path: "/" }]);
    } else {
      setBreadcrumbItems([{ name: "Dashboard", path: "/" }, ...breadcrumbs]);
    }
  }, [location.pathname]);

  return (
    <div className="navbar-custom">
      <Breadcrumb>
        {breadcrumbItems.map((item, index) => (
          <Breadcrumb.Item
            key={index}
            as={Link}
            to={item.path}
            active={index === breadcrumbItems.length - 1}
          >
            {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <Search />
    </div>
  );
};

export default Navbar;
