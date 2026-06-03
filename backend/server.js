import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("DB Connection Error:", err));

// --- UNIVERSAL MODEL HELPER (For Records) ---
const getDynamicModel = (collectionName) => {
    return mongoose.models[collectionName] ||
           mongoose.model(collectionName, new mongoose.Schema({}, { strict: false, timestamps: true }));
};

// --- AUTH ROUTES ---
app.use('/api', userRoutes);

// --- UNIVERSAL RECORD ROUTES ---
app.get('/api/', async (req, res) => {
    try {
        const DataModel = getDynamicModel(req.params.collection);
        const data = await DataModel.find();
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/:collection', async (req, res) => {
    try {
        const DataModel = getDynamicModel(req.params.collection);
        const newItem = new DataModel(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/:collection/:id', async (req, res) => {
    try {
        const DataModel = getDynamicModel(req.params.collection);
        await DataModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/:collection/:id', async (req, res) => {
    try {
        const DataModel = getDynamicModel(req.params.collection);
        const updatedItem = await DataModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: false }
        );
        if (!updatedItem) {
            return res.status(404).json({ error: "Record not found" });
        }
        res.json(updatedItem);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});
// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));