const express = require("express");

const router = express.Router();

const userCtrl = require("../controllers/user");
const emailValidator = require("../middleware/emailController")
const passwordValidator = require("../middleware/passwordControler")

router.post("/signup", emailValidator, passwordValidator, userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
