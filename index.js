const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cron = require('node-cron');
const mongoSanitize = require('express-mongo-sanitize');

const mongoDBConnect = require("./config/db");
dotenv.config({ path: "./.env" });

const logger = require('./middleware/logger');

const userRoutes = require("./versions/v1/routes/userRoutes");
const projectRoutes = require("./versions/v1/routes/projectRoutes");

const app = express();

let corsOptions = {
    origin: true,
    methods: "GET,PUT,POST,OPTIONS",
    credentials: true,
    preflightContinue: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
if (process.env.NODE_ENV === "development") {
    app.use(logger);
}

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cookieParser());
app.use(express.static('public'));
app.use(mongoSanitize({
    replaceWith: '-'
}));

// Connecting with DB
mongoDBConnect();

app.use("/my_apis/v1/user", userRoutes);
app.use("/my_apis/v1/project", projectRoutes);

app.get("/", async (req, res) => {
    res.status(200).json({ status: false, message: "Rooutes are working fine." });
});

const PORT_NO = process.env.SERVER_PORT ? process.env.SERVER_PORT : 5001;
const HOST = process.env.SERVER_HOST ? process.env.SERVER_HOST : "http://localhost";

if (process.env.NODE_ENV === "development") {
    app.listen(PORT_NO, () => {
        console.log(`App running at ${HOST}:${PORT_NO}`);
    });
}
