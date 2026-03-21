import mongoose from "mongoose";
const Schema = mongoose.Schema

const todoSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "Task_user", required: true},
    title: {
        type: String, 
        required: true,
        trim: true
    },
    description: {
        type: String, 
        required: true,
        trim: true
    },
    tags: {
        type: String,
        enum: ["Important", "Urgent"],
        required: true
    },
    
    scheduledDate: 
    { type: Date }, 

    createdAt: {
        type: Date,
        default: Date.now,
    }
})

todoSchema.index({user: 1, createdAt: -1})
export default mongoose.model("To-Do", todoSchema);