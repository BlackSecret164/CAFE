import React, { useContext } from "react";
import plusImg from "../../assets/plus.svg";
import GlobalContext from "./context/GlobalContext";
import "./CreateEventButton.scss"; 

const CreateEventButton: React.FC = () => {
  const { setShowEventModal } = useContext(GlobalContext);

  const handleClick = (): void => {
    setShowEventModal();
  };

  return (
    <button onClick={handleClick} className="create-event-btn">
      <img src={plusImg} alt="create_event" className="event-icon" />
      <span className="event-text">Create</span>
    </button>
  );
};

export default CreateEventButton;
