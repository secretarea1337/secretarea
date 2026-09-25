
import { CategoryData, NavItem } from './types';

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/nexa1337",
  github: "https://github.com",
  instagram: "https://instagram.com/nexa1337",
  twitter: "https://x.com",
  youtube: "https://youtube.com",
  tiktok: "https://tiktok.com/@nexa.1337"
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Secret Area', path: '/', iconName: 'Lock' },
  { label: 'Personal Space', path: '/personal-space', iconName: 'Activity' },
  { label: 'Roadmap', path: '/roadmap', iconName: 'Rocket' },
];

export const CATEGORIES: CategoryData[] = [
  {
    id: 'architecture',
    title: 'Architecture & 3D',
    shortDescription: 'Designing spaces and visualizing realities.',
    iconName: 'Building',
    color: 'orange',
    role: 'Architectural Designer & 3D Artist',
    bio: 'Merging functionality with aesthetics to create immersive 3D environments and sustainable architectural designs.',
    tools: [
      { name: 'AutoCAD', category: 'mastered', type: '2d-3d', icon: 'BrandAutoCAD' },
      { name: 'Revit', category: 'mastered', type: '2d-3d', icon: 'BrandRevit' },
      { name: 'Rhino', category: 'mastered', type: '2d-3d', icon: 'BrandRhino' },
      { name: 'Blender', category: 'mastered', type: '2d-3d', icon: 'BrandBlender' },
      { name: 'SketchUp', category: 'mastered', type: '2d-3d', icon: 'BrandSketchUp' },
      { name: 'ArchiCAD', category: 'mastered', type: '2d-3d', icon: 'BrandArchiCAD' },
      { name: '3ds Max', category: 'mastered', type: '2d-3d', icon: 'Brand3dsMax' },
      { name: 'Lumion', category: 'mastered', type: 'render', icon: 'BrandLumion' },
      { name: 'Twinmotion', category: 'mastered', type: 'render', icon: 'BrandTwinmotion' },
      { name: 'V-Ray', category: 'learning', type: 'render', icon: 'BrandVRay' },
      { name: 'Unreal Engine 5', category: 'learning', type: 'render', icon: 'BrandUnreal' },
      { name: 'D5 Render', category: 'mastered', type: 'render', icon: 'BrandD5' },
    ],
    skills: [
      { name: '2D', level: 95 },
      { name: '3D', level: 95 },
      { name: 'Render', level: 90 },
      { name: '3D Modeling', level: 95 },
      { name: 'Interior Design', level: 90 },
      { name: 'Exterior Design', level: 85 },
    ],
    certificates: [
      'Illustrator', 
      'Adobe InDesign', 
      'Photoshop 2021', 
      'Revit', 
      'Lumion', 
      'SketchUp', 
      '3ds Max', 
      'AutoCAD', 
      'ArchiCAD'
    ],
    certificatesDisclaimer: "These are my online certificates. If you have any doubts, feel free to message me and I will gladly send them to you. All of them were obtained through online learning platforms.",
    categorySocials: [
        { platform: 'Instagram', url: 'https://instagram.com/batimentartist', icon: 'Instagram' },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/marouananouar/', icon: 'Linkedin' },
        { platform: 'TikTok', url: 'https://www.tiktok.com/@batimentartist', icon: 'Tiktok' },
        { platform: 'LinkTree', url: 'https://linktr.ee/batimentartist', icon: 'Link' },
    ],
    projects: [
      {
        title: 'Modern Bathroom Design',
        description: 'Bathroom design visualized using SketchUp 2021 Pro with V-Ray 7.',
        tags: ['SketchUp', 'V-Ray', 'Bathroom'],
        images: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjUqUF7BPOYahgW2pXwKRJco3Uj3ucsYiToSTPtMkih4hcLvdWOYNXaRmWKvw8khJLMP6NmYvGrP_E2_Nx4D6-POdmXUcvefU54UDqNBuCYbS7nuoPRvHlpffqLpJLkOENYbVH_8LsPILQYddulv62y5lMSbQrj2KM8QCZ_wA9cNx4psqzAyPY4NMdX-4SJ/s2000/a%20(3).png',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhxBmyUjjixV_5ig5OpZHfwPdpfeIHwGpEUkOp3QKv1EbLDNum-Um2w4q0iS3lUExv50dZPjsPYXgHEG-k03AQRufGEoOTHTWOUPhPWk8SqIvFdSp1sAiffTWfYwKYuaZeywVTnXbF3pmbE519aNEVsjN6xAHUIo2k6LyabHGgd3CiK3kk5qxSYQJS9jH5N/s2000/a%20(4).png'
        ]
      },
      {
        title: 'Modern Kitchen Design',
        description: 'Kitchen design visualized using SketchUp 2021 Pro with V-Ray 7.',
        tags: ['SketchUp', 'V-Ray', 'Kitchen'],
        images: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjOxoVlHmIwYv0nXvMuphUDaYgBGSk0f2_go39AVNLCnvJmgMvf50k3xJMGD_YcZh6du7RqoThr2HqitS9Nz5J3W6YaGA0DEf0NDF68hE2aI8qjza9sDi1w5F7fPvMkuOkjrVkgKZhbqjCeWESkO0tcQbl5B_b_Y2NZR37ipBqndOZVtjTJxQ_EMRL99Hox/s2000/b%20(2).png',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhwe7MtR9__0EG2EHQ8tIO1ui_k0ClVOQix7isAjwoDO8E4pxU5nitsD80syMd4VfoIQpdaoeiCaynq3nRdbYNa-oQHDAqDyHGhfEEQE1VTXmK0BKbK1mFG7DZBYZx8pnAPaMD0xDmddDPbftKcxJQvGfe8o8Vu1E7P7QcDCDDSJqDAMvIn8mxkvoADgCKY/s2000/b%20(3).png'
        ]
      },
      {
        title: 'Contemporary Kitchen Concept',
        description: 'Kitchen design visualized using SketchUp 2021 Pro with V-Ray 7.',
        tags: ['SketchUp', 'V-Ray', 'Kitchen'],
        images: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5L13q_VFVdKeuGu8zxq0-EQZi_NLXvZG8lmI-WSoFJZ3kAgDk_7PYwy6cliubO8_kg0XpuQjr-ZbjkaCnAjR1_zfxLDGpt3Mz0ficEcqKeBLjaotoXZx-SM_ZMD0mgErh0uISaYSazjmr6esq-qCU3lgnfNuhtB31mVLKEN0GGgQuHaBMXgXPhETY0qpL/s770/c%20(1).png',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhD7qZb5lJEa_Qhyphenhyphenzhq2p_6Rk5n6ffVAlbMep-yw0rUWvJkIzbxV6HXLAfx_I_WmAqhsbgvhuYsGQcx4QaAnwng5o9vLhyphenhyphenpWlaeCqFjcish6FrCcLDDJOwy3qlcwR643CSQq9ebbitPmBIjznLw_K-kfnz2CG16aJRjCUp5z8mXqk7V132iRT0mRPTHaJZ3/s2000/c%20(5).png'
        ]
      },
      {
        title: 'Elegant Kitchen Space',
        description: 'Kitchen design visualized using SketchUp 2021 Pro with V-Ray 7.',
        tags: ['SketchUp', 'V-Ray', 'Kitchen'],
        images: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjFNM3sovGKtFLqiFkFyxUjDboMc152-V3JI7mEB22dpd1zl_53X0wC6ibkA5b4fphrq61YirwvL0MYdCKVM2VKxRWHF54a3b-s219bbYFkcDXFqEkdzbGlP6MP6vjWUxF5VPq3o7VDjpiEeM9ygcRaTk8hoEFae5qxorHg8Ve6BM8mIdR7cXWm_wb78KBR/s2000/d%20(2).png',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiArgYEmWfdCHUFfFkuU7GE6PQQsuDyiH06VOvl9xSjyMhyphenhyphenuKUoOA_ThhGxHRrW-Xu9p5zdGAt4wCEfK_j8lv79hzrlOzcIHJZvqaL4TfkL0mtVp3nsT-2k4J1eTyYnitjDTz5BU0R3u1hYvACZGqqIt8nQ1lKqaLnE9B57xg9KTwtnb8DXfz62hFE2Ioz2/s2000/d%20(3).png'
        ]
      }
    ],
    experience: [
        { 
          role: 'Kitchen Designer, Sales & Site Manager', 
          company: 'Catchit Groupe', 
          period: 'May 2024 - Present', 
          description: 'Contributed to kitchen and dressing design projects, creating 2D plans and 3D models. My role also involved assisting the team in site management and sales operations.' 
        },
        { 
          role: 'Building Draftsman & 3D Artist', 
          company: 'Freelance', 
          period: 'July 2023 - May 2024', 
          description: 'Worked on building design projects for various clients. These experiences allowed me to develop creativity and acquire a solid understanding of specific client needs.' 
        },
        { 
          role: 'Building Draftsman', 
          company: 'Studio Architecte', 
          period: 'Jan 2023 - July 2023', 
          description: 'Contributed to various architectural design projects, participating in plan creation and 3D modeling. Assisted the team with administrative tasks and collaborated closely with architects.' 
        },
    ],
    education: [
        { degree: 'Quantity Surveyor (Metreur)', institution: 'OFPPT', year: '2022 - 2023' },
        { degree: 'Building Drafting Technician', institution: 'OFPPT', year: '2020 - 2022' },
        { degree: 'Professional Baccalaureate (G.O)', institution: 'Lycée Batoul Sbihi (Sala Al Jadida)', year: '2017 - 2020' },
    ],
    interests: [
        { name: '3ds Max', icon: 'Brand3dsMax' },
        { name: 'Unreal Engine 5', icon: 'BrandUnreal' },
        { name: 'V-Ray', icon: 'BrandVRay' },
        { name: 'Revit', icon: 'BrandRevit' },
    ],
    resources: [
      { name: 'YouTube', url: 'https://youtube.com', type: 'Platform' },
      { name: 'edX', url: 'https://www.edx.org', type: 'Platform' },
      { name: 'Coursera', url: 'https://www.coursera.org', type: 'Platform' },
      { name: 'Udemy', url: 'https://www.udemy.com', type: 'Platform' }
    ],
    goals: ['Master Unreal Engine for ArchViz', 'Design a fully self-sustaining smart home'],
    roadmap: [
      { title: 'Architectural Degree', status: 'completed', description: 'Bachelor in Architecture' },
      { title: 'BIM Mastery', status: 'completed', description: 'Advanced Revit workflows' },
      { title: 'Interactive ArchViz', status: 'in-progress', description: 'Learning Unreal Engine 5' },
      { title: 'VR Integration', status: 'planned', description: 'Walkthroughs with Oculus' }
    ]
  },
  {
    id: 'it-cybersecurity',
    title: 'IT & Cybersecurity',
    shortDescription: 'Securing networks and optimizing systems.',
    iconName: 'Shield',
    color: 'blue',
    role: 'IT Specialist & Security Analyst',
    bio: 'Passionate about programming, backend development, and cybersecurity, especially red teaming. Self-taught, no school. Love working with computers and diving into their complexities.',
    tools: [
      // Security Tools
      { name: 'Kali Linux', category: 'mastered', type: 'security', icon: 'Kali' },
      { name: 'Nmap', category: 'mastered', type: 'security', icon: 'Network' },
      { name: 'Metasploit', category: 'mastered', type: 'security', icon: 'Metasploit' },
      { name: 'Burp Suite', category: 'mastered', type: 'security', icon: 'Bug' },
      { name: 'Wireshark', category: 'mastered', type: 'security', icon: 'Wireshark' },
      { name: 'OpenVAS', category: 'learning', type: 'security', icon: 'Shield' },
      { name: 'OWASP ZAP', category: 'mastered', type: 'security', icon: 'Zap' },
      { name: 'SQLmap', category: 'mastered', type: 'security', icon: 'Database' },
      { name: 'Nikto', category: 'mastered', type: 'security', icon: 'Bug' },
      { name: 'Hashcat', category: 'mastered', type: 'security', icon: 'Key' },
      { name: 'John the Ripper', category: 'mastered', type: 'security', icon: 'Lock' },
      { name: 'Aircrack-ng', category: 'mastered', type: 'security', icon: 'Wifi' },
      { name: 'SET', category: 'learning', type: 'security', icon: 'Users' }, // Social-Engineer Toolkit
      
      // Languages
      { name: 'PHP', category: 'mastered', type: 'language', icon: 'BrandPHP' },
      { name: 'Laravel', category: 'mastered', type: 'language', icon: 'BrandLaravel' },
      { name: 'Flutter', category: 'mastered', type: 'language', icon: 'BrandFlutter' },
      { name: 'Dart', category: 'mastered', type: 'language', icon: 'BrandDart' },
      { name: 'Python', category: 'mastered', type: 'language', icon: 'BrandPython' },
      { name: 'MySQL', category: 'mastered', type: 'other', icon: 'BrandMySQL' }
    ],
    skills: [
      { name: 'A+', level: 90 },
      { name: 'Cs50', level: 95 },
      { name: 'CCNA', level: 85 },
      { name: 'CEH', level: 80 },
      { name: 'Linux', level: 90 },
      { name: 'Server', level: 85 },
      { name: 'Others', level: 90 }
    ],
    certificates: [
      'Flutter from VCN',
      'Million Prompters from Dubai Future Foundation',
      'JavaScript from Coursatak',
      'HTML JS CSS from Coursatak',
      'Manage Security Risks from Google',
      'CEH from Cisco',
      'Cybersecurity from Google',
      'Back End Dev from Meta',
      'Cybersecurity from IBM',
      'Ethical Hacking from SkillUp',
      'IT and Cybersecurity from Cybrary',
      'Advanced WordPress from Maarif Edu'
    ],
    certificatesDisclaimer: "These are my online certificates. If you have any doubts, feel free to message me and I will gladly send them to you. All of them were obtained through online learning platforms.",
    projects: [], 
    resources: [
      { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'Platform' },
      { name: 'HackTheBox', url: 'https://www.hackthebox.com', type: 'Platform' },
      { name: 'Cybrary', url: 'https://www.cybrary.it', type: 'Academy' },
      { name: 'Udemy', url: 'https://www.udemy.com', type: 'Course' }
    ],
    services: [
      'Mobile App Flutter',
      'Back-end php & Laravel',
      'Ai automation & Ai agent N8N',
      'CyberSecurity'
    ],
    goals: ['Obtain OSCP Certification', 'Build a custom SIEM solution'],
    roadmap: [
      { title: 'Level 1: The Foundation', status: 'completed', description: 'Mastering the OSI Model, TCP/IP, and Linux basics.', icon: 'Server' },
      { title: 'Level 2: Coding Powers', status: 'completed', description: 'Acquiring Python, PHP, and Bash scripting skills for automation.', icon: 'Code' },
      { title: 'Level 3: Mobile Expansion', status: 'in-progress', description: 'Unlocking Cross-Platform Dev with Flutter & Dart.', icon: 'Smartphone' },
      { title: 'Level 4: Red Team Ops', status: 'in-progress', description: 'Executing CTF challenges and simulating advanced threats.', icon: 'Skull' },
      { title: 'Boss Level: OSCP', status: 'planned', description: 'The ultimate 24-hour hacking challenge.', icon: 'Trophy' }
    ],
    interests: [
      { name: 'N8N', icon: 'BrandN8N' },
      { name: 'PHP', icon: 'BrandPHP' },
      { name: 'Laravel', icon: 'BrandLaravel' },
      { name: 'Flutter', icon: 'BrandFlutter' }
    ],
    mindMapDevelopment: {
      title: "My MindMap Development",
      description: "Mapping skills in back-end and mobile app development for seamless, efficient, and innovative digital experiences. Elevating functionality harmoniously.",
      nodes: [
        { category: "Cross-Platform", name: "DART", description: "Dart is a programming language developed by Google.", icon: "BrandDart" },
        { category: "Cross-Platform", name: "Flutter", description: "UI toolkit for building natively compiled applications.", icon: "BrandFlutter" },
        { category: "Back-End", name: "PHP", description: "Server-side scripting language.", icon: "BrandPHP" },
        { category: "Back-End", name: "Laravel", description: "PHP framework for web development.", icon: "BrandLaravel" },
        { category: "Back-End", name: "APIs", description: "Interface for software interactions.", icon: "Network" },
        { category: "Back-End", name: "MySQL/SQL", description: "Database systems.", icon: "BrandMySQL" }
      ]
    },
    mindMapCyberSecurity: {
      title: "My MindMap CyberSecurity",
      description: "Mapped offensive cybersecurity skills for strategic penetration testing, ethical hacking, and proactive threat mitigation.",
      nodes: [
        { category: "JUNIOR PENTESTER", name: "EJPT", description: "ELEARNSECURITY JUNIOR PENTESTER", icon: "Award" },
        { category: "JUNIOR PENTESTER", name: "PENTEST+", description: "CompTIA+", icon: "ShieldCheck" },
        { category: "JUNIOR PENTESTER", name: "OSCP", description: "OFFENSIVE SECURITY CERTIFIED PROFESSIONAL", icon: "Trophy" },
        { category: "PENETRATION TESTER", name: "AWAE", description: "ADVANCED WEB ATTACKS AND EXPLOITATION", icon: "Code2" },
        { category: "PENETRATION TESTER", name: "OSCE", description: "OFFENSIVE SECURITY CERTIFIED EXPERT", icon: "Award" },
        { category: "PENETRATION TESTER", name: "GIAC GPEN", description: "GLOBAL INFO ASSURANCE CERTIFICATION", icon: "Award" },
        { category: "REDTEAM", name: "OS", description: "LINUX+, WIN, ANDROID, MCSA", icon: "BrandLinux" },
        { category: "REDTEAM", name: "NETWORKING", description: "CCNA . NETWORK+", icon: "Wifi" },
        { category: "REDTEAM", name: "PROGRAMMING", description: "PYTHON, RUBY, BASH", icon: "BrandPython" },
        { category: "REDTEAM", name: "SECURITY+", description: "CompTIA+", icon: "Shield" },
        { category: "REDTEAM", name: "CRTP/CRTE", description: "CERTIFIED RED TEAM PROFESSIONAL", icon: "Award" },
        { category: "REDTEAM", name: "OSEP", description: "OFFENSIVE SECURITY EXPERT PROFESSIONAL", icon: "Award" },
        { category: "REDTEAM", name: "CEH", description: "CERTIFIED ETHICAL HACKER", icon: "BrandCEH" },
        { category: "REDTEAM", name: "CISSP", description: "CERTIFIED INFO SYSTEMS SECURITY PRO", icon: "Award" }
      ]
    }
  },
  {
    id: 'gaming',
    title: 'Gaming',
    shortDescription: 'Exploring worlds and creating new ones.',
    iconName: 'Gamepad2',
    color: 'purple',
    role: 'Gamer & Game Developer',
    bio: 'From competitive gaming to creating my own worlds using modern game engines. I analyze mechanics, explore narratives, and build my own experiences.',
    categorySocials: [
        { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' },
        { platform: 'TikTok', url: 'https://tiktok.com', icon: 'Tiktok' },
        { platform: 'Kick', url: 'https://kick.com', icon: 'Kick' }, 
    ],
    tools: [
      { name: 'Unity', category: 'learning', icon: 'BrandUnity' },
      { name: 'Unreal Engine', category: 'learning', icon: 'BrandUnreal' },
      { name: 'Godot', category: 'learning', icon: 'BrandGodot' },
      { name: 'C#', category: 'learning', icon: 'Code' },
      { name: 'Blender', category: 'learning', icon: 'BrandBlender' },
      { name: 'VS Code', category: 'mastered', icon: 'BrandVSCode' },
      { name: 'GitHub', category: 'mastered', icon: 'BrandGithub' },
      { name: 'Steam', category: 'mastered', icon: 'BrandSteam' }
    ],
    skills: [
      { name: 'Technical Skills', level: 85 },
      { name: 'Creative & Design Skills', level: 90 },
      { name: 'Soft Skills & Mindset', level: 95 }
    ],
    certificates: [],
    projects: [
      {
        title: 'Project: Void Runner',
        description: 'Endless runner concept built in Unity.',
        tags: ['Unity', 'C#', 'Mobile'],
        images: ['https://picsum.photos/seed/game1/600/400']
      }
    ],
    resources: [
      { name: 'Unreal Engine', url: 'https://dev.epicgames.com/community/unreal-engine/learning', type: 'Platform' },
      { name: 'Unity', url: 'https://learn.unity.com', type: 'Platform' },
      { name: 'YouTube', url: 'https://youtube.com', type: 'Video' },
      { name: 'Godot', url: 'https://www.gdquest.com/tutorial/godot/', type: 'Platform' }
    ],
    goals: ['Release first indie game on Steam', 'Build a gaming community'],
    roadmap: [
      { title: '1. Fundamentals', status: 'completed', description: 'Programming Logic, Algorithms, C# Basics & OOP.', icon: 'Code' },
      { title: '2. The First Engine', status: 'completed', description: 'Mastering Unity Interface, Physics, and Prefabs.', icon: 'BrandUnity' },
      { title: '3. Core Mechanics', status: 'in-progress', description: 'Player Controllers, Input Systems, and UI implementation.', icon: 'Gamepad' },
      { title: '4. Advanced Systems', status: 'in-progress', description: 'Save Systems, Inventory, and Design Patterns.', icon: 'Database' },
      { title: '5. Polish & Juice', status: 'planned', description: 'Shaders, VFX, Post-Processing, and Sound Design.', icon: 'Zap' },
      { title: '6. Multiplayer', status: 'planned', description: 'Netcode, Replication, and Server Authority.', icon: 'Globe' },
      { title: '7. Publishing', status: 'planned', description: 'Marketing, Store Optimization, and Release on Steam/Itch.', icon: 'Rocket' },
      { title: '8. Post-Launch', status: 'planned', description: 'Updates, DLCs, community feedback integration, and bug patches.', icon: 'Activity' }
    ],
    gamingMarketStats: [
      { year: '2026', arabGrowth: 19, globalGrowth: 9, avgSalaryArab: 45000, avgSalaryGlobal: 85000 },
      { year: '2027', arabGrowth: 22, globalGrowth: 8, avgSalaryArab: 48500, avgSalaryGlobal: 88400 },
      { year: '2028', arabGrowth: 25, globalGrowth: 8, avgSalaryArab: 53000, avgSalaryGlobal: 91900 },
      { year: '2029', arabGrowth: 24, globalGrowth: 7, avgSalaryArab: 57500, avgSalaryGlobal: 95500 },
      { year: '2030', arabGrowth: 23, globalGrowth: 7, avgSalaryArab: 62000, avgSalaryGlobal: 99300 },
      { year: '2031', arabGrowth: 21, globalGrowth: 6, avgSalaryArab: 67000, avgSalaryGlobal: 103200 },
      { year: '2032', arabGrowth: 20, globalGrowth: 6, avgSalaryArab: 71500, avgSalaryGlobal: 107300 },
      { year: '2033', arabGrowth: 18, globalGrowth: 5, avgSalaryArab: 76000, avgSalaryGlobal: 111500 },
      { year: '2034', arabGrowth: 17, globalGrowth: 5, avgSalaryArab: 80000, avgSalaryGlobal: 115900 },
      { year: '2035', arabGrowth: 16, globalGrowth: 5, avgSalaryArab: 85000, avgSalaryGlobal: 120500 },
    ],
    bestGames: [
      {
        platform: '2026 Picks',
        icon: 'Rocket',
        games: [
          { name: 'GTA VI', image: 'https://media-rockstargames-com.akamaized.net/rockstargames-newsite/img/global/games/fob/640/GTAVI.jpg', status: 'backlog' },
          { name: 'The Witcher 4', image: 'https://upload.wikimedia.org/wikipedia/en/e/e8/The_Witcher_4_Teaser.jpg', status: 'backlog' },
          { name: 'Elder Scrolls VI', image: 'https://upload.wikimedia.org/wikipedia/en/d/d3/The_Elder_Scrolls_VI_logo.png', status: 'backlog' },
          { name: 'Mass Effect 5', image: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Mass_Effect_Will_Continue_poster.jpg', status: 'backlog' },
          { name: 'Death Stranding 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x3d.jpg', status: 'backlog' },
          { name: 'Borderlands 4', image: 'https://upload.wikimedia.org/wikipedia/en/9/91/Borderlands_4_cover_art.jpg', status: 'backlog' },
          { name: 'Doom: Dark Ages', image: 'https://upload.wikimedia.org/wikipedia/en/6/6d/Doom_The_Dark_Ages_cover_art.jpg', status: 'backlog' },
          { name: 'Metroid Prime 4', image: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Metroid_Prime_4_logo.png', status: 'backlog' }
        ]
      },
      {
        platform: 'PC',
        icon: 'BrandWindows',
        games: [
          { name: 'Cyberpunk 2077', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjs.jpg', status: 'played' },
          { name: 'Red Dead Redemption 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.jpg', status: 'played' },
          { name: 'The Witcher 3: Wild Hunt', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg', status: 'played' },
          { name: 'Elden Ring', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg', status: 'played' },
          { name: 'Valorant', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2y28.jpg', status: 'playing' },
          { name: 'Minecraft', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg', status: 'played' },
          { name: 'Grand Theft Auto V', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg', status: 'played' },
          { name: 'Baldur\'s Gate 3', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg', status: 'playing' },
          { name: 'Hades II', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co83h2.jpg', status: 'backlog' },
          { name: 'Counter-Strike 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6y2m.jpg', status: 'played' },
          { name: 'Dota 2', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900_2x.jpg', status: 'played' },
          { name: 'League of Legends', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/League_of_Legends_2019_vector.svg', status: 'played' },
          { name: 'Apex Legends', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wz4.jpg', status: 'played' },
          { name: 'Overwatch 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5p.jpg', status: 'played' },
          { name: 'Rust', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7d.jpg', status: 'backlog' },
          { name: 'Terraria', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1trc.jpg', status: 'played' },
          { name: 'Stardew Valley', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x77.jpg', status: 'played' },
          { name: 'Factorio', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x72.jpg', status: 'backlog' },
          { name: 'Civilization VI', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x76.jpg', status: 'played' },
          { name: 'MS Flight Simulator', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3v.jpg', status: 'played' },
          { name: 'Doom Eternal', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7h.jpg', status: 'played' },
          { name: 'Half-Life: Alyx', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7i.jpg', status: 'played' },
          { name: 'Portal 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7k.jpg', status: 'played' },
          { name: 'Skyrim SE', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7l.jpg', status: 'played' },
          { name: 'Fallout 4', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7m.jpg', status: 'played' },
          { name: 'Monster Hunter: World', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7n.jpg', status: 'played' },
          { name: 'RE4 Remake', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7o.jpg', status: 'played' },
          { name: 'Tekken 8', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7p.jpg', status: 'playing' },
          { name: 'Street Fighter 6', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7q.jpg', status: 'played' },
          { name: 'Palworld', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7r.jpg', status: 'played' }
        ]
      },
      {
        platform: 'PlayStation 4/5',
        icon: 'BrandPlaystation',
        games: [
          { name: 'God of War Ragnarok', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg', status: 'played' },
          { name: 'Marvel\'s Spider-Man 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6k7z.jpg', status: 'played' },
          { name: 'The Last of Us Part I', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5xex.jpg', status: 'played' },
          { name: 'Ghost of Tsushima', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2crj.jpg', status: 'played' },
          { name: 'Horizon Forbidden West', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wi.jpg', status: 'played' },
          { name: 'Bloodborne', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rba.jpg', status: 'backlog' },
          { name: 'Uncharted 4', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7w.jpg', status: 'played' },
          { name: 'FF VII Rebirth', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6702.jpg', status: 'playing' },
          { name: 'Ratchet & Clank: Rift Apart', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k35.jpg', status: 'played' },
          { name: 'Gran Turismo 7', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wp.jpg', status: 'played' },
          { name: 'Demon\'s Souls', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m37.jpg', status: 'played' },
          { name: 'Returnal', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m38.jpg', status: 'played' },
          { name: 'TLOU Part II', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m39.jpg', status: 'played' },
          { name: 'Astro\'s Playroom', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3a.jpg', status: 'played' },
          { name: 'Spider-Man: MM', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3b.jpg', status: 'played' },
          { name: 'GoT Director\'s Cut', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3c.jpg', status: 'played' },
          { name: 'Death Stranding DC', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3d.jpg', status: 'played' },
          { name: 'Final Fantasy XVI', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x3e.jpg', status: 'played' },
          { name: 'Stellar Blade', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x3f.jpg', status: 'playing' },
          { name: 'Rise of the Ronin', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5x3g.jpg', status: 'played' },
          { name: 'Shadow of Colossus', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7x.jpg', status: 'played' },
          { name: 'The Last Guardian', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7y.jpg', status: 'backlog' },
          { name: 'Days Gone', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7z.jpg', status: 'played' },
          { name: 'Until Dawn', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r80.jpg', status: 'played' },
          { name: 'Detroit: Become Human', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r81.jpg', status: 'played' },
          { name: 'Infamous Second Son', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r82.jpg', status: 'played' },
          { name: 'Sackboy', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3e.jpg', status: 'played' },
          { name: 'Kena: Bridge of Spirits', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3f.jpg', status: 'played' },
          { name: 'Sifu', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3g.jpg', status: 'played' },
          { name: 'Helldivers 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3h.jpg', status: 'playing' }
        ]
      },
      {
        platform: 'Xbox Series X',
        icon: 'BrandXbox',
        games: [
          { name: 'Halo Infinite', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4b7u.jpg', status: 'played' },
          { name: 'Forza Horizon 5', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4gcm.jpg', status: 'played' },
          { name: 'Starfield', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co64gc.jpg', status: 'playing' },
          { name: 'Gears 5', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2y29.jpg', status: 'played' },
          { name: 'Sea of Thieves', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2crq.jpg', status: 'played' },
          { name: 'Forza Motorsport', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3i.jpg', status: 'played' },
          { name: 'Halo MCC', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3j.jpg', status: 'played' },
          { name: 'Gears Tactics', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3k.jpg', status: 'played' },
          { name: 'Hellblade II', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3l.jpg', status: 'played' },
          { name: 'Hi-Fi RUSH', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3m.jpg', status: 'played' },
          { name: 'Pentiment', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3n.jpg', status: 'backlog' },
          { name: 'Grounded', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3o.jpg', status: 'played' },
          { name: 'Ori Will of Wisps', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3p.jpg', status: 'played' },
          { name: 'Psychonauts 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3q.jpg', status: 'played' },
          { name: 'MS Flight Sim Xbox', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3r.jpg', status: 'played' },
          { name: 'State of Decay 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3s.jpg', status: 'played' },
          { name: 'Quantum Break', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3t.jpg', status: 'played' },
          { name: 'Sunset Overdrive', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3u.jpg', status: 'played' },
          { name: 'Rare Replay', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3v.jpg', status: 'backlog' },
          { name: 'Killer Instinct', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3w.jpg', status: 'played' },
          { name: 'Fable III', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3x.jpg', status: 'played' },
          { name: 'Crackdown 3', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3y.jpg', status: 'played' },
          { name: 'As Dusk Falls', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m3z.jpg', status: 'played' },
          { name: 'Scorn', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m40.jpg', status: 'played' },
          { name: 'High On Life', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m41.jpg', status: 'played' },
          { name: 'Palworld Xbox', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m42.jpg', status: 'played' },
          { name: 'Avowed', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m43.jpg', status: 'backlog' },
          { name: 'Indiana Jones', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m44.jpg', status: 'backlog' },
          { name: 'S.T.A.L.K.E.R. 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m45.jpg', status: 'backlog' },
          { name: 'Age of Empires IV', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2m46.jpg', status: 'played' }
        ]
      },
      {
        platform: 'PS Vita',
        icon: 'Gamepad2',
        games: [
          { name: 'Persona 4 Golden', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1n1x.jpg', status: 'played' },
          { name: 'Uncharted: Golden Abyss', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.jpg', status: 'played' },
          { name: 'Gravity Rush', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t65.jpg', status: 'played' },
          { name: 'Killzone: Mercenary', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7i.jpg', status: 'played' },
          { name: 'Tearaway', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7j.jpg', status: 'played' },
          { name: 'LittleBigPlanet Vita', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7k.jpg', status: 'played' },
          { name: 'WipEout 2048', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7l.jpg', status: 'played' },
          { name: 'Dragon\'s Crown', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7m.jpg', status: 'played' },
          { name: 'Odin Sphere', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7n.jpg', status: 'played' },
          { name: 'Soul Sacrifice Delta', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7o.jpg', status: 'played' },
          { name: 'Freedom Wars', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7p.jpg', status: 'played' },
          { name: 'Tales of Hearts R', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7q.jpg', status: 'played' },
          { name: 'Ys: Memories', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7r.jpg', status: 'played' },
          { name: 'Danganronpa 1', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7s.jpg', status: 'played' },
          { name: 'Danganronpa 2', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7t.jpg', status: 'played' },
          { name: 'Steins;Gate', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7u.jpg', status: 'played' },
          { name: 'Muramasa Rebirth', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7v.jpg', status: 'played' },
          { name: 'Velocity 2X', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7w.jpg', status: 'played' },
          { name: 'Severed', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7x.jpg', status: 'played' },
          { name: 'Hotline Miami', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7y.jpg', status: 'played' },
          { name: 'Binding of Isaac', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7z.jpg', status: 'played' },
          { name: 'Shovel Knight', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r80.jpg', status: 'played' },
          { name: 'Rayman Origins', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r81.jpg', status: 'played' },
          { name: 'Rayman Legends', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r82.jpg', status: 'played' },
          { name: 'Sly Cooper: TiT', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r83.jpg', status: 'played' },
          { name: 'Unit 13', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r84.jpg', status: 'played' },
          { name: 'NFS Most Wanted', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r85.jpg', status: 'played' },
          { name: 'Minecraft Vita', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r86.jpg', status: 'played' },
          { name: 'Stardew Valley', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r87.jpg', status: 'played' },
          { name: 'MGS HD Collection', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r88.jpg', status: 'played' }
        ]
      }
    ],
    gameBuildProcess: [
      { title: '1. Ideation & GDD', description: 'Defining core loop, target audience, mechanics, and writing the Game Design Document.', icon: 'FileText' },
      { title: '2. Prototyping', description: 'Greyboxing levels, implementing basic physics/movement to test "Fun Factor" without art.', icon: 'Box' },
      { title: '3. Vertical Slice', description: 'Creating a polished playable demo of 5-10 minutes to prove the concept and art style.', icon: 'CheckCircle' },
      { title: '4. Production (Alpha)', description: 'Asset generation (3D/2D), level design, coding systems, and implementing UI/UX.', icon: 'Code' },
      { title: '5. Polish (Beta)', description: 'Adding "Juice" (VFX, Screen Shake), Sound Design, Lighting, and Optimization.', icon: 'Zap' },
      { title: '6. QA & Debugging', description: 'Rigorous playtesting, fixing bugs, and performance profiling.', icon: 'Bug' },
      { title: '7. Publishing & Marketing', description: 'Steam page setup, Trailer creation, Community building (Discord), and Launch.', icon: 'Rocket' },
      { title: '8. Post-Launch', description: 'Updates, DLCs, community feedback integration, and bug patches.', icon: 'Activity' }
    ],
    gameDevToolsList: [
      { name: 'Unity Personal', type: 'Free', description: 'Primary Game Engine', icon: 'BrandUnity' },
      { name: 'Unreal Engine 5', type: 'Free', description: 'High-Fidelity 3D', icon: 'BrandUnreal' },
      { name: 'Godot', type: 'Free', description: 'Open Source 2D/3D', icon: 'BrandGodot' },
      { name: 'Blender', type: 'Free', description: '3D Modeling & Animation', icon: 'BrandBlender' },
      { name: 'Visual Studio', type: 'Free', description: 'C# IDE', icon: 'BrandVSCode' },
      { name: 'Substance Painter', type: 'Paid', description: 'Texturing', icon: 'BrandAdobe' },
      { name: 'FMOD', type: 'Free', description: 'Audio Middleware', icon: 'Video' },
      { name: 'Steamworks', type: 'Free', description: 'Distribution', icon: 'BrandSteam' }
    ]
  },
  {
    id: 'business',
    title: 'N E X A 1337',
    shortDescription: 'Modern technology, creative design, and performance-driven strategies.',
    iconName: 'Briefcase',
    color: 'emerald',
    role: 'Founder',
    bio: 'At N E X A 1337, we help brands unlock their full potential through modern technology, creative design, and performance-driven strategies. Our team turns complex challenges into simple, scalable digital solutions, helping you grow smarter and faster.',
    categorySocials: [
      { platform: 'Instagram', url: 'https://instagram.com/nexa1337', icon: 'Instagram' },
      { platform: 'TikTok', url: 'https://tiktok.com/@nexa.1337', icon: 'Tiktok' },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/nexa1337', icon: 'Linkedin' },
    ],
    tools: [
      { name: 'Notion', category: 'mastered', icon: 'FileText' },
      { name: 'Shopify', category: 'learning', icon: 'ShoppingBag' },
      { name: 'Google Analytics', category: 'mastered', icon: 'BarChart' },
      { name: 'WooCommerce', category: 'mastered', icon: 'BrandWooCommerce' },
      { name: 'N8N', category: 'learning', icon: 'BrandN8N' },
      { name: 'Zapier', category: 'mastered', icon: 'BrandZapier' }
    ],
    skills: [
      { name: 'Project Management', level: 85 },
      { name: 'Digital Marketing', level: 75 },
      { name: 'Branding', level: 90 }
    ],
    certificates: [
      'How to Grow Your Business The right Way from VCN',
      'Communication Skills from Vertex',
      'Digital Marketing and Personal Branding From VCN',
      'Digital Marketing From Meta',
      'Digital Marketing and E-Commerce From Google',
      'Social media Marketing From HP'
    ],
    certificatesDisclaimer: "These are my online certificates. If you have any doubts, feel free to message me and I will gladly send them to you. All of them were obtained through online learning platforms.",
    projects: [
      {
        title: 'N E X A 1337 Agency',
        description: 'Digital agency providing 3D and Web solutions.',
        tags: ['Business', 'Startup'],
        images: ['https://picsum.photos/seed/biz1/600/400']
      }
    ],
    resources: [],
    goals: ['Scale N E X A 1337 to 10 employees', 'Launch a SaaS product'],
    roadmap: [
      { title: 'Phase 1: The Genesis', status: 'completed', description: 'Starting from zero. Building the core philosophy, defining the brand identity of N E X A 1337, and securing the first loyal clients through pure value delivery.', icon: 'Rocket' },
      { title: 'Phase 2: Digital Foundation', status: 'completed', description: 'Establishing a robust digital presence. Mastering WordPress, Shopify, and Branding to empower small businesses to stand out online.', icon: 'Building' },
      { title: 'Phase 3: The AI Revolution', status: 'in-progress', description: 'Integrating N8N, Automation, and AI Agents to scale operations. Transforming from a service provider to a tech-driven efficiency partner.', icon: 'Bot' },
      { title: 'Phase 4: Global Ecosystem', status: 'planned', description: 'Expanding to a global scale. Reaching 1M+ clients worldwide by creating a self-sustaining ecosystem of digital products, SaaS solutions, and automated growth engines.', icon: 'Globe' }
    ],
    nexaServices: [
        { title: 'AI Chatbots & Assistants', description: 'AI Chatbots', price: '$150/mo', discount: '20% OFF', category: 'AI & AUTOMATION' },
        { title: 'Workflow Automation & AI Agents', description: 'Workflow Automation', price: '$1500', discount: '30% OFF', category: 'AI & AUTOMATION' },
        { title: 'Custom Websites', description: 'Custom Websites', price: '$1500', discount: '20% OFF', category: 'WEB PRODUCT' },
        { title: 'Landing Pages & CRD', description: 'Landing Pages', price: '$999', discount: '25% OFF', category: 'WEB PRODUCT' },
        { title: 'Social Media Management', description: 'Social Media', price: '$299/mo', discount: '20% OFF', category: 'MARKETING & ACQUISITION' },
        { title: 'Media Buying (Ads)', description: 'Media Buying', price: '$500/mo', discount: '15% OFF', category: 'MARKETING & ACQUISITION' },
        { title: 'Brand Identity & Design System', description: 'Brand Identity', price: '$699', discount: '25% OFF', category: 'BRAND & CONTENT' },
        { title: 'Content Production', description: 'Reels/UGC/Blog', price: '$299/mo', discount: '20% OFF', category: 'BRAND & CONTENT' },
    ],
    nexaProjects: [
        { 
          title: 'Premium Car Rental WordPress Theme', 
          description: 'Take your car rental or car hire business to the next level ...', 
          category: 'web', 
          image: 'https://demo.awaikenthemes.com/landing/wp-content/uploads/2024/07/novaride-light-1.jpg',
          fullDescription: 'Launch your car rental business online with style and confidence. Our premium Car Rental WordPress Theme gives you a modern, high-converting website that turns visitors into loyal customers. Designed for performance, speed, and mobile experience, it helps you showcase your vehicles, manage bookings easily, and build trust with a professional design that reflects your brand. Whether you rent cars, bikes, or scooters, this theme has everything you need to grow your business and stand out from the competition.',
          client: 'Car Rental',
          sales: '150+',
          delivery: '3-4 weeks',
          revisions: '3',
          included: 'Full Website, 3 Months Support, Documentation',
          includedDetails: [
            'Full project implementation',
            '3 months of technical support',
            'Complete documentation',
            'Training materials',
            'Source code access',
            'Deployment assistance'
          ],
          technologies: 'Php, Wordpress',
          gallery: [
             'https://demo.awaikenthemes.com/landing/wp-content/uploads/2024/07/novaride-light-1.jpg',
             'https://rentic.axiomthemes.com/splash/src/img/demo/1.jpg',
             'https://limodrive.wpthemeverse.com/wp-content/uploads/2024/10/limodrive_home1.png',
             'https://luxedrive.qodeinteractive.com/wp-content/uploads/2023/03/l-img-2.jpg',
             'https://autozone.templines.com/wp-content/uploads/2025/08/autozone-envato-themes-com_Or4yz0qz.webp'
          ]
        },
        { 
          title: 'Premium Health & Medical WordPress Theme', 
          description: 'Build trust and attract more patients with a clean, professional, and modern ...', 
          category: 'web', 
          image: 'https://neoocular.qodeinteractive.com/wp-content/uploads/2021/10/landing-img-01-main-home-1.jpg',
          fullDescription: 'Build trust and attract more patients with a clean, professional, and modern Medical WordPress Theme. Designed for doctors, clinics, hospitals, and healthcare professionals, this theme helps you create a reliable online presence that inspires confidence. With easy appointment booking, service pages, and a mobile-friendly design, you can showcase your expertise, highlight your team, and grow your medical practice effortlessly. Fast, SEO-ready, and fully customizable, everything you need to make your healthcare website stand out.',
          client: 'Health & Medical',
          sales: '200+',
          delivery: '2-3 weeks',
          revisions: '2',
          included: 'Full Website, 3 Months Support, SEO Setup',
          includedDetails: [
            'Full project implementation',
            '3 months of technical support',
            'Complete documentation',
            'Training materials',
            'Source code access',
            'Deployment assistance'
          ],
          technologies: 'Php, Wordpress',
          gallery: [
            'https://neoocular.qodeinteractive.com/wp-content/uploads/2021/10/landing-img-01-main-home-1.jpg',
            'https://denticare.bold-themes.com/wp-content/uploads/2020/03/main_demo_allen.png',
            'https://denticare.bold-themes.com/wp-content/uploads/2020/03/main_demo_oscar.png'
          ]
        },
        { 
          title: 'Premium Beauty & Hairdressers WordPress Theme', 
          description: 'Create a stunning online presence for your beauty salon, spa, or hairdressing ...', 
          category: 'web', 
          image: 'https://spalabele.wpengine.com/wp-content/uploads/2023/07/home-1-768x1024.jpg',
          fullDescription: 'Create a stunning online presence for your beauty salon, spa, or hairdressing studio with a modern and elegant Beauty & Hairdresser WordPress Theme. Designed to attract and convert, this theme helps you showcase your services, display pricing, and let clients book appointments with ease. Fully responsive, fast, and easy to customize — it gives your business the luxury look it deserves while making your brand shine online. Perfect for salons, makeup artists, barbers, and wellness professionals who want to grow their client base and stand out in style.',
          client: 'Beauty & Hairdressers',
          sales: '180+',
          delivery: '2-3 weeks',
          revisions: '3',
          included: 'Full Website, 3 Months Support, Booking System',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Php, Wordpress',
          gallery: [
            'https://spalabele.wpengine.com/wp-content/uploads/2023/07/home-1-768x1024.jpg',
            'https://reina.qodeinteractive.com/wp-content/uploads/2020/12/landing-iwt-img3.jpg',
            'https://reina.qodeinteractive.com/wp-content/uploads/2020/12/landing-iwt-img8.jpg',
            'https://curly.qodeinteractive.com/wp-content/uploads/2018/05/landing-home-img-1.jpg',
            'https://curly.qodeinteractive.com/wp-content/uploads/2018/05/landing-home-img-4.jpg'
          ]
        },
        { 
          title: 'Premium Local Restaurants & Cafes WordPress Theme', 
          description: 'Give your restaurant or café the online presence it deserves with ...', 
          category: 'web', 
          image: 'https://patiotime.loftocean.com/wp-content/uploads/2022/05/home-04-2.jpg',
          fullDescription: 'Give your restaurant or café the online presence it deserves with a modern, appetizing, and fully responsive Restaurant & Café WordPress Theme. Designed to attract hungry customers, it helps you showcase your menu, highlight special dishes, and let visitors book tables or order online with ease. Fast, SEO-optimized, and simple to customize, this theme delivers the perfect blend of design and functionality, helping your local business stand out, grow your reservations, and turn visitors into loyal customers.',
          client: 'Local Restaurants & Cafes',
          sales: '220+',
          delivery: '2-3 weeks',
          revisions: '3',
          included: 'Full Website, 3 Months Support, Online Ordering',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Php, Wordpress',
          gallery: [
             'https://patiotime.loftocean.com/wp-content/uploads/2022/05/home-04-2.jpg',
             'https://patiotime.loftocean.com/wp-content/uploads/2022/10/home-10.jpg',
             'https://caverta.matchthemes.com/wp-content/uploads/2023/12/caverta-cafe-restaurant-theme.jpg',
             'https://jimmie.qodeinteractive.com/wp-content/uploads/2023/04/land-home-01.jpg',
             'https://jimmie.qodeinteractive.com/wp-content/uploads/2023/04/land-home-03.jpg'
          ]
        },
        { 
          title: 'Premium Social Media Branding', 
          description: 'Transform your brand’s online presence with eye-catching social media designs ...', 
          category: 'branding', 
          image: 'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs3/209131124/original/7b4c7b2c3edf94bc91118305357a4b0cdfd4a06c/canva-template-presentation-social-media-posts-flyer-brochure-menu-design.png',
          fullDescription: 'Transform your brand’s online presence with eye-catching social media designs that capture attention and build trust instantly. From Instagram to Facebook, every post, story, and ad is crafted to reflect your brand’s identity, boost engagement, and attract loyal followers. Whether you’re launching a product, promoting a service, or growing your audience, our professional designs help you stand out in the feed and turn every scroll into a potential customer. Make your brand unforgettable, start with visuals that speak success.',
          client: 'All Business',
          sales: '300+',
          delivery: '1-2 weeks',
          revisions: '2',
          included: 'Social Media Kit, 10 Posts, Story Templates',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Photoshop, Canva pro, ai tools',
          gallery: [
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs3/209131124/original/7b4c7b2c3edf94bc91118305357a4b0cdfd4a06c/canva-template-presentation-social-media-posts-flyer-brochure-menu-design.png',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/165968954/original/406ea3e699b97ac101049fd7797013e372891edb/create-flyer-for-social-media-posts-and-products.png',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/209131124/original/3f54b35d0f65194f3c8130e7280dca937b7a8330/canva-template-presentation-social-media-posts-flyer-brochure-menu-design.png',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/209131124/original/43094e52b6ed0807eb1b2b470439b2567f59a4a1/canva-template-presentation-social-media-posts-flyer-brochure-menu-design.png'
          ]
        },
        { 
          title: 'Premium social media advertising', 
          description: 'Reach the right audience and grow your business faster with powerful social media advertising ...', 
          category: 'branding', 
          image: 'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/335059253/original/eada4959421eae260a0a688dbec6945bb43a4d4f/drive-conversions-with-creative-online-shop-ads.jpg',
          fullDescription: 'Reach the right audience and grow your business faster with powerful social media advertising. From strategy to creative design and campaign management, we help you run targeted ads that convert — on platforms like Facebook, Instagram, TikTok, and LinkedIn. Our data-driven approach ensures every dollar you spend delivers real results: more leads, more sales, and stronger brand visibility. Stop guessing and start scaling, turn your social media into a revenue machine today.',
          client: 'All Business',
          sales: '150+',
          delivery: '1-2 weeks',
          revisions: '3',
          included: 'Ad Strategy, 5 Ad Designs, Campaign Management',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Photoshop, Canva pro, ai tools',
          gallery: [
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/335059253/original/eada4959421eae260a0a688dbec6945bb43a4d4f/drive-conversions-with-creative-online-shop-ads.jpg',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs3/335059253/original/1756d9f79b12eb86ccc16a3ac8b08ce9a04616ea/drive-conversions-with-creative-online-shop-ads.jpg',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs3/406375295/original/32b5e0ff4c18ae3c21bf972bb24bf3d0a404ae43/design-stunning-posters-professionally.jpg',
            'https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/406375295/original/22ce9cbb53887f0b94c5804aa55f349231e38d10/design-stunning-posters-professionally.jpg'
          ]
        },
        { 
          title: 'Customer Support AI', 
          description: 'Deliver instant, 24/7 support with intelligent AI-powered customer service that never sleeps ...', 
          category: 'ai', 
          image: 'https://www.tidio.com/wp-content/uploads/1-chatbot-vs-livechat.png',
          fullDescription: 'Deliver instant, 24/7 support with intelligent AI-powered customer service that never sleeps. Our Customer Support AI understands questions, provides accurate answers, and resolves issues in real time — boosting satisfaction while reducing workload. From live chat to automated ticket handling, it learns from every interaction to offer faster and smarter responses. Enhance your customer experience, cut response times, and keep your clients happy — all while saving time and money with the future of support automation.',
          client: 'Websites , Mobile Apps',
          sales: '100+',
          delivery: '2-3 weeks',
          revisions: '2',
          included: 'AI Chatbot, Training, 3 Months Support',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Ai tools',
          gallery: [
            'https://www.tidio.com/wp-content/uploads/1-chatbot-vs-livechat.png',
            'https://www.tidio.com/wp-content/uploads/17-lyro-playground-for-testing-a-knowledge-base-chatbot.webp',
            'https://res.cloudinary.com/dn1j6dpd7/image/fetch/f_auto,q_auto,w_736/https://chatbot-blog.livechat.com/app/uploads/2025/04/chatbot-guide-chatbot-with-AI-knowledge.png'
          ]
        },
        { 
          title: 'Workflow Automation', 
          description: 'Save time, cut costs, and boost productivity with intelligent workflow automation ...', 
          category: 'ai', 
          image: 'https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/Sec_O_Ps_light_2_1eea5b5172.webp',
          fullDescription: 'Save time, cut costs, and boost productivity with intelligent workflow automation. From repetitive admin tasks to complex multi-step processes, our automation solutions help your team work smarter — not harder. Connect your favorite apps, eliminate manual errors, and let smart systems handle the routine while you focus on growth. Whether it’s sales, marketing, or operations, streamline everything with automated workflows that run your business efficiently and effortlessly.',
          client: 'All Business',
          sales: '80+',
          delivery: '3-4 weeks',
          revisions: '3',
          included: 'Workflow Setup, Integration, 3 Months Support',
          includedDetails: [
             'Full project implementation',
             '3 months of technical support',
             'Complete documentation',
             'Training materials',
             'Source code access',
             'Deployment assistance'
          ],
          technologies: 'Ai tools',
          gallery: [
             'https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/Sec_O_Ps_light_2_1eea5b5172.webp',
             'https://images.ctfassets.net/0sppvm4cmdq7/1uN9XmvzzQqZFJq8yE8NKe/6ebe64226f343c509d95f8f29ec28ea5/Screen_Shot_2024-10-30_at_3.05.50_PM.png',
             'https://pbs.twimg.com/media/G2nou3-acAAMJ6F?format=jpg&name=4096x4096'
          ]
        },
    ],
    nexaBusinessLinks: [
        { label: 'LinkTree', url: 'https://nexa1337vcard.vercel.app/', description: 'Digital products, Print On demand & More' }
    ]
  }
];
