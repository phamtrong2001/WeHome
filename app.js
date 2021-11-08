const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi/swagger.yaml');
// const swaggerDocument = require('./openapi/openapi.json');

const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const rentalRouter = require('./routes/rental');
const reportRouter = require('./routes/report');
const feedbackRouter = require('./routes/feedback');
const facilityRouter = require('./routes/facility');
const imageRouter = require('./routes/image');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/user', userRouter);
app.use('/room', roomRouter);
app.use('/rental', rentalRouter);
app.use('/report', reportRouter);
app.use('/feedback', feedbackRouter);
app.use('/facility', facilityRouter);
app.use('/image', imageRouter);

module.exports = app;
