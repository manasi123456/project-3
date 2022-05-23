const express = require('express');
const router = express.Router();

const userControl=require("../controllers/userController")
const bookControl=require('../controllers/booksController')
const reviewControl=require("../controllers/reviewController")
const awsControl=require("../controllers/awsController")
const md=require('../middelware/middleware')
//Userlogin 
router.post("/login",userControl.loginUser)
//UserRegister
router.post("/register",userControl.userCreation)
//Books
router.post("/books",md.userAuth,bookControl.bookCreation)
router.get("/books",md.userAuth,bookControl.fetchAllBooks)
router.put("/books/:bookId",md.userAuth,bookControl.updateBookDetails)
router.get("/books/:bookId",md.userAuth,bookControl.fetchBooksById)
router.delete("/books/:bookId",md.userAuth,bookControl.deleteBook)
//reviews
router.post("/books/:bookId/review",reviewControl.addReview)
router.put("/books/:bookId/review/:reviewId",reviewControl.updateReview)
router.delete("/books/:bookId/review/:reviewId",md.userAuth,reviewControl.deleteReview)
router.post("/uploading",awsControl.sdk)
module.exports = router;








