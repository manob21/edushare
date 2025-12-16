# EduShare Category Structure Diagram

## Complete Hierarchical Structure

```
EduShare Application
│
├── PRIMARY (Classes 1-5)
│   ├── Class 1
│   │   └── Subjects: Bangla, English, Mathematics
│   ├── Class 2
│   │   └── Subjects: Bangla, English, Mathematics
│   ├── Class 3
│   │   └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion
│   ├── Class 4
│   │   └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion
│   └── Class 5
│       └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion
│
├── SECONDARY (Classes 6-10)
│   ├── Class 6
│   │   └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion, ICT, Agriculture
│   ├── Class 7
│   │   └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion, ICT, Agriculture
│   ├── Class 8
│   │   └── Subjects: Bangla, English, Mathematics, BGS, Science, Religion, ICT, Agriculture
│   ├── Class 9 (SSC)
│   │   ├── Science Group
│   │   │   └── Subjects: Bangla, English, Math, Physics, Chemistry, Biology, Higher Math, ICT
│   │   ├── Commerce Group
│   │   │   └── Subjects: Bangla, English, Math, Accounting, Business, Finance, ICT
│   │   └── Humanities Group
│   │       └── Subjects: Bangla, English, Math, History, Civics, Geography, Economics, ICT
│   └── Class 10 (SSC)
│       ├── Science Group
│       │   └── Subjects: Bangla, English, Math, Physics, Chemistry, Biology, Higher Math, ICT
│       ├── Commerce Group
│       │   └── Subjects: Bangla, English, Math, Accounting, Business, Finance, ICT
│       └── Humanities Group
│           └── Subjects: Bangla, English, Math, History, Civics, Geography, Economics, ICT
│
├── HIGHER-SECONDARY (Classes 11-12)
│   ├── Class 11 (HSC 1st Year)
│   │   ├── Science Group
│   │   │   └── Subjects: Bangla, English, Physics, Chemistry, Higher Math, Biology, ICT
│   │   ├── Commerce Group
│   │   │   └── Subjects: Bangla, English, Accounting, Business Org., Finance, Production, ICT
│   │   └── Humanities Group
│   │       └── Subjects: Bangla, English, History, Islamic History, Civics, Economics, Logic, ICT
│   └── Class 12 (HSC 2nd Year)
│       ├── Science Group
│       │   └── Subjects: Bangla, English, Physics, Chemistry, Higher Math, Biology, ICT
│       ├── Commerce Group
│       │   └── Subjects: Bangla, English, Accounting, Business Org., Finance, Production, ICT
│       └── Humanities Group
│           └── Subjects: Bangla, English, History, Islamic History, Civics, Economics, Logic, ICT
│
├── UNDER-GRADUATE
│   ├── CSE (Computer Science & Engineering)
│   │   └── Topics: Programming, Data Structures, Algorithms, Database, OS, Networks,
│   │       Software Engineering, AI, ML, Web Development
│   ├── EEE (Electrical & Electronic Engineering)
│   │   └── Topics: Circuit Theory, Electronics, Digital Logic, Electromagnetics,
│   │       Power Systems, Control Systems, Communication
│   ├── Mechanical Engineering
│   │   └── Topics: Thermodynamics, Fluid Mechanics, Machine Design, Manufacturing,
│   │       Heat Transfer, Mechanics
│   ├── Civil Engineering
│   │   └── Topics: Structural Analysis, Geotechnical, Transportation, Surveying,
│   │       Construction Management, Environmental Engineering
│   ├── BBA (Business Administration)
│   │   └── Topics: Marketing, Finance, Accounting, Management, HR, Operations, Strategy
│   ├── Economics
│   │   └── Topics: Microeconomics, Macroeconomics, Econometrics, Development, International
│   ├── English Literature
│   │   └── Topics: Poetry, Drama, Novel, Literary Criticism, Linguistics,
│   │       American Literature, British Literature
│   ├── Bangla Literature
│   │   └── Topics: Poetry, Novel, Drama, Literary History, Linguistics
│   ├── Physics
│   │   └── Topics: Classical Mechanics, Quantum Mechanics, Electromagnetism,
│   │       Thermodynamics, Nuclear Physics
│   ├── Chemistry
│   │   └── Topics: Organic, Inorganic, Physical, Analytical
│   └── Mathematics
│       └── Topics: Calculus, Linear Algebra, Differential Equations, Real Analysis,
│           Abstract Algebra, Probability & Statistics
│
├── POST-GRADUATE
│   ├── Masters Program
│   │   └── Subjects: CSE, EEE, Mechanical, Civil, MBA, Economics, English,
│   │       Bangla, Physics, Chemistry, Mathematics
│   └── PhD Program
│       └── Subjects: Research Methodology, Advanced Topics, Thesis
│
├── JOB (Job Preparation)
│   ├── BCS (Bangladesh Civil Service)
│   │   └── Subjects: Bangla, English, Bangladesh Affairs, International Affairs,
│   │       General Science, Geography, Mental Ability, Computer & IT
│   ├── Bank Job
│   │   └── Subjects: Bangla, English, Mathematics, General Knowledge, Computer,
│   │       Analytical Ability
│   ├── Primary Teacher
│   │   └── Subjects: Bangla, English, Mathematics, General Knowledge, Mental Ability
│   ├── Secondary Teacher (NTRCA)
│   │   └── Subjects: Bangla, English, General Knowledge, Teaching Methodology,
│   │       Subject Specialization
│   ├── University Teacher
│   │   └── Subjects: Research Methodology, Academic Writing, Subject Specialization
│   └── Corporate Job
│       └── Subjects: English, Analytical Ability, Aptitude Test, Group Discussion,
│           Interview Preparation
│
└── OTHER (More)
    ├── Competitive Exams
    │   └── Subjects: IELTS, TOEFL, GRE, GMAT, SAT
    ├── Skills Development
    │   └── Subjects: Programming, Design, Language Learning, Music, Art
    └── General Knowledge
        └── Subjects: Current Affairs, History, Science, Technology
```

## Data Model

```
Resource {
  // Basic fields
  title: String
  description: String
  
  // Hierarchical categorization
  category: String  // PRIMARY, SECONDARY, HIGHER_SECONDARY, UNDER_GRADUATE, etc.
  level: String     // "Class 1", "Class 9", "CSE", "BCS", etc.
  group: String     // "Science", "Commerce", "Humanities" (for 9-12 only)
  subjectCategory: String  // "Bangla", "Physics", "Programming", etc.
  topic: String     // Optional - for under-graduate (e.g., "Data Structures")
  
  // Legacy field (backward compatibility)
  subject: String   // Kept for old resources
  
  // File information
  fileName: String
  fileUrl: String
  uploadedBy: User Reference
  downloads: Number
  createdAt: Date
}
```

## Navigation Flow

```
User Action Flow:
┌─────────────────────────────────────────────────────────┐
│  1. User hovers over category in navigation bar         │
│     (e.g., "Secondary (6-10)")                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Dropdown shows available levels                     │
│     [Class 6] [Class 7] [Class 8] [Class 9] [Class 10] │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. User clicks on "Class 9"                            │
│     → Selection panel appears                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. For Class 9/10/11/12: Show group buttons           │
│     [Science Group] [Commerce Group] [Humanities Group] │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. User selects "Science Group"                        │
│     → Subject filters appear                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Subject tags shown:                                 │
│     [All] [Bangla] [English] [Math] [Physics]          │
│     [Chemistry] [Biology] [Higher Math] [ICT]          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  7. User clicks "Physics"                               │
│     → Resources filtered to show only Class 9 Science   │
│       Physics materials                                 │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

```
GET /api/resource/all
  → Returns all resources

GET /api/resource/filter?category=SECONDARY&level=Class%209&group=Science&subject=Physics
  → Returns filtered resources

POST /api/resource/upload
  Body: {
    title, description, file,
    category, level, group, subjectCategory, topic
  }
  → Uploads new resource with categorization
```

## State Management

```javascript
Frontend State:
{
  selectedCategory: "SECONDARY",
  selectedLevel: "Class 9",
  selectedGroup: "Science",
  selectedSubject: "Physics",
  resources: [...filtered resources...]
}

When any filter changes:
1. Update state
2. Fetch resources with new filters
3. Update UI to show current selection
```

## UI Components Hierarchy

```
HomePage
├── Header
│   ├── Logo
│   ├── Upload Button
│   └── Auth Buttons
├── CategoryNavigationBar
│   └── CategoryItem (with dropdown)
│       └── LevelList
├── Sidebar (if authenticated)
│   ├── UserProfile
│   ├── UploadStats
│   ├── DownloadStatus
│   └── QuickActions
└── MainContent
    ├── SearchSection
    │   ├── SearchBar
    │   └── CurrentSelection
    │       ├── Breadcrumbs
    │       ├── GroupButtons (if applicable)
    │       └── SubjectFilters
    └── ResourcesList
        └── ResourceCard
            ├── Title
            ├── Tags (category, level, group, subject)
            ├── Description
            └── Download Button
```

This structure provides a comprehensive, scalable categorization system tailored for the Bangladeshi education system while maintaining flexibility for future additions.
