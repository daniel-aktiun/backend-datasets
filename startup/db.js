const { Sequelize } = require("sequelize");

const db = new Sequelize(
  `postgres://${process.env.USER_DB}:${process.env.PASSWORD}@${process.env.HOST}:5432/${process.env.DATABASE}`
);

db.authenticate()
  .then(() => {
    console.log("DB running");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = db;
