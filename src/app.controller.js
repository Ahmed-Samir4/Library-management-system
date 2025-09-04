import connectDB from "./db/connection.js";
import authRouter from "./modules/user/user.controller.js";
import bookRouter from "./modules/book/book.controller.js";
import { globalErrorHandler } from "./middleware/globalHandler.js";
import limiter from 'express-rate-limit';


const bootstrap=(app,express) => {
    app.use(express.json());
    app.use(limiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50 // Limit each IP to 50 requests per windowMs
    }));

    connectDB();


    app.use("/auth", authRouter);
    app.use("/book", bookRouter);



    app.use("/", (req, res) => {
        return res.status(404).json({
            message: "Route not found"
        });
    });
    

    //handler for unhandled errors
    app.use(globalErrorHandler);

}

export default bootstrap;