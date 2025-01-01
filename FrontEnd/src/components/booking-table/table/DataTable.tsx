import React, { useState } from "react";
import "./DataTable.scss";
import DataOrder from "../order/DataOrder";
import PaginationContent from "@/components/pagination/PaginationContent";
import { EditTables } from "@/components/form/Edit/Tables/edit-tables";
import ActionButton from "../actionButton/ActionButton";

export interface DataTables {
  id: string;
  name: string;
  category: string;
  importDate: string;
}

export const initialDataTables: DataTables[] = [
  {
    id: "1",
    name: "Bàn 1",
    category: "Table",
    importDate: "Wednesday, 2/14/15 10:15 AM",
  },
  {
    id: "2",
    name: "Bàn 2",
    category: "Table",
    importDate: "Friday, 5/20/18 2:30 PM",
  },
  {
    id: "3",
    name: "Bàn 3",
    category: "Table",
    importDate: "Monday, 8/11/20 8:00 AM",
  },
  {
    id: "4",
    name: "Bàn 4",
    category: "Table",
    importDate: "Thursday, 11/5/21 3:45 PM",
  },
  {
    id: "5",
    name: "Bàn 5",
    category: "Table",
    importDate: "Saturday, 6/12/22 7:15 AM",
  },
  {
    id: "6",
    name: "Bàn 6",
    category: "Table",
    importDate: "Tuesday, 4/3/16 9:00 AM",
  },
  {
    id: "7",
    name: "Bàn 7",
    category: "Table",
    importDate: "Sunday, 12/25/17 6:20 PM",
  },
  {
    id: "8",
    name: "Bàn 8",
    category: "Table",
    importDate: "Thursday, 1/18/19 10:50 AM",
  },
  {
    id: "9",
    name: "Bàn 9",
    category: "Table",
    importDate: "Wednesday, 7/10/20 1:30 PM",
  },
  {
    id: "10",
    name: "Bàn 10",
    category: "Table",
    importDate: "Friday, 9/22/21 8:45 AM",
  },
  {
    id: "11",
    name: "Bàn 11",
    category: "Table",
    importDate: "Saturday, 10/16/15 5:15 PM",
  },
  {
    id: "12",
    name: "Bàn 12",
    category: "Table",
    importDate: "Monday, 3/5/18 11:40 AM",
  },
  {
    id: "13",
    name: "Bàn 13",
    category: "Table",
    importDate: "Sunday, 6/23/19 7:25 PM",
  },
  {
    id: "14",
    name: "Bàn 14",
    category: "Table",
    importDate: "Thursday, 8/8/20 12:10 PM",
  },
  {
    id: "15",
    name: "Bàn 15",
    category: "Table",
    importDate: "Tuesday, 2/11/22 9:35 AM",
  },
  {
    id: "16",
    name: "Bàn 16",
    category: "Table",
    importDate: "Friday, 5/19/15 4:50 PM",
  },
  {
    id: "17",
    name: "Bàn 17",
    category: "Table",
    importDate: "Saturday, 7/30/18 6:00 PM",
  },
  {
    id: "18",
    name: "Bàn 18",
    category: "Table",
    importDate: "Wednesday, 11/2/21 10:05 AM",
  }
];

interface DataTablesProps {
  onSelectTables: (tables: DataTables) => void;
}

const DataTables: React.FC<DataTablesProps> = ({ onSelectTables }) => {
  const [data, setData] = useState<DataTables[]>(initialDataTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null); // Trạng thái lưu ID của hàng được chọn
  const [selectedOrder, setSelectedOrder] = useState<DataOrder | null>(null);


  // Khi chọn hàng, chỉ lưu đối tượng, chưa hiển thị hộp thoại
  const handleSelectedTablesButton = (table: DataTables) => {
    setSelectedTableId(table.id);
    onSelectTables(table);
    setSelectedOrder({
      tableName: table.name,
      booking: "08/08/2024 00:07:57",
      idInvoice: "CF34562",
      phone: "0336126905",
      status: "available",
      service: "Dine in",
      subtotal: "đ93.000",
      seatedAt: "08/08/2024 00:07:57",
    });
  };

  //Pagination
  const [quantity, setQuantity] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(initialDataTables.length / quantity);
  const startIndex = (currentPage - 1) * quantity;
  const endIndex = startIndex + quantity;
  const currentData = initialDataTables.slice(startIndex, endIndex);
  const items = {
    currentPage,
    setCurrentPage,
    totalPages,
    setQuantity,
    quantity
  };

  return (
    <div className="table-booking">
      <div className="table-legend">
        <div className="legend-item">
          <span className="circle selecting"></span>
          <span>selecting</span>
        </div>
        <div className="legend-item">
          <span className="circle available"></span>
          <span>available</span>
        </div>
        <div className="legend-item">
          <span className="circle occupied"></span>
          <span>occupied</span>
        </div>
        <div className="legend-item">
          <span className="circle reserved"></span>
          <span>reserved</span>
        </div>
      </div>
      <div className="grid-page">
        <div className="add-table-box">
          <div className="table-grid">
            {initialDataTables.map((table) => (
              <button
                key={table.id}
                className={`table-button ${selectedTableId === table.id ? "selected" : "available"}`}
                onClick={() => handleSelectedTablesButton(table)}
              >
                {table.name}
              </button>
            ))}
          </div>
        </div>
        {/* Cột thông tin Order */}
        <DataOrder order={selectedOrder} />
      </div>
    </div>      
  );
};

export default DataTables;
