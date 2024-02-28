const mongoose = require('mongoose');

const database = process.env.MONGODB_URI;

mongoose.connect(database, { })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));
