import React, { useState } from "react";
import "./DataTable.scss";
import PaginationContent from "@/components/pagination/PaginationContent";
import ActionButton from "../actionButton/ActionButton";

export interface DataStaff {
  id: string;
  name: string;
  gender: string;
  birthday: string;
  role: string;
  phone: string;
}

export const initialDataStaff: DataStaff[] = [
  {
    id: "1",
    name: "Dương Hân",
    gender: "Female",
    birthday: "1995-12-30",
    role: "Thu ngân",
    phone: "0336126905",
  },
  {
    id: "2",
    name: "Nguyễn Anh",
    gender: "Male",
    birthday: "2015-02-14",
    role: "Pha chế",
    phone: "0345678901",
  },
  {
    id: "3",
    name: "Trần Thị Bích",
    gender: "Female",
    birthday: "2015-03-15",
    role: "Phục vụ",
    phone: "0356789012",
  },
  {
    id: "4",
    name: "Lê Hồng Sơn",
    gender: "Male",
    birthday: "2015-04-16",
    role: "Bảo vệ",
    phone: "0367890123",
  },
  {
    id: "5",
    name: "Phạm Minh Kha",
    gender: "Male",
    birthday: "2015-05-17",
    role: "Quản lý",
    phone: "0378901234",
  },
  {
    id: "6",
    name: "Đặng Thảo Linh",
    gender: "Female",
    birthday: "2015-06-18",
    role: "Thu ngân",
    phone: "0389012345",
  },
  {
    id: "7",
    name: "Ngô Vũ Long",
    gender: "Male",
    birthday: "2015-07-19",
    role: "Pha chế",
    phone: "0390123456",
  },
  {
    id: "8",
    name: "Bùi Gia Hân",
    gender: "Female",
    birthday: "2015-08-20",
    role: "Phục vụ",
    phone: "0312345678",
  },
  {
    id: "9",
    name: "Hoàng Hải Nam",
    gender: "Male",
    birthday: "2015-09-21",
    role: "Bảo vệ",
    phone: "0323456789",
  },
  {
    id: "10",
    name: "Lý Thanh Nga",
    gender: "Female",
    birthday: "2015-10-22",
    role: "Quản lý",
    phone: "0334567890",
  },
  {
    id: "11",
    name: "Võ Thị Mai",
    gender: "Female",
    birthday: "2015-11-23",
    role: "Thu ngân",
    phone: "0345678901",
  },
  {
    id: "12",
    name: "Phan Văn Bảo",
    gender: "Male",
    birthday: "2015-12-24",
    role: "Pha chế",
    phone: "0356789012",
  },
  {
    id: "13",
    name: "Nguyễn Thị Lan",
    gender: "Female",
    birthday: "2016-01-25",
    role: "Phục vụ",
    phone: "0367890123",
  },
  {
    id: "14",
    name: "Lê Minh Quang",
    gender: "Male",
    birthday: "2016-02-26",
    role: "Bảo vệ",
    phone: "0378901234",
  },
  {
    id: "15",
    name: "Trần Thanh Hương",
    gender: "Female",
    birthday: "2016-03-27",
    role: "Quản lý",
    phone: "0389012345",
  },
  {
    id: "16",
    name: "Đỗ Đức Thắng",
    gender: "Male",
    birthday: "2016-04-28",
    role: "Thu ngân",
    phone: "0390123456",
  },
  {
    id: "17",
    name: "Vũ Thị Bảo Ngọc",
    gender: "Female",
    birthday: "2016-05-29",
    role: "Pha chế",
    phone: "0312345678",
  },
  {
    id: "18",
    name: "Trịnh Công Tuấn",
    gender: "Male",
    birthday: "2016-06-30",
    role: "Phục vụ",
    phone: "0323456789",
  },
  {
    id: "19",
    name: "Hà Phương Linh",
    gender: "Female",
    birthday: "2016-07-31",
    role: "Bảo vệ",
    phone: "0334567890",
  },
  {
    id: "20",
    name: "Ngô Thị Cẩm Vân",
    gender: "Female",
    birthday: "2016-08-01",
    role: "Quản lý",
    phone: "0345678901",
  }
];


interface DataTableProps {
  onSelectStaff: (staff: DataStaff) => void;
}

const DataTable: React.FC<DataTableProps> = ({ onSelectStaff }) => {
  const [data, setData] = useState<DataStaff[]>(initialDataStaff);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null); // Trạng thái lưu ID của hàng được chọn


 // Handle selection for a single row
  const handleRowSelect = (id: string) => {
    const newSelectedId = selectedRowId === id ? null : id;
    setSelectedRowId(newSelectedId);

    // Lấy thông tin của khách hàng đã chọn
    const selectedStaff = data.find((staff) => staff.id === newSelectedId) || null;
    if (selectedStaff) {
      onSelectStaff(selectedStaff); // Gửi khách hàng đã chọn lên ActionButton
    }
  };

  //Pagination
  const [quantity, setQuantity] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(initialDataStaff.length / quantity);
  const startIndex = (currentPage - 1) * quantity;
  const endIndex = startIndex + quantity;
  const currentData = initialDataStaff.slice(startIndex, endIndex);
  const items = {
    currentPage,
    setCurrentPage,
    totalPages,
    setQuantity,
    quantity
  };

  return (
    <div className="table-div">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>NAME</th>
            <th>GENDER</th>
            <th>BIRTHDAY</th>
            <th>ROLE</th>
            <th>PHONE NUMBER</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((item) => (
            <tr
              key={item.id}
              className={selectedRowId === item.id ? "selected" : ""}
              onClick={() => handleRowSelect(item.id)} 
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRowId === item.id}
                  onChange={() => handleRowSelect(item.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent row click event when clicking the checkbox
              />
              </td>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.gender}</td>
              <td>{item.birthday}</td>
              <td>{item.role}</td>
              <td>{item.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <PaginationContent items={items} />

  
    </div>
  );
};

export default DataTable;
