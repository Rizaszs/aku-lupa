const http = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const hbs = require("hbs");

const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");

//import db connection
const dbConnection = require("./connection/db");


// app.use(express.static('express'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({
    extended: false
}));

// set views location to app
app.set("views", path.join(__dirname, "views"));

//set template/view engine
app.set("view engine", "hbs");

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(
    session({
        cookie: {
            maxAge: 2 * 60 * 60 * 1000,
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: "secretValue"
    })
);
// render index page
app.get("/", function (req, res) {
    const query = "SELECT * FROM tb_product ORDER BY created_at DESC";

    dbConnection.getConnection((err, conn) => {
        if (err) throw err;

        conn.query(query, (err, results) => {
            if (err) throw err;

            let products = []

            for (let result of results) {
                products.push(result)
            }

            res.render("index", {
                title: "BelanjaIN Indonesia",
                isLogin: req.session.isLogin, products });
        });
        
        conn.release();
    });
});

// moun auth route
app.use("/", authRoute);
// moun product route
app.use("/product", productRoute);

const server = http.createServer(app);
const port = 5000
server.listen(port, () => {
    console.log('server running on port: ', port)
});