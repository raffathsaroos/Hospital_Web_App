import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor', 'nurse', 'staff'], default: 'staff' }
});

const User = mongoose.model('User', UserSchema);
export default User;
