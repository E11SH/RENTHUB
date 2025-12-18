# RENT HUB - Property Rental Platform

RENT HUB is a modern, full-stack property rental platform designed to connect property seekers with trusted property owners. Whether you are looking for a studio near your university or a family villa, RENT HUB makes the process seamless, secure, and efficient.

## 🚀 Features

### For Property Seekers
- **Search & Browse:** Easily find properties based on location, price, and type.
- **Detailed Listings:** View high-quality images, amenities, price, and detailed descriptions.
- **Secure Booking:** Book properties instantly with secure card payment or schedule cash payments.
- **Review:** Access verified listings to ensure safety and quality.

### For Property Owners
- **Easy Listing:** Post new properties with detailed information and images.
- **Management:** Update or remove listings as needed.
- **Direct Reach:** Connect directly with potential tenants.

### Technical Highlights
- **Authentication:** Secure user registration and login using JWT and bcrypt.
- **Responsive Design:** Mobile-friendly interface with modern glassmorphism aesthetics.
- **RESTful API:** Robust backend architecture powered by Node.js and Express.
- **Database:** MongoDB for flexible and scalable data storage.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/renthub.git
    cd renthub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up MongoDB:**
    - Ensure you have MongoDB installed and running locally on port `27017`.
    - Alternatively, configure a cloud MongoDB URI in the code.

4.  **Configuration (Optional):**
    - The application comes with default configuration for local development (`mongodb://localhost:27017/renthub`).
    - You can modify the `MONGODB_URI` and `JWT_SECRET` in `server.js` or set up a `.env` file if you prefer environment variables.

5.  **Seed the Database (Optional):**
    - Populate the database with initial sample data.
    ```bash
    npm run seed
    ```

6.  **Start the Server:**
    - For development (with auto-reload):
    ```bash
    npm run dev
    ```
    - Standard start:
    ```bash
    node server.js
    ```

7.  **Access the Application:**
    - Open your browser and go to `http://localhost:5000` (or the port specified in your console).

## 📂 Project Structure

```
renthub/
├── public/              # Static frontend assets
│   ├── images/          # Property and UI images
│   ├── index.html       # Main HTML entry point
│   ├── script.js        # Frontend logic and API integration
│   └── style.css        # Global styles
├── server.js            # Main backend server entry point
├── seed.js              # Database seeding script
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
