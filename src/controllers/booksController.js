const userModel = require('../models/userModel')
const bookModel=require('../models/booksModel')
//const jwt = require('jsonwebtoken')
const validator = require('../validator/validator')
const secretKey = 'Book_management'
const reviewModel=require('../models/reviewModel')
//Registering users
const bookCreation = async function (req, res) {
    try {
        const requestBody = req.body;
        const { //Object destructuring
        title,
        excerpt,
        userId,
        ISBN,
        category,
        subcategory,
        releasedAt            
        } = requestBody;

        //Validation starts
        if (!validator.isValidRequestBody(requestBody)) { //to check the empty request query
            return res.status(400).send({ ststus: false, message: "Invalid request parameters,Empty body not accepted." })
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Title must be present" })
        };
        
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt is required." })
        }
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }
       if(!validator.isValidObjectId(userId)){
        return res.status(400).send({ status: false, message: "Invalid userId" })
       }

        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is required" })
        }
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "category is required" })
        }

        if(!validator.validAddress(subcategory)){
            return res.status(400).send({ status: false, message: "subcategory is required" })
        }
        if (!validator.isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releaseddate is required" })
        }

        if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)){
 
            return res.status(400).send({ status: false, message: "Invalid Date Format" })
        }
       
      if(!ISBN.length>=10 && ISBN.length<=13){
        return res.status(400).send({ status: false, message: "Invalid ISBN Format" })
      }
      if(!/(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)/.test(ISBN)){
       return res.status(400).send({ status: false, message: "Invalid ISBN Format" })
      }  
        //validation ends.

        //searching title & ISBN in database to maintain their uniqueness.
        const titleAlreadyUsed = await bookModel.findOne({ title: title })
        if (titleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "Title is already used. Try a new title." })
        }
        const isbnAlreadyUsed = await bookModel.findOne({
            ISBN: ISBN
        });
        if (isbnAlreadyUsed) {
            return res.status(400).send({ status: false, message: "ISBN already used. Try a new ISBN." })
        }

        //Verifying user -> If not verified then won't be able to create a book.
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: `User does not exists` })
        }

        const newBook = await bookModel.create(requestBody);
        return res.status(201).send({ status: true, message: "Book created successfully", data: newBook })
    }
            
 catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}
const fetchAllBooks = async function (req, res) {
    try {
        const queryParams = req.query
        console.log(queryParams);
        const {
            userId,
            category,
            subcategory
        } = queryParams

        //Validation for invalid userId in params
        if (userId) {
            if (!(userId.length == 24)) {
                return res.status(400).send({ status: false, message: "Invalid userId in params." })
            }
        }

        //Combinations of query params.
        if (userId || category || subcategory) {

            let obj = {};
            if (userId) {
                obj.userId = userId
            }
            if (category) {
                obj.category = category;
            }
            if (subcategory) {
                obj.subcategory = subcategory
            }
            obj.isDeleted = false

            //Authorizing user --> If not then won't be able to fetch books of someone else's.
            const check = await bookModel.findOne(obj)
            console.log(check);
           /* if (check) {
                if (check.userId != req.userId) {
                    return res.status(401).send({
                        status: false,
                        message: "Unauthorized access."
                    })
                }
            }*/

            //Searching books according to the request 
            const books = await bookModel.find(obj).select({
                category:0,
                subcategory: 0,
                ISBN: 0,
                isDeleted: 0,
                updatedAt: 0,
                createdAt: 0,
                __v: 0

            })

                .sort({
                    title: 1
                });
            const countBooks = books.length

            //If no found by the specific combinations revert error msg ~-> No books found.
            if (books == false) {
                return res.status(404).send({ status: false, message: "No books found" });
            } else {
                res.status(200).send({
                    status: true,
                    message: `${countBooks} books found.`,
                    data: books
                })
            }
        } else {
            return res.status(400).send({ status: false, message: "No filters applied." });
        }

    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}

/*const fetchAllBooks = async function (req, res) {
    try {
      let filterQuery = { isDeleted: false, deletedAt: null };
      let queryParams = req.query;
      const { userId, category, subcategory } = queryParams;

     /*if(!validator.isValid(userId)||!validator.validString(category) ||!validator.isValid(subcategory)){
        return res.status(400).send({ status: false, message: "parameter is required" })
    }
   if(!validator.isValidObjectId(userId)){
    return res.status(400).send({ status: false, message: "Invalid userId" })
   }
if(Object.keys(queryParams).length==0) return res.status(400).send({status:false,msg:"query is not present"})






   
  /* if(!validator.isValid(category)){
    return res.status(400).send({ status: false, message: "category is required" })
}
if(!validator.isValid(subcategory)){
    return res.status(400).send({ status: false, message: "subcategory is required" })
}
     
      if (validator.isValidRequestBody(queryParams)) {
        const { userId, category, subcategory } = queryParams;
        if (!validator.isValid(userId) && !validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "parameter is required" })         
        }
        else
        {
            filterQuery["userId"] = userId;
        }

        if (validator.isValid(category)) {
            if (!validator.isValid(category) && !validator.isValidObjectId(category)) {
                return res.status(400).send({ status: false, message: "parameter is required" })         
            }
            else
            {
                filterQuery["category"] = category;
            }  
        }
        
        if (validator.isValid(subcategory)) {
            if (!validator.isValid(category) && !validator.isValidObjectId(category)) {
                return res.status(400).send({ status: false, message: "parameter is required" })         
            }
            else{
                const subcatArr = subcategory 
                .trim()
                .split(",")
                .map((subcat) => subcat.trim());
              filterQuery["subcategory"] = { $all: subcatArr };


            }
        }
          
      const book = await bookModel.find({$or:[{userId:userId},{category:category},{subcategory:subcategory}]}).sort({
        title: 1
    });
    console.log(book);
    const countBooks = book.length

    //If no found by the specific combinations revert error msg ~-> No books found.
    if (book == false) {
        return res.status(404).send({ status: false, message: "No books found" });
    } else {
        res.status(200).send({
            status: true,
            message: `${countBooks} books found.`,
            data: book
        })
    }
} 
}
    catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  }*/
  /*const updateBookById = async (req, res) => {
    try {
      let data=req.body;
      let bookId=req.params.bookId;
      let title = req.body.title;;
      let excerpt = req.body.excerpt;
      let releasedAt=req.body.releasedAt;
      let ISBN=req.body.ISBN;
     
     const  Id = await bookModel.findById(bookId)
    
            
      let updatedSubCategory = data.subcategory
      if (data.subcategory) {
        updatedSubCategory.push(subcategory)
      }
      
  
      let updatedBook = await blogModel.findOneAndUpdate(
        { _id: Id  , isDeleted:false},
        {
          title: data.title,
          excerpt:data.excerpt,  
          subcategory: data.updatedSubCategory, 
          releasedAt: data.releasedAt,
          ISBN:data.ISBN
        },
        { returnDocument: 'after' },
      )
      console.log(updatedBook)
      if (!updatedBook) {
        res.status(404).send({ error: 'Document not found / already deleted' })
      }
      res.status(200).send({ Updates: updatedBook })
    } catch (err) {
      console.log(err)
      res.status(500).send({ msg: err.message })
    }
  }*/

  const updateBookDetails = async function (req, res) {
    try {
        const params = req.params.bookId;
        const requestUpdateBody = req.body
        const userIdFromToken = req.userId
        const { title, excerpt, releasedAt, ISBN } = requestUpdateBody;
         
        if (!validator.isValidRequestBody(req.params)) {
            return res.status(400).send({status: false, message: "Invalid request parameters. Please provide query details"});
          }


        //validation starts.
       if (!validator.isValidObjectId(userIdFromToken)) {
            return res.status(402).send({ status: false, message: "Unauthorized access !" })
        }
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Invalid bookId." })
        }

        if (!validator.isValidRequestBody(requestUpdateBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details to update.' })
        }
        //validation ends

        //setting the combinations for the updatation.
        if (title || excerpt || ISBN || releasedAt) {

            //validation for empty strings/values.
            if (!validator.validString(title)) {
                return res.status(400).send({ status: false, message: "Title is missing ! Please provide the title details to update." })
            }
            if (!validator.validString(excerpt)) {
                return res.status(400).send({ status: false, message: "Excerpt is missing ! Please provide the Excerpt details to update." })
            };
            if (!validator.validString(ISBN)) {
                return res.status(400).send({ status: false, message: "ISBN is missing ! Please provide the ISBN details to update." })
            };
            if (!validator.validString(releasedAt) &&  (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt))) {
                return res.status(400).send({ status: false, message: "Released date is missing ! Please provide the released date details to update." })
            }

        } //validation ends.

        //searching book in which we want to update the details.
        const searchBook = await bookModel.findById({
            _id: params,
        })
        if (!searchBook) {
            return res.status(404).send({ status: false, message: `Book does not exist by this ${params}.` })
        }

        //Authorizing user -> only the creator of the book can update the details.
        if (searchBook.userId != req.userId) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access."
            })
        }

        //finding title and ISBN in DB to maintain their uniqueness.
        const findTitle = await bookModel.findOne({ title: title, isDeleted: false })
        if (findTitle) {
            return res.status(400).send({ status: false, message: `${title.trim()} is already exists.Please try a new title.` })
        }
        const findIsbn = await bookModel.findOne({ ISBN: ISBN, isDeleted: false })
        if (findIsbn) {
            return res.status(400).send({ status: false, message: `${ISBN.trim()} is already registered.` })
        }

        //checcking the attribute isDeleted:false, then only the user is allowed to update.
        if (searchBook.isDeleted == false) {
            const changeDetails = await bookModel.findOneAndUpdate({ _id: params }, { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true })

            res.status(200).send({ status: true, message: "Successfully updated book details.", data: changeDetails })
        } else {
            return res.status(400).send({ status: false, message: "Unable to update details.Book has been already deleted" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}
const fetchBooksById = async function (req, res) {
    try {
        const bookParams = req.params.bookId;
        //validating bookId after accessing it from the params.
        
        if (!validator.isValidObjectId(bookParams)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }

        //Finding the book in DB by its Id & an attribute isDeleted:false
        const findBook = await bookModel.findOne({
            _id: bookParams,
            isDeleted: false
        })
        if (!findBook) {
            return res.status(404).send({ status: false, message: `Book does not exist or is already been deleted for this ${bookParams}.` })
        }

        //Checking the authorization of the user -> Whether user's Id matches with the book creater's Id or not.
        if (findBook.userId != req.userId) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access."
            })
        }

        //Accessing the reviews of the specific book which we got above, -> In reviewsData key sending the reviews details of that book.
        const fetchReviewsData = await reviewModel.find({ bookId: bookParams, isDeleted: false }).select({ deletedAt: 0, isDeleted: 0, createdAt: 0, __v: 0, updatedAt: 0 ,review:0}).sort({
            reviewedBy:1
        })
       

        let reviewObj = findBook.toObject()
        if (fetchReviewsData) {
            reviewObj['reviewsData'] = fetchReviewsData
        }
       //review=(fetchReviewsData.reviewedBy).length;
        return res.status(200).send({ status: true, message: "Book found Successfully.", data: reviewObj })
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}
const deleteBook = async function (req, res) {
    try {
        const params = req.params.bookId; //accessing the bookId from the params.
        
        //validation for the invalid params.
        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }

        //finding the book in DB which the user wants to delete.
        const findBook = await bookModel.findById({ _id: params })

        if (!findBook) {
            return res.status(404).send({ status: false, message: `No book found by ${params}` })
        }
        //Authorizing the user -> if the user doesn't created the book, He/she won't be able to delete it.
        else if (findBook.userId != req.userId) {
            return res.status(401).send({
                status: false,
                message: "Unauthorized access."
            })
        }
        //if the attribute isDeleted:true , then it is already deleted.
        else if (findBook.isDeleted == true) {
            return res.status(400).send({ status: false, message: `Book has been already deleted.` })
        } else {
            //if attribute isDeleted:false, then change the isDeleted flag to true, and remove all the reviews of the book as well.
            const deleteData = await bookModel.findOneAndUpdate({ _id: { $in: findBook } }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true }).select({ _id: 1, title: 1, isDeleted: 1, deletedAt: 1 })

            await reviewModel.updateMany({ bookId: params }, { isDeleted: true, deletedAt: new Date() })
            return res.status(200).send({ status: true, message: "Book deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}
module.exports.bookCreation=bookCreation;
module.exports.fetchAllBooks=fetchAllBooks;
module.exports.updateBookDetails=updateBookDetails;
module.exports.fetchBooksById=fetchBooksById;
module.exports.deleteBook=deleteBook;









































