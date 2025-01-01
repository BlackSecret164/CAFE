import { useState } from "react";
import "./create-tables.scss";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dayjs } from 'dayjs'; 

export const CreateTables = ({ onclose }: any) => {

  const generateTablesId = () => {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Random 3-digit number
    return `table${randomNumbers}`;
  };

  const [formData, setFormData] = useState({
    id: generateTablesId(),
    name: "",
    category: "",
    importDate: null as Dayjs | null,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCreateTables = () => {
    console.log("Tables Data:", formData);
    onclose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-button" onClick={onclose}>X</button>
          
          <h3 className="title-add">CREATE TABLE</h3>
          <div className="add-info-box">

            {/* ID Field (disabled) */}
            <TextField
              className="table-id"
              label="ID"
              value={formData.id}
              variant="outlined"
              disabled
              margin="normal"
            />

            <TextField
              className="table-name"
              label="Table's name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              margin="normal"
            />

            <FormControl margin="normal" className="table-category">
              <InputLabel htmlFor="tb-category">Category</InputLabel>
              <NativeSelect
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                inputProps={{
                  name: 'category',
                  id: 'tb-category',
                }}
              >
                <option value="table">Table</option>
                <option value="chair">Chair</option>
                <option value="other">Other</option>
              </NativeSelect>
            </FormControl>

            {/* Import Date Field */}
            <DateTimePicker
              className="table-import-date"
              label="Import Date"
              value={formData.importDate}
              onChange={(newValue) => handleChange("importDate", newValue)}
              // viewRenderers={{
              //   hours: renderTimeViewClock,
              //   minutes: renderTimeViewClock,
              //   seconds: renderTimeViewClock,
              // }}
              viewRenderers={{
                hours: null,
                minutes: null,
                seconds: null,
              }}
            />
          </div>
          
          {/* Buttons */}
          <div className="button-container">
            <Button variant="contained" className="button-cancel" onClick={onclose}>
              Cancel
            </Button>
            <Button variant="contained" className="button-create" onClick={handleCreateTables}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};
