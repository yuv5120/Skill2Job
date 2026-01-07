# Skill2Job

A modern job matching platform powered by AI that helps users find jobs aligned with their skills and experience.

## Features

- **Resume Upload & Parsing**: Upload your resume and have it automatically parsed to extract skills, experience, and contact information.
- **Adzuna Job Integration**: Browse thousands of real job listings from the Adzuna API with advanced filtering (search, location, pagination).
- **AI Job Matching**: Uses machine learning to match your resume against available jobs and shows similarity scores.
- **Job Detail Modal**: Click "View Details" on any job to see full description and apply directly via job link.
- **In-Memory Caching**: Frontend caches job results for 1 minute to reduce API calls and improve performance.
- **Rate Limiting**: Backend enforces rate limiting (30 req/min) to protect Adzuna API quota.
- **Firebase Authentication**: Secure login and registration with email/password.
- **Resume History**: View and manage all uploaded resumes.

## Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API requests
- **React Router** for navigation
- **Firebase Auth** for authentication

### Backend
- **Node.js** with Express
- **Prisma** ORM for database
- **PostgreSQL** database
- **Adzuna API** for job listings
- **express-rate-limit** for API rate limiting

### ML Service
- **Python** with Flask
- Resume parsing and job matching algorithms

## Project Structure

```
.
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── App.jsx          # Main app component
│   │   ├── firebase.js      # Firebase config
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                    # Express backend
│   ├── index.js             # Main server file
│   ├── prisma.js            # Prisma client
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── README.md            # Backend setup guide
├── ml-service/              # Python ML service
│   ├── main.py              # Flask app
│   └── requirements.txt      # Python dependencies
└── README.md                # This file
```

## Setup Instructions

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ with pip
- **PostgreSQL** database
- **Firebase** project
- **Adzuna API** credentials (optional, falls back to Remotive)

### 1. Clone Repository

```bash
git clone https://github.com/yuv5120/Skill2Job.git
cd Skill2Job
```

### 2. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file with Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Run development server:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/skill2job
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start server:
```bash
node index.js
```
Backend runs on `http://localhost:5001`

### 4. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
ML service runs on `http://localhost:8000`

## API Endpoints

### Jobs
- **GET** `/api/jobs` - Fetch jobs with optional filters
  - Query params: `q` (search), `location`, `page`, `country`
  - Rate limited to 30 req/min
  - Returns combined results from Adzuna + database jobs

### Resumes
- **GET** `/api/my-resumes` - Get user's resumes (requires `x-user-id` header)
- **POST** `/api/upload-resume` - Upload and parse resume (requires `x-user-id` header)
- **DELETE** `/api/resume/:id` - Delete a resume (requires `x-user-id` header)

### Matching
- **POST** `/api/save-matches` - Save job-resume matches to database

## Environment Variables

### Client (.env)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### Server (.env)
```
DATABASE_URL              # PostgreSQL connection string
ADZUNA_APP_ID            # Adzuna API app ID
ADZUNA_API_KEY           # Adzuna API key
```

## Rate Limiting

The `/api/jobs` endpoint is rate-limited to **30 requests per minute** per IP address to protect the Adzuna API quota.

Limit info is returned in response headers:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

## Caching

Frontend caches job search results in memory for 1 minute. Cache is keyed by search query, so different searches maintain separate caches.

## Features in Detail

### Job Browsing
1. Navigate to "Browse Jobs" page
2. Search by job title, company, location, or skills
3. Click "View Details" to open job modal
4. Click "Apply on site" to visit job listing
5. Optional: Enable "Show Matched Jobs" to see AI-matched positions

### Resume Matching
1. Upload resume on "Upload Resume" page
2. Wait for ML service to parse your resume
3. Go to "Resume Matcher" page
4. Select resume and click "Find Matches"
5. View matched jobs with similarity scores

## Database Schema

### Resume
```prisma
model Resume {
  id         String   @id @default(cuid())
  userId     String
  name       String
  email      String
  skills     String[]
  experience String
  createdAt  DateTime @default(now())
}
```

### Job
```prisma
model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  skills      String[]
  createdAt   DateTime @default(now())
  postedBy    String
}
```

### Match
```prisma
model Match {
  id        String   @id @default(cuid())
  resumeId  String
  jobId     String
  score     Float
  createdAt DateTime @default(now())
}
```

## Future Enhancements

- [ ] Email notifications for job matches
- [ ] Advanced filters (salary range, experience level)
- [ ] Saved job listings
- [ ] Job application tracking
- [ ] Resume recommendations
- [ ] Mobile app

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

## Authors

- Yuvraj - [GitHub](https://github.com/yuv5120)
