# Tech Stack Documentation - Diwali Donation Project

## Project Overview
A full-stack donation platform for "Light For All" charity campaign, enabling users to make donations via Razorpay payment gateway with real-time donation tracking.

---

## Frontend Stack

### Core Framework & Language
- **React** `v19.2.0` - Modern UI library for building component-based interfaces
- **TypeScript** `v4.9.5` - Type-safe JavaScript for better development experience
- **React DOM** `v19.2.0` - React rendering for web applications

### Build Tools & Development
- **Create React App** `v5.0.1` - Zero-config React application setup
- **react-scripts** `v5.0.1` - Build scripts and configuration
- **Node.js** - JavaScript runtime environment
- **npm** - Package manager

### Styling & UI
- **TailwindCSS** `v3.4.18` - Utility-first CSS framework for rapid UI development
- **PostCSS** `v8.5.6` - CSS transformation tool
- **Autoprefixer** `v10.4.21` - Automatic vendor prefix addition
- **Custom CSS** - Additional styling in `App.css`

### Icons & Assets
- **Lucide React** `v0.545.0` - Modern icon library
  - Used icons: Heart, Trophy, TrendingUp, Users, CheckCircle, XCircle, Loader, RefreshCw

### Payment Integration
- **Razorpay** `v2.9.6` - Payment gateway SDK
- **Razorpay Checkout.js** - Client-side payment interface (loaded via CDN)

### Data Processing
- **PapaParse** `v5.5.3` - CSV parsing library for data handling

### Testing
- **Jest** `v27.5.2` - JavaScript testing framework
- **React Testing Library** `v16.3.0` - React component testing utilities
- **@testing-library/dom** `v10.4.1` - DOM testing utilities
- **@testing-library/jest-dom** `v6.9.1` - Custom Jest matchers
- **@testing-library/user-event** `v13.5.0` - User interaction simulation

### Performance Monitoring
- **web-vitals** `v2.1.4` - Core Web Vitals tracking

### TypeScript Type Definitions
- `@types/jest` `v27.5.2`
- `@types/node` `v16.18.126`
- `@types/papaparse` `v5.3.16`
- `@types/react` `v19.2.2`
- `@types/react-dom` `v19.2.1`

### Frontend Server
- **Development Server**: Webpack Dev Server (via react-scripts)
  - Default Port: `3000`
  - Hot Module Replacement enabled
  - Command: `npm start`
- **Production Build**: Static files served via CDN/hosting platform
  - Command: `npm run build`

---

## Backend Stack

### Runtime & Framework
- **Node.js** - JavaScript runtime for server-side execution
- **Express.js** `v5.1.0` - Fast, minimalist web framework for Node.js

### Database
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **MongoDB Driver** `v6.20.0` - Official MongoDB Node.js driver
  - Database: `diwaliDonation`
  - Collection: `donations`
  - Features: Indexed queries, automatic connection pooling

### Middleware & Utilities
- **CORS** `v2.8.5` - Cross-Origin Resource Sharing middleware
- **dotenv** `v17.2.3` - Environment variable management
- **express.json()** - Built-in JSON body parser

### Development Tools
- **nodemon** `v3.1.10` - Auto-restart server on file changes

### Backend Server Configuration
- **Port**: `3001` (default) or `process.env.PORT`
- **Host**: `0.0.0.0` (binds to all network interfaces)
- **Deployment**: Render.com
  - Production URL: `https://backend-server-r89y.onrender.com`
  - Command: `npm start`

---

## API Architecture

### REST API Endpoints

#### 1. Get All Donations
```
GET /api/donations
Response: { success: boolean, donations: Array }
```

#### 2. Create Donation
```
POST /api/donations
Body: { name, amount, date, location, paymentId, email }
Response: { success: boolean, message: string, id: ObjectId }
```

#### 3. Health Check
```
GET /api/health
Response: { status: string, message: string }
```

---

## Database Schema

### Donations Collection
```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  name: String,            // Donor name (required)
  amount: Number,          // Donation amount in INR (required)
  date: String,            // Donation date (required)
  location: String,        // Donor location
  paymentId: String,       // Razorpay payment ID
  email: String,           // Donor email
  createdAt: Date          // Timestamp
}
```

**Indexes:**
- `date: -1` - Descending index for efficient date-based sorting

---

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/diwaliDonation
PORT=3001
```

---

## Development Workflow

### Frontend Development
```bash
cd diwali-donation\ 1
npm install
npm start          # Starts dev server on localhost:3000
npm test           # Runs test suite
npm run build      # Creates production build
```

### Backend Development
```bash
cd backend
npm install
npm run dev        # Starts server with nodemon on localhost:3001
npm start          # Production server
```

---

## Deployment Architecture

### Frontend Hosting
- **Platform**: Static hosting (Vercel/Netlify/GitHub Pages)
- **Build Output**: `/build` directory
- **Environment**: Production environment variables injected at build time

### Backend Hosting
- **Platform**: Render.com (or similar cloud platform)
- **Type**: Web Service
- **Region**: Auto-selected
- **Environment**: Node.js
- **Auto-deploy**: Enabled from Git repository

### Database Hosting
- **Platform**: MongoDB Atlas
- **Tier**: Free/Shared cluster
- **Region**: Configurable
- **Connection**: TLS/SSL encrypted

---

## Payment Flow

1. **User Input**: Donor fills form (name, email, amount)
2. **Frontend Validation**: React validates input fields
3. **Razorpay Integration**: Opens Razorpay checkout modal
4. **Payment Processing**: Razorpay handles secure payment
5. **Success Callback**: Frontend receives payment confirmation
6. **API Call**: POST request to backend with donation data
7. **Database Storage**: MongoDB stores donation record
8. **UI Update**: Frontend refreshes donation list

---

## Security Features

- **CORS**: Configured to allow cross-origin requests
- **Environment Variables**: Sensitive data stored in .env files
- **HTTPS**: All production traffic encrypted
- **Payment Security**: Razorpay PCI-DSS compliant
- **Input Validation**: Server-side validation for all API requests
- **MongoDB Atlas**: Built-in security features and encryption

---

## Browser Compatibility

### Production
- \>0.2% market share
- Not dead browsers
- Not Opera Mini

### Development
- Latest Chrome
- Latest Firefox
- Latest Safari

---

## Key Features Implemented

1. **Real-time Donation Tracking**: Live updates of donation list
2. **Payment Gateway Integration**: Seamless Razorpay checkout
3. **Responsive Design**: Mobile-first TailwindCSS styling
4. **Top Donors Leaderboard**: Sorted by donation amount
5. **Payment Verification**: Visual indicators for verified donations
6. **Error Handling**: Comprehensive error states and user feedback
7. **Loading States**: Visual feedback during async operations
8. **Graceful Degradation**: Fallback handling for API failures

---

## Performance Optimizations

- **Code Splitting**: React lazy loading (via CRA)
- **Tree Shaking**: Unused code elimination
- **Minification**: Production build optimization
- **CDN Delivery**: Static assets served via CDN
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections

---

## Future Enhancement Possibilities

- Add user authentication
- Implement donation receipts via email
- Add analytics dashboard
- Support multiple payment methods
- Add donation campaigns
- Implement webhook for payment verification
- Add admin panel for donation management
- Support recurring donations
- Multi-language support
- Export donation reports

---

**Last Updated**: October 2025  
**Project Status**: Production Ready
