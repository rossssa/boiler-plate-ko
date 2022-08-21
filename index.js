const express = require('express') // 다운받은 express 모듈을 가져옴
const app = express() // 새로운 express 앱을 만듦
const port = 5000 // 아무렇게나 해도 상관없음 
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const config=require('./config/key');
const {auth}=require('./middleware/auth');
const {User}=require("./models/User");
app.use(cookieParser());

//application/x-www-form-unlencoded 타입 분석
app.use(bodyParser.urlencoded({extended:true}));
//application/json 타입 분석
app.use(bodyParser.json());

const mongoose=require('mongoose');
const { Router } = require('express');
mongoose.connect(config.mongoURI,{}).then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err)) // 소스 안 비밀정보 보호하기(따로 저장)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//회원가입을 위한 route----------------
app.post('/api/users/register', (req, res)=>{
// 회원 가입 할때 필요한 정보들을 client에서 가져오면
// 그것들을 데이터 베이스에 넣어준다.

const user=new User(req.body) //client의 정보를 받아준다. bodyparser을 통해
console.log(user);

user.save((err, userInfo)=>{
  if(err) return res.json({success:false, err})
  console.log(userInfo.body);
  return res.status(200).json({ // status(200):성공했다
    success:true
  })
}) // mongoDB의 메소드

})

app.post('/api/users/login', (req, res)=>{
  // 요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({email:req.body.email}, (err, user)=>{
    if(!user){
      return res.json({
        loginSuccess: false,
        message : "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
  // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
  user.comparePassword(req.body.password, (err, isMatch)=>{ // 메소드 생성
    if(!isMatch) { return res.json({loginSuccess:false, message: "비밀번호가 틀렸습니다."}) }
  
      // 비밀번호까지 맞다면 토근 생성
    user.generateToken((err, user)=>{
      if(err) return res.status(400).send(err);

      // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지, 여러가지 방법이 있고 장단점이 있지만 일단 쿠키로 해보자
      res.cookie("x_auth", user.token)
      .status(200)
      .json({ loginSuccess:true, userId: user._id }) 
    })
  })
 })
})


app.get('/api/users/auth', auth , (req, res)=>{
    //여기까지 미들웨어를 통과해 왔다는 얘기는 authentication이 true라는 말
    res.status(200).json({
      _id:req.user._id,
      isAdmin: req.user.role === 0 ? false : true, // 이 정책은 바꿀 수 있다
      idAuth: true,
      email: req.user.email,
      name:req.user.name,
      lastname: req.user.lastname,
      role:req.user.role,
      image:req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res)=>{
  User.findOneAndUpdate({ _id:req.user._id},
    {token:""}
    , (err, user)=>{
      if(err) return res.json({ success:false, err});
      return res.status(200).send({
        success:true
      })
    })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})