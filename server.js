const express = require('express');
const config = require('config');
const cors = require('cors');
const User = require('./models/user');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');
const multiparty = require('multiparty');
const Url = require('./models/url');



cloudinary.config({
  cloud_name: 'arnab7',
  api_key: '861916521482154',
  api_secret: 'MzTYcuVvV4zR4Qtl_yIF7WJDYoA'
});






const connectDB = require('./config/db');
const app = express();


connectDB();
app.use(express.json())

app.use(cors());

//default start page comment
app.get('/', (req, res) => {
  return res.send('<h1>Welcome to Youtube Backend</h1>');
})


//route to register the user
app.post('/api/register', async (req, res) => {

  await User.findOne({
    email: req.body.email
  }, '+password', function (err, existingUser) {
    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already taken'
      });
    }

    // Obtain the avatar from gravatar service
    var secureImageUrl = gravatar.url(req.body.email, {
      s: '200',
      r: 'x',
      d: 'retro'
    }, true);

    var user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      user_avatar: secureImageUrl
    });

    user.save((err, registeredUser) => {
      if (err) {
        res.status(500).json({
          message: err.message
        });
      }else{
        let payload = {
          subject: registeredUser._id
        }
        let token = jwt.sign(payload, 'secretkey')
        res.status(200).send({token});
      }
      });
    });
  });


//api to authenticate User throught login
app.post('/api/login', (req, res) => {

User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(401).json({ message: 'Invalid Email' });
    }

    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid Password' });
      }
      let payload = {
        subject: user._id
      }
      let token = jwt.sign(payload, 'secretkey')
      res.status(200).send({token})

    });
  });

});


//api to post a video from User
app.post('/api/upload', (req,res) => {

  let fileName = '';
  let size = '';
  let tempPath;
  let extension;
  let videoName;
  let destPath = '';
  let inputStream;
  let outputStream;
  let form = new multiparty.Form();

  form.on('error', (err) => {
    console.log('Error parsing form: ' + err.stack);
  });

  form.on('part', (part) => {
    if(!part.filename){
      return;
    }
    size = part.byteCount;
    fileName = part.filename;
  });
  form.on('file', (name, file) => {
    cloudinary.uploader.upload(file.path, function(response){
      return res.json({ response: response });
    }, { resource_type: "video" });
  });
  form.on('close', () => {
    console.log('Uploaded!!');
  });
  form.parse(req);

})


//to get data from my DB and show in frontend
app.get('/api/getvideos' , async (req,res) => {

    try {
      
      let url = await Url.find();
      res.status(200).json(url);


    } catch (error) {

      res.status(404).json('Server Error');
      
    }

});


//to post url data inside the DB
app.post('/api/postvideos', async (req,res) => {

  try {
  const bodyurl = req.body;
  const myurl = bodyurl.name;

  let url = new Url({
        urlname: myurl
  });

  await url.save();

    res.json(url.urlname);
  } catch (error) {
    res.status(404).json('Server Error');
  }


});






























//opening port
app.listen(process.env.PORT || 6563);