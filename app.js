const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi/swagger.yaml');
const passport = require('passport');
const auth = require('./middlewares/auth');

const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const rentalRouter = require('./routes/rental');
const reportRouter = require('./routes/report');
const feedbackRouter = require('./routes/feedback');
const facilityRouter = require('./routes/facility');
const imageRouter = require('./routes/image');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

passport.use('jwt', auth.jwtStrategy);
app.use(passport.initialize());
// app.use(passport.authenticate('jwt', {session: false}));

app.get('/', (req, res) => {
   res.send("Welcome to WeHome BackEnd!");
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/user', userRouter);
app.use('/api/room', roomRouter);
app.use('/api/rental', rentalRouter);
app.use('/api/report', reportRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/facility', facilityRouter);
app.use('/api/image', imageRouter);

module.exports = app;
