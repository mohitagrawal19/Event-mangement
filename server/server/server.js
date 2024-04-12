const express=require("express");
const mongo=require("../Schema/User");
const imageSchema=require("../Schema/Project");
const cors=require("cors");
const mongoose=require("mongoose");
const app=express();
const saltRounds=10;
const bcrypt=require("bcrypt");
const path = require('path');
const nodemailer=require("nodemailer");
const { LocalStorage } = require('node-localstorage');
const localStorageDir = './localStorage';
const localStorage = new LocalStorage(localStorageDir);
const jwt = require('jsonwebtoken');
const SECRET_KEY="NOTESAPI";
const generateotp=require("../otp/Generateotp");
app.use(express.json());
const multer=require("multer");
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/Images", express.static(path.join("Images")));
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        return cb(null,"Images");
    },
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}-${file.originalname}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if(allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
 // const upload=multer({dest:"./server/Images"});
 const upload = multer({ 
    storage,
    fileFilter
});

mongoose.connect("mongodb://localhost:27017/Register")
.then(()=>{
    console.log("connected");
})
.catch(()=>{
    console.log("failed");
})


const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ma.7693849@gmail.com',
                pass: 'kmaz lqqd nssf vbwp'
            }
        });

        const mailOptions = {
            from: 'ma.7693849@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Hello ${name},</p><p>Click the link to verify your email: <a href="http://localhost:3000/emailverification/${user_id}">Verify Email</a></p>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error sending email:", error);
               
            } else {
                console.log("Email sent successfully");
                
            }
        });
    } catch (err) {
        console.log(err.message);
    }
}


app.post('/Register', async (req, res) => {
    try {
        const { userName, emailAddress, Password, isVerified, confirmPassword, firstName, lastName, phoneNumber, Address1 } = req.body;
        const existingUser = await mongo.findOne({ emailAddress });
        console.log("existing user is:", existingUser);
        
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', status: false });
        } 
        
        if (!userName || !emailAddress || !Password || !confirmPassword || !firstName || !lastName || !phoneNumber || !Address1) {
            return res.status(200).json({ message: 'All fields are required', status: false });
        } 
        
        if (Password !== confirmPassword) {
            return res.status(200).json({ message: 'Password not matched', status: false });
        } 
        
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
        const newUser = new mongo({
            userName,
            emailAddress,
            Password: hashedPassword,
            isVerified
            
        });
        const token = jwt.sign({ emailAddress: newUser.emailAddress, id: newUser._id }, SECRET_KEY,{
            expiresIn: '1h'
        });
        await newUser.save();
        newUser.token=token;
        await newUser.save();
        console.log("token is :", token);
        sendVerifyMail(req.body.userName, req.body.emailAddress, newUser._id);
        localStorage.setItem('id', JSON.stringify({ _id: newUser._id }));
        localStorage.setItem('token', JSON.stringify({ token: token }));
        localStorage.setItem('emailAddress', JSON.stringify({ emailAddress: newUser.emailAddress }));

        return res.status(201).json({ user: newUser, token: token, message: 'Registration successful', status: true });
        
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// app.post('/upload-image', async (req, res) => {
//     const { base64, userName,name,description } = req.body; 
//     try {
        
//         await imageSchema.create({ image: base64});
//         res.send({ status: true });
//     } catch (error) {
//         console.error(error);
//         res.send({ status: false });
//     }
// });
app.get('/showImage', async (req, res) => {
    try {
        const { userName } = req.query; 
        const user = await imageSchema.findOne({ userName: userName });
        if (user) {
            
            res.json(user.image);
            
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//     let data=await mongo.find({
//         "$or":[
//             {userName:{$regex:req.params.key}},
//             {emailAddress:{$regex:req.params.key}}
//         ]
//     })
//     res.send(data);
// });
// app.post('/Signin', (req, res)=>{

//     const {emailAddress, Password} = req.body;
//   let email=  mongo.findOne({emailAddress})
//   console.log("email is",email);

//   if(!email)
//   {
//       res.json("No records found!");
//   }
//   else if(emailAddress==" "){
//       res.json("failed");
//   }

//     // .then(user => {
//     //     if(user){
//     //         if(user.Password == Password) {
//     //             res.json("Success");
//     //         }
//     //         else{
//     //             res.json("Wrong password");
//     //         }
//     //     }
//     //     else{
//     //         res.json("No records found! ");
//     //     }
//     // })

// })

// app.post("/Signin", async (req, res) => {
//     try {
//       const { emailAddress, Password } = req.body;
//       const user = await mongo.findOne({ emailAddress });
//       if (user && user.Password === Password) {
//         res.status(200).json({ message: "login successfully" ,status: true}); 
//       } else {
//         res.status(200).json({message:"Wrong email or password",status: false});
//       }
//     } catch (error) {
//       console.error('Error retrieving data:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });
// const verifyToken = (req, res, next) => {
//     const token = req.headers.authorization;

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized: No token provided', status: false });
//     }

//     jwt.verify(token, SECRET_KEY, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Unauthorized: Invalid token', status: false });
//         }
//         req.user = decoded;
//         next();
//     });
// };
app.post("/Signin", async (req, res) => {
    try {
        const { usernameOrEmail, Password } = req.body;  
        console.log('Received request with usernameOrEmail:', usernameOrEmail); 
        
        
        const user = await mongo.findOne({ $or: [{ userName: usernameOrEmail }, { emailAddress: usernameOrEmail }] });  
        console.log('Found user:', user); 
        
     
        if (!user) {
            return res.status(200).json({ message: "User not found", status: false });
        }

        if (!user.isVerified) {
            return res.status(200).json({ message: "Email not verified", status: "not verified" });
        }

        const match = await bcrypt.compare(Password, user.Password);
        console.log('Password match:', match);

        
        if (!match) {
            return res.status(200).json({ message: "Wrong password", status: "not matched" });
        } else {
            return res.status(200).json({ message: "Login successful", status: true });
        }
    } catch (error) {
        console.error('Error retrieving data:', error);
        return res.status(500).json({ message: 'Internal Server Error' }); 
    }
});

app.post("/projectsecond", upload.single('image'), async (req, res) => {
        console.log('--req--', req.body, req.file)
        try {
            const { userName, name, description } = req.body;
            const image = req.file.path;
            const existingUser = await mongo.findOne({ userName: userName });

            if (!existingUser) {
                return res.status(404).json({ message: "User not found", status: false });
            }
            const newImage = new imageSchema({
                userId: existingUser._id,
                name: name,
                description: description,
                image: image
            });

            await newImage.save();

            return res.status(200).json({ message: "Project data updated successfully", status: true, data: newImage });
        } catch (error) {
            console.error('Error updating project data:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
});

app.delete('/projects/:id', async (req, res) => {
    try {
        console.log("id isisisisisiis",req.params.id);
        const deletedProject = await imageSchema.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// app.get("/Registerhome", async (req, res) => {
//     try {
//         const { userName } = req.query;
//         const user = await mongo.findOne({ userName: userName });
//         if (user) {
//             res.json(user.projectName);
//             res.json(user.projectDescription);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         console.error('Error occurred:', error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });
// app.get("/displaydata", async (req, res) => {
//     try {
//         const { userName} = req.query;
//         const userid=await mongo.findOne({userName: userName});
//         const id=userid._id;
//         console.log("userid",id)
//         const user2 = await imageSchema.findOne({ userId: id });
//         console.log("user2", user2.userId);
//         if (user2 && user2.userId.equals(id)) {
//             res.json([{ name: user2.name, description: user2.description, image: user2.image }]);
//             console.log("user2", user2.name);
//         } else {
//             res.status(404).json({ message: "User not found" });
//         }
//     } catch (error) {
//         console.error('Error occurred:', error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });
app.get("/displaydata/:userName", async (req, res) => {
    try {
        const { userName } = req.params;
        const user = await mongo.findOne({ userName: userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const projects = await imageSchema.find({ userId: user._id });
        if (projects.length === 0) {
            return res.status(404).json({ message: "No projects found for this user" });
        }
        const projectData = projects.map(project => ({
            name: project.name,
            description: project.description,
            image: project.image,
            id:project._id
        }));
        res.json(projectData);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/updatedata/:id", upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body; 
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded", status: false });
        }

        const imagePath = req.file.path;
        console.log("imagePath:", imagePath);
        const result = await imageSchema.findByIdAndUpdate(
            { _id: id },
            { name: name, description: description, image: imagePath }
        );

        if (!result) {
            fs.unlinkSync(imagePath);
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json({ message: "Data updated successfully", imagePath: imagePath });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





app.get("/dataget/:id",upload.single('image'), async (req, res) => {
    const {id}=req.params;
    try {
        const data = await imageSchema.find({"_id":id});
        console.log("data",data);
        res.json(data);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }    
})

app.get('/emailverification/:_id', async (req, res) => {
    try {
        const userId = localStorage.getItem("id");
       console.log("p is:",userId);
       
       const { _id } = JSON.parse(userId); 
        console.log(_id);
        const user=await mongo.findOne({_id:_id});
        console.log("is verified:",user.isVerified);
        if(user.isVerified==true){
            return res.status(200).json({ message: 'Email already verified', status: 'notrun'});
        }
        else{
            const result = await mongo.updateOne({_id: _id }, { $set: { isVerified: true } });
            console.log("Result:", result);
            console.log("Email verified successfully");
            return res.status(200).json({ message: 'Email verified successfully' });
        }
      
    } catch (err) {
        console.error('Error updating document:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post("/Reset", async (req, res) => {
    const otp = generateotp();
    let otp1;
    try {
        const { emailAddress } = req.body;
       
        const user1 = await mongo.findOne({ emailAddress });
        if (!user1) {
            return res.status(200).json({ message: 'User not found', status: false });
        }
        if (!user1.isVerified) {
            return res.status(200).json({ message: 'Email not verified', status: 'not verified' });
        }
        otp1 = otp;
        const user = await mongo.findOneAndUpdate(
            { emailAddress },
            { $set: { otp1 } },
            { new: true }
        );
        if (user) {
            user.otp = otp;
            await user.save();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'mohitblazels@gmail.com',
                    pass: 'wbvq bosa icgi sqlx'
                }
            });
            const mailOptions = {
                from: 'mohitblazels@gmail.com',
                to: emailAddress,
                subject: 'Reset your password',
                text: `Your OTP is: ${otp}`,
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error("Error sending email:", error);
                    res.status(200).json({ message: 'Error sending email' });
                } else {
                    console.log("Email sent successfully", info.response);
                    res.status(200).json({ message: "OTP sent successfully", status: true });
                }
            });
        } else {
            res.status(200).json({ message: "User not found", status: false });
        }
        
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post("/verify-otp", async (req, res) => {
    try {
        const { emailAddress, otp } = req.body;
        
        
        const user = await mongo.findOne({ emailAddress });

        
        if (user) {
       
            if (user.otp == otp) {
               
                res.status(200).json({ message: "OTP verified successfully", status: true });
            } else {
               
                res.status(200).json({ message: "Invalid OTP", status: false });
            }
        } else {
           
            res.status(200).json({ message: "User not found", status: false });
        }
    } catch (error) {
     
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post("/Reset-password", async (req, res) => {
    try {
      const { emailAddress, NewPassword } = req.body;
      const user = await mongo.findOne({ emailAddress });
      console.log("user password is:",user.Password);
      const match = await bcrypt.compare(NewPassword, user.Password);
      if(user.isVerified==false){
        return res.status(200).json({ message: "Email not verified", status: false });
      }
      if (match) {
        return res.status(200).json({ message: "New password cannot be the same as the old password", status: false });
      }
  
      if (user) {
        const hashedPassword = await bcrypt.hash(NewPassword, saltRounds);
  
        user.Password = hashedPassword;
        await user.save();
  
   
        res.status(200).json({ message: "Password reset successfully", status: true });
      } else {
        
        res.status(200).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.listen(3001,()=>{
    console.log("port connected")
})  