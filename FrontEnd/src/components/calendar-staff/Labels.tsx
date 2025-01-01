import React, { useContext } from "react";
import GlobalContext from "./context/GlobalContext";
import "./Labels.scss"; // Import SCSS file


const Labels: React.FC = () => {
  
  const { labels, updateLabel } = useContext(GlobalContext);

  return (
    <React.Fragment>
      <p className="label-heading">Label</p>
      {labels.map(({ label: lbl, checked }, idx) => (
        <label key={idx} className="label-item">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => updateLabel({ label: lbl, checked: !checked })}
            className={`label-checkbox text-${lbl}-400`}
          />
          <span className="label-text">{lbl}</span>
        </label>
      ))}
    </React.Fragment>
  );
};

export default Labels;
