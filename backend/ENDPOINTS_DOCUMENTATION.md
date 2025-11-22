# Car Rental System - Complete Endpoints Documentation

**Base URL:** `http://localhost:5001`  
**API Version:** v1  
**Authentication:** JWT Bearer Token  
**Database:** PostgreSQL (Render Cloud - Frankfurt)

---

## Table of Contents
1. [User Endpoints](#1-user-endpoints)
2. [Car Endpoints](#2-car-endpoints)
3. [Rental Endpoints](#3-rental-endpoints)
4. [Payment Endpoints](#4-payment-endpoints)
5. [Maintenance Endpoints](#5-maintenance-endpoints)
6. [Error Responses](#error-responses)
7. [Authentication](#authentication)

---

## 1. USER ENDPOINTS

### 1.1 Register User
Create a new user account (customer or staff)

```
POST /register
Content-Type: application/json
Authorization: None (Public)
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123",
  "role": "customer",
  "name": "John Doe",
  "phone": "03001234567",
  "driverLicense": "DL123456789",
  "secretKey": "haha"
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | ✅ | Unique identifier, must be unique in database |
| `password` | string | ✅ | Will be hashed with bcrypt |
| `role` | string | ✅ | Must be `customer` or `staff` |
| `name` | string | ✅ | User's full name |
| `phone` | string | ✅ | Exactly 11 digits (Pakistani format: 030XXXXXXXX) |
| `driverLicense` | string | ⚠️ | Required only if `role` is `customer`, max 20 characters |
| `secretKey` | string | ⚠️ | Required only if `role` is `staff`, must match `STAFF_SECRET_KEY` from .env |

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "User and profile created successfully",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid data
- `403` - Invalid staff secret key
- `409` - Duplicate username, phone, or driver license

---

### 1.2 Login User
Authenticate user and receive JWT token

```
POST /login
Content-Type: application/json
Authorization: None (Public)
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123",
  "role": "customer"
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | ✅ | Username used during registration |
| `password` | string | ✅ | Password used during registration |
| `role` | string | ✅ | Must be `customer` or `staff` |

**Response - 200 OK:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "customer"
}
```

**Error Response:**
- `400` - Invalid username or password

---

### 1.3 Get All Users
Retrieve list of all users (Staff only)

```
GET /users
Authorization: Bearer <STAFF_TOKEN>
```

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "userId": 1,
      "username": "john_doe",
      "role": "customer",
      "name": "John Doe"
    },
    {
      "userId": 2,
      "username": "mike_staff",
      "role": "staff",
      "name": "Mike Smith"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not staff role)

---

### 1.4 Get User by ID
Retrieve specific user details

```
GET /users/{userId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "User retrieved successfully",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "role": "customer",
    "name": "John Doe",
    "phone": "03001234567",
    "driverLicense": "DL123456789"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found

---

### 1.5 Update User
Update user information (username and/or password)

```
PUT /users/{userId}
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Request Body:**
```json
{
  "username": "john_doe_updated",
  "password": "newpassword123"
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | string | ❌ | New username (optional) |
| `password` | string | ❌ | New password (optional) |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "User updated successfully",
  "data": {
    "userId": 1,
    "username": "john_doe_updated",
    "role": "customer"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found

---

### 1.6 Delete User
Delete a user account

```
DELETE /users/{userId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "User deleted successfully",
  "data": {
    "userId": 1,
    "username": "john_doe",
    "role": "customer"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found

---

## 2. CAR ENDPOINTS

### 2.1 Upload Car
Add a new car to inventory (Staff only)

```
POST /uploadCar
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Request Body:**
```json
{
  "carModel": "Toyota Corolla",
  "carYear": 2022,
  "carStatus": "available",
  "carPrice": 150,
  "maintenanceId": 1,
  "carImageUrl": "https://example.com/car1.jpg"
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `carModel` | string | ✅ | Name/model of car |
| `carYear` | integer | ✅ | Year of manufacture |
| `carStatus` | string | ✅ | One of: `available`, `requested`, `rented`, `maintenance` |
| `carPrice` | number | ✅ | Daily rental price (non-negative, 2 decimal places) |
| `maintenanceId` | integer | ✅ | Associated maintenance record ID |
| `carImageUrl` | string | ✅ | URL to car image |

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Car uploaded successfully",
  "data": {
    "carId": 1,
    "carModel": "Toyota Corolla",
    "carYear": 2022,
    "carStatus": "available",
    "carPrice": 150,
    "maintenanceId": 1,
    "carImageUrl": "https://example.com/car1.jpg"
  }
}
```

**Error Responses:**
- `400` - Invalid car data
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 2.2 Get All Cars
Retrieve all cars in inventory

```
GET /cars
Authorization: None (Public)
```

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Cars retrieved successfully",
  "data": [
    {
      "carId": 1,
      "carModel": "Toyota Corolla",
      "carYear": 2022,
      "carStatus": "available",
      "carPrice": 150,
      "carImageUrl": "https://example.com/car1.jpg"
    },
    {
      "carId": 2,
      "carModel": "Honda Civic",
      "carYear": 2023,
      "carStatus": "available",
      "carPrice": 200,
      "carImageUrl": "https://example.com/car2.jpg"
    }
  ]
}
```

---

### 2.3 Get Car by ID
Retrieve specific car details

```
GET /cars/{carId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `carId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Car retrieved successfully",
  "data": {
    "carId": 1,
    "carModel": "Toyota Corolla",
    "carYear": 2022,
    "carStatus": "available",
    "carPrice": 150,
    "maintenanceId": 1,
    "carImageUrl": "https://example.com/car1.jpg"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Car not found

---

### 2.4 Search & Filter Cars
Advanced search with multiple filters, sorting, and pagination

```
GET /search?model=toyota&yearMin=2020&yearMax=2023&status=available&priceMin=100&priceMax=300&sort=price_asc&page=1&limit=20
Authorization: None (Public)
```

**Query Parameters:**
| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `model` | string | ❌ | Partial match, case-insensitive search |
| `year` | integer | ❌ | Exact year match |
| `yearMin` | integer | ❌ | Minimum year (range filter) |
| `yearMax` | integer | ❌ | Maximum year (range filter) |
| `status` | string | ❌ | Exact match: `available`, `requested`, `rented`, `maintenance` |
| `priceMin` | number | ❌ | Minimum price per day |
| `priceMax` | number | ❌ | Maximum price per day |
| `sort` | string | ❌ | Sort option: `price_asc`, `price_desc`, `year_asc`, `year_desc`, `model_asc`, `model_desc` (default: carId ASC) |
| `page` | integer | ❌ | Page number (default: 1, min: 1) |
| `limit` | integer | ❌ | Results per page (default: 20, max: 100) |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Cars retrieved successfully",
  "data": [
    {
      "carId": 1,
      "carModel": "Toyota Corolla",
      "carYear": 2022,
      "carStatus": "available",
      "carPrice": 150,
      "carImageUrl": "https://example.com/car1.jpg"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalRecords": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Example Queries:**
- `GET /search?model=toyota` - Search by model
- `GET /search?yearMin=2020&yearMax=2023` - Filter by year range
- `GET /search?status=available` - Filter by status
- `GET /search?priceMin=100&priceMax=300` - Filter by price range
- `GET /search?sort=price_asc&page=2&limit=10` - Sorted and paginated results

---

### 2.5 Update Car
Update car information (Staff only)

```
PUT /cars/{carId}
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `carId` | integer | ✅ |

**Request Body:**
```json
{
  "carModel": "Toyota Corolla Pro",
  "carYear": 2023,
  "carStatus": "available",
  "carPrice": 175,
  "maintenanceId": 1,
  "carImageUrl": "https://example.com/car1-updated.jpg"
}
```

**Body Parameters:** Same as [Upload Car](#21-upload-car)

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Car updated successfully",
  "data": {
    "carId": 1,
    "carModel": "Toyota Corolla Pro",
    "carYear": 2023,
    "carStatus": "available",
    "carPrice": 175
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)
- `404` - Car not found

---

### 2.6 Delete Car
Remove a car from inventory (Staff only)

```
DELETE /cars/{carId}
Authorization: Bearer <STAFF_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `carId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Car deleted successfully",
  "data": {
    "carId": 1,
    "carModel": "Toyota Corolla",
    "carYear": 2022,
    "carStatus": "available"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)
- `404` - Car not found

---

## 3. RENTAL ENDPOINTS

### 3.1 Create Rental
Create a new rental request

```
POST /create
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Request Body:**
```json
{
  "userId": 1,
  "carId": 1,
  "startDate": "2024-12-25",
  "endDate": "2024-12-30",
  "totalAmount": 750,
  "paymentId": 1
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `userId` | integer | ✅ | ID of customer user |
| `carId` | integer | ✅ | ID of car to rent |
| `startDate` | string (YYYY-MM-DD) | ✅ | Start date of rental |
| `endDate` | string (YYYY-MM-DD) | ✅ | End date of rental |
| `totalAmount` | number | ✅ | Total rental cost |
| `paymentId` | integer | ✅ | Payment record ID |

**Validation Rules:**
- `startDate` must be before `endDate`
- Car must be available for entire date range
- Date format must be YYYY-MM-DD
- All IDs must be positive integers

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Rental created successfully",
  "data": {
    "bookingId": 1,
    "customerId": 1,
    "carId": 1,
    "startDate": "2024-12-25",
    "endDate": "2024-12-30",
    "totalAmount": 750,
    "rentalStatus": "requested",
    "createdAt": "2024-11-22T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing fields, invalid dates, or car already booked
- `401` - Unauthorized

---

### 3.2 Get All Pending Requests
Get all rental requests awaiting approval (Staff only)

```
GET /pendingRequests
Authorization: Bearer <STAFF_TOKEN>
```

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Pending rental requests retrieved",
  "data": [
    {
      "bookingId": 1,
      "customerId": 1,
      "carId": 1,
      "startDate": "2024-12-25",
      "endDate": "2024-12-30",
      "totalAmount": 750,
      "rentalStatus": "requested"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 3.3 Get User's Pending Requests
Get rental requests for specific user

```
GET /pendingRequests/{userId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "User's pending requests retrieved",
  "data": [
    {
      "bookingId": 1,
      "customerId": 1,
      "carId": 1,
      "startDate": "2024-12-25",
      "endDate": "2024-12-30",
      "rentalStatus": "requested"
    }
  ]
}
```

---

### 3.4 Approve Rental
Approve a rental request and activate rental (Staff only)

```
POST /approveRental
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Request Body:**
```json
{
  "bookingId": 1,
  "staffId": 2
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `bookingId` | integer | ✅ | Rental booking ID to approve |
| `staffId` | integer | ✅ | Staff member ID approving the rental |

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Rental approved successfully",
  "data": {
    "bookingId": 1,
    "rentalStatus": "active",
    "staffId": 2,
    "approvedAt": "2024-11-22T10:35:00Z"
  }
}
```

**State Changes:**
- Rental status: `requested` → `active`
- Car status: `available` → `rented`

**Error Responses:**
- `400` - Invalid IDs or rental not in requested state
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 3.5 Decline Rental
Decline a rental request and reverse payment (Staff only)

```
POST /declineRental
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Request Body:**
```json
{
  "bookingId": 1
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `bookingId` | integer | ✅ | Rental booking ID to decline |

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Rental declined successfully",
  "data": {
    "bookingId": 1,
    "rentalStatus": "declined",
    "message": "Your payment has been reversed",
    "paymentReversed": true
  }
}
```

**State Changes:**
- Rental status: `requested` → `declined`
- Car status: `requested` → `available`
- Payment record: **DELETED** (reversed)

**Error Responses:**
- `400` - Invalid booking ID or rental not in requested state
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 3.6 Get Current Rentals
Get active rentals for a user

```
GET /currentRentals/{userId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Active rentals retrieved",
  "data": [
    {
      "bookingId": 1,
      "customerId": 1,
      "carId": 1,
      "startDate": "2024-12-25",
      "endDate": "2024-12-30",
      "rentalStatus": "active",
      "approvedBy": 2
    }
  ]
}
```

---

### 3.7 End Rental
Complete an active rental (Staff only)

```
POST /endRental
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Request Body:**
```json
{
  "bookingId": 1
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `bookingId` | integer | ✅ | Rental booking ID to end |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Rental ended successfully",
  "data": {
    "bookingId": 1,
    "rentalStatus": "completed",
    "endedAt": "2024-11-22T10:40:00Z"
  }
}
```

**State Changes:**
- Rental status: `active` → `completed`
- Car status: `rented` → `available`

**Error Responses:**
- `400` - Invalid booking ID or rental not in active state
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 3.8 Get Rental History
Get completed rentals for a user

```
GET /previousRentals/{userId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Rental history retrieved",
  "data": [
    {
      "bookingId": 1,
      "customerId": 1,
      "carId": 1,
      "startDate": "2024-12-25",
      "endDate": "2024-12-30",
      "totalAmount": 750,
      "rentalStatus": "completed"
    }
  ]
}
```

---

## 4. PAYMENT ENDPOINTS

### 4.1 Confirm Payment
Create a payment record

```
POST /confirmPayment
Content-Type: application/json
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Request Body:**
```json
{
  "paymentAmount": 750,
  "paymentMethod": "visa",
  "cardNumber": "4532015112830366"
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `paymentAmount` | number | ✅ | Amount to charge |
| `paymentMethod` | string | ✅ | `visa` or `mastercard` (case-insensitive) |
| `cardNumber` | string | ✅ | Valid credit card number |

**Card Validation:**
- Visa: 16 digits starting with 4
- Mastercard: 16 digits starting with 5
- Luhn algorithm validation applied

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Payment confirmed successfully",
  "data": {
    "paymentId": 1,
    "paymentAmount": 750,
    "paymentMethod": "visa",
    "cardNumber": "****0366",
    "paymentStatus": "completed",
    "createdAt": "2024-11-22T10:25:00Z"
  }
}
```

**Error Responses:**
- `400` - Missing fields or invalid card number/method
- `401` - Unauthorized

---

### 4.2 Get Payment by ID
Retrieve payment details

```
GET /getPaymentById/{paymentId}
Authorization: Bearer <TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `paymentId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Payment retrieved successfully",
  "data": {
    "paymentId": 1,
    "paymentAmount": 750,
    "paymentMethod": "visa",
    "cardNumber": "****0366",
    "paymentStatus": "completed",
    "createdAt": "2024-11-22T10:25:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Payment not found

---

## 5. MAINTENANCE ENDPOINTS

### 5.1 Get All Maintenance Records
Retrieve all maintenance records (Staff only)

```
GET /maintenance
Authorization: Bearer <STAFF_TOKEN>
```

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Maintenance records retrieved",
  "data": [
    {
      "maintenanceId": 1,
      "carId": 1,
      "maintenanceDate": "2024-12-20",
      "maintenanceType": "Oil Change",
      "maintenanceCost": 50,
      "createdAt": "2024-11-22T09:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 5.2 Get Maintenance by ID
Retrieve specific maintenance record (Staff only)

```
GET /maintenance/{maintenanceId}
Authorization: Bearer <STAFF_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `maintenanceId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Maintenance record retrieved",
  "data": {
    "maintenanceId": 1,
    "carId": 1,
    "maintenanceDate": "2024-12-20",
    "maintenanceType": "Oil Change",
    "maintenanceCost": 50,
    "createdAt": "2024-11-22T09:00:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)
- `404` - Maintenance record not found

---

### 5.3 Add Maintenance Record
Create a new maintenance record for a car (Staff only)

```
POST /maintenance
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Request Body:**
```json
{
  "carId": 1,
  "maintenanceDate": "2024-12-20",
  "maintenanceType": "Oil Change",
  "maintenanceCost": 50
}
```

**Body Parameters:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `carId` | integer | ✅ | ID of car under maintenance |
| `maintenanceDate` | string (YYYY-MM-DD) | ✅ | Date of maintenance |
| `maintenanceType` | string | ✅ | Type of maintenance work |
| `maintenanceCost` | number | ✅ | Cost of maintenance (non-negative) |

**Response - 201 Created:**
```json
{
  "status": 201,
  "message": "Maintenance created and linked to car",
  "data": {
    "maintenanceId": 1,
    "carId": 1,
    "maintenanceDate": "2024-12-20",
    "maintenanceType": "Oil Change",
    "maintenanceCost": 50
  }
}
```

**Error Responses:**
- `400` - Invalid data or car not found
- `401` - Unauthorized
- `403` - Forbidden (not staff)

---

### 5.4 Update Maintenance Record
Update maintenance information (Staff only)

```
PUT /maintenance/{maintenanceId}
Content-Type: application/json
Authorization: Bearer <STAFF_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `maintenanceId` | integer | ✅ |

**Request Body:**
```json
{
  "maintenanceDate": "2024-12-21",
  "maintenanceType": "Tire Rotation",
  "maintenanceCost": 75
}
```

**Body Parameters:** Same as [Add Maintenance Record](#53-add-maintenance-record) (carId omitted)

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Maintenance updated",
  "data": {
    "maintenanceId": 1,
    "carId": 1,
    "maintenanceDate": "2024-12-21",
    "maintenanceType": "Tire Rotation",
    "maintenanceCost": 75
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)
- `404` - Maintenance record not found

---

### 5.5 Delete Maintenance Record
Remove a maintenance record (Staff only)

```
DELETE /maintenance/{maintenanceId}
Authorization: Bearer <STAFF_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `maintenanceId` | integer | ✅ |

**Response - 200 OK:**
```json
{
  "status": 200,
  "message": "Maintenance deleted and unlinked from car",
  "data": {
    "maintenanceId": 1,
    "carId": 1
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not staff)
- `404` - Maintenance record not found

---

## Error Responses

### Standard Error Response Format
```json
{
  "status": 400,
  "message": "Error description",
  "error": "Detailed error information (if applicable)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Possible Causes |
|------|---------|-----------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid input, missing fields, validation error |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Token valid but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate entry (username, phone, etc.) |
| `500` | Server Error | Internal server error |

---

## Authentication

### JWT Token Format
- **Type:** Bearer Token
- **Algorithm:** HS256
- **Secret:** `JWT_SECRET` from .env
- **Expiration:** `JWT_EXPIRES` from .env (default: 1 day)

### Token Payload
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "customer",
  "iat": 1700641600,
  "exp": 1700728000
}
```

### Using Token in Requests
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting a Token
1. Call `/register` to create account
2. Call `/login` with credentials
3. Use returned `token` in `Authorization` header for protected routes

---

## Role-Based Access Control

### Public Endpoints (No Auth Required)
- `GET /cars` - View all cars
- `GET /search` - Search/filter cars
- `POST /register` - Create account
- `POST /login` - Login

### Customer-Only Endpoints
- `GET /users/{userId}` - View own profile
- `PUT /users/{userId}` - Update own profile
- `DELETE /users/{userId}` - Delete own account
- `POST /create` - Create rental request
- `GET /currentRentals/{userId}` - View active rentals
- `GET /previousRentals/{userId}` - View rental history
- `GET /pendingRequests/{userId}` - View own pending requests
- `POST /confirmPayment` - Make payment
- `GET /getPaymentById/{paymentId}` - View payment

### Staff-Only Endpoints
- `GET /users` - List all users
- `POST /uploadCar` - Add car
- `PUT /cars/{carId}` - Update car
- `DELETE /cars/{carId}` - Delete car
- `GET /pendingRequests` - View all pending requests
- `POST /approveRental` - Approve rental
- `POST /declineRental` - Decline rental
- `POST /endRental` - End rental
- `GET /maintenance` - View all maintenance
- `GET /maintenance/{maintenanceId}` - View maintenance details
- `POST /maintenance` - Add maintenance
- `PUT /maintenance/{maintenanceId}` - Update maintenance
- `DELETE /maintenance/{maintenanceId}` - Delete maintenance

---

## Data Models & Constraints

### User Model
```
- userId (Primary Key)
- username (Unique, String)
- password (String, hashed)
- role (Enum: 'customer', 'staff')
- name (String)
- phone (String, exactly 11 digits)
- driverLicense (String, max 20 chars, nullable)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

### Car Model
```
- carId (Primary Key)
- carModel (String)
- carYear (Integer)
- carStatus (Enum: 'available', 'requested', 'rented', 'maintenance')
- carPrice (Decimal, 10,2, >= 0)
- maintenanceId (Foreign Key)
- carImageUrl (String)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

### Rental Model
```
- bookingId (Primary Key)
- customerId (Foreign Key)
- carId (Foreign Key)
- startDate (Date)
- endDate (Date)
- totalAmount (Decimal)
- rentalStatus (Enum: 'requested', 'active', 'completed', 'declined')
- staffId (Foreign Key, nullable)
- paymentId (Foreign Key)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

### Payment Model
```
- paymentId (Primary Key)
- paymentAmount (Decimal)
- paymentMethod (String: 'visa', 'mastercard')
- cardNumber (String, last 4 digits shown only)
- paymentStatus (String, default: 'completed')
- createdAt (Timestamp)
```

### Maintenance Model
```
- maintenanceId (Primary Key)
- carId (Foreign Key)
- maintenanceDate (Date)
- maintenanceType (String)
- maintenanceCost (Decimal)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

---

## Testing Environment

**Server URL:** `http://localhost:5001`  
**Database:** PostgreSQL on Render Cloud (Frankfurt region)  
**Testing Collection:** See `API_TEST_COLLECTION.md` for comprehensive test scenarios
