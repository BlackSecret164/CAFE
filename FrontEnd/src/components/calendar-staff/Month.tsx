import React from "react";
import Day from "./Day";
import "./Month.scss"; // Import SCSS file

interface MonthProps {
  month: any[][]; // Assuming the structure of 'month' is a 2D array of 'day' objects.
}

const Month: React.FC<MonthProps> = ({ month }) => {
  return (
    <div className="month-grid">
      {month.map((row, i) => (
        <div key={i} className="month-row">
          {row.map((day, idx) => (
            <Day day={day} key={idx} rowIdx={i} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Month;
