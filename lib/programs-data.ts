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
    'BA': {
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
    'MCA': {
      specs: ['Computer Applications'],
      syllabus: {
        sem1: ['IT & Programming with C', 'Computer Organization'],
        sem2: ['Data Structures', 'Microprocessors', 'Operating Systems', 'DBMS'],
        sem3: ['Software Engineering', 'Computer Networks', 'Web Technologies', 'Python'],
        sem4: ['Seminar on Recent Trends in IT', 'Major Internship Project'],
      },
    },
    'MA': {
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Mathematical Foundations of Computer Science', 'Advanced Data Structures and Algorithms', 'Advanced Database Management Systems', 'Advanced Software Engineering', 'Python Programming'],
        sem2: ['Object Oriented Programming', 'Computer Networks', 'Operating Systems', 'Data Science', 'Web Application Development'],
        sem3: ['Data Mining and Data Warehousing', 'Cloud Computing Technologies', 'Mobile Application Development', 'Professional Elective I', 'Professional Elective II'],
        sem4: ['Professional Elective III', 'Professional Elective IV', 'Project Work'],
      },
    },
  },
  'assam-don-bosco-university': {
    'MCA': {
      specs: ['Artificial Intelligence &amp; Machine Le', 'Data Science'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Science', 'Theory of Computation', 'Operating Systems (Theory/Lab)', 'Data Structures and Algorithms (Theory/Lab)', 'Programming Through Java (Theory/Lab)'],
        sem2: ['Software Engineering', 'Data Communication and Computer Networks (Theory/L', 'Advanced Database Management Systems (Theory/Lab)', 'Internet Technology and Applications (Theory/Lab)', 'Sensor Networks and Internet of Things'],
        sem3: ['Cyber Law and IT Security', 'Machine Learning', 'Enterprise Resource Planning'],
        sem4: ['Major Project', 'ELECTIVE-III'],
      },
    },
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
    'MA': {
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
    'MCA': {
      specs: ['Data Science / Mobile Computing / IoT / '],
      syllabus: {
        sem1: ['Applied DBMS', 'Computer Networks', 'Java Programming', 'Computational Statistics', 'Management Concepts & Applications'],
        sem2: ['Object Oriented Software Engineering', 'Cloud Computing Concepts', 'Data Structures using Python', 'Data Warehousing & Data Mining', 'Web Supporting Technologies'],
        sem3: ['Software Design Patterns', 'Artificial Intelligence', 'Information Security', 'Specialisation Electives'],
        sem4: ['Seminar on Recent Trends in IT', 'Major Internship Project (60 days)'],
      },
    },
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
    'MA': {
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Cloud Computing', 'Web Development using Open Source Technologies', 'Enterprise Computing using Java EE', 'Programming with .NET Architecture', 'Database Technologies'],
        sem2: ['Programming in Python', 'Advanced Web Designing', 'Advanced Mobile Programming', 'Software Engineering with Agile and DevOps', 'Academic Writing.'],
        sem3: ['Data Analytics', 'Software Quality Assurance', 'Green Computing', 'Minor Project Work.'],
        sem4: ['Dissertation / Project Work - Industrial Training.'],
      },
    },
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Data Structure and Algorithms', 'Relational Database Management System', 'Web Development Technologies', 'Operating Systems', 'Software Engineering and Software Project Manageme'],
        sem2: ['Object Oriented Concepts and Programming', 'Web Application Development using PHP', 'Web Development Technologies with ASP.Net', 'Computer Networking', 'Electives-I (Select one: Cloud Infrastructure and '],
        sem3: ['Object Oriented Unified Modeling', 'Problem Solving using Python', 'Cross Platform Mobile Application Development', 'Internet Programming with Java', 'Electives-II (Select one: Principles of Cyber Secu'],
        sem4: ['Internship cum Industrial Project.'],
      },
    },
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
    'MA': {
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
    'BA': {
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
    'MA': {
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
    'MCA': {
      specs: ['Cloud Computing / Data Science / Cyber S'],
      syllabus: {
        sem1: ['Professional Communication Skills', 'Computer Networks & Communications', 'Data Structures & Algorithms', 'OS Concepts', 'Database Systems'],
        sem2: ['OOP', 'Data Analytics', 'Comprehensive Software Engineering', 'Professional Elective 1', '2'],
        sem3: ['Internship', 'Web Technologies', 'Essentials of Research Design', 'Professional Elective 3', '4'],
        sem4: ['Open Elective 1', '2', 'Major Project'],
      },
    },
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Data Structure Using C++', 'Advanced Database Management System', 'Operating System', 'Software Engineering', 'Business Intelligence and Its Applications'],
        sem2: ['Object Oriented Programming Using Java', 'Web Technologies', 'Python Programming', 'Mobile Programming', 'Mini Project – 1'],
        sem3: ['Software Engineering (Advanced)', 'Cryptography &amp; Network Security', 'Artificial Intelligence', 'Mobile Application Development', 'NoSQL Database'],
        sem4: ['Industry Defined Project (Internship) / Major Proj'],
      },
    },
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
    'MCA': {
      specs: ['Computer Applications'],
      syllabus: {
        sem1: ['Programming in C++', 'Advanced DBMS', 'OS', 'Software Engineering', 'Business Intelligence & Applications'],
        sem2: ['OOP using Java', 'Web Technologies', 'Python Programming', 'Mobile Programming', 'Mini Project-1'],
        sem3: ['Software Engineering Advanced', 'Cryptography & Network Security', 'AI', 'Mobile App Development', 'NoSQL Database'],
        sem4: ['Industry Defined Project (Internship)'],
      },
    },
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
    'MA': {
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
    'MA': {
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Mathematical Foundation for Computer Science', 'Computer Organization &amp; Architecture', 'Data Structures and Algorithms', 'Database Management Systems', 'Object Oriented Programming using Java'],
        sem2: ['Design and Analysis of Algorithms', 'Computer Networks', 'Operating Systems', 'Software Engineering', 'Python Programming'],
        sem3: ['Machine Learning', 'Cloud Computing', 'Big Data Analytics', 'Cryptography and Network Security', 'Professional Ethics'],
        sem4: ['Major Project.'],
      },
    },
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Computer Organization and Architecture', 'Data Structures and Algorithms', 'Mathematical Foundations of Computer Science', 'Operating System', 'Database Management Systems'],
        sem2: ['Object Oriented Programming with Java', 'Computer Networks', 'Software Engineering', 'Python Programming', 'Analysis and Design of Algorithms'],
        sem3: ['Web Technologies', 'Artificial Intelligence', 'Mobile Application Development', 'Elective 1', 'Elective 2'],
        sem4: ['Cloud Computing', 'Cyber Security', 'Major Project / Internship.'],
      },
    },
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
    'MCA': {
      specs: ['nan'],
      syllabus: {
        sem1: ['Database Management Systems', 'Computer Architecture and Organization', 'Mathematical Foundations of Computer Applications', 'Data Structures and Algorithms', 'Software Engineering'],
        sem2: ['Object Oriented Programming', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms', 'Elective I'],
        sem3: ['Data Warehousing and Data Mining', 'Web Technologies', 'Elective II', 'Elective III', 'Elective IV'],
        sem4: ['Elective V', 'Elective VI', 'Major Project'],
      },
    },
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
};

// Get program data for a university
export function getProgramData(uniId: string, program: string): ProgramData | null {
  return PROGRAMS_DATA[uniId]?.[program] || null
}

// Get all programs for a university
export function getUniversityPrograms(uniId: string): string[] {
  return Object.keys(PROGRAMS_DATA[uniId] || {})
}
