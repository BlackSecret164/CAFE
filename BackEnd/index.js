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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", async (req, res) =>{
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

app.get("/customer", async (req, res) =>{
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

app.get("/material", async (req, res) =>{
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