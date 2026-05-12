require('dotenv').config();
const express = require('express');
const { connectDB } = require('./src/config/db');

connectDB();

const app = express();

const port = process.env.PORT || 5000


app.get('/', (req,res) => {
  res.send("Server is running")
})


app.listen(port, () => {
  console.log(`Hello from server at port ${port}`)
})