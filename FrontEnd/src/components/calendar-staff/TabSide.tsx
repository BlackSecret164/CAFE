import React from "react";
import SmallCalendar from "./SmallCalendar";
import Labels from "./Labels";
import "./TabSide.scss"; 

const TabSide: React.FC = () => {
  return (
    <aside className="tab-side">
      <SmallCalendar />
      <Labels />
    </aside>
  );
};

export default TabSide;
