const express = require('express') // 다운받은 express 모듈을 가져옴
const app = express() // 새로운 express 앱을 만듦
const port = 5000 // 아무렇게나 해도 상관없음 

const bodyParser=require("body-parser");
const config=require('./config/key');

const {User}=require("./models/User");

//application/x-www-form-unlencoded 타입 분석
app.use(bodyParser.urlencoded({extended:true}));
//application/json 타입 분석
app.use(bodyParser.json());

const mongoose=require('mongoose')
mongoose.connect(config.mongoURI,{}).then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//회원가입을 위한 route----------------
app.post('/register', (req, res)=>{
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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})