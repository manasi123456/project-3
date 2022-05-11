const express = require('express');
const router = express.Router();

const userControl=require("../controllers/userController")
const bookControl=require('../controllers/booksController');
const md=require('../middelware/middleware')
//Userlogin 
router.post("/login",userControl.loginUser)
//UserRegister
router.post("/register",userControl.userCreation)
router.post("/books",md.userAuth,bookControl.bookCreation);
router.get("/books",md.userAuth,bookControl.fetchAllBooks)
router.put("/books/:bookId",md.userAuth,bookControl.updateBookDetails)
router.get("/books/:bookId",md.userAuth,bookControl.fetchBooksById)
router.delete("/books/:bookId",md.userAuth,bookControl.deleteBook)
module.exports = router;








