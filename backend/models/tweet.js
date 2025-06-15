import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },    text: {
        type: String,
        required: true,
        maxlength: 280 // Twitter's character limit
    },
    image: {
        url: {
            type: String, // Cloudinary URL to the uploaded image
            default: null
        },
        publicId: {
            type: String, // Cloudinary public ID for deletion
            default: null
        }
    },    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        text: {
            type: String,
            required: true,
            maxlength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add virtual field for likes count
tweetSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

// Ensure virtuals are included in JSON output
tweetSchema.set('toJSON', { virtuals: true });
tweetSchema.set('toObject', { virtuals: true });

const TweetModel = mongoose.model('tweets', tweetSchema);
export default TweetModel;
