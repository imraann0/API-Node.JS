const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(cors())
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }))

const path = require('path');




//   app.use(express.static('build'));

//   app.get('*', (req, res) => {
//       res.sendFile(path.resolve(__dirname,'build', 'index.html'));
//  });




app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
    // res.setHeader('Access-Control-Allow-Origin', 'https://imraann0.co.uk')


  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)

  // Pass to next layer of middleware
  next()
})

app.use('/uploads',express.static('uploads'));

const db = require('./database/db');

db.authenticate()
  .then(() => console.log('connected to db!'))
  .catch(err => console.log('Error:' + err))

// import routes
userRoute = require('./routes/user')


//route middlewear
app.use('/api/user', userRoute)


app.listen(port)

console.log('server started on: ' + port)
