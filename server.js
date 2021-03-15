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
        res.status(200).send({message : "UserRegistered"});
      }
      });
    });
  });


//api to authenticate User throught login
app.post('/api/login', (req, res) => {

  const localuser = req.body.email;

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
      res.status(200).send({token , localuser})

    });
  });

});

//to get all videos which are added by diff Users
app.get('/api/dashboardvideos' , async (req,res) => {

  try {
      
    let url = await Url.find();
    res.status(200).json(url);

  } catch (error) {

    res.status(404).json('Server Error');
    
  }
})


//to add like to video
app.post('/api/likevideo' , async (req,res) => {
  

  try {
    
    let url = await Url.findOneAndUpdate({urlname : req.body.myurl}, { $inc: { like : 1 }});
    res.status(200).json(url);


  } catch (error) {
    
    res.status(404).json('Server Error');
  }
})



//to get data from my DB and show in frontend
app.post('/api/getvideos' , async (req,res) => {

    try {
      
      let url = await User.findOne({email : req.body.email}, {videos : 1});
      
      res.status(200).json(url);


    } catch (error) {

      res.status(404).json('Server Error');
      
    }

});


//to post url data inside the DB
app.post('/api/postvideos', async (req,res) => {

  try {
  const bodyurl = req.body;
  const myurl = bodyurl.url;
  const bodytitle = bodyurl.title;



  let url = new Url({
        urlname: myurl,
        urltitle: bodytitle
  });

  url.save();

  await User.findOneAndUpdate({email: req.body.email} , 
    { $push: { 
      videos: url
    } 
}
    )
    res.json(url);
  } catch (error) {
    res.status(404).json('Server Error');
  }


});






























//opening port
app.listen(process.env.PORT || 6563);






