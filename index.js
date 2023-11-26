const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const mongoDBConnect = require("./config/db");
dotenv.config({ path: "./.env" });

const logger = require('./middleware/logger');
const { authenticated } = require('./middleware/auth');
const { checkUserExists } = require('./utils/checkAccess');

const userRoutes = require("./versions/v1/routes/userRoutes");
const projectRoutes = require("./versions/v1/routes/projectRoutes");
const imgMgmtRoutes = require("./versions/v1/routes/imgMgmtRoutes");

const app = express();

const corsOptions = {
    origin: true,
    methods: ["GET", "PUT", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 200,
};
const server = http.createServer(app);

if (process.env.NODE_ENV === "development") {
    app.use(logger);
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cookieParser());
app.use(mongoSanitize({
    replaceWith: '-'
}));

app.get('/users/:user_id/private/documents/:filename', authenticated, async (req, res) => {
    const user_id = req.params.user_id;
    const requestedFile = `/users/${user_id}/private/documents/${req.params.filename}`;

    const user = await checkUserExists(user_id);

    const isAuthenticatedUser = user_id == user._id || user.user_type === 'admin';

    if (isAuthenticatedUser) {
        res.sendFile(requestedFile);
    } else {
        res.status(403).send('Access denied.');
    }
});

app.use(express.static('uploads'));
// Connecting with DB
mongoDBConnect();

app.use("/my_apis/v1/user", userRoutes);
app.use("/my_apis/v1/project", projectRoutes);
app.use("/my_apis/v1/images", imgMgmtRoutes);

app.get("/", async (req, res) => {
    res.status(200).json({ status: false, message: "Routes are working fine." });
});

const PORT_NO = process.env.PORT ? process.env.PORT : 5001;
const HOST = process.env.HOST ? process.env.HOST : "http://localhost";

if (process.env.NODE_ENV === "development") {
    server.listen(PORT_NO, () => {
        console.log(`App running at ${HOST}:${PORT_NO}`);
    })
}
