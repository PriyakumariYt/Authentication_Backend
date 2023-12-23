require('dotenv').config()
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3, // Corrected from minLength to minlength
   
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value); // Changed validator(value) to return validator.isEmail(value)
      },
      message: "Invalid email id",
    },
  },
  password:{
    type:String,
    required:true,
  
  },
  city: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
    required: true,
    min: 6,
  },
  checkbox: {
    type: Boolean, // Assuming it's a Boolean
    required: true,
  },
  tokens:[{
    token:{
      type: String,
      required: true
    }
  }]
});

// generate token
// userSchema.methods.generateToken =async function (){
// try {
//   console.log(this._id)
//   const token = jwt.sign({_id:this._id.toSting()},"njfvuhvbvfbhjjrwuwncabnmkhdyexnhd");
//   this.tokens = this.tokens.concat({token:token})
//   // console.log(token)
//   await this.save();
//   return token
// } catch (error) {
//   res.send("the error " + error)
//   console.log(error)
// }
// }
// yaha tak
// In register.js
userSchema.methods.generateToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token; // Return the token
};



// secure data using  hash bcrypt
userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    console.log(`the current password is ${this.password}`)
    this.password = await bcrypt.hash(this.password,10)
    console.log(`the current password is ${this.password}`)
    
  }
  next();
})
// Create the Mongoose model
const Register = mongoose.model("Register", userSchema);

module.exports = Register;
