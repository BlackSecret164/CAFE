import { useState } from "react";
import "./create-staff.scss";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dayjs } from 'dayjs'; 

export const CreateStaff = ({ onclose }: any) => {

  const generateStaffId = () => {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Random 3-digit number
    return `cus${randomNumbers}`;
  };

  const [formData, setFormData] = useState({
    id: generateStaffId(),
    name: "",
    phone: "",
    gender: "Male",
    registrationDate: null as Dayjs | null,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCreateStaff = () => {
    console.log("Staff Data:", formData);
    onclose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-button" onClick={onclose}>X</button>
          
          <h3 className="title-add">CREATE STAFF</h3>
          <div className="add-info-box">

            {/* ID Field (disabled) */}
            <TextField
              className="staff-id"
              label="ID"
              value={formData.id}
              variant="outlined"
              disabled
              margin="normal"
            />

            {/* Name and gender Fields on the Same Row */}
            <div className="row">
              <TextField
                className="staff-name"
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                margin="normal"
              />
              <FormControl margin="normal" className="staff-gender">
                <InputLabel htmlFor="gender-native">Gender</InputLabel>
                <NativeSelect
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  inputProps={{
                    name: 'gender',
                    id: 'gender-native',
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </NativeSelect>
              </FormControl>
            </div>

            {/* Phone Field */}
            <TextField
              className="staff-phone"
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              fullWidth
              margin="normal"
            />

            {/* Registration Date Field */}
            <DateTimePicker
              className="staff-registration-date"
              label="Registration Date"
              value={formData.registrationDate}
              onChange={(newValue) => handleChange("registrationDate", newValue)}
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
            <Button variant="contained" className="button-create" onClick={handleCreateStaff}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};
