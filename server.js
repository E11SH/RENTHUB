const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/renthub';
const JWT_SECRET = 'your-secret-key-change-in-production';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, enum: ['seeker', 'advertiser'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    type: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: { type: String, enum: ['card', 'cash'], required: true },
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// ==================== ROUTES ====================

// User Registration
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, type } = req.body;

        // Validation
        if (!name || !email || !password || !type) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            type
        });

        await newUser.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, type: user.type },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                type: user.type
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get All Properties
app.get('/api/properties', async (req, res) => {
    try {
        const properties = await Property.find().populate('owner', 'name email').sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Single Property
app.get('/api/properties/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email');
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.json(property);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Create Property (Protected Route)
app.post('/api/properties', authenticateToken, async (req, res) => {
    try {
        // Check if user is advertiser
        if (req.user.type !== 'advertiser') {
            return res.status(403).json({ msg: 'Only property owners can post properties' });
        }

        const { title, location, price, area, bedrooms, bathrooms, type, image, description } = req.body;

        // Validation
        if (!title || !location || !price) {
            return res.status(400).json({ msg: 'Please enter required fields' });
        }

        const newProperty = new Property({
            title,
            location,
            price,
            area,
            bedrooms,
            bathrooms,
            type,
            image,
            description,
            owner: req.user.id
        });

        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update Property (Protected Route)
app.put('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user is the owner
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProperty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete Property (Protected Route)
app.delete('/api/properties/:id', authenticateToken, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check if user is the owner
        if (property.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Property deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Create Booking (Protected Route)
app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { propertyId, paymentMethod, totalAmount, transactionId } = req.body;

        const newBooking = new Booking({
            property: propertyId,
            user: req.user.id,
            paymentMethod,
            totalAmount,
            transactionId
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get User Bookings (Protected Route)
app.get('/api/bookings/my', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('property')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
    console.log(`💻 Frontend: http://localhost:${PORT}`);
});
