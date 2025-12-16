# EduShare Hierarchical Categorization Update

## Overview
This update implements a comprehensive hierarchical categorization system for the EduShare platform, replacing the simple subject-based categorization with a multi-level educational structure tailored for the Bangladeshi education system.

## Major Changes

### 1. Database Schema Updates

**Resource Model** (`backend/src/models/Resource.js`)
- Added new fields:
  - `category`: Main category (Primary, Secondary, Higher-Secondary, Under-Graduate, Post-Graduate, Job, Other)
  - `level`: Specific level/class within the category (e.g., "Class 1", "CSE", "BCS")
  - `group`: Academic group for classes 9-12 (Science, Commerce, Humanities)
  - `subjectCategory`: The actual subject (Bangla, Mathematics, etc.)
  - `topic`: For under-graduate/post-graduate major topics
- Maintained backward compatibility with existing `subject` field

### 2. Frontend Updates

**New Category Configuration** (`frontend/src/config/categoryConfig.js`)
- Comprehensive hierarchical structure defining:
  - Primary (Classes 1-5) with appropriate subjects per class
  - Secondary (Classes 6-10) with group-based subjects for 9-10
  - Higher-Secondary (Classes 11-12) with group-based subjects
  - Under-Graduate with department-wise topics
  - Post-Graduate categories
  - Job preparation categories
  - Helper functions for accessing the hierarchy

**HomePage Component** (`frontend/src/pages/HomePage.js`)
- New navigation bar with dropdown menus on hover
- Shows levels/classes when hovering over a category
- Dynamic subject filtering based on selected level and group
- Improved upload modal with hierarchical category selection
- Resource cards now display category, level, group, and subject tags
- Separated Auth and Upload modals into reusable components

### 3. Backend API Updates

**New Endpoint**: `/api/resource/filter` (GET)
- Supports query parameters:
  - `category`: Filter by main category
  - `level`: Filter by class/level
  - `group`: Filter by academic group
  - `subject`: Filter by subject
  - `topic`: Filter by topic (for higher education)

**Updated Endpoints**:
- `/api/resource/upload`: Now accepts additional fields (category, level, group, subjectCategory, topic)

**New Service Methods**:
- `ResourceService.filterResources(filters)`: Implements hierarchical filtering
- Updated `ResourceService.upload()`: Handles new categorization fields

**New Repository Methods**:
- `ResourceRepo.findByFilters(filters)`: Database query with multiple filter criteria

## Category Structure

### Primary (Classes 1-5)
- **Classes 1-2**: Bangla, English, Mathematics
- **Classes 3-5**: Bangla, English, Mathematics, BGS, Science, Religion

### Secondary (Classes 6-10)
- **Classes 6-8**: Bangla, English, Mathematics, BGS, Science, Religion, ICT, Agriculture
- **Classes 9-10**: Grouped by Science, Commerce, and Humanities with specific subjects

### Higher-Secondary (Classes 11-12)
- Grouped by Science, Commerce, and Humanities
- Group-specific subjects for HSC preparation

### Under-Graduate
- Department-wise: CSE, EEE, Mechanical, Civil, BBA, Economics, English, Bangla, Physics, Chemistry, Mathematics
- Each with relevant topics (e.g., CSE includes Programming, Data Structures, Algorithms, etc.)

### Post-Graduate
- Masters and PhD programs

### Job Preparation
- BCS, Bank Jobs, Teacher positions, Corporate jobs
- Each with relevant preparation subjects

## Usage Guide

### For Users - Uploading Documents

1. Click "Upload Document" button
2. Fill in the title and description
3. **Select Category**: Choose from Primary, Secondary, Higher-Secondary, etc.
4. **Select Level**: Pick the specific class or program (e.g., "Class 9", "CSE")
5. **Select Group** (if applicable): For classes 9-12, choose Science/Commerce/Humanities
6. **Select Subject**: Pick from the dynamically filtered subject list
7. **Add Topic** (optional): For under-graduate materials, specify the topic
8. Upload your file

### For Users - Finding Documents

1. **Use the Navigation Bar**: Hover over a category (e.g., "Secondary (6-10)")
2. **Select a Level**: Click on a class from the dropdown
3. **Choose Group** (if shown): For classes 9-12, select your academic group
4. **Filter by Subject**: Click on a subject tag to filter resources
5. **Search**: Use the search bar for keyword-based filtering

### For Developers - Adding New Categories

Edit `frontend/src/config/categoryConfig.js`:

```javascript
CATEGORIES: {
  YOUR_NEW_CATEGORY: {
    name: 'YourCategory',
    display: 'Display Name',
    levels: [
      { 
        value: 'level1', 
        label: 'Level 1',
        subjects: ['Subject1', 'Subject2'],
        // Optional for group-based levels
        hasGroups: true,
        groups: [
          { 
            value: 'group1', 
            label: 'Group 1',
            subjects: ['GroupSubject1', 'GroupSubject2']
          }
        ]
      }
    ]
  }
}
```

Don't forget to update the enum in `backend/src/models/Resource.js`.

## Migration Notes

### Backward Compatibility
- Existing resources without new categorization fields will continue to work
- The old `subject` field is maintained and populated from `subjectCategory`
- Old subject-based filtering still works via `/api/resource/subject/:subject`

### Data Migration (Optional)
If you want to migrate existing resources to the new structure, you can run a migration script:

```javascript
// migration.js example
const Resource = require('./backend/src/models/Resource');

async function migrateResources() {
  const resources = await Resource.find({ category: { $exists: false } });
  
  for (const resource of resources) {
    // Apply migration logic based on existing subject field
    // Example:
    if (resource.subject === 'Computer Science') {
      resource.category = 'Under-Graduate';
      resource.level = 'CSE';
      resource.subjectCategory = 'Computer Science';
      await resource.save();
    }
    // Add more migration logic as needed
  }
}
```

## Testing Checklist

- [ ] Upload a document with full categorization
- [ ] Upload a document with minimal fields (backward compatibility)
- [ ] Filter resources by category and level
- [ ] Filter resources by group (for 9-12)
- [ ] Filter resources by subject
- [ ] Test search functionality
- [ ] Test navigation dropdowns
- [ ] Verify resource cards display correct tags
- [ ] Test old subject-based endpoints still work

## UI/UX Improvements

1. **Hover-based Navigation**: Categories show dropdowns on hover for quick access
2. **Visual Tags**: Resources display color-coded tags for category, level, group, and subject
3. **Breadcrumb-style Selection**: Current filter selection is clearly displayed
4. **Progressive Disclosure**: Upload form shows fields progressively based on category selection
5. **Responsive Design**: Maintains mobile-friendliness

## Performance Considerations

- All filters use database indexes for efficient querying
- Populated user data for display (uploadedBy field)
- Results sorted by creation date (newest first)
- Consider adding pagination for large result sets in future updates

## Future Enhancements

1. Add pagination for resource lists
2. Implement advanced search with multiple criteria
3. Add resource ratings and reviews
4. Implement bookmarking/favorites
5. Add analytics for popular topics and categories
6. Implement recommendation system based on user's selected category
7. Add batch upload for multiple files
8. Implement tagging system for additional categorization

## Technical Debt

- Consider extracting modal components into separate files
- Add unit tests for category configuration
- Add integration tests for new filtering endpoints
- Consider implementing caching for frequently accessed filters
- Add validation for category-level-subject combinations

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
