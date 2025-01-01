import React, { useState, useContext, useEffect } from "react";
import "./CalendarLayout.scss";
import CalendarHeader from "@/components/calendar-staff/CalendarHeader";
import TabSide from "@/components/calendar-staff/TabSide";
import Month from "@/components/calendar-staff/Month";
import { getMonth } from "@/utils/util";
import GlobalContext from "@/components/calendar-staff/context/GlobalContext";
import EventModal from "@/components/calendar-staff/EventModal";
import CreateEventButton from "@/components/calendar-staff/CreateEventButton";
function CalendarLayout() {
  const [currenMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal } = useContext(GlobalContext);

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  return (
    <React.Fragment>
      {showEventModal && <EventModal />}
      <div className="calendar-layout">
        <div className="calendar-title">
          <div className="create-event">
            <CreateEventButton />
          </div>
          <div className="calendar-header">
            <CalendarHeader />
          </div>
        </div>
        
        <div className="tabside-main">
          <TabSide />
          <Month month={currenMonth} />
        </div>
      </div>
    </React.Fragment>
  );
}

export default CalendarLayout;
