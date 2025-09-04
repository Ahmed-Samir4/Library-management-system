import { sequelize } from "../connection.js";
import { DataTypes } from "sequelize";

const userModel = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true 
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    otpCode: { type: DataTypes.STRING, defaultValue: null },
    otpExpires: { type: DataTypes.DATE, defaultValue: null },
    otpAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    otpBanExpires: { type: DataTypes.DATE, defaultValue: null },
    forgetCode: { type: DataTypes.STRING },
    isLoggedIn: { type: DataTypes.BOOLEAN, defaultValue: false },
},
    {
        timestamps: true, 
        tableName: 'users' 
    });

// userModel.beforeCreate((user, options) => {
//     // Hash the password before saving the user
//     if (user.password) {
//         const bcrypt = require('bcrypt');
//         const saltRounds = 10;
//         return bcrypt.hash(user.password, saltRounds)
//             .then(hash => {
//                 user.password = hash;
//             });
//     }
// });
// userModel.hasMany(productModel, {

//     foreignKey: 'userId',
//     as: 'products' // Alias for the association
// });

// productModel.belongsTo(userModel, {
//     foreignKey: 'userId',
//     as: 'user' // Alias for the association
// });

// userModel.belongsToMany(productModel, {
//     through: 'UserProducts', // Join table for many-to-many relationship
//     foreignKey: 'userId',
//     onDelete: 'CASCADE', // Optional: delete user products when user is deleted
//     onUpdate: 'CASCADE' // Optional: update user products when user is updated
// });

// productModel.belongsToMany(userModel, {
//     through: 'UserProducts', // Join table for many-to-many relationship
//     foreignKey: 'productId',
//     onDelete: 'CASCADE', // Optional: delete user products when product is deleted
//     onUpdate: 'CASCADE' // Optional: update user products when product is updated
// });


export default userModel;