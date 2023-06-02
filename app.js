const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(morgan("tiny"));

require("express-async-errors");
require("./startup/routes")(app);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
