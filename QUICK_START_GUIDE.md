# Quick Start Guide - Testing the New Hierarchical Design

## Starting the Application

### 1. Start the Backend
```powershell
cd backend
npm install  # if needed
npm start
```

### 2. Start the Frontend
```powershell
cd frontend
npm install  # if needed
npm start
```

## Testing the New Features

### 1. Navigation Bar
- **Look at the top**: You should see categories like "Primary (1-5)", "Secondary (6-10)", etc.
- **Hover over a category**: A dropdown menu will appear showing classes/levels
- **Click on a level**: The page will filter to show resources for that level

### 2. Upload a New Document (Hierarchical)

#### Example 1: Uploading a Class 9 Science Book
1. Click "Upload Document"
2. **Title**: "Class 9 Physics Chapter 1"
3. **Category**: Select "Secondary"
4. **Level**: Select "Class 9"
5. **Group**: Select "Science Group"
6. **Subject**: Select "Physics"
7. **Description**: "Chapter 1: Motion"
8. Choose your file and upload

#### Example 2: Uploading Under-Graduate Material
1. Click "Upload Document"
2. **Title**: "Data Structures Notes"
3. **Category**: Select "Under-Graduate"
4. **Level**: Select "Computer Science & Engineering"
5. **Subject**: Select "Data Structures"
6. **Topic** (optional): "Linked Lists"
7. **Description**: "Complete notes on linked lists"
8. Choose your file and upload

#### Example 3: Uploading Job Preparation Material
1. Click "Upload Document"
2. **Title**: "BCS Bangla Guide"
3. **Category**: Select "Job"
4. **Level**: Select "BCS (Bangladesh Civil Service)"
5. **Subject**: Select "Bangla"
6. **Description**: "Complete Bangla preparation guide for BCS"
7. Choose your file and upload

### 3. Filtering Resources

#### By Category and Level:
1. **Hover** over "Higher-Secondary (11-12)" in the navigation bar
2. **Click** on "Class 12 (HSC 2nd Year)"
3. You'll see a selection panel with group options

#### By Group (for Classes 9-12):
1. After selecting Class 9/10/11/12
2. Click on a group button (e.g., "Science Group")
3. Subject filters will appear

#### By Subject:
1. After selecting level (and group if applicable)
2. Click on a subject tag (e.g., "Physics")
3. Resources will be filtered to show only Physics materials

#### Clear Filters:
- Click "Clear Filters" button in the selection panel
- Or click on a different category in the navigation bar

### 4. Viewing Resources

Resources now show:
- **Blue tag**: Level/Class (e.g., "Class 9")
- **Purple tag**: Group (e.g., "Science")
- **Green tag**: Subject (e.g., "Physics")

### 5. Search Functionality

The search bar still works across all categories:
- Type keywords in the search box
- Results will be filtered from your current selection
- Works with titles and descriptions

## Visual Guide

### Navigation Flow:
```
Category (Primary/Secondary/etc.)
    ↓
Level/Class (Class 9, CSE, etc.)
    ↓
Group (if applicable - Science/Commerce/Humanities)
    ↓
Subject (Bangla, Math, Physics, etc.)
    ↓
Resources filtered by selection
```

### Upload Flow:
```
1. Select Category → Shows relevant levels
2. Select Level → Shows groups (if applicable) or subjects
3. Select Group (optional) → Shows group-specific subjects
4. Select Subject → Required
5. Add Topic (optional) → For higher education
6. Fill title, description, and upload file
```

## Expected Behavior

### Primary (Classes 1-5):
- Classes 1-2 show: Bangla, English, Mathematics
- Classes 3-5 show: Bangla, English, Mathematics, BGS, Science, Religion

### Secondary (Classes 6-10):
- Classes 6-8: Basic subjects + ICT, Agriculture
- Classes 9-10: Must select group first (Science/Commerce/Humanities)
  - Each group has different subjects

### Higher-Secondary (Classes 11-12):
- Must select group (Science/Commerce/Humanities)
- Each group has HSC-level subjects

### Under-Graduate:
- Select department (CSE, EEE, BBA, etc.)
- Shows topic-based subjects
- Can add specific topic name

### Job Preparation:
- Select job type (BCS, Bank, Teacher, etc.)
- Shows relevant preparation subjects

## Troubleshooting

### Issue: Categories not showing in navigation
- **Fix**: Refresh the page, check browser console for errors

### Issue: Upload failing
- **Fix**: Make sure to:
  1. Select all required fields (marked with *)
  2. Category, Level, and Subject are mandatory
  3. Group is mandatory for Classes 9-12

### Issue: No resources showing after filter
- **Fix**: 
  1. Click "Clear Filters"
  2. Try uploading a test document in that category first
  3. Check if you're logged in (some features require authentication)

### Issue: Old resources not showing
- **Fix**: Old resources without new categorization will show in "All" view
  - They still use the old subject-based system
  - They're backward compatible

## Testing Complete Workflow

1. **Sign up** a new account
2. **Upload 3 documents** in different categories:
   - One in Primary
   - One in Secondary (with group selection)
   - One in Under-Graduate
3. **Navigate** using the category bar
4. **Filter** by clicking on levels and subjects
5. **Search** for your uploaded documents
6. **Download** one of them (should work after 3 uploads)

## Development Notes

### Files Modified:
- `frontend/src/pages/HomePage.js` - New UI with hierarchical navigation
- `frontend/src/config/categoryConfig.js` - Category configuration (NEW)
- `backend/src/models/Resource.js` - Added new fields
- `backend/src/controllers/resourceController.js` - New filter endpoint
- `backend/src/services/ResourceService.js` - Filter logic
- `backend/src/repositories/ResourceRepo.js` - Database queries
- `backend/src/routes/resourceRoutes.js` - New route

### Old files backed up:
- `frontend/src/pages/HomePage.old.js` - Original homepage (backup)

## Need Help?

Check the detailed documentation: `HIERARCHICAL_UPDATE.md`

For specific category configurations, see: `frontend/src/config/categoryConfig.js`
