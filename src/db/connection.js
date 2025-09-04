import { Sequelize } from 'sequelize';



export const sequelize = new Sequelize('Task', 'root', '', {
    host: 'localhost',
    dialect: 'mysql', 
    logging: false, 
});

const connectDB = async () => {
    return (await sequelize.sync({})).authenticate(() => {
        console.log('Database connection has been established successfully.');
    }).catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
};

export default connectDB;
