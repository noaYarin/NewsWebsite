# Horizon News Website - Extra Credit Features

This document outlines the additional features implemented beyond the basic project requirements, showcasing advanced web development concepts and integrations.

## 🚀 Extra Credit Features Overview

### 1. Node.js API Server

**Technology**: Node.js with Express.js

**Implementation**:

- Created a separate Node.js server running on a different port from the main .NET backend
- Integrated with NewsAPI.org to fetch real-time news articles
- Handles API rate limiting and data transformation
- Provides endpoints for news categorization and search

**Key Files**:

- `API/server.js` - Main Express server
- `API/routes/NewsRouter.js` - News API routing and logic
- `API/package.json` - Node.js dependencies

**Benefits**:

- Separation of concerns between news fetching and business logic
- Real-time news data integration
- Scalable microservice architecture

---

### 2. AI-Powered Article Summarization

**Technology**: Hugging Face Transformers API

**Implementation**:

- Integrated Hugging Face's pre-trained summarization models
- Provides intelligent article content summarization
- Asynchronous processing for better user experience
- Error handling for API failures

**Key Features**:

- Automatic text extraction from article URLs
- Intelligent content summarization using AI
- Fallback mechanisms for failed requests
- User-friendly summary display

**Files**:

- `Backend/BL/ArticleSummarization.cs` - AI summarization logic
- `Backend/DAL/SummarizerService.cs` - Service layer integration

**User Benefit**: Users can quickly understand article content without reading full articles.

---

### 3. Natural Language Processing (NLP) for Article Categorization

**Technology**: Node-NLP Library

**Implementation**:

- Trained custom NLP model with category-specific keywords and phrases
- Automatic article categorization based on content analysis
- Support for multiple categories: Business, Technology, Sports, Health, etc.
- Real-time classification of incoming news articles

**Categories Supported**:

- **Business**: Economy, finance, markets, companies
- **Technology**: Software, hardware, innovation, cybersecurity
- **Sports**: Games, competitions, athletes, tournaments
- **Health**: Medical research, wellness, fitness, healthcare
- **Science**: Research, discoveries, experiments, space
- **Entertainment**: Movies, music, celebrities, fashion
- **Travel**: Destinations, tourism, transportation
- **Culture**: Art, food, traditions, religion

**Key Features**:

- Machine learning-based text classification
- Confidence scoring for categorization accuracy
- Fallback to "General" category for unclear content
- Training data includes diverse keyword sets for each category

**Benefits**:

- Automatic content organization
- Improved user experience through better content discovery
- Personalized content delivery based on user interests

---

### 4. Advanced Friendship System

**Technology**: .NET Core with SQL Server

**Implementation**:

- Complete friendship management system with multiple states
- Real-time friendship status tracking
- Privacy controls and user blocking functionality
- Notification system for friendship activities

**Features**:

- **Friend Requests**: Send, accept, decline, and cancel requests
- **Friendship Management**: Add/remove friends with proper state transitions
- **User Blocking**: Block/unblock users with complete interaction prevention
- **Status Tracking**: Pending, accepted, blocked, and cancelled states
- **Privacy Controls**: Blocked users cannot interact with content or send requests

**Database Design**:

- Comprehensive friendship table with status tracking
- User blocking table for privacy management
- Notification integration for friendship events

**API Endpoints**:

```
POST /api/Friends/request          - Send friend request
PUT  /api/Friends/respond          - Accept/decline request
DELETE /api/Friends/cancel         - Cancel pending request
DELETE /api/Friends/remove         - Remove existing friendship
GET  /api/Friends/{userId}         - Get user's friends
GET  /api/Friends/pending/{userId} - Get pending requests
POST /api/Users/{userId}/toggle-block/{userToBlockId} - Block/unblock user
```

---

### 5. Interactive Comment Engagement System

**Technology**: .NET Core with SQL Server and real-time updates

**Implementation**:

- Advanced commenting system with social engagement features
- Like/unlike functionality for individual comments
- Real-time like count updates
- User engagement tracking and notifications

**Features**:

- **Comment Likes**: Users can like/unlike comments with toggle functionality
- **Real-time Updates**: Like counts update immediately without page refresh
- **Engagement Tracking**: Track which users liked which comments
- **Notification System**: Comment authors receive notifications when their comments are liked
- **Permission Checks**: Users can only like comments from non-blocked users

**Technical Implementation**:

- Optimized SQL stored procedures for like toggle operations
- Output parameters to retrieve notification data efficiently
- Frontend JavaScript for seamless user interaction
- Database design preventing duplicate likes from same user

**User Experience**:

- Heart icon toggles between filled/empty states
- Real-time like count updates
- Visual feedback for user interactions
- Smooth animations for engagement actions

---

## 🏗️ Architecture Benefits

### Microservice Design

- **Node.js API**: Handles external news data and NLP processing
- **.NET Backend**: Manages business logic, user data, and relationships
- **Separation of Concerns**: Each service handles specific responsibilities

### Scalability Features

- Independent scaling of news processing vs. user management
- Caching strategies for frequently accessed data
- Optimized database queries with proper indexing

### User Experience Enhancements

- Real-time content updates
- Intelligent content curation
- Social interaction features
- Personalized news delivery

---

## 🛠️ Technologies Used

| Feature            | Primary Technology     | Supporting Tools              |
| ------------------ | ---------------------- | ----------------------------- |
| News API           | Node.js + Express      | NewsAPI.org, Axios            |
| AI Summarization   | Hugging Face API       | HTTP Client, Async/Await      |
| NLP Categorization | Node-NLP               | Natural Language Processing   |
| Friendship System  | .NET Core + SQL Server | Entity Framework, LINQ        |
| Comment Likes      | .NET Core + SQL Server | Stored Procedures, JavaScript |

---

## 🎯 Project Impact

These extra credit features transform a basic news website into a comprehensive social news platform with:

1. **Intelligent Content**: AI-powered summarization and categorization
2. **Social Features**: Friendship management and comment engagement
3. **Real-time Experience**: Live updates and interactions
4. **Scalable Architecture**: Microservice design for future growth
5. **Advanced Integration**: Multiple APIs and AI services working together

This implementation demonstrates proficiency in full-stack development, API integration, artificial intelligence, natural language processing, and complex database relationships.
