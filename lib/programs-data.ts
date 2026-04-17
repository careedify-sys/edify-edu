// lib/programs-data.ts
// Auto-generated MCA, BBA, BCA, B.Com, BA, MA, M.Com, MSc data from Excel

export interface ProgramSyllabus {
  sem1?: string[]
  sem2?: string[]
  sem3?: string[]
  sem4?: string[]
  sem5?: string[]
  sem6?: string[]
}

export interface ProgramData {
  specs: string[]
  syllabus: ProgramSyllabus
}

// Programs data by university
export const PROGRAMS_DATA: Record<string, Record<string, ProgramData>> = {
  'aligarh-muslim-university': {
    'B.A': {
      specs: ['nan', 'nan', 'nan'],
      syllabus: {
        sem1: ['History of India (Ancient Period)', 'Ancient World Civilizations', 'English Language I', 'Ethics and Culture/Theology', 'Urdu'],
        sem2: ['History of India (Medieval Period)', 'Medieval World Civilizations', 'English Language II', 'Ethics and Culture/Theology', 'Urdu'],
        sem3: ['History of India (Modern Period)', 'Rise of Modern West', 'English Language III', 'Environmental Studies', 'Urdu'],
        sem4: ['Contemporary India', 'International Relations (1914-1945)', 'English Language IV', 'Environmental Studies', 'Urdu'],
        sem5: ['Historiography', 'History of Modern Europe', 'History of South Asia', 'Human Rights in History'],
        sem6: ['Contemporary World History', 'History of USA', 'History of Islamic World', 'Project Work/Dissertation'],
      },
    },
  },
  'amet-university': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Financial Accounting', 'Micro Economics', 'Business Mathematics', 'Business Communication', 'Principles of Marketing.'],
        sem2: ['Corporate Accounting', 'Macro Economics', 'Business Statistics', 'Management Concepts', 'Environmental Studies.'],
        sem3: ['Advanced Corporate Accounting', 'Cost Accounting', 'Business Law', 'Elements of Insurance', 'Company Law.'],
        sem4: ['Management Accounting', 'Auditing', 'Income Tax Law and Practice', 'Indirect Taxes', 'Banking Theory Law and Practice.'],
        sem5: ['Financial Management', 'Human Resource Management', 'Entrepreneurship Development', 'Marketing Management', 'E-Commerce.'],
        sem6: ['Business Ethics', 'Corporate Governance'],
      },
    },
  },
  'andhra-university': {
    
    'M.A': {
      specs: ['Sociology'],
      syllabus: {
        sem1: ['Foundations of Sociology', 'Sociological Theories-I'],
        sem2: ['Research Methods in Social Sciences', 'Indian Social Structure'],
        sem3: ['Political Sociology', 'Economic Sociology'],
        sem4: ['Contemporary Sociological Theories', 'Project'],
      },
    },
  },
  'anna-university': {
    
  },
  'assam-don-bosco-university': {
    
    'BBA': {
      specs: ['Marketing Management', 'Finance Management', 'Human Resource Management', 'Entrepreneurship', 'Artificial Intelligence'],
      syllabus: {
        sem1: ['Management Concepts and Practices', 'Fundamentals of Financial Accounting', 'Business Economics', 'Communicative English', 'Entrepreneurship Principles and Practices'],
        sem2: ['Ethics', 'Values and Corporate Social Responsibility', 'Marketing'],
        sem3: ['Principles of Marketing', 'Fundamentals of Human Resource Management', 'Introduction to Financial Management', 'Emotional Intelligence', 'Managerial Communication'],
        sem4: ['Personal Financial Planning', 'Consumer Behaviour', 'Business Mathematics and Statistics for Decision M', 'Elective I', 'English'],
        sem5: ['Business Decision Analysis', 'Corporate Governance and Professional Ethics', 'Production and Operations Management', 'Elective II', 'Internship'],
        sem6: ['Business Policy and Strategic Management', 'Financial Markets and Institutions', 'Corporate and Business Law', 'Minor Project-1', 'Elective III'],
      },
    },
    'BCA': {
      specs: ['Computer Science and Information Technol'],
      syllabus: {
        sem1: ['Programming in C Language', 'Computer Programming in C Language (Theory/Lab)', 'Cyber Law and Ethics', 'Computer Fundamentals', 'Fundamentals of Business &amp; Economics'],
        sem2: ['Data Structures Using C (Theory/Lab)', 'E-commerce Technologies', 'Hardware and Server Maintenance', 'Communicative English I', 'Indian Economy'],
        sem3: ['Introduction to Java Programming (Theory/Lab)', 'Digital Logic Design (Theory/Lab)', 'Enterprise Resource Planning', 'Multimedia and Graphics', 'Service-Learning Practice'],
        sem4: ['Operating System (Theory/Lab)', 'Computer Organization and Architecture (Theory/Lab', 'Relational Database Management Systems (Theory/Lab', 'Basics of Web Designing (Theory/Lab)', 'Communicative English II'],
        sem5: ['Computer Network Fundamentals (Theory/Lab)', 'Android Application Development Fundamentals', 'Minor Project', 'Software Engineering (Theory/Lab)', 'Internship'],
        sem6: ['Cloud Computing', 'Network Security', 'Web Technologies (Theory/Lab)', 'Business Statistics', 'Basics of Python (Theory/Lab)'],
      },
    },
    'M.A': {
      specs: ['Public Administration', 'Public Policy', 'Governance'],
      syllabus: {
        sem1: ['State and its Elements', 'Introduction to the Public Administration', 'Comparative and Development Administration', 'Public Policy', 'Engaged Policy and Governance Elective Group I'],
        sem2: ['Administrative Theory and Principles', 'Indian Administration', 'Public Personnel Administration'],
        sem3: ['Budget and Financial Administration in India', 'Social Welfare Administration', 'Environmental Governance', 'Citizens and Administration', 'Policy Analysis ELECTIVE GROUP I'],
        sem4: ['Decentralization and Local Governance', 'E-Governance', 'Policy Implementation (PP) ELECTIVE GROUP I', 'Tribal Development Policy In North East India', 'Dissertations-Phase II'],
      },
    },
  },
  'bharathiar-university': {
    'BBA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Language - I', 'English - I', 'Principles of Management', 'Basis of Business Statistics', 'Environmental Studies'],
        sem2: ['Language - II', 'English - II', 'Organizational Behavior', 'Economics for Executives', 'Value Education - Human Rights'],
        sem3: ['Financial Accounting', 'Production and Operations Management', 'Marketing Management', 'PC Software (MS Office) - Theory', 'PC Software (MS Office) - Practical'],
        sem4: ['Human Resource Management', 'Business Law', 'Cost &amp; Management Accounting', 'Introduction to Business Analysis', 'Naan Mudhalvan - Skill Course'],
        sem5: ['Financial Management', 'Quantitative Techniques for Management'],
        sem6: ['Strategic Management', 'Business Ethics and Global Business', 'Elective - III: Consumer Behaviour', 'Elective - IV: Supply Chain Management', 'Project Work and Viva-Voce'],
      },
    },
  },
  'bharati-vidyapeeth': {
    
    'BBA': {
      specs: ['Marketing / Finance / HRM / Agribusiness'],
      syllabus: {
        sem1: ['Management Fundamentals', 'Business Mathematics', 'Managerial Economics', 'Financial Accounting'],
        sem2: ['Macro Economics', 'OB', 'Business Statistics', 'Business Ethics & CSR'],
        sem3: ['Management Accounting', 'Principles of Marketing', 'Business Laws', 'IT Tools for Business'],
        sem4: ['Digital Marketing', 'Income Tax', 'Personal Selling', 'Entrepreneurship Development'],
        sem5: ['Strategic Management', 'Financial Management', 'Operations Management', 'Summer Internship', 'Specialisation Electives I & II'],
        sem6: ['MIS', 'Specialisation Electives III & IV', 'Industrial Project'],
      },
    },
    'BCA': {
      specs: ['Data Analysis / Information Security / D'],
      syllabus: {
        sem1: ['IT Trends', 'Foundation of Programming', 'Digital Computer Fundamentals', 'Web Designing Fundamentals', 'Communication Skills'],
        sem2: ['E-Commerce Fundamentals', 'Advanced Web Designing', 'OOP', 'Database Fundamentals'],
        sem3: ['Computer Oriented Management Systems', 'System Analysis & Design', 'Data Structures & Algorithms', 'OS'],
        sem4: ['Software Engineering', 'Advanced DBMS', 'Open Source Technology', 'Computer Networks', 'Elective-I'],
        sem5: ['OOP using JAVA', 'Fundamentals of Visual Programming', 'Multi-Paradigms Programming', 'Elective-II'],
        sem6: ['Basics of Mobile Applications', 'Software Testing', 'Project Work'],
      },
    },
  },
  'central-university-of-himachal': {
    'M.A': {
      specs: ['nan', 'nan'],
      syllabus: {
        sem1: ['Political and Economic History of India up to 8th ', 'Political and Economic History of India 8th c. CE ', 'Society', 'Culture and Dharma in India up to Early Medieval P', 'Outline of Historical Tourism'],
        sem2: ['Political and Economic History of India during 16t', 'National Movement of India – I: 1757 to 1857', 'National Movement of India – II: 1858 to 1947', 'Understanding Archaeology', 'Science and Technology in Ancient India (IKS)'],
        sem3: ['Numismatics and Epigraphy'],
        sem4: ['Selected Themes in Modern World History: 1789-1945', 'Academic Writing/Paper Publication/SeminarConferen', 'Subject Based Data Analysis', 'Dissertation/Presentation and Viva-Voce (Practical'],
      },
    },
  },
  'charusat': {
    
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Information Technology Trends', 'Foundation of Programming', 'Digital Computer Fundamentals', 'Fundamentals of Web Designing', 'Communicative English.'],
        sem2: ['Fundamentals of E-Commerce', 'Advanced Web Designing', 'Fundamentals of Object Oriented Programming', 'Database Fundamentals', 'Seminar.'],
        sem3: ['Computer Oriented Management Systems', 'System Analysis and Design', 'Fundamentals of Data Structures and Algorithms', 'Fundamentals of Operating Systems', 'Environmental Sciences'],
        sem4: ['Software Engineering', 'Advanced Database System', 'Open Source Technology', 'Computer Networks', 'Human Values and Professional Ethics'],
        sem5: ['Object Oriented Programming using JAVA', 'Fundamentals of Visual Programming', 'Introduction to Multi-Paradigms Programming langua', 'Communication and'],
        sem6: ['Basics of Mobile Applications', 'Software Testing', 'Project Work', 'Contributory Personality Development.'],
      },
    },
  },
  'christ-online': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Fundamentals of Accounting', 'Financial Accounting and Reporting', 'Business Mathematics and Statistics.'],
        sem2: ['Auditing', 'Financial Management', 'Corporate Law.'],
        sem3: ['Management Accounting', 'Financial Markets and Services', 'Organizational Behaviour.'],
        sem4: ['Income Tax', 'Corporate Law (Advanced)', 'Indirect Taxation.'],
        sem5: ['Human Resource Management', 'Financial Market and Institutions', 'Cost Accounting', 'Entrepreneurship.'],
        sem6: ['Financial Statement Analysis', 'Project Management', 'Advanced Accounting.'],
      },
    },
  },
  'dayananda-sagar-university-onl': {
    'BCA': {
      specs: ['nan'],
      syllabus: {
      },
    },
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Business Accounting', 'Managerial Economics', 'Management and Behavioural Practices', 'Corporate Governance and Business Ethics', 'Mastering English Communication.'],
        sem2: ['Financial Accounting', 'Business Laws', 'Business Mathematics', 'Marketing Management', 'Basics of Excel.'],
        sem3: ['Corporate Accounting', 'Advanced Financial Accounting', 'Business Statistics', 'Advanced Excel', 'Introduction to FinTech.'],
        sem4: ['Income Tax', 'Auditing', 'Cost Accounting', 'Digital Banking and Financial Services', 'Blockchain in Finance.'],
        sem5: ['Management Accounting', 'Financial Management', 'Preparedness for Interview', 'Discipline Electives', 'Internship.'],
        sem6: ['Strategic Management', 'Entrepreneurship and Ethics', 'FinTech Analytics'],
      },
    },
  },
  'dr-babasaheb-ambedkar-open-uni': {
    
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Fundamental of Programming using C language', 'Fundamental of Computer &amp; Information Technolo', 'Introduction to Internet Technologies and HTML', 'Financial Accounting and Management', 'Communication Skills-I'],
        sem2: ['Operating System and Software Installation', 'Data Structure Using C', 'Database Management System (DBMS)', 'Digital Electronics and Computer Organization', 'Communication Skills-II'],
        sem3: ['Object Oriented Concepts &amp; Programming - I', 'Introduction to Computer Network', 'Relational Database Management System (RDBMS)', 'Cyber Security', 'Digital Marketing and SEO'],
        sem4: ['Object Oriented Concepts &amp; Programming-II (Adv', 'System Analysis and Design', 'Web Technology using FOSS (LAMP/WAMP)', 'System Programming and Introduction to Microproces', 'Basics of French Language'],
        sem5: ['Software Engineering', 'Client/Server Architecture and Interface (C#)', 'Introduction to Python Programming', 'Business Application and Introduction to ERP', 'Mobile Operating Systems.'],
        sem6: ['Object Oriented Analysis and Design', 'Internet Programming (ASP.NET Using C#)', 'Mobile Application Development', 'E-Commerce', 'Data Warehousing and Data Mining'],
      },
    },
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Business Organization', 'Financial Accounting', 'Business Economics', 'Principles of Management', 'Communication Skills.'],
        sem2: ['Corporate Accounting', 'Business Law', 'Company Law', 'Banking and Finance', 'Environmental Studies.'],
        sem3: ['Cost Accounting', 'Income Tax', 'Business Mathematics', 'Human Resource Management', 'Marketing Management.'],
        sem4: ['Auditing', 'Management Accounting', 'Financial Management', 'E-Commerce', 'Entrepreneurship.'],
        sem5: ['Advanced Financial Accounting', 'Business Statistics', 'International Business', 'Corporate Governance', 'Specialized Elective.'],
        sem6: ['Project Work', 'Goods and Services Tax (GST)', 'Business Ethics', 'specialized elective based on track.'],
      },
    },
    'M.A': {
      specs: ['nan', 'nan'],
      syllabus: {
        sem1: ['ઐતિહાસિક સંશોધન પદ્ધતિઓ (Historical'],
        sem2: ['Medieval Indian History', 'World History', 'History of Gujarat.'],
        sem3: ['Modern Indian History', 'Historiography', 'Cultural History of India.'],
        sem4: ['Social and Economic History', 'Modern World', 'Contemporary India.'],
      },
    },
  },
  'gujarat-university': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned'],
        sem2: ['Not Mentioned'],
        sem3: ['Not Mentioned'],
        sem4: ['Not Mentioned'],
      },
    },
    'B.A': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Prose', 'Poetry', 'Indian Writing in English', 'Reading and Writing Skills.'],
        sem2: ['The English Novel: Background', 'History and Development', 'Writing for Media', 'Linguistics and Phonetics.'],
        sem3: ['Poetry and Poetic Forms', 'Comparative Literature', 'Shakespearean Drama.'],
        sem4: ['Indian Literature in English Translation', 'World Literature', 'English Grammar and Usage', 'Literary Criticism – 2.'],
        sem5: ['English Language and Literature', 'British Literature: Renaissance to Romanticism', 'Literature and Society', 'English Language Teaching (ELT)', 'Literary Criticism.'],
        sem6: ['British Literature: Victorian Age to Modern', 'Postcolonial Literature', '20th Century British and American Literature', 'Modern Literary Theory', 'Critical Theories: Classical to Contemporary.'],
      },
    },
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned'],
        sem2: ['Not Mentioned'],
        sem3: ['Not Mentioned'],
        sem4: ['Not Mentioned'],
      },
    },
  },
  'guru-ghasidas-vishwavidyalaya': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Financial Accounting', 'Business Laws', 'Financial Literacy', 'Rural Development', 'Creativity and Entrepreneurship'],
        sem2: ['Corporate Accounting', 'Business Organization and Management', 'Business Environment', 'Basics of Management', 'Business Communication'],
        sem3: ['Financial Management', 'Income-tax Law and Practice', 'Principles of Marketing', 'Investing in Stock Markets', 'Advanced Financial Accounting'],
        sem4: ['Cost Accounting', 'Business Mathematics', 'Human Resource Management', 'Risk Management', 'Working Capital Management'],
        sem5: ['Business Economics', 'Business Statistics', 'Management Accounting', 'Financial Markets and Institutions', 'Advertising and Personal Selling'],
        sem6: ['Goods &amp; Services Tax (GST) and Customs Law', 'Auditing', 'Personal Finance &amp; Planning', 'Seminar', 'Dissertation / Project'],
      },
    },
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Organizational Behaviour', 'Statistical Analysis', 'Managerial Economics', 'Corporate Financial Accounting', 'Accounting for Managerial Decisions'],
        sem2: ['Computer Applications in Business', 'Corporate Legal Framework', 'Financial Management', 'Marketing Management'],
        sem3: ['Management of Financial Services', 'Strategic Management', 'Advanced Corporate Accounting', 'Discipline Specific Elective (e.g.', 'Financial Markets'],
        sem4: ['Corporate Governance and Business Ethics', 'Dissertation', 'Discipline Specific Elective (e.g.', 'Security Analysis', 'Portfolio Management)'],
      },
    },
    'M.A': {
      specs: ['in Finance', 'Marketing', 'or HRM 2. MA Hindi'],
      syllabus: {
        sem1: ['Poetry I (Renaissance to Romantic)', 'Drama I (Shakespeare to Sheridan)', 'Prose', 'History of English Literature'],
        sem2: ['Poetry II (Victorian to Modern)', 'Drama II (Ibsen to Beckett)', 'Fiction I (18th-19th Century)', 'Literary Criticism and Theory I'],
        sem3: ['Fiction II (Modern)', 'Literary Criticism and Theory II', 'Indian Writing in English', 'Elective (Linguistics and Stylistics', 'New Literatures in English)'],
        sem4: ['American Literature'],
      },
    },
  },
  'hindustan-institute-of-technol': {
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Computer Fundamentals and Organization', 'Programming in C', 'Mathematical Foundations', 'English Communication', 'C Programming Lab'],
        sem2: ['Data Structures and Algorithms', 'Operating Systems', 'Database Management Systems', 'Discrete Mathematics', 'Data Structures Lab'],
        sem3: ['Object Oriented Programming using Java', 'Computer Networks', 'Software Engineering', 'Probability and Statistics', 'Java Programming Lab'],
        sem4: ['Python Programming', 'Web Technologies', 'Computer Architecture', 'Financial Management', 'Python Programming Lab'],
        sem5: ['Mobile Application Development', 'Cloud Computing', 'Open Source Technologies', 'Elective - I', 'Mobile App Development Lab'],
        sem6: ['Big Data Analytics', 'Artificial Intelligence', 'Elective - II', 'Project Work'],
      },
    },
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Financial Accounting - I', 'Business Economics', 'Business Management', 'English - I', 'Tamil - I / Hindi - I'],
        sem2: ['Financial Accounting - II', 'Marketing Management', 'Business Mathematics', 'English - II', 'Tamil - II / Hindi - II'],
        sem3: ['Corporate Accounting - I', 'Business Law', 'Banking Theory Law and Practice', 'Business Statistics', 'Environmental Science'],
        sem4: ['Corporate Accounting - II', 'Company Law', 'Indirect Taxes', 'Cost Accounting', 'General Proficiency'],
        sem5: ['Management Accounting', 'Income Tax Law and Practice', 'Auditing', 'Financial Management', 'Entrepreneurship Development'],
        sem6: ['Practical Auditing', 'Financial Markets and Services', 'E-Commerce', 'Human Resource Management', 'Project Work'],
      },
    },
  },
  'integral-university': {
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Computer Fundamentals', 'Programming in C', 'Mathematical Foundation-I', 'Professional Communication', 'C Programming Lab'],
        sem2: ['Data Structures using C', 'Operating System', 'Discrete Mathematics', 'Database Management Systems', 'Data Structure Lab'],
        sem3: ['Object Oriented Programming using Java', 'Computer Networks', 'Software Engineering', 'Numerical and Statistical Techniques', 'Java Lab'],
        sem4: ['Python Programming', 'Web Technologies', 'Computer Organization and Architecture', 'Financial Management', 'Python Lab'],
        sem5: ['Mobile Application Development', 'Cloud Computing', 'Artificial Intelligence', 'Elective-I', 'Mobile App Lab'],
        sem6: ['Cyber Security', 'Big Data Analytics', 'Elective-II', 'Major Project Key Differentiator: Strong focus on '],
      },
    },
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Financial Accounting', 'Business Organization', 'Business Communication', 'Micro Economics', 'Business Mathematics'],
        sem2: ['Advanced Accounting', 'Marketing Management', 'Macro Economics', 'Business Statistics', 'Environmental Studies'],
        sem3: ['Corporate Accounting', 'Business Law', 'Banking Theory', 'Cost Accounting', 'Computer Applications'],
        sem4: ['Income Tax Law', 'Company Law', 'Indirect Taxes', 'Management Accounting', 'Entrepreneurship'],
        sem5: ['Auditing', 'Financial Management', 'Indian Financial System', 'Elective-I', 'Elective-II'],
        sem6: ['Practical Auditing', 'Financial Markets', 'E-Commerce', 'Project Work Key Differentiator: Includes &quot;Pr'],
      },
    },
  },
  'karnataka-state-open-universit': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Language 1 &amp; 2', 'Indian Constitution', 'Human Rights and Environmental Studies', 'Commercial Communication–I', 'Financial Accounting'],
        sem2: ['Language 1 &amp; 2', 'Fundamentals of Computer Applications', 'Commercial Communication–II', 'Macro Economics', 'Cost Accounting'],
        sem3: ['Language 1 &amp; 2', 'Income Tax &amp; GST', 'Company Law', 'Business Management–II', 'Accounting &amp; Finance–II'],
        sem4: ['Auditing', 'Business Law', 'Statistic', 'Business Management–III', 'Accounting &amp; Finance–III'],
        sem5: ['Advanced Accountancy', 'Management of Financial Services'],
        sem6: ['Major Project / Elective specialization'],
      },
    },
  },
  'karunya-institute-of-technolog': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['English for Communication', 'Financial Accounting - I', 'Business Organization', 'Business Economics', 'Principles of Marketing'],
        sem2: ['Professional English', 'Financial Accounting - II', 'Banking Theory Law and Practice', 'Company Law and Secretarial Practice', 'Business Statistics With R'],
        sem3: ['Business Law', 'Advanced Accounting', 'Income Tax', 'Business'],
        sem4: ['Corporate Accounting-I', 'Principles of Auditing', 'Cost Accounting -I', 'Indirect Taxes', 'Management Accounting'],
        sem5: ['Corporate Accounting-II', 'Cost Accounting-II', 'Financial Management', 'Indian Financial System', 'International Business'],
        sem6: ['Fundamentals of Advertising', 'New Venture Creation', 'Portfolio Management', 'Value Education'],
      },
    },
  },
  'kl-university': {
    
    'BBA': {
      specs: ['Marketing / Finance / Human Resource'],
      syllabus: {
        sem1: ['Integrated Professional English', 'Business Mathematics', 'Business Environment', 'Business Economics', 'Perspectives of Management'],
        sem2: ['English Proficiency', 'Introduction to Financial Accounting', 'Business Statistics', 'OB', 'MIS'],
        sem3: ['Business Communication Skills', 'Management Accountancy', 'Marketing Management', 'HRM', 'Business Research Methods'],
        sem4: ['Cost Accountancy', 'Production & Operations Management', 'Business Law', 'Financial Management', 'Business Model Generation'],
        sem5: ['Business Analytics', 'Soft Skills', 'Fundamentals of Digital Marketing', 'Research Paper Writing', 'Elective 1'],
        sem6: ['Entrepreneurship', 'Strategic Management', 'Enterprise Resource Planning', 'Elective 3', '4'],
      },
    },
    'BCA': {
      specs: ['Cloud Technology & Info Security / Data '],
      syllabus: {
        sem1: ['Integrated Professional English', 'Mathematics for Computer Science', 'Problem Solving through Programming', 'Computer Organization & Architecture', 'Ecology & Environment'],
        sem2: ['English Proficiency', 'OS', 'Data Structures', 'OOP through Java', 'Mobile App Development'],
        sem3: ['Software Engineering', 'DBMS', 'Computer Networks', 'Web Development using Python', 'Design Thinking & Innovation'],
        sem4: ['Essential Skills for Employability', 'Java Full Stack Development', 'OOAD', 'Professional Elective 2', 'Term Paper'],
        sem5: ['Foreign Language', 'Corporate Readiness Skills', 'Internship-2', 'Professional Elective 3'],
        sem6: ['Major Project', 'Professional Elective 4', '5', 'MOOCS Certifications'],
      },
    },
  },
  'maharishi-markandeshwar': {
    
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned (Verbatim subjects unavailable in li'],
        sem2: ['Object Oriented Programming Using C++', 'Data Structure', 'System Analysis and Design', 'Hindi', 'Environment Education'],
        sem3: ['Not Mentioned (Standard BCA core subjects)'],
        sem4: ['Not Mentioned (Standard BCA core subjects)'],
        sem5: ['Not Mentioned (Standard BCA core subjects)'],
        sem6: ['Major Project / Industrial Training'],
      },
    },
  },
  'manav-rachna-centre-for-distan': {
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Economics for Managerial Decisions – I', 'Quantitative Techniques', 'Accounting Theory and Practices', 'Marketing Management', 'Organisation Theory and Behaviour.'],
        sem2: ['Cost and Management Accounting', 'Human Resource Management', 'Financial Management and Policy', 'Economics for Managerial Decisions – II', 'E-Commerce.'],
        sem3: ['Business Policy and Strategic Management', 'Corporate Accounting Practices', 'Advanced Business'],
        sem4: ['International Accounting', 'Financial Analytics', 'Marketing Analytics', 'Direct Taxation', 'Indirect Taxation'],
      },
    },
  },
  'mangalayatan-university': {
    
    'BBA': {
      specs: ['General Management'],
      syllabus: {
        sem1: ['Fundamentals of Management', 'Business Math', 'Managerial Economics', 'Financial Accounting', 'Environmental Studies'],
        sem2: ['Macro Economics', 'OB', 'Business Statistics', 'Business Ethics & CSR', 'Communication Lab'],
        sem3: ['Management Accounting', 'Principles of Marketing', 'Business Laws', 'IT Tools for Business'],
        sem4: ['Digital Marketing', 'Income Tax', 'Personal Selling', 'Entrepreneurship Development'],
        sem5: ['Business Policy & Strategy', 'Financial Management', 'Operations Management', 'Summer Training Report'],
        sem6: ['Management Information System', 'Industrial Project'],
      },
    },
    'BCA': {
      specs: ['Computer Applications'],
      syllabus: {
        sem1: ['Computer Fundamentals', 'Programming in C', 'Math', 'Web Designing', 'Communication Skills'],
        sem2: ['Data Structures', 'OOP with C++', 'Math-2', 'DBMS'],
        sem3: ['Java Programming', 'OS', 'Computer Networks', 'Software Engineering', 'Python'],
        sem4: ['PHP & MySQL', 'Advanced Java', 'Android App Development', 'Mini Project-1'],
        sem5: ['Cloud Computing', 'Information Security', 'Summer Internship'],
        sem6: ['AI', 'Machine Learning', 'Major Project'],
      },
    },
    'M.Sc': {
      specs: ['Mathematics'],
      syllabus: {
        sem1: ['Advanced Abstract Algebra', 'Topology', 'Integral Transforms', 'Special Functions', 'MATLAB'],
        sem2: ['Measure Theory & Integration', 'PDEs', 'Discrete Mathematics', 'Analytical Mechanics'],
        sem3: ['Functional Analysis', 'Mathematical Statistics', 'Optimisation Techniques', 'Fluid Mechanics', 'Python'],
        sem4: ['Integral Equation', 'Operation Research', 'Integral Transforms', 'MATLAB', 'Graph Theory'],
      },
    },
    'M.Com': {
      specs: ['Commerce'],
      syllabus: {
        sem1: ['Principles of Management', 'Financial Accounting', 'Marketing Management', 'Cost Accounting/Indian Financial System', 'Management of Self & Career'],
        sem2: ['Financial Management', 'Indian Economic Policy', 'Business Environment', 'Management Accounting/Security Analysis', 'Operations of Stock Exchanges'],
        sem3: ['OB', 'Tax Planning & Management', 'Research Methodology', 'Accounting & Control System/Portfolio Management'],
        sem4: ['Strategic Management', 'International Business', 'Corporate Governance & Business Ethics', 'Dissertation'],
      },
    },
    'M.A': {
      specs: ['English Literature', 'Journalism & Mass Communication', 'Education', 'Political Science'],
      syllabus: {
        sem1: ['Western Political Thought', 'Indian Government & Politics', 'Political Theory'],
        sem2: ['Comparative Politics', 'International Relations', 'Public Administration'],
        sem3: ['Contemporary Issues', 'Research Methodology'],
        sem4: ['Dissertation/Project Work'],
      },
    },
  },
  'manonmaniam-sundaranar-univers': {
    'M.A': {
      specs: ['nan', 'nan'],
      syllabus: {
        sem1: ['Ancient Indian History (Upto 1206 AD)', 'Medieval Indian History (1206-1707 AD)', 'Modern Indian History (1707-1857 AD)', 'History of South India'],
        sem2: ['Modern Indian History (Since 1857)', 'Historiography', 'History of Tamil Nadu'],
        sem3: ['World History (Upto 1500 AD)', 'World History (Since 1500 AD)', 'Constitutional History of India', 'International Relations'],
        sem4: ['Contemporary India', 'Human Rights', 'History of Modern Europe', 'Dissertation'],
      },
    },
  },
  'marwadi-university': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned (Verbatim subjects missing from spec'],
        sem2: ['Not Mentioned (Verbatim subjects missing from spec'],
        sem3: ['Not Mentioned (Verbatim subjects missing from spec'],
        sem4: ['Not Mentioned (Verbatim subjects missing from spec'],
        sem5: ['Not Mentioned (Verbatim subjects missing from spec'],
        sem6: ['Not Mentioned (Verbatim subjects missing from spec'],
      },
    },
  },
  'p-p-savani-university': {
    'BBA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned'],
        sem2: ['Not Mentioned'],
        sem3: ['Not Mentioned'],
        sem4: ['Not Mentioned'],
        sem5: ['Not Mentioned'],
        sem6: ['Not Mentioned'],
      },
    },
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Not Mentioned'],
        sem2: ['Not Mentioned'],
        sem3: ['Not Mentioned'],
        sem4: ['Not Mentioned'],
      },
    },
  },
  'sathyabama-institute-of-scienc': {
    'M.Sc': {
      specs: ['electives in Cultural and Comparative st'],
      syllabus: {
        sem1: ['Financial Accounting-I', 'Business Economics', 'Business Management', 'English-I', 'Tamil-I/Hindi-I.'],
        sem2: ['Financial Accounting-II', 'Marketing Management', 'Business Mathematics', 'English-II', 'Tamil-II/Hindi-II.'],
        sem3: ['Corporate Accounting-I', 'Business Law', 'Banking Theory Law &amp; Practice', 'Business Statistics', 'Environmental Science.'],
        sem4: ['Corporate Accounting-II', 'Company Law', 'Indirect Taxes', 'Cost Accounting', 'General Proficiency.'],
      },
    },
  },
  'sgt-university': {
    'B.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Management Concepts &amp; Organizational Behaviour', 'Financial Accounting', 'Artificial Intelligence For Everyone', 'Business Environment', 'Foundational Course: Communicative English'],
        sem2: ['Human Resource Management', 'Principles of Marketing', 'Business Statistics', 'Business Laws', 'Advanced Course: Communicative English'],
        sem3: ['Business Economics', 'Corporate Accounting', 'Business'],
        sem4: ['Cost Accounting', 'Taxation Laws', 'Financial Markets &amp; Services', 'Data Analysis Using Excel', 'Campus to Corporate: Professional Communication an'],
        sem5: ['Financial Management', 'Management Accounting', 'Security Analysis &amp; Portfolio Management', 'Goods and Service Tax (GST) &amp; Customs Law', 'Business Analytics'],
        sem6: ['Financial Analysis and Reporting', 'Financial Derivatives', 'Financial Analytics', 'Auditing.'],
      },
    },
  },
  'sharda-university': {
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Programming for Problem Solving using C', 'Computer Fundamentals and Organization', 'Mathematical Foundations', 'English Communication', 'C Programming Lab'],
        sem2: ['Object Oriented Programming using C++', 'Data Structures and Algorithms', 'Database Management Systems', 'Discrete Mathematics', 'C++ Lab'],
        sem3: ['Programming in Java', 'Computer Networks', 'Software Engineering', 'Probability and Statistics', 'Java Programming Lab'],
        sem4: ['Python Programming', 'Operating Systems', 'Computer Architecture', 'Web Technologies', 'Python Lab'],
        sem5: ['Mobile Application Development', 'Cloud Computing', 'Elective-I', 'Elective-II', 'Mobile App Development Lab'],
        sem6: ['Artificial Intelligence', 'Cyber Security', 'Elective-III', 'Major Project'],
      },
    },
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Managerial Economics', 'Financial Accounting', 'Organizational Behaviour', 'Business Statistics', 'IT for Managers'],
        sem2: ['Financial Management'],
        sem3: ['Blockchain Technology in Finance', 'Algorithmic Trading', 'Cybersecurity in Banking', 'Insurtech &amp; Wealthtech', 'Elective I'],
        sem4: ['Regtech &amp; Compliance', 'Fintech Strategy &amp; Innovation', 'Master Project/Dissertation'],
      },
    },
  },
  'shobhit-institute-of-engineeri': {
    
    'BBA': {
      specs: ['vocational or engineering courses. Key D'],
      syllabus: {
        sem1: ['Principles of Management', 'Business Economics', 'Financial Accounting', 'Business Communication', 'Business Mathematics.'],
        sem2: ['Organizational Behavior', 'Marketing Management', 'Business Statistics', 'Environmental Studies', 'Macro Economics.'],
        sem3: ['Human Resource Management', 'Cost Accounting', 'Business Law', 'IT in Management', 'Production &amp; Operations Management.'],
        sem4: ['Financial Management'],
        sem5: ['Strategic Management', 'Sales &amp; Distribution Management', 'Logistics &amp; SCM', 'Digital Marketing', 'Training &amp; Development.'],
        sem6: ['Business Ethics', 'Retail Management', 'Advertising &amp; Sales Promotion', 'Industry Project.'],
      },
    },
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Computer Fundamentals', 'Programming in C', 'Mathematical Foundation-I', 'Communication Skills', 'C Programming Lab.'],
        sem2: ['Data Structures using C', 'Operating System', 'Discrete Mathematics', 'Database Management Systems', 'Data Structures Lab.'],
        sem3: ['Object Oriented Programming using Java', 'Computer Networks', 'Software Engineering', 'Numerical and Statistical Techniques', 'Java Lab.'],
        sem4: ['Python Programming', 'Web Technologies', 'Computer Organization and Architecture', 'Python Lab.'],
        sem5: ['Mobile Application Development', 'Cloud Computing', 'Artificial Intelligence', 'Mobile App Lab', 'Mini Project.'],
        sem6: ['Cyber Security', 'Big Data Analytics', 'Major Project.'],
      },
    },
  },
  'university-of-mysore': {
    
    'BBA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Principles of Management', 'Business Economics', 'Financial Accounting', 'English', 'Environmental Studies.'],
        sem2: ['Organizational Behaviour', 'Marketing Management', 'Human Resource Management', 'Business Mathematics', 'Constitution of India.'],
        sem3: ['Financial Management', 'Cost Accounting', 'Business Law'],
        sem4: ['Strategic Management', 'Entrepreneurship Development', 'Business Statistics', 'International Business', 'Elective 1.'],
        sem5: ['Operations Management', 'Business Ethics', 'Elective 2', 'Elective 3', 'Summer Training / Project.'],
        sem6: ['Management Accounting', 'E-Business', 'Elective 4', 'Elective 5', 'Major Project.'],
      },
    },
    'BCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Computer Fundamentals', 'Programming in C', 'Mathematics - I', 'English', 'Web Designing.'],
        sem2: ['Data Structures', 'Object Oriented Programming with C++', 'Mathematics - II', 'Database Management Systems', 'Environmental Studies.'],
        sem3: ['Java Programming', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Python Programming.'],
        sem4: ['PHP and MySQL', 'Advanced Java', 'Android Application Development', 'Elective 1', 'Mini Project.'],
        sem5: ['Cloud Computing', 'Information Security', 'Elective 2', 'Elective 3', 'Summer Internship.'],
        sem6: ['Artificial Intelligence', 'Machine Learning', 'Elective 4', 'Major Project.'],
      },
    },
    'B.Com': {
      specs: ['Track)'],
      syllabus: {
        sem1: ['Business Organization and Management', 'Financial Accounting - I', 'Business Economics', 'English', 'Environmental Studies.'],
        sem2: ['Corporate Accounting - I', 'Business Law', 'Banking and Finance', 'Business Mathematics', 'Constitution of India.'],
        sem3: ['Financial Accounting - II', 'Cost Accounting', 'Income Tax - I', 'Marketing Management', 'Management Information Systems.'],
        sem4: ['Corporate Accounting - II', 'Income Tax - II', 'Business Statistics', 'Auditing', 'Elective 1.'],
        sem5: ['Management Accounting', 'Financial Management', 'Elective 2', 'Elective 3', 'Summer Project.'],
        sem6: ['Principles of Marketing', 'Entrepreneurship', 'Elective 4', 'Elective 5', 'Major Project.'],
      },
    },
    'M.Com': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Business Policy and Environment', 'Statistical Analysis', 'Marketing Management', 'Financial Management', 'Accounting Theory'],
        sem2: ['Managerial Economics'],
        sem3: ['Strategic Management', 'Advanced Cost and Management Accounting', 'Elective 1', 'Elective 2', 'Elective 3.'],
        sem4: ['International Business', 'Corporate Governance and Business Ethics', 'Elective 4', 'Elective 5', 'Dissertation / Project.'],
      },
    },
  },
  'vellore-institute-of-technolog': {
    
  },
  'yenepoya-university': {
    'B.Com': {
      specs: ['Commerce'],
      syllabus: {
        sem1: ['Financial Accounting', 'Business Economics', 'Business Management', 'Business Law'],
        sem2: ['Corporate Accounting', 'Marketing Management', 'Business Statistics'],
        sem3: ['Cost Accounting', 'Income Tax', 'Banking & Finance'],
        sem4: ['Management Accounting', 'Auditing', 'E-Commerce'],
        sem5: ['Financial Management', 'Advanced Accounting'],
        sem6: ['GST', 'Project Work'],
      },
    },
  },
  'kl-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence', 'Data Science', 'Cloud Technology', 'Cybersecurity'],
      syllabus: {
        sem1: ['Professional Communication Skills', 'Computer Networks and Communications', 'Data Structures and Algorithms', 'Operating Systems Concepts', 'Database Systems'],
        sem2: ['Object-Oriented Programming', 'Data Analytics', 'Comprehensive Software Engineering', 'Applied Machine Learning', 'Pattern Recognition', 'Hadoop and Bigdata', 'Cloud Computing', 'Cloud Information Security', 'Cyber Security and Ethical Hacking', 'Cyber Forensics'],
        sem3: ['Internship', 'Web Technologies', 'Essentials of Research Design', 'Computer Vision', 'Applied Deep Learning', 'Applications of Natural Language Processing', 'Term Paper', 'Data Visualization Techniques', 'Statistics for Data Science', 'Graph and Web Analytics', 'Cloud Architectures', 'Cloud and Serverless Computing', 'Cloud Web Services', 'Malware Analysis', 'Security Governance and Management', 'Cloud Security'],
        sem4: ['OE 1', 'OE 2', 'Project'],
      },
    },
    
    
  },
  'vignan-university-online': {
    'MCA': {
      specs: ['Computer Science and IT', 'Data Science'],
      syllabus: {
        sem1: ['Probability and Statistics', 'C & Data Structures', 'Operating System', 'Computer Architecture and Organization', 'Web Technologies'],
        sem2: ['Design and Analysis of Algorithms', 'Database Management System', 'Software Engineering', 'Java Programming', 'Python Programming'],
        sem3: ['Computer Networks', 'Big Data Analytics', 'Data Visualization', 'Machine Learning', 'Cloud Computing', 'SQL for Data Science'],
        sem4: ['Cryptography and Network Security', 'Blockchain Technology', 'Cyber Security', 'Project', 'Reinforcement Learning', 'Natural Language Processing'],
      },
    },
    
    
  },
  'assam-don-bosco-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence & Machine Learning', 'Data Science'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Science', 'Theory of Computation', 'Operating Systems', 'Data Structures and Algorithms', 'Programming Through Java', 'Operating Systems Lab', 'Data Structures and Algorithms Lab', 'Programming Through Java Lab'],
        sem2: ['Software Engineering', 'Data Communication and Computer Networks', 'Advanced Database Management Systems', 'Internet Technology and Applications', 'Sensor Networks and Internet of Things', 'Data Communication and Computer Networks Lab', 'Internet Technology and Applications Lab', 'Advanced Database Management Systems Lab', 'Service Learning/Community Engagement'],
        sem3: ['Cyber Law and IT Security', 'Machine Learning', 'Enterprise Resource Planning', 'Research Methodology and IPR', 'Machine Learning Lab', 'Elective I Artificial Intelligence', 'Elective I Data Science', 'Elective II Artificial Intelligence', 'Elective II Data Science'],
        sem4: ['Major Project', 'Elective III Artificial Intelligence', 'Elective III Data Science'],
      },
    },
    
    
  },
  'assam-down-town-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence & Machine Learning', 'Data Science'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'guru-ghasidas-vishwavidyalaya-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'mats-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'jamia-hamdard-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'charusat-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: ['Cloud Computing', 'Web Development using Open Source Technologies', 'Enterprise Computing using Java EE', 'Programming with .NET Architecture', 'Database Technologies', 'Academic Speaking and Presentation Skills'],
        sem2: ['Programming in Python', 'Advanced Web Designing', 'Advanced Mobile Programming', 'Software Engineering with Agile and DevOps', 'Academic Writing'],
        sem3: ['Data Analytics', 'Software Quality Assurance', 'Green Computing', 'Minor Project Work'],
        sem4: ['Dissertation / Project Work', 'Industrial Training'],
      },
    },
    
    
  },
  'dr-babasaheb-ambedkar-open-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'parul-university-online': {
    'MCA': {
      specs: ['Cybersecurity & Forensic', 'Full Stack Web Development', 'Artificial Intelligence / Machine Learning'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'marwadi-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['Data Structure using C', 'Web Application Development using PHP', 'Object Oriented Programming using Java', 'Operating Systems', 'Relational Database Management System', 'Problem Solving using Python', 'Techniques Object Oriented', 'Practicals based on Python', 'Computer Networks Virtualization', 'Analysis and Design using UML', 'MOOC - Web Technologies (HTML, CSS, PHP)'],
        sem2: ['Computer Networks', 'Python Programming', 'Mobile Programming', 'Mini Project 1', 'Elective (NoSQL Databases / Image Processing / Data Analytics and Visualization / C#.NET)', 'MOOC (Node / Angular / Express / React JS)', 'Artificial Intelligence', 'Data Science', 'Practicals based on Data Science using Python', 'Blockchain Technology', 'Elective - Unstructured Database Big Data Technologies', 'MOOC - Web Development using Python Framework'],
        sem3: ['Software Engineering', 'Cryptography', 'Artificial Intelligence', 'Mini Project 2', 'Elective (Big Data Tools / Machine Vision / Machine Learning / ASP.Net Programming)', 'MOOC (Cloud Computing)', 'Corporate Etiquettes', 'Machine Learning', 'Elective - Distributed Database Systems / Image Processing', 'Mobile Application Development', 'Software Engineering with DevOps', 'Practicals based on Machine Learning using Python', 'MOOC - Cyber Security'],
        sem4: ['Final Project / Dissertation', 'Dissertation Project'],
      },
    },
    
    
  },
  'ganpat-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'kurukshetra-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: ['Operating System & Linux', 'Data Structures', 'Client Side Web Technology', 'Programming in Java', 'Computer Fundamentals and Problem Solving Through C', 'Seminar', 'Practical 1', 'Practical 2', 'Practical 3'],
        sem2: ['Database Management Systems', 'Server Side Web Technology', 'Artificial Intelligence', 'Mathematical Foundations for Computer Science', 'Computer Network', 'Internship', 'Constitutional, Human and Moral Values, and IPR', 'Practical 4', 'Practical 5', 'Practical 6'],
        sem3: ['Machine Learning in Python', 'Design and Analysis of Algorithms', 'Ethical Hacking', 'Data Analytics using Excel', 'Big Data & Pattern Recognition', 'Practical 7', 'Practical 8'],
        sem4: ['Blockchain Technology', 'Principles of Programming Languages', 'Object Oriented Design and UML', 'Cyber Security Fundamentals', 'Dissertation / Project'],
      },
    },
    
    
  },
  'maharishi-markandeshwar-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'manav-rachna-online': {
    'MCA': {
      specs: ['Cyber Security and Block Chain', 'Artificial Intelligence and Data Science', 'Cloud Computing and Internet of Things', 'Full Stack Development and DevOps', 'General'],
      syllabus: {
        sem1: ['Research Innovation Catalyst-I', 'Linear Algebra & Statistical Techniques', 'Data Structures', 'Object Oriented Programming in Java', 'Python Programming', 'Data Structures Lab', 'Object Oriented Programming in Java Lab', 'Python Programming Lab', 'Placement Competency Enhancement-I', 'Fundamentals of Computer Programming', 'Elements of Mathematics'],
        sem2: ['Research Innovation Catalyst-II', 'Data Communications', 'Analysis & Design of Algorithm', 'Introduction to Artificial Intelligence', 'Vocational Training / Project', 'R Programming Lab', 'Android Application Development Lab', 'Placement Competency Enhancement-II'],
        sem3: ['Research Innovation Catalyst-III', 'Data Mining and Warehousing', 'Software Engineering & Testing', 'Operations Research', 'Big Data Analytics'],
        sem4: ['Introduction to .NET', 'Advanced Java', 'Introduction to .NET Lab', 'Advanced Java Lab'],
      },
    },
    
    
  },
  'shree-guru-gobind-singh-tricentenary-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence & Machine Learning', 'Data Science', 'Cyber Security', 'Blockchain Technology'],
      syllabus: {
        sem1: ['Operating System', 'Python Programming', 'Advanced Database Management System', 'Fundamentals of Artificial Intelligence and Machine Learning', 'Mathematical & Statistical Foundations', 'Operating System Lab', 'Python Programming Lab', 'Advanced Database Management System Lab', 'Fundamentals of Artificial Intelligence and Machine Learning Lab', 'Professional Communication', 'Bridge Course (Only for Non-Computer Background)', 'Programming in C'],
        sem2: ['Cloud Computing', 'Advanced Data Structures', 'Object-Oriented Programming with Java', 'Software Engineering & Project Management', 'Data Warehousing & Data Mining', 'Critical Reasoning & Systems Thinking', 'Applied AI', 'Probability & Statistics', 'Fundamentals of Cyber Security', 'Introduction to Blockchain'],
        sem3: ['Full Stack Development', 'Design & Analysis of Algorithms', 'Distributed Systems', 'Generative AI Fundamentals', 'Fundamentals of Deep Learning', 'Internship', 'Generative AI', 'Data Exploration & Preparation', 'Cryptography & Network Security', 'Web Development for Blockchain Application'],
        sem4: ['Mobile App Development', 'Research Methodology & Academic Writing', 'Capstone Project', 'Ethical AI & Responsible Computing', 'Natural Language Processing', 'Project', 'Data Visualization', 'Big Data', 'Cyber Forensics', 'Vulnerability Assessment & Penetration Testing', 'Smart Contract and Solidity Programming', 'Cyber Security with Blockchain'],
      },
    },
    
    
  },
  'shoolini-university-online': {
    'MCA': {
      specs: ['AI Specialization', 'Data Science', 'Full Stack'],
      syllabus: {
        sem1: ['Functional English-1', 'Problem Solving with C', 'Computational Mathematics', 'Applied Database Management System', 'Open Elective', 'Saying it with Presentations', 'Principles of Management'],
        sem2: ['Web Technology', 'Functional English-2', 'Data Structure and Algorithm (C)', 'Python Application Programming', 'Open Elective', 'Digital Marketing for Practitioners', 'Entrepreneurship'],
        sem3: ['Java Programming', 'Object-Oriented Programming with C++', 'Operating System Concepts', 'Open Elective', 'Artificial Intelligence', 'Generative AI-1', 'Data Analytics using Python', 'Data Science', 'UX/UI', 'DevOps'],
        sem4: ['Project Work', 'Computer Networking', 'Open Elective', 'Machine Learning in Python', 'Generative AI-2', 'Digital Media Analytics', 'IoT and Data Science', 'Software Architecture', 'Prototyping'],
      },
    },
    
    
  },
  'jain-university-online': {
    'MCA': {
      specs: ['DevOps', 'Natural Language Processing & Large Language Models Development', 'Data Analytics', 'Cyber Security', 'Full Stack Development', 'Cloud Computing', 'Data Science', 'Artificial Intelligence', 'Computer Science and Information Technology'],
      syllabus: {
        sem1: ['Mathematical Foundations for Computer Science', 'Computing Concepts and Problem Solving using C', 'Operating Systems', 'Data Structures', 'Problem Solving using C Lab', 'Data Structures Lab', 'Generative AI Applications in Modern Computing', 'Mathematical Foundation for Computer Application', 'Operating System and Unix Shell Programming', 'Data Communication and Computer Networks', 'Data Structures with Algorithms (with Java)', 'Java Programming', 'Java Programming Lab'],
        sem2: ['Advanced Database Systems', 'Java Programming', 'Web Technologies', 'Cloud Computing Foundations', 'Advanced Database Systems Lab', 'Java Programming Lab', 'Environmental, Social, and Governance (ESG) in IT', 'Relational Database Management System', 'Design and Analysis of Algorithms', 'Computer Organization and Architecture', 'Web Development using HTML and CSS', 'Dynamic Web Applications Using JavaScript', 'Relational Database Management System Lab', 'Python for Data Science', 'SQL for Data Science', 'Statistical Methods in Decision Making'],
        sem3: ['Artificial Intelligence and Machine Learning', 'Python Programming', 'Infrastructure as Code & Automation', 'AI & Machine Learning Lab', 'Python Programming Lab', 'Open Elective', 'Transformer Models & Attention Mechanisms', 'Computer Vision', 'Cyber Threat Intelligence', 'Application Development using Python', 'Web Technologies', 'React JS', 'Advanced Database Systems', 'Mobile Application Development', 'Applied Learning', 'Application Development using Python Lab', 'Web Technologies Lab', 'Cloud Managed Services', 'Containers and Microservices', 'Big Data Management and Analytics', 'Data Visualization', 'Predictive Analytics using Machine Learning', 'Statistical Methods in Decision Making', 'Predictive Analytics using Machine Learning Lab', 'Recommendation Systems', 'Advanced Machine Learning', 'Software Testing'],
        sem4: ['Site Reliability Engineering', 'DevSecOps', 'Microservices & Containerization', 'DevOps in AI & Big Data', 'Project', 'Large-Scale AI Model Deployment', 'Multimodal AI', 'Reinforcement Learning', 'Fine-Tuning & Optimization', 'Natural Language Processing', 'Predictive Analytics using Machine Learning', 'Deep Learning', 'Big Data Hadoop', 'Ethical Hacking', 'Defensive Cyber Security Technologies', 'Vulnerability Analysis', 'Penetration Testing', 'Software Engineering & Testing', 'Web APIs', 'Network Security & Cryptography', 'DevOps', 'Mastering Professional and Academic Writing', 'Capstone Project', 'CI/CD and DevOps', 'Cloud Security and Migration', 'Microsoft Azure Essentials', 'Google Cloud Platform Essentials', 'Data Mining', 'Time Series Analysis', 'Natural Language Processing and GenAI', 'Applied Analytics - Marketing, Web, Social Media', 'Model Deployment and AI in Practice', 'Neural Networks and Deep Learning', 'Computer Vision', 'IT Project Management', 'Big Data Analytics', 'Low-Code/No-Code Application Development', 'Data Visualization'],
      },
    },
    
    
  },
  'manipal-academy-higher-education-online': {
    'MCA': {
      specs: ['Artificial Intelligence & Machine Learning', 'Cloud Computing', 'Cybersecurity', 'Full Stack Development'],
      syllabus: {
        sem1: ['Mathematics for Computing', 'Business Communication', 'Problem Solving using C', 'Operating Systems', 'Software Engineering'],
        sem2: ['Database Management with Structured Query Language', 'Data Analytics and Visualization with Python', 'Object Oriented Programming with Java', 'Data Structures and Algorithms'],
        sem3: ['Computer Networks', 'Web Technologies', 'Machine Learning Methods', 'Big Data Analytics', 'Research Methodology'],
        sem4: ['Project', 'AI & ML', 'Cloud Computing', 'Cybersecurity', 'Full Stack Development', 'Electives/Specializations (Deep Learning Principles and Applications, Artificial Intelligence, Big Data Analytics, Computer Vision)', 'Electives/Specializations (Cloud Architecture and Management, Cloud DevOps, Cloud Application and Database with Java, Cloud Security Essentials)', 'Electives/Specializations (Basics in Information Security, Forensic Investigation, Cyber Crime Intervention, Cloud Security Essentials)', 'Electives/Specializations (Back-end Web Development, Front-end Web Development, Human-Computer Interaction, Cloud Security Essentials)'],
      },
    },
    
    
  },
  'manipal-university-jaipur-online': {
    'MCA': {
      specs: ['AI & Data Science', 'Comprehensive Emerging Technologies', 'Artificial Intelligence & Machine Learning', 'Cloud Computing', 'Cybersecurity'],
      syllabus: {
        sem1: ['Fundamentals of Computers and IT', 'Fundamentals of Mathematics', 'Discrete Mathematics and Graph Theory', 'Python Programming', 'Programming and Problem Solving in C', 'Relational Database Management System', 'Data Visualisation', 'Relational Database Management Systems Lab', 'Programming and Problem Solving in C Lab', 'Python Programming Lab'],
        sem2: ['Computer Networks and Protocols', 'Object Oriented Programming using Java', 'Operating System', 'Data Structure and Algorithms', 'Computer Architecture', 'Object Oriented Programming using Java Lab', 'Data Structure and Algorithms Lab', 'Elective (Artificial Intelligence)', 'Elective (IoT Essentials)', 'Elective (Fundamentals of Artificial Intelligence and Problem Solving)', 'Elective (Fundamentals of Cloud Computing)', 'Elective (Cybersecurity Essentials)'],
        sem3: ['Unix and Shell Programming', 'Web Technology', 'Software Engineering and Project Management', 'Unix and Shell Programming Lab', 'Web Technology Lab', 'Elective (Categorical Data Analysis and Generalized Linear Models / Deep Learning and Text Mining)', 'Elective (Data Mining Techniques / Blockchain Technologies)', 'Elective (Introduction to Machine Learning / Fundamentals of Unsupervised Learning)', 'Elective (Cloud Architecture and Services / Google Cloud Essentials)', 'Elective (Cyber Law and Ethics / Ethical Hacking)'],
        sem4: ['Mobile Application Development', 'Project Work', 'Elective (Applied Data Analytics)', 'Elective (Big Data Analytics and Business Intelligence)', 'Elective (AI in Project Management)', 'Elective (Cloud Application Development)', 'Elective (Cryptography and Network Security)'],
      },
    },
    
    
  },
  'sikkim-manipal-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['Computational Mathematics', 'Java Programming', 'Operating Systems', 'Database Management System', 'Database Management System Lab', 'Java Programming Lab', 'Fundamentals of Computers & IT', 'Fundamental of Mathematics'],
        sem2: ['Python Programming', 'Software Engineering and Unified Modelling Language', 'Computer Organization and Architecture', 'Data Structure and Algorithm', 'Data Structure and Algorithm Lab', 'Python Programming Lab'],
        sem3: ['.NET Framework', 'Computer Network', 'IT Laws and Practices', '.NET Framework Lab', 'Computer Network Lab', 'Elective (Data Warehousing and Data Mining / Cloud Computing)'],
        sem4: ['Mobile Application Development', 'Angular JS, React JS, and VUE JS', 'Project', 'Elective (Machine Learning / Distributed System and Grid Computing)'],
      },
    },
    
    
  },
  'university-of-mysore-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['Advanced Data Structures and Indexing', 'Object Oriented Programming with C++', 'Advanced Database Management System', 'Java Programming', 'Linux Programming', 'E-commerce and E-governance'],
        sem2: ['Data Communication and Networks', 'Artificial Intelligence', '.Net with C#', 'Cloud Computing', 'Data Mining and Data Warehousing', 'Cryptography and Network Security'],
        sem3: ['Advanced Software Engineering', 'Python Programming', 'Machine Learning', 'Digital Image Processing', 'Internet of Things'],
        sem4: ['Project Work', 'Communication Skills and Professional Management'],
      },
    },
    
    
  },
  'yenepoya-university-online': {
    'MCA': {
      specs: ['Computer Science and Information Technology', 'Cloud Computing and Cyber Security'],
      syllabus: {
        sem1: ['Fundamentals of C Programming', 'Probability and Statistics', 'Generative AI for App Development', 'Database Management Systems', 'HTML, CSS, and JavaScript'],
        sem2: ['Operating Systems', 'Python Programming', 'Data Structures and Algorithms', 'Cloud Computing Foundations', 'UI Development Using React'],
        sem3: ['Software Testing and Quality Assurance', 'Web Application Development and Deployment', 'Machine Learning for Developers', 'Java Programming', 'Advanced Database Management Systems'],
        sem4: ['Project'],
      },
    },
    
    
  },
  'vtu-online': {
    'MCA': {
      specs: ['General', 'Artificial Intelligence & Data Science', 'Cyber Security & Cloud Computing'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Application', 'Operating System', 'Database Management System', 'Programming Using C', 'C Programming Lab', 'Database Management Lab'],
        sem2: ['Data Structure and Algorithms', 'Object Oriented Programming Using Python', 'Software Engineering', 'Computer Networks', 'Data Structure Lab', 'Python Lab'],
        sem3: ['Web Programming', 'Object Oriented Programming Using Java', 'Analysis & Design of Algorithm', 'Elective-I', 'Data Analytics Using Python', 'Introduction to Data Mining', 'Cryptography and Network Security', 'Web Programming Lab', 'Programming using Java Lab', 'Artificial Intelligence', 'Big Data Analytics', 'Data Mining', 'Linear Algebra and Applications', 'Elective-II', 'Data Visualization', 'Agile Technologies', 'Natural Language Processing', 'Artificial Intelligence Lab', 'Data Analytics Lab', 'Ethical Hacking', 'Cloud Web Services', 'Principles of Virtualization', 'Storage and Data Centre', 'Cloud Computing', 'Blockchain Technology', 'AI in Cyber Security', 'Cyber Security Governance, Risk & Compliance', 'Ethical Hacking Lab', 'Cloud Web Services Lab'],
        sem4: ['Elective-II', 'Cloud Computing', 'Big Data Analytics', 'Cyber Security Governance, Risk & Compliance', 'Elective-III', 'Artificial Intelligence', 'Blockchain Technology', 'Machine Learning', 'Major Project', 'Deep Learning', 'Data and Web Mining', 'Predictive Analysis', 'Artificial Intelligence in Cyber Security', 'Digital Forensics', 'Cyber Security and Cyber Law', 'Cryptography and Network Security', 'Python Scripting for Security'],
      },
    },
    
    
  },
  'christ-university-online': {
    'MCA': {
      specs: [],
      syllabus: {
        sem1: ['Mathematics for Computer Science', 'Computer Organization and Architecture', 'Problem Solving Techniques using C', 'Advanced Operating System', 'Advanced Database Management Systems'],
        sem2: ['Data Communication and Computer Networks', 'Java Programming', 'Data Structures and Algorithms', 'Python Programming (Swayam Course)', 'Full Stack Development', 'Artificial Intelligence and Machine Learning'],
        sem3: ['Cloud Computing', 'Software Engineering', 'Research Methodology', 'Elective 1 (AI for Healthcare / AI for Security / Quantum Computing)', 'Elective 2 (Applied Statistics using R / Digital Forensics / Game Programming)', 'Elective 3 (Business Intelligence / Network Security and Cryptography / Robotics Process Automation)'],
        sem4: ['Internet of Things', 'Software Project Management', 'Elective 1 (Natural Language Processing / Blockchain Technology / Augmented and Virtual Reality)', 'Elective 2 (Neural Networks and Deep Learning / Cyber Security and Incident Response Management / Industrial IoT)', 'Elective 3 (Big Data Analytics / Predictive Analytics / Generative AI)', 'Elective 4 (Accounting and Finance Management / Econometrics / Computational Social Science / Cognitive Psychology)', 'Major Project'],
      },
    },
    
    
  },
  'dayananda-sagar-university-online': {
    'MCA': {
      specs: ['Cloud Computing Technologies', 'Data Science', 'Blockchain Technologies', 'Quantum Computing', 'Artificial Intelligence', 'Deep Learning', 'Big Data Analytics', 'Internet of Things (IoT)', 'Natural Language Processing', 'Mobile Application Development', 'Data Analytics & Visualization', 'Industrial IoT & Automation', 'Business Intelligence Technology', 'Business Data Analytics', 'Quantum Machine Learning'],
      syllabus: {
        sem1: ['Advanced Data Structures and Algorithms', 'Advanced Python Programming', 'Advanced Operating Systems', 'Relational Database Management Systems', 'Mathematical Methods', 'Advanced Data Structures and Algorithms Lab', 'Advanced Python Programming Lab', 'RDBMS Lab'],
        sem2: ['Machine Learning with Python', 'Advanced Java Programming', 'Design and Analysis of Algorithms', 'Full Stack Development', 'Computer Communication Network', 'Advanced Java Programming Lab', 'Machine Learning with Python Lab', 'Full Stack Development Lab', 'Elective-I (Cloud Computing Technologies / Big Data Analytics / Data Science / Quantum Algorithms / Blockchain Technologies)'],
        sem3: ['Cyber Security', 'Embedded Systems and Internet of Things', 'Elective-II (Cloud Security & Infrastructure / Data Analytics & Visualization / Artificial Intelligence / Quantum Information / Research Methodology & IPR)', 'Elective-III (IoT / Data Mining / Deep Learning / Quantum Error Correction / Mobile Application Development Techniques)', 'Elective-IV (IoT / Data Mining / Deep Learning / Quantum Error Correction / Mobile Application Development Techniques)', 'Design and Analysis of Algorithms Lab', 'Mini Project'],
        sem4: ['General Elective (Business Data Analytics / Industrial Safety / Operations Research)', 'Project'],
      },
    },
    
    
  },
  'dr-dy-patil-vidyapeeth-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Computer Organisation and Architecture', 'Data Structure Using C', 'Object Oriented Programming Using C++', 'Discrete Mathematics and Combinatorics', 'Lab - OOPS Using C++', 'Business Communication'],
        sem2: ['Database Management System', 'Full Stack Web Development', 'Software Engineering', 'Data Communication and Computer Networks', 'Lab - DBMS', 'Lab - Full Stack Web Development'],
        sem3: ['Core & Advanced Java', 'Python Programming', 'Advanced Cloud Computing', 'Basics of Artificial Intelligence & Machine Learning', 'Lab - Java & Python Programming', 'Environment Awareness and Disaster Management'],
        sem4: ['Business Analytics', 'Basics of Blockchain Technology', 'Cyber Laws & Hacking', 'Research Project'],
      },
    },
    
    
  },
  'bharati-vidyapeeth-university-online': {
    'MCA': {
      specs: ['Cloud Computing', 'Data Science', 'Linux', 'Open-Source Technologies', 'Mobile Computing', 'Dot Net Technologies', 'Net Centric Technologies', 'Information Systems', 'Big Data', 'IOT', 'Cyber Security', 'Data Management'],
      syllabus: {
        sem1: ['Applied Database Management Systems', 'Computer Networks', 'Java Programming', 'Computational Statistics', 'Management Concepts and Applications', 'Lab on Applied Database Management Systems', 'Lab on Java Programming', 'MOOCs-I', 'Open Course (Universal Human Values / Cyber Security / Soft Skills)'],
        sem2: ['Object Oriented Software Engineering', 'Cloud Computing Concepts', 'Data Structures using Python', 'Data Warehousing and Data Mining', 'Web Supporting Technologies', 'Lab on Data Structures using Python', 'Minor Project – 1', 'MOOCs-II', 'Open Course (Foreign Language / Digital Technology / Human Psychology at Workplace)'],
        sem3: ['Software Design Patterns', 'Artificial Intelligence', 'Information Security', 'Electives (Virtualization / AWS / Statistical Programming in R / Introduction to Data Science / Linux Programming & Administration / Perl / Ruby / JavaScript / Android / C# / ASP.NET MVC / HTML5 / AJAX / Recommender Systems / Knowledge Management / IoT / Big Data / Hadoop / Cyber Security / Data Management)', 'Lab on Software Testing', 'Minor Project – 2', 'MOOCs-III', 'Open Course (Social Change in Technology / Water Management / Economics for IT Industry)'],
        sem4: ['Seminar on Recent Trends in IT', 'Advanced Electives (Cloud / Data Science / Linux / Open Source / Mobile / .NET / Net-Centric / Information Systems / IoT / Big Data / Cyber Security / Data Management)', 'Major Internship Project'],
      },
    },
    
    
  },
  'datta-meghe-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Mathematical Logic, Combination & Graph Theory', 'Advanced Software Engineering', 'UI Frameworks', 'Front End Development & Programming', 'GEC (Database Design Development)', 'SEC (Front End Development & Programming Lab)', 'SEC (Database Design Development Lab)', 'AECC (Business Communication)'],
        sem2: ['Applied Machine Learning', 'Statistical Data Analytics with R', 'DSE (Reinforcement Learning / Develop Enterprise Application)', 'DSE (Deep Learning / Application Integration)', 'GEC (Software Testing and Quality Assurance)', 'SEC (Machine Learning Lab)', 'SEC (R Programming Lab)', 'AECC (Research Methodology with Writing Research Paper)'],
        sem3: ['AI Implementation Capstone'],
        sem4: ['In-Plant Project Work and Seminar / Company Internship'],
      },
    },
    
    
  },
  'savitribai-phule-pune-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Programming from First Principles', 'Processor Architecture and Design', 'Computational Mathematics', 'Persistent Data Management', 'Elective (Foundations of Artificial Intelligence)', 'Research Methodology'],
        sem2: ['Data Organization for Program Construction', 'Software Subsystem for Hardware Virtualization', 'Computational Thinking', 'Foundations of Software Development', 'Elective 1', 'Elective 2', 'Foundations of Data Analytics'],
        sem3: ['Communication Protocols', 'Software Component Engineering', 'Elective 1', 'Elective 2', 'Elective 3', 'Research Project'],
        sem4: ['Internship', 'Online Elective 1 (MOOC 1)', 'Online Elective 2 (MOOC 2)'],
      },
    },
    
    
  },
  'chandigarh-university-online': {
    'MCA': {
      specs: ['Cloud Computing', 'Full Stack Development', 'Data Analytics', 'Artificial Intelligence and Machine Learning'],
      syllabus: {
        sem1: ['Advanced Database Management System', 'Advanced Computer Networks', 'Web Programming', 'Python Programming', 'Network Security and Cryptography'],
        sem2: ['Advanced Internet Programming', 'Design and Analysis of Algorithms', 'Software Testing', 'Web Application Development', 'Cyber Security'],
        sem3: ['Introduction to Cloud Computing', 'Introduction to Amazon Web Services', 'Introduction to Microsoft Azure services', 'Cloud Programming', 'Cloud Virtualization', 'HTML, CSS and Javascript', 'User Interface, Experience, Design', 'DevOps -1 (GIT, Jenkins, Docker)', 'Software Architecture', 'Prototyping', 'Data Analytics Using Python', 'SQL for Data Analytics', 'Web Analytics', 'Digital Media Analytics', 'IOT and Data Analytics', 'Machine Learning in Python', 'Statistics and Python in Machine Learning', 'Business Application of Machine Learning', 'Deep Learning and NLP', 'Web, Social Analytics and Visualization'],
        sem4: ['Introduction to Google Cloud services', 'Introduction to IBM Cloud Services', 'Major Project', 'Web Services- Rest API, ReactJS, NodeJS Development', 'DevOps-2 (Ansible, Puppet, Nagios)', 'Data Analytics using R', 'Data Analytics for decision making', 'Major project', 'Big data hadoop', 'IOT cloud and watson analytics'],
      },
    },
    
    
  },
  'lovely-professional-university-online': {
    'MCA': {
      specs: ['AR/ VR (Game Development)', 'Machine Learning & AI', 'Data Science', 'Cybersecurity', 'Full Stack Web Development'],
      syllabus: {
        sem1: ['Software Engineering Practices', 'Object Oriented Programming using C++', 'Data Warehousing and Data Mining', 'Linux and Shell Scripting', 'Data Communication and Networking', 'Skill Enhancement Course I', 'Fundamentals of Computer and C Programming', 'Elementary Mathematics'],
        sem2: ['Programming in Java', 'Advanced Data Structures', 'Introduction to Big Data', 'Cloud Computing', 'Mathematical Foundation for Computer Science', 'Web Technologies', 'Skill Enhancement Course II'],
        sem3: ['Programming in Python', 'Skill Enhancement Course III', 'Game Development using Unity Engine', 'Unreal Programming using C++', 'Generic Elective I', 'Generic Elective II', 'Seminar on Summer Training', 'One course from GE Basket 1', 'Fundamentals of Machine Learning', 'Natural Language Processing', 'Probability and Statistics', 'Data Science Tool Box', 'Network Administration', 'Cyber Forensic', 'Front End Web Developer', 'Web Development using ReactJS'],
        sem4: ['Skill Enhancement Course IV', 'Game AI & Reinforcement Learning', 'Virtual Reality and Augmented Reality in Game Development', 'Generic Elective III', 'Generic Elective IV', 'Project Work', 'Deep Learning', 'Advance Data Visualization', 'Machine Learning', 'Securing Networks and its Infrastructure', 'Vulnerability Assessment and Penetration Testing', 'Advanced Web Development', 'Web Development in Python using Django'],
      },
    },
    
    
  },
  'guru-nanak-dev-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Design And Analysis Of Algorithms', 'System Software', 'System Simulation', 'Design of Programming Languages', 'Programming Lab-I', 'Secure Software Development'],
        sem2: ['Open Source Software', 'Distributed Systems', 'Web Technologies', 'Microprocessor & It\'s Applications', 'Programming Lab-II', 'Information Systems and Security'],
        sem3: ['Advanced Software Engineering', 'Soft Computing', 'Data Warehousing and Data Mining', 'Advanced Computer Architecture', 'Cloud Native Application development', 'Programming Lab-III'],
        sem4: ['Major Project/Industrial Training/Dissertation'],
      },
    },
    
    
  },
  'guru-kashi-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'desh-bhagat-university-online': {
    'MCA': {
      specs: ['Cyber Security', 'AI and Data Science'],
      syllabus: {
        sem1: ['Emerging Technologies', 'Emerging Technologies Lab', 'Relational Database Management System', 'Relational Database Management System Lab', 'Computer Oriented Numerical and Statistical Methods', 'Software Engineering', 'Capstone Project'],
        sem2: ['C# Programming', 'C# Programming Lab', 'Design and Analysis Of Algorithm', 'Design and Analysis Of Algorithm Lab', 'Artificial Intelligence', 'Digital Marketing', 'Capstone Project', 'Data Warehousing and Data Mining'],
        sem3: ['Java Programming', 'Java Programming Lab', 'Python', 'Python Lab', 'Big Data Analytics', 'Cloud Computing', 'Cloud Computing Lab', 'Capstone Project', 'Internet of Things', 'Machine Learning'],
        sem4: ['Industrial Training'],
      },
    },
    
    
  },
  'vivekananda-global-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence', 'Cloud Technology & Information Security'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Application', 'Fundamentals of Computer and Programming in C', 'Operating Systems', 'Database Management System', 'Software Engineering and Project Management', 'Virtualization and Cloud Technology', 'Web Technology Lab', 'Trans-Disciplinary Project'],
        sem2: ['Object-Oriented Programming using Java', 'Data Structures and Algorithms Using C', 'Computer Networks', 'Machine Learning with Python', 'Linux and Shell Programming', 'Trans-Disciplinary Project', 'Artificial Intelligence', 'Introduction to Data Science', 'Cloud Architectural Patterns', 'Data Visualization'],
        sem3: ['Design & Analysis of Algorithm', 'Deep Learning', 'Natural Processing Language', 'Artificial Intelligence and Intelligent Agents', 'Seminar', 'Summer Internship', 'Transdisciplinary Project', 'Artificial Intelligence', 'Elective II (AI) Big Data Analytics', 'Elective II (AI) Knowledge Engineering & Expert Systems', 'Elective II (AI) Pattern Recognition', 'Elective II (AI) Blockchain', 'Elective II (CTIS) Storage and Data Center', 'Elective II (CTIS) Cloud Web Services', 'Elective II (CTIS) Cryptography and Network Security', 'Elective II (CTIS) Cyber Forensics', 'Elective II (CTIS) Ethical Hacking', 'Elective II (CTIS) Blockchain', 'Elective II (CTIS) Security Architecture'],
        sem4: ['Project Phase II', 'Industry Internship', 'Research Project', 'Industrial Project', 'Academic/Research Lab Project', 'Research Publications', 'Trans-Disciplinary Project'],
      },
    },
    
    
  },
  'amity-university-online': {
    'MCA': {
      specs: ['general', 'Artificial Intelligence and Machine Learning', 'Financial Technology and AI', 'Cyber Security', 'Software Engineering', 'Blockchain Technology'],
      syllabus: {
        sem1: ['Professional Communication', 'Core Java', 'Advanced Database Management Systems', 'Advanced Software Engineering Principles', 'Graph Theory and Combinatorics'],
        sem2: ['Research Methodology', 'Data Structures and Algorithm Design', 'Cognitive Analytics and Social Skills for Professional', 'Network Security and Cryptography', 'Cognitive Analytics & Social Skills for Professionals', 'Artificial Intelligence for Real World Application', 'Machine Learning for Real World Application', 'Programming Analytics and AI in FinTech', 'Machine Learning Data Science and Blockchain Development', 'Information Security, Cloud Security, Risk & Compliance', 'CyberSecurity Information Threat Intelligence & Hunting, Cyber Incident Response, Vulnerability Assessment', 'DevOps Principles, Practices and Tools', 'Developing a Single Page Application with Angular', 'Blockchain Technology and Management', 'Introduction to Ethereum, Enterprise Blockchain applications and Hyperledger'],
        sem3: ['Unix/Linux Programming', 'Seminar (Evaluation)', 'Cloud Infrastructure and Services', 'Quantitative Aptitude', 'Professional Ethics', 'Deep Learning & Neural Network', 'Social Media & Text Analytics', 'Cybersecurity, Cloud Computing and Big Data in FinTech', 'WealthTech, RegTech and FinTech Innovation', 'UNIX/Linux Programming', 'Application Security, Data Security, Malware Analysis', 'SIEM and Security Operation, UEBA', 'Getting Cloud Ready for Development', 'Microservices Master', 'Architecting Blockchain Solutions', 'Building Ethereum Applications', 'Programming Fundamentals Golang and Solidity', 'Technicalities and Implementation of Blockchain'],
        sem4: ['Augmented Reality and Virtual Reality', 'Blockchain Technology and Management Business Management', 'Blockchain Technology and Management Technical Development', 'Elective Courses General', 'Machine Learning', 'Machine Learning and Artificial Intelligence', 'Major Project'],
      },
    },
    
    
  },
  'jaipur-national-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Object Oriented Programming with C++', 'Database Management System', 'Computer Graphics', 'Information and Network Security', 'Management Process and Organizational Behavior with Environmental Ethics', 'Advance Data Structure and Algorithm Analysis', 'Understanding Prescription, Doses and Dose Forms', 'Dining Etiquettes', 'Basics of Photography', 'Crime and Society', 'Industrial Mathematics', 'Object Oriented Programming with C++ and Java Lab', 'Database Management System Lab', 'Computer Graphics Lab', 'Advance Data Structure and Algorithm Analysis Lab'],
        sem2: ['Theory of Computation', 'Software Engineering', 'Web Technology', 'Computer Based Optimization Techniques', 'Microprocessor & Assembly Language Programming', 'E-Commerce and Digital Marketing', 'Introduction to Epidemiology', 'Basics of Baking', 'Videography', 'Sociology of Health', 'Nanotechnology', 'Software Engineering Lab', 'Web Technology Lab', 'Microprocessor Lab', 'Seminar'],
        sem3: ['Compiler Design', 'Advanced Database Concepts', 'Internet of Things', 'Android Programming', '.NET Framework and ASP.NET', 'Introduction to Artificial Intelligence and Machine Learning', 'Big Data Analytics', 'Mobile Computing', 'Cloud Computing', 'Human Computer Interaction', 'Public Health Pharmacy', 'Rajasthan and Punjabi Cuisine', 'Script Writing for Film', 'Sociology of Media', 'Research Methodology', 'Advanced Database Concepts Lab', 'Internet of Things Lab', 'Android Programming Lab', '.NET Lab', 'Artificial Intelligence Lab using Python', 'Communication & Soft Skills', 'Summer Training Presentation'],
        sem4: ['Industrial Training', 'Research Paper Publication', 'Calculus of Variation and Special Functions', 'Differential Equations', 'Real Analysis', 'C Programming', 'C Programming Lab'],
      },
    },
    
    
  },
  'shri-ramasamy-memorial-university-online': {
    'MCA': {
      specs: ['Data Science and Machine Learning', 'Cyber Security & Cyber Forensics', 'Artificial Intelligence & Gen AI'],
      syllabus: {
        sem1: ['Basic Mathematics', 'Fundamentals of Computer', 'Programming in Java', 'Operating System', 'Database Technology', 'Computer Networks', 'Programming in Java Practical', 'Operating System and Database Technology Practical'],
        sem2: ['Python Programming', 'Advanced Data Structure and Algorithms', 'Advanced Web Application Development', 'Optimization Techniques', 'Advanced Data Structure and Algorithms Practical', 'Advanced Web Application Development Practical'],
        sem3: ['Artificial Intelligence and Machine Learning', 'IT Infrastructure Management', 'Android Applications Development', 'Internet of Things (IoT)', 'Mini Project', 'Specialization Data Science and Machine Learning', 'Data Analysis using R', 'Machine Learning for Data Science', 'Specialization Cyber Security and Cyber Forensics', 'Cyber Security', 'Vulnerability Assessment and Penetration Testing', 'Specialization AI & Gen AI', 'Introduction to Generative AI', 'Natural Language Processing'],
        sem4: ['MEAN Stack Web Development', 'Software Engineering and Project Management', 'Project Work', 'Specialization Data Science and Machine Learning', 'Big Data Analytics', 'Data Visualization', 'Specialization Cyber Security and Cyber Forensics', 'Principles of Digital Forensics', 'Security and Privacy in Blockchain Systems', 'Specialization AI & Gen AI', 'Large Language Models and Applications', 'GenAI Application Development'],
      },
    },
    
    
  },
  'bs-abdur-rahman-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Applications', 'Computer Organization and Operating System', 'Database Management Systems', 'Computer Networks', 'Data Structures and Algorithms using C/C++', 'Object Oriented Software Engineering', 'Data Structures and Algorithms Laboratory using C/C++', 'Programming in C and C++ Laboratory', 'DBMS Laboratory'],
        sem2: ['Programming in Java', 'Resource Management Techniques', 'Cloud Computing', 'Mobile Application Development', 'Introduction to Data Science', 'Elective I', 'Communication Skills Laboratory', 'Advanced Technology Laboratory (Cloud/Mobile/Data Science)', 'Programming in Java Laboratory'],
        sem3: ['Python Programming', 'Block Chain Technologies', 'Big Data Analytics', 'Machine Learning Techniques', 'Advanced Web Development and Services', 'Elective II', 'Customer Relationship Management', 'Python Programming Laboratory', 'Mini Project'],
        sem4: ['Project'],
      },
    },
    
    
  },
  'shanmugha-arts-science-technology-research-online': {
    'MCA': {
      specs: ['Full Stack Development', 'Artificial Intelligence & Data Science', 'Cyber Security'],
      syllabus: {
        sem1: ['Statistical Methods', 'Data Structures (Semi Theory & Semi Practical)', 'Problem Solving & Programming in C', 'Database Management Systems', 'Soft Skills I'],
        sem2: ['Design & Analysis of Algorithms (Semi Theory & Semi Practical)', 'Operating System Concepts & Principles (Semi Theory & Semi Practical)', 'Java Programming', 'Computer Networks (Semi Theory & Semi Practical)', 'Soft Skills II'],
        sem3: ['Software Engineering (Semi Theory & Semi Practical)', 'Python Programming with Web Frameworks', 'Web Technology (Semi Theory & Semi Practical)', 'Low Code Programming with Oracle', 'Software Design & Testing', 'Fundamentals of AI & Data Science', 'Machine Learning Techniques', 'Cryptography & Network Security', 'Cyber Security & Ethical Hacking'],
        sem4: ['Natural Language Processing', 'Cloud Computing', 'Design Thinking', 'Full Stack Web Application Development', 'Project & Viva Voce', 'Predictive Analytics & Data Visualization', 'Data Analytics for Health Care Applications', 'Machine Learning for Cyber Security', 'Enterprise Block Chain Framework'],
      },
    },
    
    
  },
  'srm-institute-science-technology-online': {
    'MCA': {
      specs: ['General', 'Generative AI'],
      syllabus: {
        sem1: ['Programming using Java', 'Operating System', 'Database Technology', 'Advanced Web Application Development', 'Cyber Security', 'Software Engineering', 'IT Infrastructure Management', 'Career Advancement I', 'Mathematical Foundation', 'Fundamentals of Generative AI'],
        sem2: ['Python Programming', 'Computer Networks', 'Optimization Techniques', 'Android Applications Development', 'Software Testing', 'Data Analysis Using R', 'Career Advancement II', 'Natural Language Processing'],
        sem3: ['Object Oriented Analysis and Design', 'Artificial Intelligence and Machine Learning', 'Cloud Computing', 'Internet of Things (IoT)', 'Internship', 'Mini Project Work', 'Software Project Management', 'Data Warehouse and Data Mining', 'Organizational Behavior and Professional Ethics', 'Career Advancement III', 'Large Language Models in Generative AI', 'Building Conversational AI for Human Resources', 'Advanced Techniques in Generative AI', 'AI Data Analytics and Predictive Modeling'],
        sem4: ['Project Work'],
      },
    },
    
    
  },
  'amrita-vishwa-vidyapeetham-online': {
    'MCA': {
      specs: ['Artificial Intelligence and Machine Learning', 'Cybersecurity', 'General'],
      syllabus: {
        sem1: ['Foundations of Computer Systems', 'Mathematical Foundations for Computer Applications', 'Object Oriented Programming using Java', 'Python Programming for AI', 'Foundations of Machine Learning', 'Python Scripting for Security', 'Fundamentals of Security Operations', 'Stream Core 1', 'Stream Core 2'],
        sem2: ['Data Structures and Algorithms', 'Soft Skills', 'Computational Linear Algebra', 'Deep Learning for AI', 'Natural Language Processing', 'MCA AI & ML Elective I', 'Mathematical Foundations for Cryptography', 'ML and AI in Cybersecurity', 'Network Security', 'MCA Cyber Security Elective I', 'Stream Core Mathematics', 'Stream Core 3', 'Stream Core 4', 'Professional Elective 1'],
        sem3: ['Software Project Management', 'Research Methodology', 'Complex Network Analysis', 'Reinforcement Learning', 'MCA AI & ML Elective II', 'MCA AI & ML Elective III', 'Case Study', 'Blockchain and Decentralized Applications', 'Cyber Forensics', 'MCA Cyber Security Elective II', 'MCA Cyber Security Elective III', 'Stream Core 5', 'Stream Core 6', 'Professional Elective 2', 'Professional Elective 3'],
        sem4: ['Capstone Project', 'MCA AI & ML Elective IV', 'MCA AI & ML Elective V', 'Elective Data Engineering for AI', 'Elective No SQL Databases', 'Elective Applications of Machine Learning', 'Elective Computational Statistics', 'Elective IoT for AI', 'Elective Computer Vision', 'Elective Business Analytics and Visualization', 'Elective Generative AI and LLM', 'MCA Cyber Security Elective IV', 'MCA Cyber Security Elective II', 'Cybersecurity Governance Risk and Compliance', 'Essentials of Cyber Security', 'Cyber Security Law', 'System Security', 'Web Application Security', 'Cloud and Infrastructure Security', 'Vulnerability Assessment and Penetration Testing', 'Zero Trust Architecture', 'Professional Elective 4', 'Professional Elective 5', 'Stream Core Mathematics Probability and Statistics', 'Stream Core Mathematics Computational Linear Algebra', 'Stream Core Mathematics Mathematical Foundations for Cryptography', 'Programming Essentials in Python', 'Advanced Computer Networks', 'Software Engineering and Design Patterns', 'Advanced DBMS', 'Software Testing', 'Full Stack Development'],
      },
    },
    
    
  },
  'vit-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence', 'Machine Learning', 'Cyber Security', 'Software Quality Assurance and Reliability', 'Virtual and Augmented Reality', 'Big Data Analytics', 'Computer Architecture', 'Mobile Application Development', 'Cyber Forensics', 'Blockchain Technologies', 'Data Mining Techniques'],
      syllabus: {
        sem1: ['Discrete Mathematical Structures', 'Python Programming', 'Data Structure and Algorithms', 'Operating Systems', 'Database Systems'],
        sem2: ['Statistics for Data Science', 'Software Engineering', 'Computer Networks', 'Programming in Java', 'Elective I Artificial Intelligence'],
        sem3: ['Elective II', 'Elective III', 'Elective IV', 'Elective V', 'Elective VI'],
        sem4: ['Elective VII', 'Seminar', 'Project Work'],
      },
    },
    
    
  },
  'hindustan-institute-technology-online': {
    'MCA': {
      specs: ['Computer Science and IT', 'Cyber Security & Cloud Computing', 'Data Science'],
      syllabus: {
        sem1: ['Advanced Data Structures & Algorithms using Python', 'Statistics for Computer Science', 'Database Technology', 'Object Oriented Programming Using JAVA', 'Computer Networks', 'Practical Software Design Project', 'Software Design Project'],
        sem2: ['Web Design and Development', 'Data Warehousing and Data Mining', 'Machine Learning', 'Software Engineering', 'Practical Software Design Project', 'Web Programming Lab', 'Elective I Web Analytics', 'Elective I Big Data Analytics'],
        sem3: ['Software Testing and Quality Assurance', 'DevOps', 'MOOC', 'Presentation Skills and Academic Writing', 'Project Phase I', 'Elective II R Programming', 'Elective II Big Data Analytics', 'Elective III Semantic Web', 'Elective III Data Visualization Techniques and Tools'],
        sem4: ['Personality Development', 'Project Work Phase II', 'Elective IV Data Classification Methods and Evaluation', 'Elective IV Principles of Deep Learning'],
      },
    },
    
    
  },
  'sharda-university-online': {
    'MCA': {
      specs: ['Data Science', 'Computer Science and Information Technology', 'Augmented Reality and Virtual Reality with Artificial Intelligence'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Application', 'C Programming and File Handling', 'Operating System and Unix Shell Programming', 'Computer Architecture and Organization', 'Data Communication and Computer Networks', 'Introduction to Computers & Technology'],
        sem2: ['Data Structures with C', 'Database Management System', 'Software Engineering', 'Java Programming', 'Logic Building and Soft Skills'],
        sem3: ['Application Development Using Python', 'Design and Analysis of Algorithms', 'Statistical Methods in Decision Making', 'Data Visualization', 'Introduction to Data Science', 'Cryptography and Network Security', 'Cloud Infrastructure and Service', 'Object Oriented Modelling and Design Pattern', 'IT Project Management', 'C# with ASP.NET', 'Introduction to R Programming', 'Internet of Thing', 'Project'],
        sem4: ['IT Project Management', 'Artificial Intelligence and Machine Learning', 'SQL for Data Science', 'Time Series Analytics', 'Project', 'C# with ASP.NET', 'Introduction to R Programming', 'Internet of Thing', 'Strategic & Industry Projects', 'Applied Generative AI and Model Safety', 'Time Series Analysis', 'Neural Networks and Deep Learning', 'Capstone Industry Project (with Leverage Online)'],
      },
    },
    
    
  },
  'mangalayatan-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['Data Communication & Computer Networks', 'Computer Organization & Architecture', 'Professional Communication', 'Discrete Mathematics', 'Accountancy and Financial Management', 'Programming with C', 'Programming with C Lab'],
        sem2: ['Web Programming', 'Advance Cyber Security', 'Management Information System', 'Design & Analysis of Algorithm', 'Data Structure using C++', 'DAA and Web Programming Lab', 'Data Structure using C++ Lab'],
        sem3: ['Artificial Intelligence and Machine Learning', 'Data Science using R Programming', 'OOP’s Technologies and Java Programming', 'Advanced DBMS', 'Soft Computing Techniques', 'Java Programming Lab', 'Data Science using R Programming Lab'],
        sem4: ['Big Data Analytics', 'Mobile Computing', 'Natural Language Processing', 'Python Programming', 'Quantum Computing', 'Python Programming Lab', 'Project'],
      },
    },
    
    
  },
  'gla-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Fundamentals of Computer Science', 'Software Engineering and Testing', 'Problem Solving Using Python', 'Web Technology', 'Database Management System', 'Professional Communication I', 'Problem Solving Using Python Lab', 'Web Technology Lab', 'Database Management System Lab', 'Soft Skills I'],
        sem2: ['Problem Solving Using Java', 'Applied Data Structure and Applications', 'Machine Learning', 'Computer Networks', 'Professional Communication II', 'Ethics & Values', 'Problem Solving Using Java Lab', 'Applied Data Structure and Applications Lab using C/C++', 'Mini Project', 'Soft Skills II'],
        sem3: ['Cloud Computing', '.Net Framework using C#', 'Mobile Application Development I', 'Digital and Social Media Marketing', 'Full Stack I', 'Soft Skills III', 'Environmental Studies', 'Project I', 'Cloud Computing Lab', 'Mobile Application Development I Lab', 'Digital and Social Media Marketing Lab', 'Full Stack I Lab', '.Net Framework Lab'],
        sem4: ['DevOps', 'Mobile Application Development II', 'Full Stack Development II', 'Search Engine Optimization', 'Soft Skills IV', 'Project II', 'DevOps Lab', 'Mobile Application Development II Lab', 'Full Stack Development II Lab', 'Search Engine Optimization Lab'],
      },
    },
    
    
  },
  'noida-international-university-online': {
    'MCA': {
      specs: ['AI & Data Science'],
      syllabus: {
        sem1: ['Fundamental of Computers & Emerging Technologies', 'Problem Solving using C', 'Principles of Management & Communication', 'Discrete Mathematics', 'Computer Organization & Architecture', 'Problem Solving using C Lab', 'Computer Organization & Architecture Lab', 'Professional Communication Lab'],
        sem2: ['Web Technologies', 'Object Oriented Programming Using Java', 'Data Structures and Algorithms', 'Data Base Management System', 'Web Technologies Lab', 'Object Oriented Programming Using Java Lab', 'Data Structures and Algorithms Lab', 'DBMS Lab', 'Fundamental of AI and Problem Solving'],
        sem3: ['Unix & Shell Programming', 'Computer Network & Protocols', 'Software Engineering & Project Management', 'Unix & Shell Programming Lab', 'Software Engineering Lab', 'Introduction to Machine Learning', 'Fundamentals of Unsupervised Learning'],
        sem4: ['Banking and Insurance Management', 'Project Work', 'Artificial Intelligence in Project Management'],
      },
    },
    
    
  },
  'chhatrapati-shahu-ji-maharaj-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'galgotias-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['Problem Solving and Computer Programming', 'Computational Mathematics and Statistics', 'Database Management System', 'Digital Computer Organization', 'English Proficiency and Aptitude Building', 'Quantitative Aptitude and Reasoning'],
        sem2: ['Object Oriented Programming with Java', 'Machine Learning with Python', 'Data Structures', 'Verbal and Quantitative Reasoning', 'Data Communication & Networking', 'Operating Systems', 'Training I', 'Elective I Internet of Things', 'Elective I Data Science with R'],
        sem3: ['Object Oriented Programming with Java', 'Machine Learning with Python', 'Data Structures', 'Verbal and Quantitative Reasoning', 'Data Communication & Networking', 'Operating Systems', 'Training I', 'Elective I Internet of Things', 'Elective I Data Science with R'],
        sem4: ['Major Project'],
      },
    },
    
    
  },
  'shobhit-university-online': {
    'MCA': {
      specs: ['Cloud Computing', 'AI & Machine Learning', 'Full Stack Development', 'Cyber Security', 'Data Science'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'graphic-era-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: [],
        sem2: [],
        sem3: [],
        sem4: [],
      },
    },
    
    
  },
  'upes-online': {
    'MCA': {
      specs: ['Artificial Intelligence and Machine Learning', 'Cyber Security and Forensics', 'Data Science'],
      syllabus: {
        sem1: ['Advance Python Programming', 'Data Base Management Systems', 'Discrete Mathematics', 'Object Oriented Programming using C++', 'Advance Data Structures', 'AI for everyone', 'Information Technology and Cyber Security', 'Fundamentals of Data Science'],
        sem2: ['Web Technologies', 'Operating Systems', 'Design and Analysis of Algorithm', 'Java Programming', 'Applied Machine Learning', 'Computer Graphics', 'Cryptography & Network Security', 'Data Visualization and Interpretation'],
        sem3: ['Object-Oriented Analysis and Design Using UML', 'Computer Networks', 'Advanced Java Programming', 'Software Engineering and Project Management', 'AR/VR Development', 'Deep Learning', 'Digital Forensics I', 'Machine Learning and Deep Learning'],
        sem4: ['Project Dissertation', 'Android Application Development', 'Pattern and Visual Recognition', 'Computational Linguistics and Natural Language Processing', 'Digital Forensics II', 'Ethical Hacking & Penetration Testing', 'Cloud Computing for Data Science', 'Use of Cloud Platforms for Data Processing Analysis and Storage', 'Generative Artificial Intelligence'],
      },
    },
    
    
  },
  'uttaranchal-university-online': {
    'MCA': {
      specs: ['General'],
      syllabus: {
        sem1: ['OOPS using C++', 'Operating System', 'Computer Organization and Architecture', 'Discrete Mathematics', 'Financial Accounting'],
        sem2: ['Python Programming', 'Data Structure', 'Software Engineering', 'Data Communication and Networking', 'Theory of Computation'],
        sem3: ['Database Management System', 'Web Technology', 'Information Security', 'Artificial Intelligence', 'Soft Computing'],
        sem4: ['Capstone Project'],
      },
    },
    
    
  },
  'centurion-university-online': {
    'MCA': {
      specs: ['general'],
      syllabus: {
        sem1: ['Software Engineering', 'Programming in C', 'Data Analysis and Visualization using Python', 'Relational and Distributed Databases', 'Customer Experience Design and Programming', 'Job Readiness'],
        sem2: ['Machine Learning using Python', 'Cloud Practitioner (AWS)', 'Cloud Fundamentals (Azure)', 'Java Programming', 'Data Structures with Competitive Coding', 'Information Security (CISCO)', 'System Administrator (RedHat)'],
        sem3: ['Design and Analysis of Algorithms', 'Machine Learning for Predictive Analytics', 'Deep Learning for Image Analytics', 'Data Analytics using Tableau'],
        sem4: ['Project', 'Android Development with Kotlin'],
      },
    },
  },
  'mody-university-online': {
    'MCA': {
      specs: ['Artificial Intelligence and Machine Learning', 'Cloud Computing', 'Internet of Things (IoT)', 'Web Technology'],
      syllabus: {
        sem1: ['Object Oriented Programming Using C++', 'Computer Architecture', 'Discrete Mathematics', 'Enterprise Resource Planning', 'Database Management System', 'C++ Programming Practicals', 'DBMS Practical'],
        sem2: ['Operating System', 'Java Programming', 'Software Engineering', 'Data Warehousing and Mining', 'Advance Data Structure', 'Java Programming Practicals', 'Advance Data Structure Practical'],
        sem3: ['Visualization with R Programming', 'Data Communication and Network', 'Python Programming', 'Research Methodology', 'R Programming Practical', 'Python Programming Practicals', 'Elective (AI & ML) Artificial Intelligence and Machine Learning', 'Elective (Cloud Computing) Cloud Computing', 'Elective (IoT) Wireless Sensor Networks & IoT Standards', 'Elective (Web Technology) Web Development (C#)'],
        sem4: ['Data Science and Analytics', 'Mobile Application Design and Development', 'Project', 'Mobile Application Design and Development Practicals', 'Elective (AI & ML) Natural Language Processing', 'Elective (Cloud Computing) Cloud Security Management', 'Elective (IoT) Descriptive Analytics for IoT', 'Elective (Web Technology) Full Stack Development'],
      },
    },
  },
};

// Get program data for a university
export function getProgramData(uniId: string, program: string): ProgramData | null {
  return PROGRAMS_DATA[uniId]?.[program] || null
}

// Get all programs for a university
export function getUniversityPrograms(uniId: string): string[] {
  return Object.keys(PROGRAMS_DATA[uniId] || {})
}
