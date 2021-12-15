const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi/swagger.yaml');
const passport = require('passport');
const auth = require('./middlewares/auth');
const cors = require('cors');


const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const rentalRouter = require('./routes/rental');
const favouriteRouter = require('./routes/favourite');
const reportRouter = require('./routes/report');
const feedbackRouter = require('./routes/feedback');
const facilityRouter = require('./routes/facility');
const notificationRouter = require('./routes/notification');

const app = express();
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

passport.use('jwt', auth.jwtStrategy);
app.use(passport.initialize());
// app.use(passport.authenticate('jwt', {session: false}));

app.use(cors());

app.get('/', (req, res) => {
   res.send("Welcome to WeHome BackEnd!");
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/user', userRouter);
app.use('/api/room', roomRouter);
app.use('/api/rental', rentalRouter);
app.use('/api/favourite', favouriteRouter);
app.use('/api/report', reportRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/facility', facilityRouter);
app.use('/api/notification', notificationRouter);

console.log(new Date().toISOString());

module.exports = app;
