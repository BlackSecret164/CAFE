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

app.use(cors());
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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://cafe-k5p5.onrender.com"); // Thay "*" bằng URL của Swagger nếu cần
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

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

app.put("/customer/:phonecustomer", async (req, res) => {
    const { fullname, phonecustomer, gender, registrationdate } = req.body;
    const client = await pool.connect();

    try {
        const query = `
            UPDATE customer
            SET fullname = $1, gender= $3, registrationdate = $4
            WHERE phonecustomer = $2
        `;
        await client.query(query, [ fullname, phonecustomer, gender, registrationdate]);
        res.status(201).send({ message: "Customer edited successfully!" });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).send({ message: "Failed to edited customer" });
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

app.listen(3000, console.log("Server Running"));