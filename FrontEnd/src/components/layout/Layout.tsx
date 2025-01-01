import "@/components/layout/Layout.scss";
import Sidebar from "@/components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Header from "../header/Header";

export default function Layout() {
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="content">
          <div>
            <Header /> {/* Đưa Header lên trước Outlet */}
            <div className="main-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
