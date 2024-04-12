const mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    emailAddress: String,
    Password: String,
    dateOfBirth: Number,
    Gender: String,
    phoneNumber: Number,
    Address1: String,
    Address2: String,
    State: String,
    ZIPCode: Number,
    Country: String,
    otp: Number,
    isVerified:{type:Boolean,default:false},
    token:String
});
const users = mongoose.model("User", userSchema);

module.exports = users;