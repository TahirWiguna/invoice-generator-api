const requestIp = require("request-ip");
const helmet = require("helmet");
const cors = require("cors");

const { logger, logError, logRequest } = require("./utils/logger");
const sendEmail = require("./utils/email");

const authRouter = require("./routes/auth/auth");
const usersRouter = require("./routes/auth/users");
const rolesRouter = require("./routes/auth/roles");
const usersRolesRouter = require("./routes/auth/users_roles");
const permissionRouter = require("./routes/auth/permission");
const rolesPermissionRouter = require("./routes/auth/roles_permission");

const clientRouter = require("./routes/client");
const itemRouter = require("./routes/item");
const invoiceRouter = require("./routes/invoice");
const paymentMethodRouter = require("./routes/payment_method");

// SETUP
const express = require("express");
const app = express();
const PORT = 3000;

const API_URL = "/v1/api";

// MIDDLEWARE
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use(requestIp.mw());
app.use(logRequest);
app.use(logError);

// ROUTER
app.use(API_URL, authRouter);
app.use(API_URL, usersRouter);
app.use(API_URL, rolesRouter);
app.use(API_URL, usersRolesRouter);
app.use(API_URL, permissionRouter);
app.use(API_URL, rolesPermissionRouter);

app.use(API_URL, clientRouter);
app.use(API_URL, itemRouter);
app.use(API_URL, invoiceRouter);
app.use(API_URL, paymentMethodRouter);

app.get("/email", async (req, res) => {
    const send = await sendEmail(
        "mtahirwiguna@gmail.com",
        "Invoice Generator",
        "<div>Ini adalah invoice gen</div><div>haha</div>"
    );
    res.send(send);
});

// SYNC DB
// const db = require("./models_sequelize")
// db.sequelize
//   .sync()
//   .then(() => {
//     console.log("Synced db.")
//   })
//   .catch((err) => {
//     console.log("Failed to sync db: " + err.message)
//   })

// LISTEN
app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT} | ENV ${process.env.NODE_ENV}`);
});

module.exports = app;

// Error handler
function errorHandler(err, req, res, next) {
    if (err.code === "23505") {
        // Handle unique constraint violation error
        res.status(409).json({ message: "Data already exist" });
    } else {
        res.status(err.status).json({
            message: "Oops! Something went wrong.",
            error: err.message,
            err,
        });
    }
}
