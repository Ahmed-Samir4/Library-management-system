import { sequelize } from "../connection.js";
import { DataTypes } from "sequelize";

const bookModel = sequelize.define("book", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 100]
        }
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ISBN: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isISBN(value) {
                const isbnRegex = /^(97(8|9))?\d{9}(\d|X)$/;
                if (!isbnRegex.test(value)) {
                    throw new Error('Invalid ISBN format');
                }
            }
        }
    },
    availabilityQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    shelfLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publishedDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    addedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
},
    {
        timestamps: true,
        tableName: 'books'
    }
);

export default bookModel;
