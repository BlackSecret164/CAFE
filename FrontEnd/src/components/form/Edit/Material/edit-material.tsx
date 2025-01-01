import { useState, useEffect } from "react";
import "./edit-material.scss";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DataMaterial } from "@/components/material-list/table/DataTable";
import { MenuItem, Select } from "@mui/material";

interface EditMaterialProps {
  material: DataMaterial;
  onSave: (updatedMaterial: DataMaterial) => void;
  onClose: () => void;
}

export const EditMaterial = ({ material, onSave, onClose }: EditMaterialProps) => {
  const [formData, setFormData] = useState({
    id: material.id,
    name: material.name,
    gender: material.gender,
    birthday: material.birthday ? dayjs(material.birthday) : null,
    role: material.role,
    phone: material.phone,
  });

  useEffect(() => {
    setFormData({
      id: material.id,
      name: material.name,
      gender: material.gender,
      birthday: material.birthday ? dayjs(material.birthday) : null,
      role: material.role,
      phone: material.phone,
    });
  }, [material]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updatedMaterial: DataMaterial = {
      ...formData,
      birthday: formData.birthday
        ? formData.birthday.format('DD/MM/YYYY')
        : "",
    };
    onSave(updatedMaterial);
    onClose();  
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-button" onClick={onClose}>X</button>
          
          <h3 className="title-add">EDIT MATERIAL</h3>
          <div className="add-info-box">
            {/* ID Field (disabled) */}
            <TextField
              className="material-id"
              label="ID"
              value={formData.id}
              variant="outlined"
              disabled
              margin="normal"
            />
            {/* Name and gender Fields on the Same Row */}
            <div className="row-1">
              <TextField
                className="material-name"
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                margin="normal"
              />
              <FormControl 
                  variant="standard" 
                  sx={{ m: 0.25, minWidth: 100}}  
                  className="material-gender"
                  style={{marginTop: 16}}
                >
                <InputLabel htmlFor="gender-native">Gender</InputLabel>
                <Select
                  label = "Gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="row-2">
              {/* Role Field */}  
              <FormControl margin="normal" className="material-role">
                <TextField
                  select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  required
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Manager">Manager</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Bartender">Bartender</option>
                </TextField>
              </FormControl>

              {/* Birthday Field */}
              <DateTimePicker
                className="material-birthday"
                label="Birthday"
                value={formData.birthday}
                onChange={(newValue) => handleChange("birthday", newValue)}
                viewRenderers={{
                  hours: null,
                  minutes: null,
                  seconds: null,
                }}
              />
            </div>
  

            {/* Phone Field */}
            <TextField
              className="material-phone"
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              fullWidth
              margin="normal"
            />

          </div>

          {/* Buttons */}
          <div className="button-container">
            <Button variant="contained" className="button-cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" className="button-save" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};
