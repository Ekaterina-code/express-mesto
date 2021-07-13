const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;
mongoose
  .connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .catch((err) => console.log(err));

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));
app.use('/', require('./routes/root'));

app.use(errors());
app.use(errorHandler);

const server = app.listen(PORT, (error) => {
  if (error) {
    console.log(`Error: ${error}`);
    return;
  }
  console.log(`Server listening on port ${server.address().port}`);
});
