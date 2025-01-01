import React from "react";
import "./DataOrder.scss";

interface DataOrder {
  tableName: string;
  booking: string;
  idInvoice: string;
  phone: string;
  status: string;
  service: string;
  subtotal: string;
  seatedAt: string;
}

interface DataOrderProps {
  order: DataOrder | null; // Thông tin Order hiện tại
}

const DataOrder: React.FC<DataOrderProps> = ({ order }) => {
  return (
    <div className="order-info">
      <div className="order-header">
        <span>📋</span>
        <span>TABLE</span>
      </div>

      <div className="order-detail">
        <div className="detail-item" style={{fontWeight:"bold", textAlign:"center", justifyContent:"center"}}>
          <span>{order?.tableName.toUpperCase() || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Booking:</strong></span>
          <span>{order?.booking || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>ID Invoice:</strong></span>
          <span>{order?.idInvoice || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Phone:</strong></span>
          <span>{order?.phone || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Status:</strong></span>
          <span>{order?.status || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Service:</strong></span>
          <span>{order?.service || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Sub-total:</strong></span>
          <span>{order?.subtotal || "N/A"}</span>
        </div>
        <div className="detail-item">
          <span><strong>Seated at:</strong></span>
          <span>{order?.seatedAt || "N/A"}</span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="order-actions">
        <button className="service">Service</button>
        <button className="clear">Clear Table</button>
      </div>
    </div>
  );
};

export default DataOrder;
