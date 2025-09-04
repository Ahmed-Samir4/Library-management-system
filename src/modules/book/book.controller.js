import { Router } from "express";
import * as bookService from "./book.service.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middleware/auth.js";
import * as bookValidation from "./book.validation.js";
import { validationMiddleware } from "../../middleware/validation.middleware.js";

const bookRouter = Router();

bookRouter.post("/borrow/:id", auth(), validationMiddleware(bookValidation.borrowBookSchema), expressAsyncHandler(bookService.borrowBook));
bookRouter.post("/return/:id", auth(), validationMiddleware(bookValidation.returnBookSchema), expressAsyncHandler(bookService.returnBook));
bookRouter.get("/my-borrows", auth(), expressAsyncHandler(bookService.getUserBorrows));
bookRouter.delete("/my-borrows", auth(), expressAsyncHandler(bookService.deleteUserBorrows));

bookRouter.post("/", auth(), validationMiddleware(bookValidation.addBookSchema), expressAsyncHandler(bookService.addBook));
bookRouter.put("/:id", auth(), validationMiddleware({ ...bookValidation.updateBookSchema, ...bookValidation.borrowBookSchema }), expressAsyncHandler(bookService.updateBook));
bookRouter.delete("/:id", auth(), validationMiddleware(bookValidation.deleteBookSchema), expressAsyncHandler(bookService.deleteBook));
bookRouter.get("/", expressAsyncHandler(bookService.getBooks));
bookRouter.get("/search", validationMiddleware(bookValidation.getBookByFieldSchema), expressAsyncHandler(bookService.getBookByField));
bookRouter.get("/overdue", auth(), expressAsyncHandler(bookService.listOverdueBooks));
bookRouter.get("/analytics/borrows", auth(), expressAsyncHandler(bookService.getBorrowAnalytics));
bookRouter.get("/export/borrows", auth(), expressAsyncHandler(bookService.exportBorrowData));

export default bookRouter;
