const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const optimizedImg = require("../middleware/sharp-config");

const router = express.Router();

const bookCtrl = require("../controllers/books");

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, optimizedImg, bookCtrl.createBook);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, optimizedImg, bookCtrl.modifyBook);
router.delete("/:id", auth, multer, bookCtrl.deleteBook);
router.post("/:id/rating", auth, bookCtrl.rateABook);

module.exports = router;
