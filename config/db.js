const mongoose = require('mongoose');

const mongoDBConnect = () => {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const conn = mongoose.connection;
    conn.on("error", console.error.bind(console, "connection error: "));
    conn.once("open", function () {
        console.log("DB connected successfully");
    });
};

module.exports = mongoDBConnect;