# StaySync

### PG & Roommate Discovery Platform

StaySync is a full-stack web application designed to help users discover PGs, hostels, flats, and rooms while providing property owners with a platform to manage their listings.

The project focuses on secure authentication, property discovery, search and filtering, property management, image handling, and scalable REST APIs.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Short-lived access tokens
- Refresh-token based session management
- Secure HttpOnly refresh-token cookies
- Role-based access control
- Roles:
  - Seeker
  - Owner
  - Admin
- Protected API routes
- Password hashing using bcrypt

### Property Management

Owners can:

- Add properties
- View their properties
- Update properties
- Delete properties
- Manage property availability
- Add property details such as:
  - Property type
  - Gender preference
  - Room type
  - Rent
  - Deposit
  - Amenities
  - Rules
  - Location
  - Available rooms
### Property Discovery

Users can:

- Browse available properties
- Search properties
- Filter by city
- Filter by area
- Filter by property type
- Filter by gender preference
- Filter by room type
- Filter by rent range
- Filter for properties with available rooms
- View property details
- Navigate through paginated results

### Property Images

- Property image upload
- Multiple property images
- Cloudinary integration
- Image preview during property creation
- Property images displayed on listing and detail pages
- Image fallback when a property does not have an image

### Security

- Helmet security headers
- CORS configuration
- API rate limiting
- Authentication middleware
- Role-based authorization middleware
- Ownership checks for property updates and deletion
- Environment variables for sensitive configuration
- Refresh-token hashing in MongoDB
- Request body size limits

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Helmet
- CORS
- Express Rate Limit
- Cookie Parser

### Cloud & Storage

- MongoDB Atlas
- Cloudinary
---

## Project Architecture

```text
StaySync
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
---

## Authentication Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
Backend Authentication
 │
 ├── Password → bcrypt
 │
 ├── Access Token → JWT
 │
 └── Refresh Token → HttpOnly Cookie
 │
 ▼
Protected API
 │
 ▼
Role & Ownership Validation
 │
 ▼
Database Operation
---

## Property Flow

```text
Owner
 │
 ▼
Add Property
 │
 ├── Property Details
 ├── Location
 ├── Pricing
 ├── Room Information
 └── Images
       │
       ▼
   Cloudinary
       │
       ▼
    MongoDB
       │
       ▼
Property Discovery
       │
       ▼
     Seeker
     ---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/ShivaniiYadav28/StaySync.git
cd StaySync
### 2. Backend Setup

```bash
cd backend
npm install
---

## API Overview

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
---

## Security Architecture

StaySync follows several security practices:

- JWT access-token authentication
- Refresh-token rotation
- HttpOnly cookies
- Refresh-token hashing
- bcrypt password hashing
- Role-based authorization
- Property ownership validation
- API rate limiting
- Helmet security middleware
- CORS restrictions
- Environment-based secrets
- MongoDB validation through Mongoose
---

## Screenshots

Screenshots of the StaySync application will be added here.

### Home Page

_Add screenshot here_

### Property Discovery

_Add screenshot here_

### Property Details

_Add screenshot here_

### Owner Dashboard

_Add screenshot here_
---

## Current Development Status

StaySync currently includes:

- Authentication system
- Role-based access control
- Owner property management
- Property discovery
- Search and filtering
- Pagination
- Property details
- Cloudinary image management
- Secure REST APIs
- Responsive frontend interfaces

