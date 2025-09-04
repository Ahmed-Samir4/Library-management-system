# Library Management System

A Node.js/Express/Sequelize-based library management system with user authentication, book management, borrowing process, analytics, and data export features.

## Features
- User registration, login, email verification, password reset
- Book CRUD (add, update, delete, list, search)
- Borrow and return books
- Track overdue books
- Analytics and reporting for borrowing process
- Export borrowing data as CSV or XLSX
- Input validation with Joi

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (see below)
4. Run the app:
   ```bash
   npm start
   ```

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```
# JWT
JWT_SECRET=your-value
SALT=your-value

# Email (for nodemailer)

EMAIL=your-value
EMAIL_PASSWORD=your-value

# App
PORT=your-value
TOKEN_PREFIX=Bearer_
```
---

## API Endpoints

### User APIs

#### POST `/users/signup`
- Register a new user
- **Body:** `{ name, email, password }`
- **Response:** `201 Created` or error

#### POST `/users/login`
- Login
- **Body:** `{ email, password }`
- **Response:** `{ token }` or error

#### POST `/users/verify`
- Verify email with OTP
- **Body:** `{ email, otpCode }`
- **Response:** Success or error

#### POST `/users/requestCode`
- Request new verification code
- **Body:** `{ email }`
- **Response:** Success or error

#### GET `/users/refresh?token=...`
- Refresh verification token
- **Response:** Success or error

#### POST `/users/forget`
- Request password reset code
- **Body:** `{ email }`
- **Response:** Success or error

#### POST `/users/reset`
- Reset password
- **Body:** `{ email, forgetCode, password }`
- **Response:** Success or error

#### DELETE `/users/delete`
- Delete user account (auth required)
- **Response:** Success or error

#### GET `/users/all`
- List all users
- **Response:** Array of users

---

### Book APIs

#### POST `/books/`
- Add a new book (auth required)
- **Body:** `{ title, author, ISBN, availabilityQuantity, shelfLocation, publishedDate }`
- **Response:** Book object or error

#### PUT `/books/:id`
- Update a book (auth required)
- **Body:** Any updatable book fields
- **Response:** Updated book or error

#### DELETE `/books/:id`
- Delete a book (auth required)
- **Response:** Success or error

#### GET `/books/`
- List all books
- **Response:** Array of books

#### GET `/books/search`
- Search for a book by field
- **Headers:** `{ field, value }`
- **Response:** Book object or error

#### POST `/books/borrow/:id`
- Borrow a book (auth required)
- **Params:** `id` (book id)
- **Response:** Borrow record or error

#### POST `/books/return/:id`
- Return a borrowed book (auth required)
- **Params:** `id` (book id)
- **Response:** Success or error

#### GET `/books/my-borrows`
- List current user's borrowed books (auth required)
- **Response:** Array of books

#### DELETE `/books/my-borrows`
- Delete all current user's borrows (auth required)
- **Response:** Success or error

#### GET `/books/overdue`
- List overdue books for current user (auth required)
- **Response:** Array of books

---

### Analytics & Export APIs

#### GET `/books/analytics/borrows?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Get borrowing analytics for a period
- **Response:** `{ totalBorrows, uniqueUsers, mostBorrowedBook }`

#### GET `/books/export/borrows?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv|xlsx`
- Export borrowing data for a period
- **Response:** File download (CSV or XLSX)

---

## Validation
All inputs are validated using Joi. See the `user.validation.js` and `book.validation.js` files for details.

## Database Schema
See the `book.model.js`, `borrow.model.js`, and `user.model.js` files for Sequelize model definitions.

## License
MIT
