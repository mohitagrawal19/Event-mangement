const otp=require('otp-generator');

const Generateotp=()=>{
    const otpvalue=otp.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});
    return otpvalue;
}
module.exports=Generateotp;