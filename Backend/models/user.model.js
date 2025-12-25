import mongoose from 'mongoose'



 const userscheam = mongoose.Schema({
    fullname:{
        firstname : {
            type : String,
            minLength : [3,'firstname must be atleasr 3 chatacter long'],
            required : true
        },    
        lastname : {
            type : String
        }
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true, // 👈 this line is the key
        minlength: [11, "Phone number must be at least 11 digits long"],
    },

    role: {
      type: String,
      enum: ["user", "admin"], // only 2 possible values
      default: "user",
      isactive : true         // by default sab user honge
    },
    password : { 
      type: String,
      required: true,
      select: false
    }
    
},
    {timestamps : true}
)

const User = mongoose.model('User', userscheam);
export default User;