const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim:true, // trim은 공백을 삭제해줌
        unique: 1
    },
    password: {
        type:String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { // 관리자 혹은 일반유저 분류
        type: Number,
        default:0 
    },
    image: String,
    token: {
        type:String
    },
    tokenExp: {
        type:Number
    }
})

const User=mongoose.model('User', userSchema); // 스키마를 모델로 감싸줌

module.exports={User} // 다른곳에서도 사용가능하도록함