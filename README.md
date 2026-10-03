# NexusVault

**NexusVault** is a secure cloud storage web application designed for uploading, storing, managing, sharing, and downloading files through an authenticated and encrypted storage system.

The project combines a **Node.js/Express backend**, **MongoDB database**, and **React frontend** to provide a complete cloud-storage workflow. Files uploaded to the system are encrypted before being stored, while controlled sharing allows users to create temporary download links with expiration dates, download limits, and permission settings.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [How NexusVault Works](#how-nexusvault-works)
* [System Workflow](#system-workflow)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Technology Stack](#technology-stack)
* [Authentication](#authentication)
* [File Storage](#file-storage)
* [File Encryption](#file-encryption)
* [File Management](#file-management)
* [File Sharing](#file-sharing)
* [Access Control](#access-control)
* [Statistics and Dashboard](#statistics-and-dashboard)
* [Statistics API Structure](#statistics-api-structure)
* [Recent Activity](#recent-activity)
* [Time Series](#time-series)
* [Frontend Architecture](#frontend-architecture)
* [Backend Architecture](#backend-architecture)
* [API Overview](#api-overview)
* [Security](#security)
* [Environment Variables](#environment-variables)
* [Installation](#installation)
* [Running the Project](#running-the-project)
* [Typical User Workflow](#typical-user-workflow)
* [Future Improvements](#future-improvements)
* [License](#license)

---

# Overview

NexusVault provides a simplified cloud-storage environment where users can:

* Create an account and authenticate securely
* Upload files
* Store files in encrypted form
* View and manage their files
* Download and decrypt their files
* Delete files
* Generate secure share links
* Configure share permissions
* Set expiration dates for shared files
* Limit the number of downloads
* Revoke shared links
* Monitor storage usage
* View file-type statistics
* Monitor download activity
* View recent account activity
* Analyze storage and download trends over time

The application separates responsibilities between the **frontend**, **backend**, **database**, and **file storage layer**.

---

# Features

## User Authentication

* User registration
* User login
* JWT-based authentication
* Protected API endpoints
* Authentication middleware
* User-specific file access

## File Management

* Upload files
* List uploaded files
* Download files
* Delete files
* File metadata management
* File ownership verification

## Secure Storage

* AES-256-GCM file encryption
* Encrypted files stored on the server
* Encryption keys managed through environment variables
* Authentication tags used to verify encrypted data integrity

## File Sharing

* Generate secure share links
* Expiration dates
* Download limits
* Download permission
* Preview permission
* Share revocation
* Download counting
* Protected share access

## Dashboard and Statistics

* Total files
* Storage usage
* Storage capacity
* File-type distribution
* Share statistics
* Download statistics
* Recent activity
* Time-based statistics

---

# How NexusVault Works

At a high level, NexusVault follows this architecture:

```text
┌─────────────────────┐
│    React Frontend   │
│                     │
│ Dashboard           │
│ Authentication      │
│ File Management     │
│ Sharing             │
│ Statistics          │
└──────────┬──────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│   Express Backend   │
│                     │
│ Routes              │
│ Middleware          │
│ Controllers        │
│ Services            │
└───────┬───────┬─────┘
        │       │
        │       │
        ▼       ▼
┌────────────┐ ┌─────────────────┐
│ MongoDB    │ │ File Storage    │
│            │ │                 │
│ Users      │ │ Encrypted Files │
│ Files      │ │                 │
│ Shares     │ │                 │
└────────────┘ └─────────────────┘
```

The frontend communicates with the Express API. The backend authenticates requests, validates permissions, communicates with MongoDB, and performs file-storage and encryption operations.

---

# System Workflow

## 1. User Registration

```text
User
 │
 ▼
Registration Form
 │
 ▼
POST /api/auth/register
 │
 ▼
Validate Input
 │
 ▼
Create User
 │
 ▼
Store User in MongoDB
 │
 ▼
Registration Successful
```

---

## 2. User Login

```text
User
 │
 ▼
Login Form
 │
 ▼
POST /api/auth/login
 │
 ▼
Validate Credentials
 │
 ▼
Generate JWT
 │
 ▼
Return Authentication Token
 │
 ▼
Frontend stores token
```

The JWT is subsequently included with protected API requests.

---

# File Upload Workflow

When a user uploads a file, the request follows this flow:

```text
React Frontend
      │
      │ multipart/form-data
      ▼
Upload Route
      │
      ▼
Authentication Middleware
      │
      ▼
Upload Middleware
      │
      ▼
File Controller
      │
      ▼
File Service
      │
      ▼
Encryption Service
      │
      ▼
AES-256-GCM Encryption
      │
      ▼
Encrypted File Storage
      │
      ▼
File Metadata → MongoDB
      │
      ▼
Response
      │
      ▼
React Frontend
```

The database stores information **about** the file, while the actual file content is stored in the server's storage directory.

---

# File Download Workflow

Downloading a file reverses the encryption process:

```text
User
 │
 ▼
Download Request
 │
 ▼
Authentication
 │
 ▼
Find File Metadata
 │
 ▼
Verify File Ownership
 │
 ▼
Read Encrypted File
 │
 ▼
Decrypt Using AES-256-GCM
 │
 ▼
Return Original File
 │
 ▼
User Downloads File
```

The encrypted file remains encrypted while stored on disk.

---

# Architecture

NexusVault uses a layered backend architecture.

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├──────────────► MongoDB
  │
  └──────────────► File Storage
```

Each layer has a specific responsibility.

### Routes

Define API endpoints and connect them to controllers.

### Middleware

Handles cross-cutting concerns such as:

* Authentication
* File uploads
* Error handling

### Controllers

Handle HTTP requests and responses.

### Services

Contain the main application logic.

### Models

Define MongoDB data structures using Mongoose.

### Storage

Contains encrypted file data.

---

# Project Structure

```text
cloud-storage/
│
├── src/
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── swagger.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── file.controller.js
│   │   ├── health.controller.js
│   │   ├── share.controller.js
│   │   └── stats.controller.js
│   │
│   ├── docs/
│   │   ├── auth.swagger.js
│   │   ├── file.swagger.js
│   │   └── health.swagger.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── models/
│   │   ├── activity.model.js
│   │   ├── file.model.js
│   │   ├── share.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── file.routes.js
│   │   ├── health.routes.js
│   │   ├── share.routes.js
│   │   └── stats.routes.js
│   │
│   ├── services/
│   │   ├── activity.service.js
│   │   ├── auth.service.js
│   │   ├── encryption.service.js
│   │   ├── share.service.js
│   │   └── stats.service.js
│   │
│   ├── utils/
│   │   ├── crypto.js
│   │   └── validators.js
│   │
│   ├── app.js
│   └── server.js
│
├── storage/
│   └── encrypted files
│
├── tmp/
│
├── .env
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

---

# Technology Stack

## Backend

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **Mongoose** — MongoDB ODM
* **JWT** — Authentication
* **Multer** — Multipart file uploads

## Frontend

* **React** — User interface
* **JavaScript / JSX** — Frontend development
* **CSS** — Interface styling

## Database

* **MongoDB** — Persistent application data

## Security

* **AES-256-GCM** — File encryption
* **JWT** — User authentication
* **Cryptographic hashing** — Secure share-token storage

---

# Authentication

NexusVault uses JWT-based authentication.

After successful login, the backend generates a JSON Web Token.

Protected requests include the token so the backend can identify the authenticated user.

```text
Login
  │
  ▼
Credentials validated
  │
  ▼
JWT generated
  │
  ▼
Frontend receives token
  │
  ▼
Token included in protected requests
  │
  ▼
verifyToken middleware
  │
  ▼
Request authorized
```

The authentication middleware protects operations such as:

* File listing
* Uploading
* Downloading
* Deleting
* Sharing
* Statistics

---

# File Storage

NexusVault separates **file content** from **file metadata**.

MongoDB stores metadata such as:

```text
File
├── originalName
├── storedPath
├── mimeType
├── size
├── encrypted
├── owner
├── createdAt
└── updatedAt
```

The actual file content is stored in the server's storage directory.

For example:

```text
storage/
├── encrypted-file-1
├── encrypted-file-2
├── encrypted-file-3
└── ...
```

The stored files are encrypted and are not intended to be directly usable without the application's decryption process.

---

# File Encryption

NexusVault uses:

```text
AES-256-GCM
```

AES-256-GCM provides both:

* Confidentiality
* Integrity verification

The encryption configuration uses:

```text
Algorithm: AES-256-GCM
Key:       32 bytes / 256 bits
IV:        12 bytes
Auth Tag:  16 bytes
```

The encryption key is supplied through an environment variable rather than being hard-coded into the application.

```text
Original File
     │
     ▼
Encryption Service
     │
     ├── Encryption Key
     ├── Random IV
     └── AES-256-GCM
     │
     ▼
Encrypted File
     │
     ▼
Storage
```

During download:

```text
Encrypted File
     │
     ▼
Read from Storage
     │
     ▼
AES-256-GCM Decryption
     │
     ▼
Authentication Tag Verification
     │
     ▼
Original File
```

If authentication verification fails, the encrypted data is not accepted as valid.

---

# File Management

Authenticated users can manage files belonging to their own account.

Supported operations include:

```text
Upload
   │
   ├── Store encrypted file
   └── Save metadata

List
   │
   └── Return user's files

Download
   │
   └── Decrypt and return file

Delete
   │
   ├── Delete physical file
   └── Remove metadata
```

Ownership checks prevent one user from directly accessing another user's private files.

---

# File Sharing

NexusVault supports controlled file sharing through share links.

A user can create a share for a file and configure:

* Expiration time
* Maximum number of downloads
* Download permission
* Preview permission

The share model contains information such as:

```text
Share
├── file
├── tokenHash
├── expiresAt
├── maxDownloads
├── downloadCount
├── revoked
└── timestamps
```

---

# Secure Share Tokens

The raw share token is not stored directly in the database.

Instead:

```text
Generated Token
      │
      ▼
Hash Token
      │
      ▼
Store Hash in MongoDB
```

When a shared link is accessed:

```text
Provided Token
      │
      ▼
Hash Token
      │
      ▼
Compare With Stored Hash
      │
      ▼
Token Valid?
   ┌──┴──┐
   │     │
  Yes    No
   │     │
   ▼     ▼
Access  Reject
```

This prevents the database from containing usable raw share tokens.

---

# Share Validation

Before allowing access through a share link, the system verifies the share conditions.

```text
Share Request
      │
      ▼
Token Validation
      │
      ▼
Share Exists?
      │
      ▼
Revoked?
      │
      ▼
Expired?
      │
      ▼
Download Limit Reached?
      │
      ▼
Permission Allowed?
      │
      ▼
Access File
```

This makes the share link controllable by multiple independent conditions.

---

# Download Limits

A share can have a maximum number of downloads.

For example:

```text
Maximum Downloads: 5

Download 1 → Allowed
Download 2 → Allowed
Download 3 → Allowed
Download 4 → Allowed
Download 5 → Allowed
Download 6 → Rejected
```

The download count is updated when a valid shared download is performed.

The system also checks the expiration and revocation state of the share.

---

# Access Control

Access control is applied at multiple levels.

## Private Files

Users can only manage files they own.

```text
Authenticated User
        │
        ▼
Find File
        │
        ▼
Check Owner
        │
   ┌────┴────┐
   │         │
 Owner    Different User
   │         │
   ▼         ▼
Allow      Reject
```

## Shared Files

Shared files use their own access rules:

```text
Share Token
     │
     ├── Valid?
     ├── Not revoked?
     ├── Not expired?
     ├── Download limit available?
     └── Permission allowed?
```

---

# Statistics and Dashboard

The dashboard provides an overview of the user's storage system.

The statistics system is exposed through:

```http
GET /api/stats
```

The response is organized into several sections.

```text
GET /api/stats
│
├── Overview
│
├── Storage
│
├── File Types
│
├── Shares
│
├── Downloads
│
├── Recent Activity
│
└── Time Series
```

---

# Statistics API Structure

## Overview

Provides high-level information about the user's storage account.

Examples include:

```text
Total Files
Storage Used
Storage Capacity
Total Shares
```

This information is used by dashboard summary cards.

---

## Storage

Provides information about storage consumption.

Example concepts:

```text
Storage Used
Storage Limit
Remaining Storage
Usage Percentage
```

This allows the frontend to display storage usage visually.

---

## File Types

The backend analyzes uploaded files based on their MIME types.

Example:

```text
Images
Documents
Videos
Audio
Archives
Other
```

The frontend can use this information to create file-type charts or summaries.

---

## Shares

Share statistics describe the user's sharing activity.

Examples include:

```text
Total Shares
Active Shares
Expired Shares
Revoked Shares
```

---

## Downloads

Download statistics track file access through the application.

This allows the dashboard to display information such as:

```text
Total Downloads
Recent Downloads
Download activity
```

---

# Recent Activity

NexusVault provides a recent activity section for monitoring important file operations.

Typical activities include:

```text
File uploaded
File downloaded
File deleted
Share created
Share revoked
Shared file downloaded
```

A simplified activity flow is:

```text
User Action
    │
    ▼
Backend Operation
    │
    ▼
Activity Generated
    │
    ▼
Statistics Service
    │
    ▼
Recent Activity
    │
    ▼
Dashboard
```

This gives the user a quick overview of what has recently happened in their storage account.

---

# Time Series

The statistics system also provides time-based information.

This allows the dashboard to analyze changes over time rather than displaying only current values.

Examples include:

```text
Storage usage over time
Downloads over time
File uploads over time
```

Conceptually:

```text
Time
 │
 ├── Day 1
 ├── Day 2
 ├── Day 3
 ├── Day 4
 └── ...
        │
        ▼
   Statistics
```

The frontend can use these values to display charts and identify usage trends.

---

# Frontend Architecture

The React frontend is responsible for presenting the storage system through a dashboard-oriented interface.

The main UI areas include:

```text
Dashboard
│
├── Overview Cards
│
├── Storage Usage
│
├── File Statistics
│
├── Recent Files
│
├── Recent Shares
│
├── Recent Activity
│
└── Charts / Statistics
```

The interface follows a lightweight dashboard design with:

* Card-based components
* File and share summaries
* Storage indicators
* Status badges
* Action buttons
* Empty states
* Recent activity information

---

# Backend Architecture

The backend follows a layered structure.

```text
                    ┌─────────────┐
                    │   Routes    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Middleware  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Controllers │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Services   │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
          ┌──────────┐         ┌─────────────┐
          │ MongoDB  │         │ File System │
          └──────────┘         └─────────────┘
```

## Configuration

```text
config/
├── database.js
└── env.js
```

Responsible for database connection and environment configuration.

## Controllers

```text
controllers/
├── auth.controller.js
├── file.controller.js
├── share.controller.js
└── stats.controller.js
```

Controllers handle incoming HTTP requests and return HTTP responses.

## Middleware

```text
middleware/
├── auth.middleware.js
├── upload.middleware.js
└── error.middleware.js
```

Middleware provides authentication, upload processing, and centralized error handling.

## Models

```text
models/
├── User.js
├── File.js
└── Share.js
```

These models represent the main database entities.

## Services

```text
services/
├── auth.service.js
├── file.service.js
├── encryption.service.js
├── storage.service.js
├── share.service.js
└── stats.service.js
```

Services contain the application's business logic and keep controllers focused on HTTP-level operations.

---

# API Overview

The API is divided into several functional groups.

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

Used for account creation and authentication.

---

## Files

File endpoints handle:

```text
Upload
List
Download
Delete
```

These endpoints are protected by authentication and ownership checks.

---

## Shares

The sharing API handles:

```text
Create Share
Access Share
Manage Share
Revoke Share
```

A share can contain:

```text
Expiration
Download Limit
Download Permission
Preview Permission
```

---

## Statistics

```http
GET /api/stats
```

Returns the dashboard statistics structure:

```text
Overview
Storage
File Types
Shares
Downloads
Recent Activity
Time Series
```

---

# Security

Security is one of the primary design goals of NexusVault.

The project implements several security mechanisms.

## Authentication

JWT authentication protects private API endpoints.

## Authorization

Users must own a file before performing private file-management operations.

## Encryption

Files are encrypted using AES-256-GCM before being stored.

## Environment-Based Secrets

Sensitive configuration such as:

```text
Database credentials
JWT secret
Encryption key
```

is supplied through environment variables.

## Share Token Protection

Only hashed share tokens are stored in the database.

## Share Expiration

Shares can automatically become invalid after their expiration time.

## Download Limits

Shares can restrict the number of permitted downloads.

## Revocation

A share can be manually revoked before its expiration date.

---

# Environment Variables

The project requires environment variables for configuration.

Example:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/nexusvault

JWT_SECRET=your_jwt_secret

FILE_ENCRYPTION_KEY=your_64_character_hex_key
```

> Never commit the real `.env` file or production secrets to source control.

The encryption key must represent a 256-bit key suitable for AES-256-GCM.

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/KiaHadizade/nexusvault.git
cd src
```

## 2. Install Dependencies

Install backend dependencies:

```bash
npm install
```

If the frontend is maintained as a separate React application, install its dependencies from the frontend directory as well:

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nexusvault
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
FILE_ENCRYPTION_KEY=your_64_character_hex_key
```
> **TIP** - To create your secrets<br>
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`

## 4. Start MongoDB

Make sure MongoDB is running and accessible through the configured connection string.

## 5. Start the Backend

```bash
npm start
```

For development:

```bash
npm run dev
```

## 6. Start the Frontend

From the React frontend directory:

```bash
npm run dev
```

The exact command may depend on the frontend build configuration.

---

# Typical User Workflow

A complete user session can be represented as:

```text
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Register  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Login    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Upload         Manage        Share
             │             │             │
             ▼             ▼             ▼
         Encrypt        Download      Create Link
             │             │             │
             ▼             ▼             ▼
          Storage        Decrypt      Permissions
             │                           │
             └─────────────┬─────────────┘
                           ▼
                     Statistics
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
         Overview       Activity      Time Series
```

---

# Complete File Upload Example

A typical upload looks like this:

```text
1. User selects a file
        │
        ▼
2. React sends multipart/form-data
        │
        ▼
3. Express receives request
        │
        ▼
4. JWT is validated
        │
        ▼
5. Multer processes upload
        │
        ▼
6. File service processes file
        │
        ▼
7. Encryption service encrypts file
        │
        ▼
8. Encrypted file is stored
        │
        ▼
9. File metadata is stored in MongoDB
        │
        ▼
10. API returns file information
        │
        ▼
11. React updates dashboard
```

---

# Complete Shared Download Example

A shared download follows a different authorization path:

```text
1. User opens share link
        │
        ▼
2. Share token is received
        │
        ▼
3. Token is hashed
        │
        ▼
4. Hash is matched against database
        │
        ▼
5. Share validity is checked
        │
        ├── Revoked? ────────► Reject
        │
        ├── Expired? ────────► Reject
        │
        ├── Limit reached? ─► Reject
        │
        └── Permission? ─────► Continue
                                │
                                ▼
                         Read encrypted file
                                │
                                ▼
                           Decrypt file
                                │
                                ▼
                         Increment download
                                │
                                ▼
                          Return file
```

---

# Data Model

NexusVault uses three primary database entities.

## User

Represents an authenticated application user.

```text
User
 │
 ├── Authentication information
 └── Account information
```

## File

Represents an uploaded file.

```text
File
 │
 ├── originalName
 ├── storedPath
 ├── mimeType
 ├── size
 ├── encrypted
 ├── owner
 └── timestamps
```

Each file belongs to a user.

```text
User
  │
  └──────< File
```

## Share

Represents a controlled sharing permission for a file.

```text
Share
 │
 ├── file
 ├── tokenHash
 ├── expiresAt
 ├── maxDownloads
 ├── downloadCount
 ├── revoked
 └── timestamps
```

Relationship:

```text
User
  │
  └── File
        │
        └── Share
```

A single file can therefore have multiple share links with different configurations.

---

# Error Handling

NexusVault uses centralized error handling to keep API responses consistent.

```text
Request
   │
   ▼
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├── Success ──► Response
   │
   └── Error
         │
         ▼
   Error Middleware
         │
         ▼
   HTTP Error Response
```

This prevents application errors from being handled independently in every route.

---

# Design Goals

The project was designed around several principles:

### Security

Files should not be stored as plain, directly usable content.

### Separation of Responsibilities

Routes, controllers, services, database models, and storage operations have separate responsibilities.

### Controlled Sharing

Sharing should not mean giving unrestricted access to a file.

### User Ownership

Private files should remain associated with their owner.

### Observability

Users should be able to understand how their storage is being used through statistics and recent activity.

### Maintainability

The backend is divided into logical modules so individual parts can be modified without restructuring the entire application.

---

# Future Improvements

Although NexusVault provides a complete cloud-storage workflow, several features could be added in future versions.

Possible improvements include:

* Cloud object storage such as Amazon S3 or compatible storage
* Resumable uploads
* Large-file streaming
* Chunked uploads
* File versioning
* Folder support
* File search
* Trash / recycle bin
* Password-protected share links
* More granular permissions
* Email notifications
* Two-factor authentication
* Rate limiting
* Virus/malware scanning
* Background processing
* Redis caching
* Automated database backups
* Storage quotas per user
* Multiple storage providers
* Production deployment with HTTPS
* Docker containerization
* Automated testing and CI/CD

These features are outside the current implementation but provide possible directions for expanding the system.

---

# Project Summary

NexusVault demonstrates the implementation of a complete secure cloud-storage application using a modern web architecture.

The system combines:

```text
React
  │
  ▼
Express / Node.js
  │
  ├──────────────► MongoDB
  │
  └──────────────► Encrypted File Storage
```

The complete workflow covers:

```text
Authentication
      │
      ▼
File Upload
      │
      ▼
Encryption
      │
      ▼
Secure Storage
      │
      ▼
File Management
      │
      ▼
Controlled Sharing
      │
      ▼
Secure Downloads
      │
      ▼
Statistics
      │
      ▼
Recent Activity
      │
      ▼
Time-Series Analysis
```

NexusVault therefore serves as a practical implementation of a secure file-storage platform, demonstrating concepts including **REST APIs, JWT authentication, database modeling, file handling, symmetric encryption, access control, secure token management, sharing policies, and dashboard-based data analysis**.
