# ChanceFly - Private Jet Charter Marketplace

A comprehensive platform for booking shared private jet charters, featuring role-based access for customers and operators.

## 🚀 Features

### For Customers
- **Browse Available Flights** - Search and filter private jet charters
- **Shared Charter Booking** - Split costs with other passengers
- **Interactive Flight Details** - View aircraft images, route maps, and pricing
- **Real-time Pricing** - Dynamic pricing based on passenger count
- **Savings Calculator** - See how much you save compared to full charter

### For Operators
- **Flight Management Dashboard** - Create, edit, and manage flight listings
- **Enhanced Status Tracking** - Large, clear status indicators for flights
- **Image Upload System** - Add multiple aircraft photos with drag-drop interface
- **Passenger Analytics** - Track bookings and availability
- **Professional Interface** - Dedicated operator dashboard with comprehensive tools

## 🛠 Technology Stack

### Frontend
- **React** - Modern UI framework
- **Vite** - Fast development build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons
- **OpenStreetMap & Leaflet** - Free interactive maps

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - Secure authentication
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
ChanceFly/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── data/           # Mock data and constants
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend API
│   ├── server.js           # Express server setup
│   ├── initDatabase.js     # Database initialization
│   └── package.json        # Backend dependencies
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexxvives/ChanceFly.git
   cd ChanceFly
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Initialize the database**
   ```bash
   node initDatabase.js
   ```

4. **Start the backend server**
   ```bash
   node server.js
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 🔐 Authentication System

### Role-Based Access
- **Customer Role** - Browse and book flights
- **Operator Role** - Manage flight listings and view analytics

### Test Accounts
- **Customer**: Username: `customer` / Password: `password`
- **Operator**: Username: `operator` / Password: `password`

## 📱 Key Pages

### Customer Experience
- **Home** (`/`) - Flight search and listings
- **Flight Details** (`/flight/:id`) - Comprehensive flight information with image gallery
- **Booking Flow** - Passenger selection and pricing calculator

### Operator Experience
- **Operator Dashboard** (`/operator-dashboard`) - Flight management interface
- **Create Flight** (`/create-flight`) - Dedicated flight creation with image upload
- **Flight Analytics** - Booking statistics and performance metrics

## 🎨 Design Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX** - Clean, professional interface with smooth animations
- **Interactive Maps** - Visual flight route display using OpenStreetMap
- **Image Galleries** - Showcase aircraft with professional photo displays
- **Dynamic Pricing** - Real-time cost calculations based on passenger count

## 🛫 Flight Features

- **Charter Cost Sharing** - Split full charter cost among passengers
- **Real-time Availability** - Live seat availability tracking
- **Comprehensive Flight Info** - Aircraft details, duration, pricing, and operator info
- **Interactive Route Maps** - Visual representation of flight paths
- **Multi-image Galleries** - Professional aircraft photo displays

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/:id` - Get flight details
- `POST /api/flights` - Create new flight (operators only)
- `PUT /api/flights/:id` - Update flight (operators only)
- `DELETE /api/flights/:id` - Delete flight (operators only)

## 🚀 Deployment

The application is ready for deployment on platforms like:
- **Vercel** (Frontend)
- **Railway** or **Heroku** (Backend)
- **Netlify** (Frontend alternative)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email alexvives@example.com or create an issue on GitHub.

---

Built with ❤️ for the private aviation industry
