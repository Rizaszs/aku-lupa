const router = require('express').Router()
//import db connection
const dbConnection = require("../connection/db");
const uploadFile = require('../middlewares/uploadFile');

// render product add form page
router.get("/add", function(req, res) {
    res.render("product/form-add", {
        title: "Add Product", 
        isLogin: req.session.isLogin 
    })
})

router.post("/", uploadFile("image"), function (req,res) {
    let {name, description} = req.body;
    let image = req.file.filename;

    const userId = req.session.user.id;

    console.log(description)

    description = description.replace(/(\r\n)/, "<br>")

    const query = "INSERT INTO tb_product (name, description, image, user_id) VALUES (?,?,?,?)"

    dbConnection.getConnection((err, conn) => {
        if (err) throw err;

        conn.query(query, [name, description, image, userId], (err, result) => {
            if (err) {
                req.session.message = {
                    type: "danger",
                    message: "server error"
                }
                res.redirect("/product/add")
            } else {
                req.session.message = {
                    type: "succes",
                    message: "add product success"
                }

                res.redirect(`/product/${result.insertId}`)
            }
        })
    })

})

// render detail product page
router.get("/:id", function(req, res) {
    const { id } = req.params;

    const query = "SELECT * FROM tb_product WHERE id = ?";

    dbConnection.getConnection((err, conn) => {
        if (err) throw err;

        conn.query(query, [id], (err,results) => {
            if (err) throw err;

            const product = results[0];
            let isContentOwner = false

            if (req.session.isLogin) {
                if (req.session.user.id == product.user_id) {
                    isContentOwner = true
                }
            }
            res.render("product/detail", {
                title: 'Products', 
                isLogin: req.session.isLogin, 
                product, 
                isContentOwner
            });
        });
        conn.release();
    });
});

module.exports = router