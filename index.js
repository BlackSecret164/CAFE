const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
const file  = fs.readFileSync("./api-docs.yaml", "utf8");
const swaggerDocument = YAML.parse(file);

const corsOptions = {
    origin: ['http://localhost:3000', 'https://cafe-k5p5.onrender.com'], // Danh sách các origin được phép
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

const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD} = process.env;

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl:{
        require: true,
        rejectUnauthorized: false
    }
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/staff/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM staff");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.get("/customer/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM customer");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.get("/product/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM product");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.get("/table/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM tables");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.get("/material/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM rawmaterial");

        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.get("/order/list", async (req, res) =>{
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM order_tb");
        res.json(result.rows);
    } catch (errors) {
        console.log(errors)
    } finally{
        client.release();
    }

    res.status(404);
})

app.post("/customer", async (req, res) => {
    const { fullname, phonecustomer, gender, registrationdate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO customer (fullname, phonecustomer, gender, registrationdate)
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(query, [ fullname, phonecustomer, gender, registrationdate]);
        res.status(201).send({ message: "Customer added successfully!" });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).send({ message: "Failed to add customer" });
    } finally {
        client.release();
    }
});

app.post("/staff", async (req, res) => {
    const { fullname, phonestaff, birth, address, gender, typestaff, startdate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            INSERT INTO staff (fullname, phonestaff, birth, address, gender, typestaff, startdate)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(query, [ fullname, phonestaff, birth, address, gender, typestaff, startdate]);
        res.status(201).send({ message: "Staff added successfully!" });
    } catch (error) {
        console.error("Error adding staff:", error);
        res.status(500).send({ message: "Failed to add staff" });
    } finally {
        client.release();
    }
});

app.put("/customer/:phonecustomer", async (req, res) => {
    const { fullname, gender, registrationdate } = req.body; // Xóa phonecustomer khỏi body
    const { phonecustomer } = req.params; // Lấy phonecustomer từ URL params
    const client = await pool.connect();

    try {
        const query = `
            UPDATE customer
            SET fullname = $1, gender = $2, registrationdate = $3
            WHERE phonecustomer = $4
        `;
        const result = await client.query(query, [fullname, gender, registrationdate, phonecustomer]);
        
        // Kiểm tra nếu không có hàng nào bị ảnh hưởng
        if (result.rowCount === 0) {
            return res.status(404).send({ message: "Customer ${phonecustomer} not found" });
        }

        res.status(200).send({ message: "Customer edited successfully!" });
    } catch (error) {
        console.error("Error editing customer:", error);
        res.status(500).send({ message: "Failed to edit customer" });
    } finally {
        client.release();
    }
});


app.delete("/customer/:phonecustomer", async (req, res) => {
    const { phonecustomer } = req.params; // Lấy phonecustomer từ params
    const client = await pool.connect();

    try {
        // Ghi log để kiểm tra giá trị nhận được
        console.log("Phonecustomer to delete:", phonecustomer);

        // Xóa dữ liệu trong invoice
        const query3 = `
            DELETE FROM invoice
            WHERE orderid IN (SELECT orderid FROM order_tb WHERE phonecustomer = $1)
        `;
        await client.query(query3, [phonecustomer]);

        // Xóa dữ liệu trong order_details
        const query2 = `
            DELETE FROM order_details
            WHERE orderid IN (SELECT orderid FROM order_tb WHERE phonecustomer = $1)
        `;
        await client.query(query2, [phonecustomer]);

        // Xóa dữ liệu trong order_tb
        const query1 = `
            DELETE FROM order_tb
            WHERE phonecustomer = $1
        `;
        await client.query(query1, [phonecustomer]);

        // Xóa dữ liệu trong customer
        const query = `
            DELETE FROM customer
            WHERE phonecustomer = $1
        `;
        const result = await client.query(query, [phonecustomer]);

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


app.get("/customer/:phonecustomer", async (req, res) => {
    const { phonecustomer } = req.params;
    const client = await pool.connect();

    try {
        const query = "SELECT * FROM customer WHERE phonecustomer = $1";
        const result = await client.query(query, [phonecustomer]);

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

app.get("/promote/list", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM PROMOTE");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching promotions:", error);
        res.status(500).send({ message: "Failed to fetch promotions" });
    }
});

// Lấy thông tin promotion theo ID
app.get("/promote/:promoteid", async (req, res) => {
    const { promoteid } = req.params;
    try {
        const result = await pool.query("SELECT * FROM PROMOTE WHERE PROMOTEID = $1", [promoteid]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: `Promotion with ID ${promoteid} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching promotion:", error);
        res.status(500).send({ message: "Failed to fetch promotion" });
    }
});

// Tạo một promotion mới
app.post("/promote", async (req, res) => {
    const { promoteName, description, discount, promoteType, startAt, endAt } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO PROMOTE (PROMOTENAME, DESCRIPTION, DISCOUNT, PROMOTETYPE, STARTAT, ENDAT) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [promoteName, description, discount, promoteType, startAt, endAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating promotion:", error);
        res.status(500).send({ message: "Failed to create promotion" });
    }
});

// Cập nhật thông tin promotion theo ID
app.put("/promote/:promoteid", async (req, res) => {
    const { promoteid } = req.params;
    const { promotename, description, discount, promotetype, startat, endat } = req.body;
    try {
        const result = await pool.query(
            `UPDATE PROMOTE 
             SET PROMOTENAME = $1, DESCRIPTION = $2, DISCOUNT = $3, PROMOTETYPE = $4, STARTAT = $5, ENDAT = $6 
             WHERE PROMOTEID = $7 RETURNING *`,
            [promotename, description, discount, promotetype, startat, endat, promoteid]
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

// Xóa promotion theo ID
app.delete("/promote/:promoteid", async (req, res) => {
    const { promoteid } = req.params;
    try {
        const result = await pool.query("DELETE FROM PROMOTE WHERE PROMOTEID = $1", [promoteid]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Promotion with ID ${promoteid} not found` });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting promotion:", error);
        res.status(500).send({ message: "Failed to delete promotion" });
    }
});

// Lấy danh sách tất cả các coupons
app.get("/promote/coupon/list", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM COUPON");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).send({ message: "Failed to fetch coupons" });
    }
});

// Lấy thông tin coupon theo ID
app.get("/promote/coupon/:couponid", async (req, res) => {
    const { couponid } = req.params;
    try {
        const result = await pool.query("SELECT * FROM COUPON WHERE COUPONID = $1", [couponid]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: `Coupon with ID ${couponid} not found` });
        }
        res.status(200).json(result.rows[0]);
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
app.put("/promote/coupon/:couponid", async (req, res) => {
    const { couponid } = req.params;
    const { code, status, promoteid } = req.body;
    try {
        const result = await pool.query(
            `UPDATE COUPON 
             SET CODE = $1, STATUS = $2, PROMOTEID = $3 
             WHERE COUPONID = $4 RETURNING *`,
            [code, status, promoteid, couponid]
        );
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Coupon with ID ${couponid} not found` });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating coupon:", error);
        res.status(500).send({ message: "Failed to update coupon" });
    }
});

// Xóa coupon theo ID
app.delete("/promote/coupon/:couponid", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM COUPON WHERE COUPONID = $1", [couponid]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `Coupon with ID ${couponid} not found` });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).send({ message: "Failed to delete coupon" });
    }
});

app.listen(3000, console.log("Server Running"));