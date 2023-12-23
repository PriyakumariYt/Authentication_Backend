const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const port = process.env.PORT || 8000;
const hbs = require('hbs');
const conn = require('./db/conn'); 
const bcrypt = require("bcrypt")
 const jwt = require("jsonwebtoken")
const Register = require('./models/register');

const auth = require("./middleware/auth");
const { CurrencyCodes } = require('validator/lib/isISO4217');
// Set up static paths
const templatePath = path.join(__dirname, '../templates/views');
const partialPath = path.join(__dirname, '../templates/partials');
const staticPath = path.join(__dirname, '../public');

// Middleware for form data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(staticPath));

// Set up the view engine
app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialPath);
// yaha se
app.get('/', (req, res) => {
  res.render('index');
  // res.send(req.body)
});
app.get('/logout', auth, async(req, res) => {
try {
  console.log(`this is user data ${req.user}`)
  // delete token in one device 
  // req.user.tokens =req.user.tokens.filter((CurrElem)=>{
  //   return CurrElem.token !== req.token
  // })
  // DELETE ALL TOKEN IN ONE TIME 
  req.user.tokens = [];
  res.clearCookie("jwt")
  console.log("logout succesfully")
 await req.user.save()
 res.render("login")
} catch (error) {
  res.status(500).send(error)
}
});

app.get('/page',auth, (req, res) => {
  res.render('page');
  // console.log(`this the cookies page  ${req.cookies.jwt}`)
});


app.post('/', async (req, res) => {
  try {
      const Data = new Register(req.body);
      const token = await Data.generateToken(); 
      console.log("the register token part", token)
      res.cookie("jwt", token,{
        expires:new Date(Date.now()+ 500000),
        httpOnly:true
      })
      console.log(`reqistered..... cookies ${req.cookies.jwt}`)

      // Now you can handle the response
      res.status(201).render('last');
  } catch (error) {
      // Handle error
      console.error('Error saving data:', error);
      res.status(500).send(error);
  }
});

// 2nd collection login check add in mongoose
app.get('/login', (req, res) => {
  res.render('login');
  // res.send(req.body)
});
app.post('/login', async (req, res) => {
 try {
const email = req.body.email;
const password = req.body.password;
const userEmail = await Register.findOne({ email: email });
const isMatch = await bcrypt.compare(password,userEmail.password)
const token = await userEmail.generateToken()
console.log("the login token part", token)
res.cookie("jwt", token,{
  expires:new Date(Date.now() + 500000),
  httpOnly:true, 
  // secure:true
})
console.log(`login cookies..... ${req.cookies.jwt}`)


if (isMatch) {

res.status(201).render("last")
}else{
  res.send("invalid password details")
}


 } catch (error) {
    res.status(400).send("invalid email")
 }

});

app.get('*', (req, res) => {
  res.render('error', {
    errorMsg: 'Oops, page not found',
  });
});
// yaha tk

// bycrytp
// const securePassword = async (password)=>{
//     const passwordHash = await bcrypt.hash(password,10);
//     console.log(passwordHash)
//     const passwordMatch = await bcrypt.compare(password,passwordHash);
//     console.log(passwordMatch)
// }

// securePassword("priya@123")

// jwt
// const jwt = require("jsonwebtoken")
// const createToken = async ()=>{
// const token = await jwt.sign({_id:"112355554ssdfcvf"},"mynamehhecbdcbjbcbcnjbjvczz",{
//   expiresIn: "2 minutes"
// })

// console.log(token)
// const userVerification = await jwt.verify(token,"mynamehhecbdcbjbcbcnjbjvczz")
// console.log(userVerification);
// }
// createToken()


// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
