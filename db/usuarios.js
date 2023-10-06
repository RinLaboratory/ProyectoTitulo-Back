const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:String,
    usernameE:String,
    email:String,
    password_id:String,
    rol: String,
})

userSchema.index({usernameE: 'text'})
module.exports = mongoose.model("usuarios", userSchema);