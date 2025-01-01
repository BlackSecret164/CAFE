import React, { useContext } from "react";
import dayjs from "dayjs";
import calendar from "../../assets/calendar.png";
import GlobalContext from "./context/GlobalContext";
import "./CalendarHeader.scss";


const CalendarHeader: React.FC = () => {
  const { monthIndex, setMonthIndex } = useContext(GlobalContext);

  const handlePrevMonth = (): void => {
    setMonthIndex(monthIndex - 1);
  };

  const handleNextMonth = (): void => {
    setMonthIndex(monthIndex + 1);
  };

  const handleReset = (): void => {
    setMonthIndex(
      monthIndex === dayjs().month() ? monthIndex + Math.random() : dayjs().month()
    );
  };

  return (
    
    <header className="calendar-header">
      {/* <div>
      <img src={calendar} alt="calendar" className="calendar-icon" />
      <h1 className="calendar-title">
        Calendar
      </h1>
      </div> */}
      <button 
        onClick={handleReset} 
        className="calendar-btn today-btn"
      >
        Today
      </button>
      <button 
        onClick={handlePrevMonth} 
        className="calendar-btn nav-btn"> 
        <i className="fa-solid fa-chevron-left"></i>      
      </button>
      <button 
        onClick={handleNextMonth} 
        className="calendar-btn nav-btn">
        <i className="fa-solid fa-chevron-right"></i>      
      </button>
      <h2 className="calendar-current-month">
        {dayjs(new Date(dayjs().year(), monthIndex)).format("MMMM YYYY")}
      </h2>
    </header>
  );
};

export default CalendarHeader;
