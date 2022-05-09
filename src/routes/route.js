const express = require('express');
const router = express.Router();

const userControl=require("../controllers/userController")

//Userlogin 
router.post("/login",userControl.loginUser)
//UserRegister
router.post("/register",userControl.userCreation)


module.exports = router;