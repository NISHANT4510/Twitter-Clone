import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type : String,
        required : true
    },
    username: {
        type : String,
        unique : true,
        sparse: true  // Allow null/undefined values
    },
    email: {
        type : String,
        required : true,
        unique : true
    },
    password: {
        type : String,
        required : true
    },
    bio: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },    profilePicture: {
        type: String,
        default: ''
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }]
})
 
const UserModel = mongoose.model('users', userSchema);
export default UserModel;