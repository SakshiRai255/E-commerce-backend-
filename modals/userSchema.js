import mongoose, { Schema } from "mongoose";
import AuthRoles from "../utils/authRoles";
import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../config/index";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      maxLength: [50, "Name must be less than 50"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "password must be at least than 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: AuthRoles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// challenge 1 - encrypt password

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods = {
    comparePassword : async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
    },
    //  generate JWT TOKEN 
    getJwtToken : function(){
        return JWT.sign({
            _id :this._id,
            role:this.role
        },
        config.JWT_SECRET,
        {
            expiresIn:config.JWT_EXPIRY
        }
        )},

        generateForgotPasswordToken: function(){
          const forgotToken = crypto.randomBytes(20).toString('hex')
          // Step 1 = Save to DB
          this.forgotPasswordToken = crypto
          .createHash("sha256")
          .update(forgotToken)
          .digest("hex")
          this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
          
          // Step 2 = Return the values to user
          return forgotToken
        }
}


export default mongoose.model("User", userSchema);
