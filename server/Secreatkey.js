const crypto=require('crypto');
const generateSecreatKey=()=>{
    return crypto.randomBytes(32).toString('hex');
}
console.log("key is",generateSecreatKey());
module.exports=generateSecreatKey;