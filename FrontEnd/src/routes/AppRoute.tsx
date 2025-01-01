import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login/Login";
import Homepage from "@/pages/Homepage/Homepage";
import { routePath } from "@/routes/routePath";
import { Route, Routes, useNavigate } from "react-router-dom";

export default function AppRoute() {
  // const navigate = useNavigate();
  // const token = useSelector((state: RootState) => state.user.token);
  // useEffect(() => {
  //   if (!token) {
  //     navigate('/login');
  //   }
  // }, [token]);

  const routePathRender = () => {
    return routePath.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={route.component}>
            {route.children.map((subRoute, subIndex) => (
              <Route
                key={subIndex}
                path={subRoute.path}
                element={subRoute.component}
              />
            ))}
          </Route>
        );
      }
      return (
        <Route
          key={index}
          index={route.index}
          path={route.path}
          element={route.component}
        />
      );
    });
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {routePathRender()}
      </Route>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/Homepage" element={<Homepage />} /> */}
    </Routes>
  );
}
