const mongoose = require('../odm');
const { Schema } = mongoose;

const PromptsSchema = new Schema({
    prompt: {
        type: String,
        required: true
    },
    response: {
        type: String,
    }
});

const FriendSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    prompts: [PromptsSchema]

});

module.exports = mongoose.model('Friend', FriendSchema);