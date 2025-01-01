import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { getMonth } from "@/utils/util";
import GlobalContext from "./context/GlobalContext";
import "./SmallCalendar.scss"; // Import SCSS file

const SmallCalendar: React.FC = () => {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(dayjs().month());
  const [currentMonth, setCurrentMonth] = useState(getMonth());

  const { monthIndex, setSmallCalendarMonth, setDaySelected, daySelected }: { monthIndex: number; setSmallCalendarMonth: (index: number) => void; setDaySelected: (day: dayjs.Dayjs) => void; daySelected: dayjs.Dayjs | null } = useContext(GlobalContext);

  useEffect(() => {
    setCurrentMonth(getMonth(currentMonthIdx));
  }, [currentMonthIdx]);

  useEffect(() => {
    setCurrentMonthIdx(monthIndex);
  }, [monthIndex]);

  function handlePrevMonth() {
    setCurrentMonthIdx(currentMonthIdx - 1);
  }

  function handleNextMonth() {
    setCurrentMonthIdx(currentMonthIdx + 1);
  }

  function getDayClass(day: dayjs.Dayjs) {
    const format = "DD-MM-YY";
    const nowDay = dayjs().format(format);
    const currDay = day.format(format);
    const slcDay = daySelected && daySelected.format(format);
    if (nowDay === currDay) {
      return "bg-blue-500 rounded-full text-white";
    } else if (currDay === slcDay) {
      return "bg-blue-100 rounded-full text-blue-600 font-bold";
    } else {
      return "";
    }
  }

  const handleDateSelect = (day: dayjs.Dayjs) => {
    setDaySelected(day); // Cập nhật ngày đã chọn trong GlobalContext
    setSmallCalendarMonth(currentMonthIdx); // Lưu tháng hiện tại vào context
  };

  return (
    <div className="small-calendar">
      <header className="small-calendar-header">
        <p className="month-year">
          {dayjs(new Date(dayjs().year(), currentMonthIdx)).format("MMMM YYYY")}
        </p>
        <div className="nav-buttons">
          <button onClick={handlePrevMonth}>
            <i className="fa-solid fa-chevron-left"></i>      
          </button>
          <button onClick={handleNextMonth}>
            <i className="fa-solid fa-chevron-right"></i>      
          </button>
        </div>
      </header>
      <div className="calendar-grid">
        {currentMonth[0].map((day, i) => (
          <span key={i} className="day-name">
            {day.format("dd").charAt(0)}
          </span>
        ))}
        {currentMonth.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, idx) => (
              <button
                key={idx}
                onClick={() => handleDateSelect(day)}
                className={`day-button ${getDayClass(day)}`}
              >
                <span className="day-number">{day.format("D")}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SmallCalendar;
