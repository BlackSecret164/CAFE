const express = require("express");
const multer = require('multer');
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
const file = fs.readFileSync("./api-docs.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
const cloudinary = require('cloudinary').v2;

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://cafe-k5p5.onrender.com'], // Danh sách các origin được phép
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Phương thức HTTP được phép
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Methods', 'ngrok-skip-browser-warning', 'access-control-allow-origin'], // Header được phép
    //Credential: true,
    credentials: true,
};

app.use(cors(corsOptions));

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin); // Đặt giá trị khớp với origin yêu cầu
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    ); // Không thêm "Access-Control-Allow-Origin" ở đây
    res.sendStatus(200);
});
app.use(express.json());

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const storage = multer.memoryStorage(); // Lưu file trong bộ nhớ tạm
const upload = multer({ storage });
const axios = require("axios");
const FormData = require("form-data");

// API Endpoint để tải lên tệp
app.post("/file/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file; // Lấy file từ request
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Tạo FormData để gửi lên Cloudinary
        const formData = new FormData();
        formData.append("file", file.buffer, file.originalname); // Tệp từ buffer
        formData.append("upload_preset", "upload-coffeewfen"); // Tên upload preset
        formData.append("folder", "doan"); // Thư mục chỉ định (nếu cần)

        // Gửi yêu cầu POST đến Cloudinary
        const cloudinaryResponse = await axios.post(
            "https://api.cloudinary.com/v1_1/dkntmdcja/image/upload",
            formData,
            {
                headers: {
                    ...formData.getHeaders(), // Header của FormData
                },
            }
        );

        // Trả về URL của ảnh đã upload
        res.status(201).json({
            message: "File uploaded successfully",
            imageUrl: cloudinaryResponse.data.secure_url, // URL ảnh
        });
    } catch (error) {
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Failed to upload file", error: error.response ? error.response.data : error.message });
    }
});

//staff
app.get("/staff/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM staff ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/staff", async (req, res) => {
    const { name, phone, birth, address, gender, typeStaff, startDate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO staff (name, phone, birth, address, gender, typestaff, startdate)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(query, [name, phone, birth, address, gender, typeStaff, startDate]);
        res.status(201).send({ message: "Staff added successfully!" });
    } catch (error) {
        console.error("Error adding staff:", error);
        res.status(500).send({ message: "Failed to add staff" });
    } finally {
        client.release();
    }
});

app.put("/staff/:id", async (req, res) => {
    const { id, name, phone, birth, address, gender, typeStaff, startDate } = req.body;
    const client = await pool.connect();
    const idAsInteger = parseInt(id, 10);
    try {
        const query = `
            UPDATE staff
            SET name = $1, phone = $2, birth = $3, address = $4, gender = $5, typestaff = $6, startdate = $7
            WHERE id = $8
        `;
        const result = await client.query(query, [name, phone, birth, address, gender, typeStaff, startDate, idAsInteger]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "staff ${id} not found" });
        }

        res.status(200).send({ message: "staff edited successfully!" });
    } catch (error) {
        console.error("Error editing staff:", error);
        res.status(500).send({ message: "Failed to edit staff" });
    } finally {
        client.release();
    }
});


app.delete("/staff/:id", async (req, res) => {
    const { id } = req.params; // Lấy phonecustomer từ params
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("StaffID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM staff
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "staff not found" });
        }

        res.status(204).send({ message: "staff deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting staff:", error);
        res.status(500).send({ message: "Failed to delete staff" });
    } finally {
        client.release();
    }
});

app.get("/staff/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM staff WHERE id = $1";
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "staff not found" });
        }

        // Trả về thông tin khách hàng
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Failed to fetch staff" });
    } finally {
        client.release();
    }
});


//customer
app.get("/customer/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM customer ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/customer", async (req, res) => {
    const { name, phone, gender, registrationDate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO customer (name, phone, gender, registrationdate)
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(query, [name, phone, gender, registrationDate]);
        res.status(201).send({ message: "Customer added successfully!" });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).send({ message: "Failed to add customer" });
    } finally {
        client.release();
    }
});

app.put("/customer/:id", async (req, res) => {
    const { name, gender, registrationDate, rank } = req.body; // Xóa phonecustomer khỏi body
    const { id } = req.params; // Lấy phonecustomer từ URL params
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();
    try {
        const query = `
            UPDATE customer
            SET name = $1, gender = $2, registrationdate = $3, rank = $4
            WHERE id = $5
        `;
        const result = await client.query(query, [name, gender, registrationDate, rank, idAsInteger]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Customer ${id} not found" });
        }

        res.status(200).send({ message: "Customer edited successfully!" });
    } catch (error) {
        console.error("Error editing customer:", error);
        res.status(500).send({ message: "Failed to edit customer" });
    } finally {
        client.release();
    }
});

app.delete("/customer/:id", async (req, res) => {
    const { id } = req.params; // Lấy phonecustomer từ params
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("CustomerID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM customer
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "Customer not found" });
        }

        res.status(204).send({ message: "Customer deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).send({ message: "Failed to delete customer" });
    } finally {
        client.release();
    }
});

app.get("/customer/:phone", async (req, res) => {
    const { phone } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM customer WHERE phone = $1";
        const result = await client.query(query, [phone]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "Customer not found" });
        }

        // Trả về thông tin khách hàng
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Failed to fetch customer" });
    } finally {
        client.release();
    }
});

//product
app.get("/product/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM product ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/product", async (req, res) => {
    const { name, price, upsize, imageURL, category } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO product (name, price, upsize, imageURL, category)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(query, [name, price, upsize, imageURL, category]);
        res.status(201).send({ message: "Product added successfully!" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ message: "Failed to add product" });
    } finally {
        client.release();
    }
});

app.put("/product/:id", async (req, res) => {
    const { name, price, upsize, imageURL, category } = req.body; // Xóa phonecustomer khỏi body
    const { id } = req.params; // Lấy phonecustomer từ URL params
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            UPDATE product
            SET name = $1, price = $2, upsize = $3, imageURL = $4, category =$5
            WHERE id = $6
        `;
        const result = await client.query(query, [name, price, upsize, imageURL, category, idAsInteger]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Product ${id} not found" });
        }

        res.status(200).send({ message: "Product edited successfully!" });
    } catch (error) {
        console.error("Error editing product:", error);
        res.status(500).send({ message: "Failed to edit product" });
    } finally {
        client.release();
    }
});

app.delete("/product/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("ProductID to delete:", id);

        const query = `
            DELETE FROM Product
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Product not found" });
        }

        res.status(204).send({ message: "Product deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting Product:", error);
        res.status(500).send({ message: "Failed to delete product" });
    } finally {
        client.release();
    }
});

app.get("/product/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM product WHERE id = $1";
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    } finally {
        client.release();
    }
});

app.put("/product/:id/available", async (req, res) => {
    const { available } = req.body; // Lấy "available" từ body
    const { id } = req.params; // Lấy "id" từ URL
    const idAsInteger = parseInt(id, 10);  
    const client = await pool.connect();
  
    try {
      // Thực thi câu truy vấn
      const query = `
        UPDATE product
        SET available = $1
        WHERE id = $2
      `;
      const result = await client.query(query, [available, idAsInteger]);
  
      // Kiểm tra nếu không có hàng nào bị ảnh hưởng
      if (result.rowCount === 0) {
        return res.status(404).send({ message: `Product ${id} not found` });
      }
  
      res.status(200).send({ message: "Product availability updated successfully!" });
    } catch (error) {
      console.error("Error updating product availability:", error);
      res.status(500).send({ message: "Failed to update product availability" });
    } finally {
      client.release();
    }
  });

//table
app.get("/table/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM tables ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/table", async (req, res) => {
    const { status, seat } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO tables (status, seat)
            VALUES ($1, $2)
        `;
        await client.query(query, [status, seat]);
        res.status(201).send({ message: "Table added successfully!" });
    } catch (error) {
        console.error("Error adding table:", error);
        res.status(500).send({ message: "Failed to add table" });
    } finally {
        client.release();
    }
})

app.put("/table/:id", async (req, res) => {
    const { status, phoneOrder, bookingTime, seatingTime, seat } = req.body;
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            UPDATE tables
            SET status = $1, phoneorder = $2, bookingtime = $3, seatingtime = $4, seat =$5
            WHERE id = $6
        `;
        const result = await client.query(query, [status, phoneOrder, bookingTime, seatingTime, seat, idAsInteger]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Table ${id} not found" });
        }

        res.status(200).send({ message: "Table edited successfully!" });
    } catch (error) {
        console.error("Error editing table:", error);
        res.status(500).send({ message: "Failed to edit table" });
    } finally {
        client.release();
    }
});

app.get("/table/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM tables WHERE id = $1";
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "Tables not found" });
        }

        // Trả về thông tin khách hàng
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching table:", error);
        res.status(500).json({ message: "Failed to fetch table" });
    } finally {
        client.release();
    }
});

app.delete("/table/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("CustomerID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM tables
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "table not found" });
        }

        res.status(204).send({ message: "table deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting table:", error);
        res.status(500).send({ message: "Failed to delete table" });
    } finally {
        client.release();
    }
});

//material
app.get("/material/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM rawmaterial ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/material", async (req, res) => {
    const { name, quantityImported, quantityStock, price, storageType, importDate, expiryDate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO rawmaterial (name, quantityImported, quantityStock, price, storageType, importDate, expiryDate)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(query, [name, quantityImported, quantityStock, price, storageType, importDate, expiryDate]);
        res.status(201).send({ message: "Material added successfully!" });
    } catch (error) {
        console.error("Error adding material:", error);
        res.status(500).send({ message: "Failed to add material" });
    } finally {
        client.release();
    }
})

app.put("/material/:id", async (req, res) => {
    const { name, quantityImported, quantityStock, price, storageType, importDate, expiryDate } = req.body;
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            UPDATE rawmaterial
            SET name = $1, quantityImported = $2, quantityStock = $3, price = $4, storageType = $5, importDate = $6, expiryDate = $7
            WHERE id = $8
        `;
        const result = await client.query(query, [name, quantityImported, quantityStock, price, storageType, importDate, expiryDate, idAsInteger]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Material ${id} not found" });
        }

        res.status(200).send({ message: "MAterial edited successfully!" });
    } catch (error) {
        console.error("Error editing material:", error);
        res.status(500).send({ message: "Failed to edit material" });
    } finally {
        client.release();
    }
});

app.get("/material/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM rawmaterial WHERE id = $1";
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "Material not found" });
        }

        // Trả về thông tin khách hàng
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching material:", error);
        res.status(500).json({ message: "Failed to fetch material" });
    } finally {
        client.release();
    }
});

app.delete("/material/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("MaterialID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM rawmaterial
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "material not found" });
        }

        res.status(204).send({ message: "material deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting material:", error);
        res.status(500).send({ message: "Failed to delete material" });
    } finally {
        client.release();
    }
});

//order
app.get("/order/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT order_tb.id AS "id", customer.id AS "customerID", order_tb.servicetype AS "serviceType", order_tb.totalprice AS "totalPrice", order_tb.staffid AS "staffID", order_tb.tableid AS "tableID", order_tb.orderdate AS "orderDate", array_agg(order_details.productid) AS "productIDs", order_tb.status AS "status" FROM order_tb JOIN customer ON order_tb.phonecustomer = customer.phone JOIN order_details ON order_tb.id = order_details.orderid GROUP BY order_tb.id, customer.id, order_tb.servicetype, order_tb.totalprice, order_tb.staffid, order_tb.tableid, order_tb.orderdate');
        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/order", async (req, res) => {
    const { customerID, serviceType, totalPrice, orderDate, staffID, status } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO order_tb (customerid, serviceType, totalprice, orderDate, staffID, status)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(query, [customerID, serviceType, totalPrice, orderDate, staffID, status]);
        res.status(201).send({ message: "Order added successfully!" });
    } catch (error) {
        console.error("Error adding order:", error);
        res.status(500).send({ message: "Failed to add order" });
    } finally {
        client.release();
    }
})

app.get("/order/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        const query = `
            SELECT 
                order_tb.id AS "id", 
                customer.customerid AS "customerID", 
                order_tb.servicetype AS "serviceType", 
                order_tb.totalprice AS "totalPrice", 
                order_tb.staffid AS "staffID", 
                order_tb.tableid AS "tableID", 
                order_tb.orderdate AS "orderDate", 
                array_agg(order_details.productid) AS "productIDs"
            FROM 
                order_tb
            JOIN 
                customer 
            ON 
                order_tb.phonecustomer = customer.phone
            JOIN 
                order_details 
            ON 
                order_tb.id = order_details.orderid
            WHERE 
                order_tb.id = $1
            GROUP BY 
                order_tb.id, 
                customer.customerid, 
                order_tb.servicetype, 
                order_tb.totalprice, 
                order_tb.staffid, 
                order_tb.tableid, 
                order_tb.orderdate;
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    } finally {
        client.release();
    }
});

app.put("/order/:id", async (req, res) => {
    const { customerID, serviceType, totalPrice, orderDate, staffID, status } = req.body;
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
             UPDATE order_tb
             SET customerid = $1, servicetype = $2, totalprice = $3, orderDate = $4, staffID =$5, status = $6
             WHERE id = $7
         `;
        const result = await client.query(query, [customerID, serviceType, totalPrice, orderDate, staffID, status, idAsInteger]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Order ${id} not found" });
        }

        res.status(200).send({ message: "Order edited successfully!" });
    } catch (error) {
        console.error("Error editing order:", error);
        res.status(500).send({ message: "Failed to edit order" });
    } finally {
        client.release();
    }
});

app.delete("/order/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("OrderID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM order_tb
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "order not found" });
        }

        res.status(204).send({ message: "Order deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send({ message: "Failed to delete order" });
    } finally {
        client.release();
    }
});

//promote
app.get("/promote/list", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM PROMOTE ORDER BY ID ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        res.status(500).send({ message: "Failed to fetch promotions" });
    }
});

app.get("/promote/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM PROMOTE WHERE ID = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: `Promotion with ID ${id} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching promotion:", error);
        res.status(500).send({ message: "Failed to fetch promotion" });
    }
});

app.post("/promote", async (req, res) => {
    const { name, description, discount, promoteType, startAt, endAt } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO PROMOTE (NAME, DESCRIPTION, DISCOUNT, PROMOTETYPE, STARTAT, ENDAT) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, description, discount, promoteType, startAt, endAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating promotion:", error);
        res.status(500).send({ message: "Failed to create promotion" });
    }
});

app.put("/promote/:id", async (req, res) => {
    const { name, description, discount, promoteType, startAt, endAt  } = req.body;
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();
    try {
        const result = await pool.query(
            `UPDATE PROMOTE 
             SET NAME = $1, DESCRIPTION = $2, DISCOUNT = $3, PROMOTETYPE = $4, STARTAT = $5, ENDAT = $6 
             WHERE ID = $7 RETURNING *`,
            [name, description, discount, promoteType, startAt, endAt, idAsInteger]
        );
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Promotion with ID ${id} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating promotion:", error);
        res.status(500).send({ message: "Failed to update promotion" });
    }
});

app.delete("/promote/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result1 = await pool.query("DELETE FROM COUPON WHERE PROMOTEID = $1", [id]);
        const result = await pool.query("DELETE FROM PROMOTE WHERE ID = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Promotion with ID ${id} not found` });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting promotion:", error);
        res.status(500).send({ message: "Failed to delete promotion" });
    }
});

//coupon
app.get("/promote/coupon/list", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                coupon.id AS coupon_id,
                coupon.code,
                coupon.status,
                promote.id AS promote_id,
                promote.name,
                promote.description,
                promote.discount,
                promote.promoteType,
                promote.startAt,
                promote.endAt
            FROM COUPON
            JOIN PROMOTE ON coupon.promoteid = promote.id
        `);

        // Xử lý dữ liệu để tổ chức lại theo cấu trúc mong muốn
        const formattedResult = result.rows.map(row => ({
            id: row.coupon_id,
            code: row.code,
            status: row.status,
            promote: {
                id: row.promote_id,
                name: row.name,
                description: row.description,
                discount: row.discount,
                promoteType: row.promoteType,
                startAt: row.startat,
                endAt: row.endat,
            },
        }));

        res.status(200).json(formattedResult);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).send({ message: "Failed to fetch coupons" });
    }
});

// Lấy thông tin coupon theo ID
app.get("/promote/coupon/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                coupon.id AS coupon_id,
                coupon.code,
                coupon.status,
                promote.id AS promote_id,
                promote.name,
                promote.description,
                promote.discount,
                promote.promoteType,
                promote.startAt,
                promote.endAt
            FROM COUPON
            JOIN PROMOTE ON coupon.promoteid = promote.id
            WHERE coupon.id = $1
        `, [id]);

        // Kiểm tra nếu không có kết quả
        if (result.rows.length === 0) {
            return res.status(404).send({ message: `Coupon with ID ${id} not found` });
        }

        // Định dạng kết quả
        const row = result.rows[0];
        const formattedResult = {
            id: row.coupon_id,
            code: row.code,
            status: row.status,
            promote: {
                id: row.promote_id,
                name: row.name,
                description: row.description,
                discount: row.discount,
                promoteType: row.promoteType,
                startAt: row.startat,
                endAt: row.endat,
            },
        };

        res.status(200).json(formattedResult);
    } catch (error) {
        console.error("Error fetching coupon:", error);
        res.status(500).send({ message: "Failed to fetch coupon" });
    }
});


// Tạo một coupon mới
app.post("/promote/coupon", async (req, res) => {
    const { code, status, promoteId } = req.body;
    try {

        const result = await pool.query(
            `INSERT INTO COUPON (CODE, STATUS, PROMOTEID) VALUES ($1, $2, $3) RETURNING *`,
            [code, status, promoteId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating coupon:", error);
        res.status(500).send({ message: "Failed to create coupon" });
    }
});

// Cập nhật thông tin coupon theo ID
app.put("/promote/coupon/:id", async (req, res) => {
    const { id } = req.params;
    const { code, status, promoteId } = req.body;
    try {
        const result = await pool.query(
            `UPDATE COUPON 
             SET CODE = $1, STATUS = $2, PROMOTEID = $3 
             WHERE ID = $4 RETURNING *`,
            [code, status, promoteId, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Coupon with ID ${id} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).send({ message: "Failed to update coupon" });
    }
});

// Xóa coupon theo ID
app.delete("/promote/coupon/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM COUPON WHERE ID = $1", [id]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Coupon with ID ${id} not found` });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).send({ message: "Failed to delete coupon" });
    }
});

//membership
app.get("/membership/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM membership ORDER BY ID ASC");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/membership", async (req, res) => {
    const { rank, mprice, discount } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO membership (rank, mprice, discount)
            VALUES ($1, $2, $3)
        `;
        await client.query(query, [rank, mprice, discount]);
        res.status(201).send({ message: "Membership added successfully!" });
    } catch (error) {
        console.error("Error adding membership:", error);
        res.status(500).send({ message: "Failed to add membership" });
    } finally {
        client.release();
    }
})

app.put("/membership/:id", async (req, res) => {
    const { id, rank, mprice, discount } = req.body;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            UPDATE membership
            SET rank = $1, mpoint = $2, discount = $3
            WHERE id = $4
        `;
        const result = await client.query(query, [rank, mprice, discount, idAsInteger]);

        if (result.rowCount === 0) {
            return res.status(404).send({ message: "membership ${id} not found" });
        }

        res.status(200).send({ message: "Membership edited successfully!" });
    } catch (error) {
        console.error("Error editing membership:", error);
        res.status(500).send({ message: "Failed to edit material" });
    } finally {
        client.release();
    }
});

app.get("/membership/:rank", async (req, res) => {
    const { rank } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM membership WHERE rank = $1";
        const result = await client.query(query, [rank]);

        if (result.rowCount === 0) {
            // Không tìm thấy khách hàng
            return res.status(404).json({ message: "Membership not found" });
        }

        // Trả về thông tin khách hàng
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching membership:", error);
        res.status(500).json({ message: "Failed to fetch membership" });
    } finally {
        client.release();
    }
});

app.delete("/membership/:id", async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("MembershipID to delete:", id);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM membership
            WHERE id = $1
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            // Nếu không tìm thấy bản ghi để xóa
            return res.status(404).send({ message: "membership not found" });
        }

        res.status(204).send({ message: "membership deleted" }); // Xóa thành công,
    } catch (error) {
        console.error("Error deleting membership:", error);
        res.status(500).send({ message: "Failed to delete membership" });
    } finally {
        client.release();
    }
});


app.listen(3000, console.log("Server Running"));