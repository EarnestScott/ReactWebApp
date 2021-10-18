const mongoose = require('mongoose');
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
    nickName: {
        type: String,
    },
    prompts: [PromptsSchema]

});

module.exports = FriendSchema;