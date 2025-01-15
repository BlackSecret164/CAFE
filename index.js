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
const JWT_SECRET = "your_jwt_secret_key";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

function roleGuard(requiredRole) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Gắn thông tin user vào request

            if (decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Forbidden: You do not have the required permissions" });
            }
            next(); // Cho phép tiếp tục nếu đúng role
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    };
}

app.get("/admin", roleGuard("admin"), (req, res) => {
    res.status(200).json({ message: `Welcome Admin, ${req.user.phone}` });
});

app.get("/staff", roleGuard("staff"), (req, res) => {
    res.status(200).json({ message: `Welcome Staff, ${req.user.phone}` });
});

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

app.post("/auth/signin", async (req, res) => {
    const { phone, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM staff WHERE phone = $1", [phone]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Phone number not found!" });
        }

        const user = result.rows[0];
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role }, // Thêm role vào token
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Signin successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/auth/callback", async (req, res) => {
    try {
        // Lấy JWT từ header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        // Xác minh và giải mã token
        const decoded = jwt.verify(token, JWT_SECRET);
        const staffID = decoded.id;

        // Truy vấn thông tin người dùng từ cơ sở dữ liệu
        const userResult = await pool.query("SELECT id, name, phone, role FROM staff WHERE id = $1", [staffID]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
        }

        const user = userResult.rows[0];

        // Lưu log hoạt động
        const logQuery = `
            INSERT INTO activity_logs (staffid, action, timestamp)
            VALUES ($1, $2, $3)
        `;
        const action = "User accessed callback API";
        const timestamp = new Date();
        await pool.query(logQuery, [user.id, action, timestamp]);

        // Trả về thông tin người dùng
        return res.status(200).json({
            msg: "ok",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in callback:", error);
        return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
});

//staff
app.get("/staff/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`SELECT id, name, gender, birth, address, phone, workhours as "workHours", minsalary, salary, typestaff as "typeStaff", startdate as "startDate", activestatus as "activeStatus", password, role FROM staff ORDER BY ID ASC`);

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/staff", async (req, res) => {
    const { name, gender, birth, address, phone, workHours, minsalary, typeStaff, startDate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO staff (name, gender, birth, address, phone, workHours, minsalary, typestaff, startdate)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await client.query(query, [name, gender, birth, address, phone, workHours, minsalary, typeStaff, startDate]);
        res.status(201).send({ message: "Staff added successfully!" });
    } catch (error) {
        console.error("Error adding staff:", error);
        res.status(500).send({ message: "Failed to add staff" });
    } finally {
        client.release();
    }
});

app.put("/staff/:id", async (req, res) => {
    const { id } = req.params;
    const { name, gender, birth, address, phone, workHours, minsalary, typeStaff, startDate } = req.body;
    const idAsInteger = parseInt(id, 10);
    const workHoursAsInteger = parseInt(workHours, 10);
    const minsalaryAsInteger = parseInt(minsalary, 10);
    const client = await pool.connect();
    try {
        const query = `
            UPDATE staff
            SET name = $1, gender = $2, birth = $3, address = $4, phone = $5, workhours = $6, minsalary = $7, typestaff = $8, startdate = $9, salary = COALESCE($6, 0) * COALESCE($7, 0)
            WHERE id = $10
        `;
        const result = await client.query(query, [name, gender, birth, address, phone, workHoursAsInteger, minsalaryAsInteger, typeStaff, startDate, idAsInteger]);

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
        const query = 'SELECT id, name, gender, birth, address, phone, workhours as "workHours", minsalary, salary, typestaff as "typeStaff", startdate as "startDate", activestatus as "activeStatus", password, role FROM staff WHERE id = $1';
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
        const result = await client.query(`SELECT id, name, phone, gender, total, registrationdate AS "registrationDate", rank FROM customer ORDER BY ID ASC`);

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

app.put("/customer/total/:phone", async (req, res) => {
    const { total } = req.body;
    const { phone } = req.params;
    console.log("Received phone:", phone);
    const client = await pool.connect();
    try {
        const query = `
            UPDATE customer
            SET total = $1
            WHERE phone = $2
        `;
        const result = await client.query(query, [total, phone]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Customer ${phone} not found" });
        }

        res.status(200).send({ message: "Customer edited successfully!" });
    } catch (error) {
        console.error("Error editing customer:", error);
        res.status(500).send({ message: "Failed to edit customer" });
    } finally {
        client.release();
    }
});

app.put("/customer/:id", async (req, res) => {
    const { name, phone, gender, registrationDate, total } = req.body; // Xóa phonecustomer khỏi body
    const { id } = req.params; // Lấy phonecustomer từ URL params
    console.log("Received ID:", id);
    if (!id || isNaN(Number(id))) {
        return res.status(400).send({ message: "Invalid customer ID" });
    }
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();
    try {
        const query = `
            UPDATE customer
            SET name = $1, phone =$2, gender = $3, registrationdate = $4, total = $5
            WHERE id = $6
        `;
        const result = await client.query(query, [name, phone, gender, registrationDate, total, idAsInteger]);

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

app.get("/customer/search", async (req, res) => {
    const { phone } = req.query; // Nhận số điện thoại từ query string
    const client = await pool.connect();

    try {
        const query = `
            SELECT name, phone
            FROM customer 
            WHERE phone LIKE $1
            LIMIT 10`;  // Giới hạn số kết quả trả về để tránh load quá nhiều

        // Thêm dấu "%" ở hai đầu để tìm kiếm số điện thoại chứa chuỗi đã nhập ở bất kỳ đâu
        const result = await client.query(query, [`%${phone}%`]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No customers found" });
        }

        // Trả về danh sách khách hàng khớp với phần số điện thoại nhập vào
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Failed to fetch customers" });
    } finally {
        client.release();
    }
});

app.get("/customer/:phone", async (req, res) => {
    const { phone } = req.params;
    const client = await pool.connect();

    try {
        const query = 'SELECT id, name, phone, gender, total, registrationdate AS "registrationDate", rank FROM customer WHERE phone = $1';
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
        const result = await client.query(`SELECT id, status, phoneOrder AS "phoneOrder", bookingtime AS "bookingTime", seatingtime AS "seatingTime", seat FROM tables ORDER BY ID ASC`);

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
        const bookingTimeOrNull = bookingTime ? bookingTime : null;  // Nếu bookingTime là chuỗi rỗng, gán giá trị null
        const seatingTimeOrNull = seatingTime ? seatingTime : null;  // Tương tự với seatingTime
        const result = await client.query(query, [status, phoneOrder, bookingTimeOrNull, seatingTimeOrNull, seat, idAsInteger]);

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
        const query = `SELECT id, status, phoneOrder AS "phoneOrder", bookingtime AS "bookingTime", seatingtime AS "seatingTime", seat FROM tables WHERE id = $1`;
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

app.put("/table/complete/:id", async (req, res) => {
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
             UPDATE tables
             SET status = 'Available', phoneorder = null, bookingtime = null, seatingtime = null
             WHERE id = $1
         `;
        const result = await client.query(query, [idAsInteger]);

        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
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

//material
app.get("/material/list", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`SELECT id, name, quantityimported AS "quantityImported", quantitystock AS "quantityStock", price, storagetype AS "storageType", importdate AS "importDate", expirydate AS "expiryDate" FROM rawmaterial ORDER BY ID ASC`);

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
        const query = 'SELECT id, name, quantityimported AS "quantityImported", quantitystock AS "quantityStock", price, storagetype AS "storageType", importdate AS "importDate", expirydate AS "expiryDate" FROM rawmaterial WHERE id = $1';
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
        const result = await client.query('SELECT order_tb.id AS "id", order_tb.phonecustomer AS "phone", order_tb.servicetype AS "serviceType", order_tb.totalprice AS "totalPrice", staff.name AS "staffName", order_tb.tableid AS "tableID", order_tb.orderdate AS "orderDate", array_agg(order_details.productid) AS "productIDs", order_tb.status AS "status" FROM order_tb JOIN staff ON order_tb.staffid = staff.id JOIN order_details ON order_tb.id = order_details.orderid GROUP BY order_tb.id, order_tb.phonecustomer, order_tb.servicetype, order_tb.totalprice, staff.name, order_tb.tableid, order_tb.orderdate');
        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.post("/order", async (req, res) => {
    const { phone, serviceType, totalPrice, orderDate, staffID, tableID, status } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO order_tb (phonecustomer, serviceType, totalprice, orderDate, staffID, tableID, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(query, [phone, serviceType, totalPrice, orderDate, staffID, tableID, status]);
        res.status(201).send({ message: "Order added successfully!" });
    } catch (error) {
        console.error("Error adding order:", error);
        res.status(500).send({ message: "Failed to add order" });
    } finally {
        client.release();
    }
})

app.get("/order/new", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT id AS "id", phonecustomer AS "phone", servicetype AS "serviceType", tableid AS "tableID", orderdate AS "orderDate" FROM order_tb WHERE ID=(SELECT MAX(ID) from order_tb)');
        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally {
        client.release();
    }

    res.status(404);
})

app.get("/order/:id", async (req, res) => {
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            SELECT 
                order_tb.id AS "id", 
                order_tb.phonecustomer AS "phone", 
                order_tb.servicetype AS "serviceType", 
                order_tb.totalprice AS "totalPrice", 
                staff.name AS "staffName", 
                order_tb.tableid AS "tableID", 
                order_tb.orderdate AS "orderDate", 
                array_agg(order_details.productid) AS "productIDs"
            FROM 
                order_tb
            JOIN 
                staff 
            ON 
                order_tb.staffid = staff.id
            JOIN 
                order_details 
            ON 
                order_tb.id = order_details.orderid
            WHERE 
                order_tb.id = $1
            GROUP BY 
                order_tb.id, 
                order_tb.phonecustomer, 
                order_tb.servicetype, 
                order_tb.totalprice, 
                staff.name, 
                order_tb.tableid, 
                order_tb.orderdate;
        `;
        const result = await client.query(query, [idAsInteger]);

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
    const { phone, serviceType, totalPrice, orderDate, status } = req.body;
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
             UPDATE order_tb
             SET phonecustomer = $1, servicetype = $2, totalprice = $3, orderDate = $4, status = $5
             WHERE id = $6
         `;
        const result = await client.query(query, [phone, serviceType, totalPrice, orderDate, status, idAsInteger]);

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

app.put("/order/complete/:id", async (req, res) => {
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
             UPDATE order_tb
             SET status = 'Hoàn thành'
             WHERE id = $1
         `;
        const result = await client.query(query, [idAsInteger]);

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

app.put("/order/cancel/:id", async (req, res) => {
    const { id } = req.params;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
             UPDATE order_tb
             SET status = 'Đã hủy'
             WHERE id = $1
         `;
        const result = await client.query(query, [idAsInteger]);

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

app.post("/order/detail/:id", async (req, res) => {
    const { orderID, productID, size, mood, quantity_product } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO ORDER_DETAILS (orderID, productID, size, mood, quantity_product) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [orderID, productID, size, mood, quantity_product]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating detail:", error);
        res.status(500).send({ message: "Failed to create details" });
    }
});

//promote
app.get("/promote/list", async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, name, description, discount, promoteType AS "promoteType", startAt AS "startAt", endAt AS "endAt" FROM PROMOTE ORDER BY ID ASC`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        res.status(500).send({ message: "Failed to fetch promotions" });
    }
});

app.get("/promote/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT id, name, description, discount, promoteType AS "promoteType", startAt AS "startAt", endAt AS "endAt" FROM PROMOTE WHERE ID = $1`, [id]);
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
    const { name, description, discount, promoteType, startAt, endAt } = req.body;
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
                promoteType: row.promotetype,
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
                promoteType: row.promotetype,
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
    const { id } = req.params;
    const { rank, mprice, discount } = req.body;
    const idAsInteger = parseInt(id, 10);
    const client = await pool.connect();

    try {
        const query = `
            UPDATE membership
            SET rank = $1, mprice = $2, discount = $3
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

app.get('/report/system', async (req, res) => {
    const client = await pool.connect();
    try {
        // Tổng quan báo cáo
        const { rows: [overview] } = await client.query(`
            SELECT
                (SELECT SUM(totalprice) FROM order_tb) AS totalPayment, 
                (SELECT COUNT(*) FROM product) AS totalProduct,
                (SELECT COUNT(*) FROM customer) AS totalCustomer,
                (SELECT COUNT(*) FROM staff) AS totalStaff,
                (SELECT COUNT(*) FROM order_tb) AS totalOrder,
                (SELECT COUNT(*) FROM tables) AS totalTable
        `);

        // Đơn hàng và doanh thu trong 14 ngày
        const { rows: last14DaysOrder } = await client.query(`
            SELECT DATE(orderdate) AS date, COUNT(*) AS amount
            FROM order_tb
            WHERE orderdate >= NOW() - INTERVAL '14 DAYS'
            GROUP BY DATE(orderdate)
            ORDER BY date ASC
        `);

        const { rows: last14DaysOrderValue } = await client.query(`
            SELECT DATE(orderdate) AS date, SUM(totalprice) AS amount
            FROM order_tb
            WHERE orderdate >= NOW() - INTERVAL '14 DAYS'
            GROUP BY DATE(orderdate)
            ORDER BY date ASC
        `);

        // Đơn hàng và doanh thu trong 30 ngày
        const { rows: last30DaysOrderValue } = await client.query(`
            SELECT DATE(orderdate) AS date, SUM(totalprice) AS amount
            FROM order_tb
            WHERE orderdate >= NOW() - INTERVAL '30 DAYS'
            GROUP BY DATE(orderdate)
            ORDER BY date ASC
        `);

        // Số lượng bán ra của các loại nước
        const { rows: salesByCategory } = await client.query(`
            SELECT category AS category, COUNT(*) AS amount
            FROM product
            JOIN order_details ON product.id = order_details.productid
            GROUP BY category
        `);

        // Xếp hạng khách hàng
        const { rows: rankMap = [] } = await client.query(`
            SELECT rank, COUNT(*) AS count
            FROM customer
            GROUP BY rank
        `);

        // Thống kê Takeaway / Dine-in
        const { rows: [serviceType = {}] } = await client.query(`
            SELECT 
              SUM(CASE WHEN servicetype = 'Take Away' THEN 1 ELSE 0 END) AS takeAway,
              SUM(CASE WHEN servicetype = 'Dine In' THEN 1 ELSE 0 END) AS dineIn
            FROM order_tb
        `);

        const { rows: topProducts } = await client.query(`
            SELECT 
              product.name,
              COUNT(order_details.productid) AS amount
            FROM 
              order_details
            JOIN 
              product ON product.id = order_details.productid
            GROUP BY 
              product.name
            ORDER BY 
              amount DESC
            LIMIT 5
        `);

        const formattedOverview = {
            totalPayment: parseInt(overview[0].totalPayment, 10),
            totalProduct: parseInt(overview[0].totalProduct, 10),
            totalCustomer: parseInt(overview[0].totalCustomer, 10),
            totalStaff: parseInt(overview[0].totalStaff, 10),
            totalOrder: parseInt(overview[0].totalOrder, 10),
            totalTable: parseInt(overview[0].totalTable, 10),
        };

        const formattedLast14DaysOrder = last14DaysOrder.map(order => ({
            date: order.date,
            amount: parseInt(order.amount, 10),
        }));

        const formattedLast14DaysOrderValue = last14DaysOrderValue.map(order => ({
            date: order.date,
            amount: parseInt(order.amount), // Nếu giá trị là tiền, dùng parseFloat
        }));

        const formattedLast30DaysOrderValue = last30DaysOrderValue.map(order => ({
            date: order.date,
            amount: parseInt(order.amount), // Nếu giá trị là tiền, dùng parseFloat
        }));

        const formattedSalesByCategory = salesByCategory.map(item => ({
            category: item.category,
            amount: parseInt(item.amount, 10),
        }));

        const formattedRankMap = rankMap.reduce((acc, row) => {
            acc[row.rank] = parseInt(row.count, 10); // Đảm bảo giá trị là số nguyên
            return acc;
        }, {});

        const formattedServiceType = {
            takeAway: parseInt(serviceType.takeAway, 10),
            dineIn: parseInt(serviceType.dineIn, 10),
        };

        const formattedTopProducts = topProducts.map(product => ({
            name: product.name,
            amount: parseInt(product.amount, 10)  // Đảm bảo 'amount' là số nguyên
        }));

        // Tạo phản hồi tổng hợp
        res.json({
            ...formattedOverview,
            last14DaysOrder: formattedLast14DaysOrder,
            last14DaysOrderValue: formattedLast14DaysOrderValue,
            last30DaysOrderValue: formattedLast30DaysOrderValue,
            salesByCategory: formattedSalesByCategory,
            rankMap: formattedRankMap,
            serviceType: formattedServiceType,
            topProducts: formattedTopProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy báo cáo hệ thống.' });
    } finally {
        client.release();
    }
});



app.listen(3000, console.log("Server Running"));