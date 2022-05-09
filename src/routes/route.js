const express = require('express');
const router = express.Router();


// const booksControl=require("../controllers/booksController")
const userControl=require("../controllers/userController")

router.post("/login",userControl.loginUser)
router.post("/register",userControl.userCreation)
// router.get("/functionup/collegeDetails",collegecontrol.finddata)

module.exports = router;