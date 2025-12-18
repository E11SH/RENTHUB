const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/renthub';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected for Seeding'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schemas
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    type: String,
    createdAt: { type: Date, default: Date.now }
});

const propertySchema = new mongoose.Schema({
    title: String,
    location: String,
    price: Number,
    area: Number,
    bedrooms: Number,
    bathrooms: Number,
    type: String,
    image: String,
    description: String,
    owner: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);

// Seed Data
async function seedDatabase() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Property.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Users
        const seeker = await User.create({
            name: 'Ahmed Mohamed',
            email: 'seeker@test.com',
            password: hashedPassword,
            type: 'seeker'
        });

        const advertiser = await User.create({
            name: 'Sara Hassan',
            email: 'owner@test.com',
            password: hashedPassword,
            type: 'advertiser'
        });

        console.log('✅ Created test users:');
        console.log('   Seeker: seeker@test.com / password123');
        console.log('   Owner: owner@test.com / password123');

        // Create Properties
        const properties = [
            {
                title: 'Cozy Downtown Apartment',
                location: 'Cairo, Zamalek',
                price: 5000,
                area: 85,
                bedrooms: 2,
                bathrooms: 1,
                type: 'Apartment',
                image: 'images/apartment.png',
                description: 'Beautiful apartment in the heart of Zamalek with stunning Nile views. Fully furnished with modern amenities, close to restaurants and cafes.',
                owner: advertiser._id
            },
            {
                title: 'Modern Studio Near University',
                location: 'Giza, Dokki',
                price: 3500,
                area: 45,
                bedrooms: 1,
                bathrooms: 1,
                type: 'Studio',
                image: 'images/studio.png',
                description: 'Perfect for students! Compact studio apartment just 5 minutes walk from Cairo University. Includes all utilities and high-speed internet.',
                owner: advertiser._id
            },
            {
                title: 'Spacious Family Villa',
                location: '6th October City',
                price: 15000,
                area: 250,
                bedrooms: 4,
                bathrooms: 3,
                type: 'Villa',
                image: 'images/villa.png',
                description: 'Luxurious villa in a gated community with private garden, swimming pool, and 24/7 security. Perfect for families.',
                owner: advertiser._id
            },
            {
                title: 'Luxury Penthouse with View',
                location: 'New Cairo',
                price: 20000,
                area: 200,
                bedrooms: 3,
                bathrooms: 2,
                type: 'Penthouse',
                image: 'images/penthouse.png',
                description: 'Stunning penthouse with panoramic city views, rooftop terrace, and premium finishes. Located in the most prestigious tower.',
                owner: advertiser._id
            },
            {
                title: 'Shared Room for Students',
                location: 'Cairo, Nasr City',
                price: 1500,
                area: 30,
                bedrooms: 1,
                bathrooms: 1,
                type: 'Shared',
                image: 'images/shared.png',
                description: 'Affordable shared accommodation for students and young professionals. Clean, safe environment with shared kitchen and living areas.',
                owner: advertiser._id
            },
            {
                title: 'Industrial Loft Downtown',
                location: 'Cairo, Downtown',
                price: 8000,
                area: 120,
                bedrooms: 2,
                bathrooms: 2,
                type: 'Loft',
                image: 'images/loft.png',
                description: 'Trendy loft with exposed brick walls, high ceilings, and modern design. Perfect for creative professionals in the city center.',
                owner: advertiser._id
            },
            {
                title: 'Elegant Apartment in Maadi',
                location: 'Cairo, Maadi',
                price: 6500,
                area: 95,
                bedrooms: 2,
                bathrooms: 1,
                type: 'Apartment',
                image: 'images/apartment.png',
                description: 'Charming apartment in the green district of Maadi. Quiet neighborhood with easy access to schools and shopping centers.',
                owner: advertiser._id
            },
            {
                title: 'Compact Studio in Heliopolis',
                location: 'Cairo, Heliopolis',
                price: 4000,
                area: 50,
                bedrooms: 1,
                bathrooms: 1,
                type: 'Studio',
                image: 'images/studio.png',
                description: 'Well-maintained studio in historic Heliopolis. Close to airport and major business districts. Ideal for working professionals.',
                owner: advertiser._id
            }
        ];

        await Property.insertMany(properties);
        console.log(`✅ Created ${properties.length} properties`);

        console.log('\n📊 Database seeded successfully!');
        console.log('\n🔗 MongoDB Compass Connection String:');
        console.log('   mongodb://localhost:27017/renthub');
        console.log('\n📝 Database Name: renthub');
        console.log('📋 Collections: users, properties, bookings');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
}

seedDatabase();
