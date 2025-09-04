import jwt from 'jsonwebtoken';
import User from '../db/models/user.model.js';


export const auth = () => {
    return async (req, res, next) => {
        try {
            const { access } = req.headers;
            if (!access) {
                return next(new Error('Please login first', { cause: 400 }));
            }

            if (!access.startsWith(process.env.TOKEN_PREFIX)) {
                return next(new Error('Invalid token prefix', { cause: 400 }));
            }

            const token = access.split(process.env.TOKEN_PREFIX)[1];
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);
            if (!decodedData || !decodedData.id) {
                return next(new Error('Invalid token payload', { cause: 400 }));
            }
            const findUser = await User.findByPk(decodedData.id);
            if (!findUser) {
                return next(new Error('Please signUp first', { cause: 404 }));
            }
            
            req.authUser = findUser;
            next();

        } catch (err) {
            console.log(err);
            return next(new Error('Catch error in auth middleware', { cause: 500 }));
        }
    }
}