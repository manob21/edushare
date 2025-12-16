// Hierarchical category configuration for the EduShare platform
export const CATEGORIES = {
  PRIMARY: {
    name: 'Primary',
    display: 'Primary (1-5)',
    levels: [
      { value: 'Class 1', label: 'Class 1', subjects: ['Bangla', 'English', 'Mathematics'] },
      { value: 'Class 2', label: 'Class 2', subjects: ['Bangla', 'English', 'Mathematics'] },
      { value: 'Class 3', label: 'Class 3', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion'] },
      { value: 'Class 4', label: 'Class 4', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion'] },
      { value: 'Class 5', label: 'Class 5', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion'] },
    ]
  },
  SECONDARY: {
    name: 'Secondary',
    display: 'Secondary (6-10)',
    levels: [
      { value: 'Class 6', label: 'Class 6', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion', 'ICT', 'Agriculture'] },
      { value: 'Class 7', label: 'Class 7', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion', 'ICT', 'Agriculture'] },
      { value: 'Class 8', label: 'Class 8', subjects: ['Bangla', 'English', 'Mathematics', 'BGS', 'Science', 'Religion', 'ICT', 'Agriculture'] },
      { 
        value: 'Class 9', 
        label: 'Class 9',
        hasGroups: true,
        groups: [
          { 
            value: 'Science', 
            label: 'Science Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Higher Mathematics', 'ICT']
          },
          { 
            value: 'Commerce', 
            label: 'Commerce Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'Accounting', 'Business Entrepreneurship', 'Finance & Banking', 'ICT']
          },
          { 
            value: 'Humanities', 
            label: 'Humanities Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'History', 'Civics', 'Geography', 'Economics', 'ICT']
          }
        ]
      },
      { 
        value: 'Class 10', 
        label: 'Class 10 (SSC)',
        hasGroups: true,
        groups: [
          { 
            value: 'Science', 
            label: 'Science Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Higher Mathematics', 'ICT']
          },
          { 
            value: 'Commerce', 
            label: 'Commerce Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'Accounting', 'Business Entrepreneurship', 'Finance & Banking', 'ICT']
          },
          { 
            value: 'Humanities', 
            label: 'Humanities Group',
            subjects: ['Bangla', 'English', 'Mathematics', 'History', 'Civics', 'Geography', 'Economics', 'ICT']
          }
        ]
      },
    ]
  },
  HIGHER_SECONDARY: {
    name: 'Higher-Secondary',
    display: 'Higher-Secondary (11-12)',
    levels: [
      { 
        value: 'Class 11', 
        label: 'Class 11 (HSC 1st Year)',
        hasGroups: true,
        groups: [
          { 
            value: 'Science', 
            label: 'Science Group',
            subjects: ['Bangla', 'English', 'Physics', 'Chemistry', 'Higher Mathematics', 'Biology', 'ICT']
          },
          { 
            value: 'Commerce', 
            label: 'Commerce Group',
            subjects: ['Bangla', 'English', 'Accounting', 'Business Organization & Management', 'Finance & Banking', 'Production Management', 'ICT']
          },
          { 
            value: 'Humanities', 
            label: 'Humanities Group',
            subjects: ['Bangla', 'English', 'History', 'Islamic History', 'Civics', 'Economics', 'Social Work', 'Logic', 'ICT']
          }
        ]
      },
      { 
        value: 'Class 12', 
        label: 'Class 12 (HSC 2nd Year)',
        hasGroups: true,
        groups: [
          { 
            value: 'Science', 
            label: 'Science Group',
            subjects: ['Bangla', 'English', 'Physics', 'Chemistry', 'Higher Mathematics', 'Biology', 'ICT']
          },
          { 
            value: 'Commerce', 
            label: 'Commerce Group',
            subjects: ['Bangla', 'English', 'Accounting', 'Business Organization & Management', 'Finance & Banking', 'Production Management', 'ICT']
          },
          { 
            value: 'Humanities', 
            label: 'Humanities Group',
            subjects: ['Bangla', 'English', 'History', 'Islamic History', 'Civics', 'Economics', 'Social Work', 'Logic', 'ICT']
          }
        ]
      },
    ]
  },
  UNDER_GRADUATE: {
    name: 'Under-Graduate',
    display: 'Under-Graduate',
    levels: [
      { 
        value: 'CSE', 
        label: 'Computer Science & Engineering',
        topics: ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Web Development']
      },
      { 
        value: 'EEE', 
        label: 'Electrical & Electronic Engineering',
        topics: ['Circuit Theory', 'Electronics', 'Digital Logic', 'Electromagnetics', 'Power Systems', 'Control Systems', 'Communication']
      },
      { 
        value: 'Mechanical', 
        label: 'Mechanical Engineering',
        topics: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Heat Transfer', 'Mechanics']
      },
      { 
        value: 'Civil', 
        label: 'Civil Engineering',
        topics: ['Structural Analysis', 'Geotechnical Engineering', 'Transportation', 'Surveying', 'Construction Management', 'Environmental Engineering']
      },
      { 
        value: 'BBA', 
        label: 'Business Administration',
        topics: ['Marketing', 'Finance', 'Accounting', 'Management', 'Human Resource', 'Operations Management', 'Business Strategy']
      },
      { 
        value: 'Economics', 
        label: 'Economics',
        topics: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics', 'International Economics']
      },
      { 
        value: 'English', 
        label: 'English Literature',
        topics: ['Poetry', 'Drama', 'Novel', 'Literary Criticism', 'Linguistics', 'American Literature', 'British Literature']
      },
      { 
        value: 'Bangla', 
        label: 'Bangla Literature',
        topics: ['Poetry', 'Novel', 'Drama', 'Literary History', 'Linguistics']
      },
      { 
        value: 'Physics', 
        label: 'Physics',
        topics: ['Classical Mechanics', 'Quantum Mechanics', 'Electromagnetism', 'Thermodynamics', 'Nuclear Physics']
      },
      { 
        value: 'Chemistry', 
        label: 'Chemistry',
        topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry']
      },
      { 
        value: 'Mathematics', 
        label: 'Mathematics',
        topics: ['Calculus', 'Linear Algebra', 'Differential Equations', 'Real Analysis', 'Abstract Algebra', 'Probability & Statistics']
      },
    ]
  },
  POST_GRADUATE: {
    name: 'Post-Graduate',
    display: 'Post-Graduate',
    levels: [
      { 
        value: 'Masters', 
        label: 'Masters Program',
        subjects: ['CSE', 'EEE', 'Mechanical', 'Civil', 'MBA', 'Economics', 'English', 'Bangla', 'Physics', 'Chemistry', 'Mathematics']
      },
      { 
        value: 'PhD', 
        label: 'PhD Program',
        subjects: ['Research Methodology', 'Advanced Topics', 'Thesis']
      },
    ]
  },
  JOB: {
    name: 'Job',
    display: 'Job Preparation',
    levels: [
      { 
        value: 'BCS', 
        label: 'BCS (Bangladesh Civil Service)',
        subjects: ['Bangla', 'English', 'Bangladesh Affairs', 'International Affairs', 'General Science', 'Geography', 'Mental Ability', 'Computer & IT']
      },
      { 
        value: 'Bank', 
        label: 'Bank Job',
        subjects: ['Bangla', 'English', 'Mathematics', 'General Knowledge', 'Computer', 'Analytical Ability']
      },
      { 
        value: 'Primary Teacher', 
        label: 'Primary Teacher',
        subjects: ['Bangla', 'English', 'Mathematics', 'General Knowledge', 'Mental Ability']
      },
      { 
        value: 'Secondary Teacher', 
        label: 'Secondary Teacher (NTRCA)',
        subjects: ['Bangla', 'English', 'General Knowledge', 'Teaching Methodology', 'Subject Specialization']
      },
      { 
        value: 'University Teacher', 
        label: 'University Teacher',
        subjects: ['Research Methodology', 'Academic Writing', 'Subject Specialization']
      },
      { 
        value: 'Corporate Job', 
        label: 'Corporate Job',
        subjects: ['English', 'Analytical Ability', 'Aptitude Test', 'Group Discussion', 'Interview Preparation']
      },
    ]
  },
  OTHER: {
    name: 'Other',
    display: 'More',
    levels: [
      { value: 'Competitive Exams', label: 'Competitive Exams', subjects: ['IELTS', 'TOEFL', 'GRE', 'GMAT', 'SAT'] },
      { value: 'Skills', label: 'Skills Development', subjects: ['Programming', 'Design', 'Language Learning', 'Music', 'Art'] },
      { value: 'General', label: 'General Knowledge', subjects: ['Current Affairs', 'History', 'Science', 'Technology'] },
    ]
  }
};

// Helper function to get all categories
export const getAllCategories = () => {
  return Object.keys(CATEGORIES).map(key => ({
    key,
    ...CATEGORIES[key]
  }));
};

// Helper function to get levels for a category
export const getLevelsForCategory = (categoryKey) => {
  return CATEGORIES[categoryKey]?.levels || [];
};

// Helper function to get subjects for a level
export const getSubjectsForLevel = (categoryKey, levelValue, groupValue = null) => {
  const levels = CATEGORIES[categoryKey]?.levels || [];
  const level = levels.find(l => l.value === levelValue);
  
  if (!level) return [];
  
  if (level.hasGroups && groupValue) {
    const group = level.groups?.find(g => g.value === groupValue);
    return group?.subjects || [];
  }
  
  return level.subjects || level.topics || [];
};

// Helper function to get groups for a level (if applicable)
export const getGroupsForLevel = (categoryKey, levelValue) => {
  const levels = CATEGORIES[categoryKey]?.levels || [];
  const level = levels.find(l => l.value === levelValue);
  
  return level?.groups || [];
};

export default CATEGORIES;
