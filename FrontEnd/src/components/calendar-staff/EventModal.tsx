import React, { useContext, useState, ChangeEvent, FormEvent } from "react";
import moment from "moment";
import "./EventModal.scss"; // Import SCSS file
import GlobalContext from "./context/GlobalContext";

const labelsClasses = [
  "indigo",
  "gray",
  "green",
  "blue",
  "red",
  "purple",
];

const EventModal: React.FC = () => {
  const { setShowEventModal, daySelected, dispatchCalEvent, selectedEvent } = useContext(GlobalContext) as {
    setShowEventModal: (show: boolean) => void;
    daySelected: moment.Moment | null;
    dispatchCalEvent: (action: { type: string; payload: any }) => void;
    selectedEvent: { id: number; title: string; description: string; label: string } | null;
  };

  const [title, setTitle] = useState<string>(selectedEvent ? selectedEvent.title : "");
  const [description, setDescription] = useState<string>(selectedEvent ? selectedEvent.description : "");
  const [selectedLabel, setSelectedLabel] = useState<string>(
    selectedEvent ? labelsClasses.find((lbl) => lbl === selectedEvent.label) || labelsClasses[0] : labelsClasses[0]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const calendarEvent = {
      title,
      description,
      label: selectedLabel,
      day: daySelected ? daySelected.valueOf() : null,
      id: selectedEvent ? selectedEvent.id : Date.now(),
    };
    if (selectedEvent) {
      dispatchCalEvent({ type: "update", payload: calendarEvent });
    } else {
      dispatchCalEvent({ type: "push", payload: calendarEvent });
    }

    setShowEventModal(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "title") setTitle(value);
    if (name === "description") setDescription(value);
  };

  return (
    <div className="modal-overlay">
      <form className="modal-container">
        <header className="modal-header">
          <span className="material-icons-outlined text-gray-400">drag_handle</span>
          <div>
            {selectedEvent && (
              <span
                onClick={() => {
                  dispatchCalEvent({ type: "delete", payload: selectedEvent });
                  setShowEventModal(false);
                }}
                className="material-icons-outlined text-gray-400 cursor-pointer"
              >
                delete
              </span>
            )}
            <button onClick={() => setShowEventModal(false)}>
              <span className="material-icons-outlined text-gray-400">close</span>
            </button>
          </div>
        </header>
        <div className="modal-body">
          <div className="input-group">
            <input
              type="text"
              name="title"
              placeholder="Add title"
              value={title}
              required
              className="input-title"
              onChange={handleInputChange}
            />
            <span className="material-icons-outlined text-gray-400">schedule</span>
            <p>{daySelected ? daySelected.format("dddd, MMMM DD") : "No date selected"}</p>
            <span className="material-icons-outlined text-gray-400">segment</span>
            <input
              type="text"
              name="description"
              placeholder="Add a description"
              value={description}
              required
              className="input-description"
              onChange={handleInputChange}
            />
            <span className="material-icons-outlined text-gray-400">bookmark_border</span>
            <div className="label-selection">
              {labelsClasses.map((lblClass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`label ${lblClass}`}
                >
                  {selectedLabel === lblClass && (
                    <span className="material-icons-outlined text-white text-sm">check</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        <footer className="modal-footer">
          <button type="submit" onClick={handleSubmit} className="save-btn">
            Save
          </button>
        </footer>
      </form>
    </div>
  );
};

export default EventModal;
