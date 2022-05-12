const userModel = require('../models/userModel')
const bookModel=require('../models/booksModel')
//const jwt = require('jsonwebtoken')
const validator = require('../validator/validator')
const secretKey = 'Book_management'
const reviewModel=require('../models/reviewModel')
//Registering users
/*const reviewCreation = async function (req, res) {
    try {
        const bookId=req.params.bookId;
        const requestBody = req.body;
        const { //Object destructuring
       reviewedBy,   
       rating,
       review
        } = requestBody;

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }
    


        //Validation starts
        if (!validator.isValidRequestBody(requestBody)) { //to check the empty request query
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        }

        if (!validator.isValid(reviewedBy)) {
            return res.status(400).send({ status: false, message: "reviewBy must be present" })
        };
        
        if (!validator.isValid(review)) {
            return res.status(400).send({ status: false, message: "excerpt is required." })
        }
        /*if (!validator.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is required" })
        }
       if(!validator.isValidObjectId(bookId)){
        return res.status(400).send({ status: false, message: "Invalid bookId" })
       }
        if (!validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: "rating is required" })
        }

        
       
     
        //validation ends.

        //searching title & ISBN in database to maintain their uniqueness.
        const nameBooks = await bookModel.findById(bookId)
        if (!nameBooks) {
            return res.status(400).send({ status: false, message: "book is not found" })
        }
        requestReviewBody.bookId = searchBook._id;
        requestReviewBody.reviewedAt = new Date();




        console.log(nameBooks);   
        const newBook = await reviewModel.create(requestBody);
        return res.status(201).send({ status: true, message: "review created successfully", data: newBook })
    }
            
 catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}*/
const addReview = async function (req, res) {
    try {
        const params = req.params.bookId //accessing bookId from params.
        requestReviewBody = req.body
        const { reviewedBy, rating, review } = requestReviewBody;

        //validation starts.
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }

        //for empty request body.
        if (!validator.isValidRequestBody(requestReviewBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide review details to update.' })
        }
        if (!isNaN(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Reviewer's name cannot be a number." })
        }

        if (!validator.validString(reviewedBy)) {
            return res.status(400).send({ status: false, message: "Reviewer's name is required" })
        }
        if (!validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: "Rating is required" })
        }
        /*if (!validator.validRating(rating)) {
            return res.status(400).send({ status: false, message: "Rating must be 1,2,3,4 or 5." })
        }*/
        //validation ends.

        //setting rating limit between 1-5.
        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
        }
        const searchBook = await bookModel.findById({
            _id: params
        })

        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }

        //verifying the book is deleted or not so that we can add a review to it.
        if (searchBook.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Cannot add review, Book has been already deleted." })
        }
        requestReviewBody.bookId = searchBook._id;
        requestReviewBody.reviewedAt = new Date();

        const saveReview = await reviewModel.create(requestReviewBody)
        if (saveReview) {
            await bookModel.findOneAndUpdate({ _id: params }, { $inc: { review: 1 } })
        }
        const response = await reviewModel.findOne({ _id: saveReview._id }).select({
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0
        })
        return res.status(201).send({ status: true, message: `Review added successfully for ${searchBook.title}`, data: response })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



























const updateReviewDetails = async function (req, res) {
    try {
        const params = req.params.bookId;
        const Params=req.params.reviewId;
        const requestUpdateBody = req.body
    //    const userIdFromToken = req.userId
        const {review, ratting,reviewedBy  } = requestUpdateBody;
         
       


        //validation starts.
      /* if (!validator.isValidObjectId(userIdFromToken)) {
            return res.status(402).send({ status: false, message: "Unauthorized access !" })
        }*/
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }

        if (!validator.isValidObjectId(Params)) {
            return res.status(400).send({ status: false, message: "Invalid ReviewId." })
        }



        if (!validator.isValidRequestBody(requestUpdateBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details to update.' })
        }
        //validation ends

        //setting the combinations for the updatation.
        if (review || ratting || reviewedBy) {

            //validation for empty strings/values.
            if (!validator.validString(review)) {
                return res.status(400).send({ status: false, message: "review is missing ! Please provide the title details to update." })
            }
            if (!validator.validString(reviewedBy)) {
                return res.status(400).send({ status: false, message: "reviewBy is missing ! Please provide the Excerpt details to update." })
            };
            
        if(!validator.isValid(ratting)){
            return res.status(400).send({ status: false, message: "ratting is missing ! Please provide the ratting details to update." })
        }


        } //validation ends.

        //searching book in which we want to update the details.
        const searchBook = await bookModel.findById({
            _id: params,
        })
       console.log(searchBook);

        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }
        const reviewSearch=await reviewModel.findById({
            _id:Params,
        })
       if(!reviewSearch){
        return res.status(404).send({ status: false, message: `review does not exist by this ${Params}.` }) 
       }



        //Authorizing user -> only the creator of the book can update the details.
       /* if (searchBook.userId != req.userId) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access."
            })
        }*/

        //finding title and ISBN in DB to maintain their uniqueness.
        
        

        //checcking the attribute isDeleted:false, then only the user is allowed to update.
        if (searchBook.isDeleted == false) {
            const changeDetails = await reviewModel.findOneAndUpdate({ _id: params }, {review:review,ratting:ratting,reviewedBy:reviewedBy }, { new: true })

            res.status(200).send({ status: true, message: "Successfully updated book Review details.", changeDetails })
        } else {
            return res.status(400).send({ status: false, message: "Unable to update details.Book has been already deleted" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}
const deleteReview = async function (req, res) {
    try {
        const params = req.params.bookId; //accessing the bookId from the params.
        const Params=req.params.reviewId;
        //validation for the invalid params.
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }
        if (!validator.isValidObjectId(Params)) {
            return res.status(400).send({ status: false, message: "Inavlid ReviewId." })
        }

        //finding the book in DB which the user wants to delete.
        const findBook = await bookModel.findById({ _id: params })

        if (!findBook) {
            return res.status(404).send({ status: false, message: `No book found by ${params}` })
        }
        

        //Authorizing the user -> if the user doesn't created the book, He/she won't be able to delete it.
        /*else if (findBook.userId != req.userId) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access."
            })
        }*/
     const findReview=await reviewModel.findById({_id:Params})
      if(!findReview){
        return res.status(404).send({ status: false, message: `No book found by ${findReview}` })
      }

        //if the attribute isDeleted:true , then it is already deleted.
        else if (findReview.isDeleted == true) {
            return res.status(400).send({ status: false, message: `review has been already deleted.` })
        } else {
            //if attribute isDeleted:false, then change the isDeleted flag to true, and remove all the reviews of the book as well.
            const deleteData = await reviewModel.findOneAndUpdate({ _id: { $in: findReview } }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true }).select({ _id: 1, title: 1, isDeleted: 1, deletedAt: 1 })

           const reviewData= await reviewModel.updateMany({ reviewId: Params }, { isDeleted: true, deletedAt: new Date() })

            if (reviewData) {
                await bookModel.findOneAndUpdate({ _id: params }, { $inc: { review: -1 } })
            }

            return res.status(200).send({ status: true, message: "review deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

module.exports.addReview=addReview;
module.exports.updateReviewDetails=updateReviewDetails;
module.exports.deleteReview=deleteReview;


