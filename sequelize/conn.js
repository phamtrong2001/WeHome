require('dotenv').config();
const { Sequelize } = require('sequelize');
const { initModels } = require("./models/init-models");

const dbConnection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
});

dbConnection.authenticate().then(() => {
    console.log('success');
}).catch(err => console.error(err));

module.exports = initModels(dbConnection);
