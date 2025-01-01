import { useState, useEffect } from "react";
import "./edit-product.scss";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DataProduct } from "@/components/product-list/table/DataTable";

interface EditProductProps {
  product: DataProduct;
  onSave: (updatedProduct: DataProduct) => void;
  onClose: () => void;
}

export const EditProduct = ({ product, onSave, onClose }: EditProductProps) => {
  const [formData, setFormData] = useState({
    id: product.id,
    name: product.name,
    gender: product.gender,
    birthday: product.birthday ? dayjs(product.birthday) : null,
    role: product.role,
    phone: product.phone,
  });

  useEffect(() => {
    setFormData({
      id: product.id,
      name: product.name,
      gender: product.gender,
      birthday: product.birthday ? dayjs(product.birthday) : null,
      role: product.role,
      phone: product.phone,
    });
  }, [product]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updatedProduct: DataProduct = {
      ...formData,
      birthday: formData.birthday
        ? formData.birthday.format('DD/MM/YYYY')
        : "",
    };
    onSave(updatedProduct);
    onClose();  
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-button" onClick={onClose}>X</button>
          
          <h3 className="title-add">EDIT PRODUCT</h3>
          <div className="add-info-box">
            {/* ID Field (disabled) */}
            <TextField
              className="product-id"
              label="ID"
              value={formData.id}
              variant="outlined"
              disabled
              margin="normal"
            />
            {/* Name and gender Fields on the Same Row */}
            <div className="row-1">
              <TextField
                className="product-name"
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                margin="normal"
              />
              <FormControl 
                  variant="standard" 
                  sx={{ m: 0.25, minWidth: 100}}  
                  className="product-gender"
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
              <FormControl margin="normal" className="product-role">
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
                className="product-birthday"
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
              className="product-phone"
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
