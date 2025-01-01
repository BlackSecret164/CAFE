import { useState, useEffect } from "react";
import "./edit-tables.scss";
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DataTables } from "@/components/booking-table/table/DataTable";

interface EditTablesProps {
  tables: DataTables;
  onSave: (updatedCustomer: DataTables) => void;
  onClose: () => void;
}

export const EditTables = ({ tables, onSave, onClose }: EditTablesProps) => {
  const [formData, setFormData] = useState({
    id: tables.id,
    name: tables.name,
    category: tables.category,
    importDate: tables.importDate ? dayjs(tables.importDate) : null,
  });

  useEffect(() => {
    setFormData({
      id: tables.id,
      name: tables.name,
      category: tables.category,
      importDate: tables.importDate ? dayjs(tables.importDate) : null,
    });
  }, [tables]);

  const handleChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updatedTables: DataTables = {
      ...formData,
      importDate: formData.importDate
        ? formData.importDate.format("dddd, M/D/YY h:mm A")
        : "",
    };
    onSave(updatedTables);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Close Button */}
          <button className="close-button" onClick={onClose}>X</button>
          
          <h3 className="title-add">EDIT TABLE</h3>
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
              viewRenderers={{
                hours: null,
                minutes: null,
                seconds: null,
              }}
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
