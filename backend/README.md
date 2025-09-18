# ChanceFly Backend

This is the backend API for the ChanceFly private jet marketplace platform.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Flight Management**: CRUD operations for empty-leg flights with advanced search and filtering
- **Booking System**: Complete booking workflow with passenger management
- **Payment Processing**: Stripe integration for secure payments
- **Database**: PostgreSQL with comprehensive schema for aviation marketplace
- **Security**: Rate limiting, input validation, error handling, and secure headers

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Payments**: Stripe
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting

## Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database:**
```bash
# Create database
createdb chancefly_db

# Run migrations
npm run db:migrate
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No (default: 3001) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | No (default: 5432) |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASS` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh expiration | No (default: 30d) |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Flights
- `GET /api/flights` - Search flights with filters
- `GET /api/flights/:id` - Get flight details
- `POST /api/flights` - Create flight (operators only)
- `PUT /api/flights/:id` - Update flight (operators only)
- `DELETE /api/flights/:id` - Cancel/delete flight (operators only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

## Database Schema

### Users
- Authentication and profile information
- Role-based access (customer, operator, admin)
- Email verification and password reset

### Operators
- Aviation operator profiles
- Company information and credentials
- Approval workflow and ratings

### Aircraft
- Aircraft specifications and details
- Operator ownership and management
- Images and amenities

### Flights
- Empty-leg flight listings
- Route and schedule information
- Pricing and availability
- Service offerings and policies

### Bookings
- Passenger booking records
- Payment and status tracking
- Special requests and preferences

### Passengers
- Individual passenger details
- Travel documents and preferences
- Dietary and accessibility needs

## Security Features

- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive validation with express-validator
- **SQL Injection Protection**: Parameterized queries
- **JWT Security**: Secure token generation and validation
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: helmet.js security headers

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm test` - Run tests (when implemented)

### Project Structure
```
backend/
├── config/          # Database and configuration
├── middleware/      # Custom middleware (auth, errors)
├── routes/          # API route handlers
├── scripts/         # Database migrations and utilities
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
└── .env.example     # Environment variables template
```

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure Stripe production keys
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License.