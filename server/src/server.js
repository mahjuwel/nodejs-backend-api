const express= require("express");
const cookieParser= require('cookie-parser');
const morgan= require("morgan");
const xss= require('xss-clean');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const rateLimit= require('express-rate-limit');
const { serverPort } = require("./secret");
const userRouter = require("./routers/userRouter");
const connectDB = require("./config/db");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");
const authRouter = require("./routers/authRouter");

const app= express();
const rateLimiter= rateLimit({
    windowMs: 1*60*1000, // 1 minit
    max: 5,
    message: "Too many requests from this IP. Please try again later."
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(xss());

app.use('/api/users',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/seed',seedRouter);



app.use((req, res, next) => {
    next(createError(404, 'route not found'));
  });
  
  // all the errors will come here in the end from all the routes
  app.use((err, req, res, next) => {      
      return errorResponse(res,{
        statusCode: err.status,
        message: err.message
      });

    });

app.listen(serverPort, ()=>{
console.log(`server is running on the port: ${serverPort}`);
connectDB();
});