const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds=10; // 10자리인 salt 생성해서 비밀번호를 암호화
const jwt=require('jsonwebtoken');

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
userSchema.pre('save', function(next){ // user 정보를 저장하기 전에 함수 시행
    let user=this;

    if(user.isModified('password')){ // 조건: model 안의 필드 중 비밀번호가 변환될때만
    // 비밀번호를 암호화 시킨다
    bcrypt.genSalt(saltRounds, function(err, salt){
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err)
            user.password=hash
            next()
        })
    })
} else {
        next()
    }
}); 

userSchema.methods.comparePassword=function(plainPassword, cb){
    // plainPassword 1234567 <=====>  암호화된 비밀번호 $2b$10$tGhwKfkeWVO9XpTyidO5BOu8iyUyQseZ5YGVHONL8CjnqLVyvr3di
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        else cb(null, isMatch)
    })
}

userSchema.methods.generateToken=function(cb){
    let user=this;
    //jsonwebtoken을 이용해서 token을 생성하기
    let token =jwt.sign(user._id.toHexString(),'secretToken')
    // user._id+'secretToken'=token
    // ->
    // 'secretToken' -> user._id
    user.token=token
    user.save(function(err, user){
        if(err) return cb(err)
        else cb(null, user)
    })
}

userSchema.statics.findByToken=function(token, cb){
    let user=this;
  //  user._id +''=token
    // 토큰을 decode 한다
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 아이디를 이용하여 유저를 찾은 후
        // 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User=mongoose.model('User', userSchema); // 스키마를 모델로 감싸줌

module.exports={User} // 다른곳에서도 사용가능하도록함