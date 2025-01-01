import dayjs, { Dayjs } from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "./context/GlobalContext";
import "./Day.scss"; // Import SCSS file

interface Event {
  day: string;
  label: string;
  title: string;
}

interface DayProps {
  day: Dayjs;
  rowIdx: number;
}

const Day: React.FC<DayProps> = ({ day, rowIdx }) => {
  const [dayEvents, setDayEvents] = useState<Event[]>([]);
  const {
    setDaySelected,
    setShowEventModal,
    filteredEvents,
    setSelectedEvent,
  } = useContext(GlobalContext);

  useEffect(() => {
    const events = filteredEvents.filter(
      (evt: Event) =>
        dayjs(evt.day).format("DD-MM-YY") === day.format("DD-MM-YY")
    );
    setDayEvents(events);
  }, [filteredEvents, day]);

  const getCurrentDayClass = (): string => {
    return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
      ? "current-day"
      : "";
  };

  const handleClickDay = () => {
    setDaySelected(day);
    setShowEventModal();
  };

  const handleClickEvent = () => {
    setSelectedEvent();
  };

  return (
    <div className="day-container">
      <header className="day-header">
        {rowIdx === 0 && 
        <p className="day-weekday">{day.format("ddd").toUpperCase()}</p>}
        <p className={`day-date ${getCurrentDayClass()}`}>{day.format("DD")}</p>
      </header>
      <div className="event-area" onClick={handleClickDay}>  
        
        <div className="events-list">
          {dayEvents.map((evt, idx) => (
            <div
              key={idx}
              onClick={handleClickEvent}
              className={`event-item bg-${evt.label}-200`}
            >
              {evt.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Day;
