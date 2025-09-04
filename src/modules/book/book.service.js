import Book from '../../db/models/book.model.js';
import Borrow from '../../db/models/borrow.model.js';
import { Parser as Json2csvParser } from 'json2csv';
import * as XLSX from 'xlsx';
import { Op } from 'sequelize';


export const addBook = async (req, res, next) => {
    const { title, author, ISBN, availabilityQuantity, shelfLocation, publishedDate } = req.body;

    const newBook = await Book.create({
        title,
        author,
        ISBN,
        availabilityQuantity,
        shelfLocation,
        publishedDate,
        addedBy: req.authUser.id
    });

    if (!newBook) {
        return res.status(500).json({ message: "Failed to add book" });
    }
    res.status(201).json({ message: "Book added successfully", book: newBook });


}

export const updateBook = async (req, res, next) => {
    const { title, author, ISBN, availabilityQuantity, shelfLocation, publishedDate } = req.body;
    const bookId = req.params.id;


    const book = await Book.findByPk(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (req.authUser.id !== +book.addedBy) {
        return res.status(403).json({ message: "You are not authorized to update this book" });
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (ISBN) book.ISBN = ISBN;
    if (availabilityQuantity !== undefined) book.availabilityQuantity = availabilityQuantity;
    if (shelfLocation) book.shelfLocation = shelfLocation;
    if (publishedDate) book.publishedDate = publishedDate;

    await book.save();
    res.status(200).json({ message: "Book updated successfully", book });


}

export const deleteBook = async (req, res, next) => {
    const bookId = req.params.id;

    const book = await Book.findByPk(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (req.authUser.id !== +book.addedBy) {
        return res.status(403).json({ message: "You are not authorized to delete this book" });
    }

    await book.destroy();

    res.status(200).json({ message: "Book deleted successfully" });
};


export const getBooks = async (req, res, next) => {
    const books = await Book.findAll();
    res.status(200).json({ books });
};

export const getBookByField = async (req, res, next) => {
    const { field, value } = req.headers;

    const book = await Book.findOne({ where: { [field]: value } });
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ book });
};

export const borrowBook = async (req, res, next) => {
    const userId = req.authUser.id;
    const bookId = req.params.id;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const book = await Book.findByPk(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (book.availabilityQuantity === 0) {
        return res.status(400).json({ message: "Book is not available for borrowing" });
    }


    const newBorrow = await Borrow.create({
        userId,
        bookId,
        borrowDate: new Date(),
        dueDate: dueDate,
        returnDate: null
    })
    if (!newBorrow) {
        book.availabilityQuantity += 1;
        return res.status(500).json({ message: "Failed to borrow book" });
    } else {
        book.availabilityQuantity -= 1;
    }

    await book.save();

    res.status(200).json({ message: "Book borrowed successfully", book, borrow: newBorrow });
};

export const returnBook = async (req, res, next) => {
    const userId = req.authUser.id;
    const bookId = req.params.id;

    const book = await Book.findByPk(bookId);
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const borrow = await Borrow.findOne({ where: { userId, bookId, returnDate: null } });
    if (!borrow) {
        return res.status(400).json({ message: "Book is not borrowed by you" });
    }

    book.availabilityQuantity += 1;
    await book.save();

    borrow.returnDate = new Date();
    borrow.dueDate = null;
    await borrow.save();

    res.status(200).json({ message: "Book returned successfully", book, borrow });
};

export const getUserBorrows = async (req, res, next) => {
    const userId = req.authUser.id;

    const borrows = await Borrow.findAll({ where: { userId, returnDate: null } });
    if (!borrows || borrows.length === 0) {
        return res.status(404).json({ message: "No borrowed books found" });
    }

    const bookIds = borrows.map(borrow => borrow.bookId);
    const books = await Book.findAll({ where: { id: bookIds } });
    if (!books || books.length === 0) {
        return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json({ message: "Borrowed books retrieved successfully", books });
};

export const deleteUserBorrows = async (req, res, next) => {
    const userId = req.authUser.id;

    const borrows = await Borrow.findAll({ where: { userId, returnDate: null } });
    if (!borrows || borrows.length === 0) {
        return res.status(404).json({ message: "No borrowed books found" });
    }

    //handle the quantity update for each book
    for (const borrow of borrows) {
        const book = await Book.findByPk(borrow.bookId);
        if (book) {
            book.availabilityQuantity += 1;
            await book.save();
        }
    }

    await Borrow.destroy({ where: { userId, returnDate: null } });
    res.status(200).json({ message: "All borrowed books deleted successfully" });
};

export const listOverdueBooks = async (req, res, next) => {
    const userId = req.authUser.id;

    const borrows = await Borrow.findAll({ where: { userId, returnDate: null } });
    if (!borrows || borrows.length === 0) {
        return res.status(404).json({ message: "No borrowed books found" });
    }

    const overdueBooks = borrows.filter(borrow => borrow.dueDate < new Date());
    if (overdueBooks.length === 0) {
        return res.status(404).json({ message: "No overdue books found" });
    }

    const bookIds = overdueBooks.map(borrow => borrow.bookId);
    const books = await Book.findAll({ where: { id: bookIds } });
    if (!books || books.length === 0) {
        return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json({ message: "Overdue books retrieved successfully", books });
};

export const getBorrowAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        const borrows = await Borrow.findAll({
            where: {
                borrowDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [Book]
        });
        // Example analytics: total borrows, unique users, most borrowed book
        const totalBorrows = borrows.length;
        const uniqueUsers = new Set(borrows.map(b => b.userId)).size;
        const bookCounts = {};
        borrows.forEach(b => {
            bookCounts[b.bookId] = (bookCounts[b.bookId] || 0) + 1;
        });
        const mostBorrowedBookId = Object.keys(bookCounts).reduce((a, b) => bookCounts[a] > bookCounts[b] ? a : b, null);
        const mostBorrowedBook = mostBorrowedBookId ? await Book.findByPk(mostBorrowedBookId) : null;
        res.json({
            totalBorrows,
            uniqueUsers,
            mostBorrowedBook: mostBorrowedBook ? mostBorrowedBook.title : null
        });
    } catch (err) {
        next(err);
    }
};

export const exportBorrowData = async (req, res, next) => {
    try {
        const { startDate, endDate, format } = req.query;
        if (!startDate || !endDate || !format) {
            return res.status(400).json({ message: 'startDate, endDate, and format (csv|xlsx) are required' });
        }
        const borrows = await Borrow.findAll({
            where: {
                borrowDate: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [Book]
        });
        const data = borrows.map(b => ({
            id: b.id,
            userId: b.userId,
            bookId: b.bookId,
            bookTitle: b.book ? b.book.title : '',
            borrowDate: b.borrowDate,
            dueDate: b.dueDate,
            returnDate: b.returnDate
        }));
        if (format === 'csv') {
            const parser = new Json2csvParser();
            const csv = parser.parse(data);
            res.header('Content-Type', 'text/csv');
            res.attachment('borrows.csv');
            return res.send(csv);
        } else if (format === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Borrows');
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment('borrows.xlsx');
            return res.send(buf);
        } else {
            return res.status(400).json({ message: 'Invalid format. Use csv or xlsx.' });
        }
    } catch (err) {
        next(err);
    }
};
