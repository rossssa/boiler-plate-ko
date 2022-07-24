const express = require('express') // 다운받은 express 모듈을 가져옴
const app = express() // 새로운 express 앱을 만듦
const port = 5000 // 아무렇게나 해도 상관없음 

const mongoose=require('mongoose')
mongoose.connect('mongodb+srv://rosa:dnlffl12@boilerplate.w8mb5.mongodb.net/?retryWrites=true&w=majority',{}).then(()=>console.log('MongoDB Connected...'))
.catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세여~!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})