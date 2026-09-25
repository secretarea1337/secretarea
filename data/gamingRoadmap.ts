export type Language = 'fr' | 'en' | 'ar';

export interface RoadmapItem {
  id: string;
  icon?: string;
  title: Record<Language, string>;
  subtitle?: Record<Language, string>;
  roadmap?: Record<Language, { level: string; items: string[] }[]>;
  tools?: Record<Language, { usage: string; recommended: string; alternative?: string }[]>;
  salaries?: Record<Language, { region: string; items: string[] }[]>;
  general?: Record<Language, string[]>;
  children?: string[];
}

export const gamingRoadmapData: RoadmapItem[] = [
  {
    id: 'intro',
    icon: 'Info',
    title: {
      fr: 'D\'abord, clarifions les métiers (souvent confondus)',
      en: 'First, let\'s clarify the roles (often confused)',
      ar: 'أولاً، دعونا نوضح الأدوار (غالبًا ما يتم الخلط بينها)'
    },
    general: {
      fr: [
        'Game Designer : conçoit les règles, mécaniques, niveaux, équilibrage, expérience joueur (pas forcément de code)',
        'Game Developer / Programmer : code le jeu (gameplay, moteur, IA, réseau, outils)',
        'Game Artist : 2D/3D art, animation, character design, environnement',
        'Technical Artist : pont entre art et code (shaders, rigging, outils)',
        'Level Designer : conçoit les niveaux jouables concrets',
        'Game Producer : gestion de projet/équipe',
        'Tu peux viser un seul rôle ou devenir "indie generalist" (tout faire seul, très courant en 2026 grâce à l\'IA).'
      ],
      en: [
        'Game Designer: designs rules, mechanics, levels, balancing, player experience (not necessarily code)',
        'Game Developer / Programmer: codes the game (gameplay, engine, AI, network, tools)',
        'Game Artist: 2D/3D art, animation, character design, environment',
        'Technical Artist: bridge between art and code (shaders, rigging, tools)',
        'Level Designer: designs concrete playable levels',
        'Game Producer: project/team management',
        'You can target a single role or become an "indie generalist" (do everything alone, very common in 2026 thanks to AI).'
      ],
      ar: [
        'Game Designer: يصمم القواعد، الميكانيكا، المستويات، التوازن، تجربة اللاعب (ليس بالضرورة برمجة)',
        'Game Developer / Programmer: يبرمج اللعبة (أسلوب اللعب، المحرك، الذكاء الاصطناعي، الشبكة، الأدوات)',
        'Game Artist: فن 2D/3D، رسوم متحركة، تصميم شخصيات، بيئة',
        'Technical Artist: الجسر بين الفن والبرمجة (shaders, rigging, الأدوات)',
        'Level Designer: يصمم المستويات القابلة للعب بشكل ملموس',
        'Game Producer: إدارة المشروع/الفريق',
        'يمكنك استهداف دور واحد أو أن تصبح "indie generalist" (تفعل كل شيء بمفردك، شائع جدًا في 2026 بفضل الذكاء الاصطناعي).'
      ]
    }
  },
  {
    id: 'phase0',
    icon: 'BookOpen',
    title: {
      fr: 'PHASE 0 — Fondations',
      en: 'PHASE 0 — Foundations',
      ar: 'المرحلة 0 — الأساسيات'
    },
    subtitle: {
      fr: '2-4 mois, gratuit',
      en: '2-4 months, free',
      ar: '2-4 أشهر، مجاني'
    },
    roadmap: {
      fr: [
        { 
          level: '1. Choisir ton moteur de jeu (le plus important)', 
          items: [
            'Unity — le plus accessible, énorme communauté, excellent pour mobile/indie/2D/3D, C#', 
            'Unreal Engine 5 — le plus puissant visuellement (Nanite, Lumen), utilisé en AAA, C++/Blueprints (visuel, sans code)', 
            'Godot — 100% gratuit et open-source, montée en puissance rapide, excellent pour apprendre sans se ruiner, GDScript (facile) ou C#',
            '💡 Conseil réaliste : commence par Godot (gratuit, léger, pédagogique) ou Unity (le plus de tutoriels/emplois), puis passe à Unreal si tu vises l\'AAA/le visuel haut de gamme.'
          ] 
        },
        { 
          level: '2. Programmation', 
          items: [
            'C# (Unity), C++ (Unreal, AAA), GDScript (Godot)', 
            'Structures de données, POO, boucles de jeu (game loop), gestion d\'état'
          ] 
        },
        { 
          level: '3. Mathématiques appliquées au jeu', 
          items: [
            'Vecteurs, trigonométrie de base, algèbre linéaire simple (transformations, collisions)'
          ] 
        },
        { 
          level: '4. Design fondamental', 
          items: [
            'Boucle de gameplay (game loop), mécaniques vs dynamiques vs esthétiques (framework MDA)', 
            'Level design de base, courbes de difficulté, feedback loops'
          ] 
        }
      ],
      en: [
        { 
          level: '1. Choose your game engine (most important)', 
          items: [
            'Unity — most accessible, huge community, excellent for mobile/indie/2D/3D, C#', 
            'Unreal Engine 5 — most visually powerful (Nanite, Lumen), used in AAA, C++/Blueprints (visual, no-code)', 
            'Godot — 100% free and open-source, rapid rise in power, excellent to learn without going broke, GDScript (easy) or C#',
            '💡 Realistic advice: start with Godot (free, lightweight, educational) or Unity (most tutorials/jobs), then move to Unreal if you target AAA/high-end visuals.'
          ] 
        },
        { 
          level: '2. Programming', 
          items: [
            'C# (Unity), C++ (Unreal, AAA), GDScript (Godot)', 
            'Data structures, OOP, game loop, state management'
          ] 
        },
        { 
          level: '3. Applied mathematics for games', 
          items: [
            'Vectors, basic trigonometry, simple linear algebra (transformations, collisions)'
          ] 
        },
        { 
          level: '4. Fundamental Design', 
          items: [
            'Gameplay loop, mechanics vs dynamics vs aesthetics (MDA framework)', 
            'Basic level design, difficulty curves, feedback loops'
          ] 
        }
      ],
      ar: [
        { 
          level: '1. اختر محرك اللعبة (الأهم)', 
          items: [
            'Unity — الأسهل وصولاً، مجتمع ضخم، ممتاز للجوال/indie/2D/3D، C#', 
            'Unreal Engine 5 — الأقوى بصرياً (Nanite, Lumen)، يُستخدم في AAA، C++/Blueprints (مرئي، بدون كود)', 
            'Godot — مجاني 100% ومفتوح المصدر، صعود سريع في القوة، ممتاز للتعلم بدون إفلاس، GDScript (سهل) أو C#',
            '💡 نصيحة واقعية: ابدأ بـ Godot (مجاني، خفيف، تعليمي) أو Unity (أكثر الدروس/الوظائف)، ثم انتقل إلى Unreal إذا كنت تستهدف AAA/مرئيات عالية الجودة.'
          ] 
        },
        { 
          level: '2. البرمجة', 
          items: [
            'C# (Unity)، C++ (Unreal, AAA)، GDScript (Godot)', 
            'هياكل البيانات، OOP، حلقة اللعبة (game loop)، إدارة الحالة'
          ] 
        },
        { 
          level: '3. الرياضيات التطبيقية للألعاب', 
          items: [
            'المتجهات، حساب المثلثات الأساسي، الجبر الخطي البسيط (التحويلات، التصادمات)'
          ] 
        },
        { 
          level: '4. التصميم الأساسي', 
          items: [
            'حلقة اللعب (game loop)، الميكانيكا مقابل الديناميكا مقابل الجماليات (إطار MDA)', 
            'تصميم المستوى الأساسي، منحنيات الصعوبة، حلقات الملاحظات (feedback loops)'
          ] 
        }
      ]
    },
    general: {
      fr: [
        'Ressources 100% gratuites pour cette phase :',
        '• Brackeys (YouTube, Unity/Godot, référence absolue pour débutants — chaîne archivée mais contenu toujours excellent)',
        '• GDQuest (YouTube + gratuit, spécialiste Godot)',
        '• Unreal Engine Learning (cours officiels gratuits sur unrealengine.com)',
        '• Unity Learn (plateforme officielle gratuite avec parcours structurés)',
        '• CS50\'s Introduction to Game Development (Harvard, gratuit sur edX/YouTube)'
      ],
      en: [
        '100% free resources for this phase:',
        '• Brackeys (YouTube, Unity/Godot, absolute reference for beginners — archived channel but still excellent content)',
        '• GDQuest (YouTube + free, Godot specialist)',
        '• Unreal Engine Learning (official free courses on unrealengine.com)',
        '• Unity Learn (official free platform with structured paths)',
        '• CS50\'s Introduction to Game Development (Harvard, free on edX/YouTube)'
      ],
      ar: [
        'موارد مجانية 100% لهذه المرحلة:',
        '• Brackeys (YouTube, Unity/Godot، مرجع مطلق للمبتدئين — قناة مؤرشفة لكن المحتوى لا يزال ممتازًا)',
        '• GDQuest (YouTube + مجاني، متخصص Godot)',
        '• Unreal Engine Learning (دورات رسمية مجانية على unrealengine.com)',
        '• Unity Learn (منصة رسمية مجانية بمسارات منظمة)',
        '• CS50\'s Introduction to Game Development (هارفارد، مجانًا على edX/YouTube)'
      ]
    }
  },
  {
    id: 'phase1',
    icon: 'Gamepad2',
    title: {
      fr: 'PHASE 1 — Construire tes premiers jeux',
      en: 'PHASE 1 — Build your first games',
      ar: 'المرحلة 1 — بناء ألعابك الأولى'
    },
    subtitle: {
      fr: '4-8 mois',
      en: '4-8 months',
      ar: '4-8 أشهر'
    },
    roadmap: {
      fr: [
        { 
          level: 'Pratique & Création', 
          items: [
            'Reproduire des clones simples : Pong, Snake, Flappy Bird, Platformer 2D', 
            'Apprendre : physics engine, collision detection, input handling, UI/UX de jeu, audio', 
            'Publier tes premiers petits jeux sur itch.io (gratuit, excellente vitrine pour ton portfolio)'
          ] 
        },
        { 
          level: 'Participe à des Game Jams (gratuit, essentiel pour progresser vite)', 
          items: [
            'Ludum Dare — la plus connue, 48-72h', 
            'itch.io Game Jams — des centaines toute l\'année, tous niveaux', 
            'Global Game Jam — événement mondial annuel'
          ] 
        }
      ],
      en: [
        { 
          level: 'Practice & Creation', 
          items: [
            'Reproduce simple clones: Pong, Snake, Flappy Bird, Platformer 2D', 
            'Learn: physics engine, collision detection, input handling, game UI/UX, audio', 
            'Publish your first small games on itch.io (free, excellent showcase for your portfolio)'
          ] 
        },
        { 
          level: 'Participate in Game Jams (free, essential to progress fast)', 
          items: [
            'Ludum Dare — the most famous, 48-72h', 
            'itch.io Game Jams — hundreds all year long, all levels', 
            'Global Game Jam — annual global event'
          ] 
        }
      ],
      ar: [
        { 
          level: 'التطبيق والإبداع', 
          items: [
            'إعادة إنتاج نسخ بسيطة: Pong, Snake, Flappy Bird, Platformer 2D', 
            'تعلم: محرك الفيزياء، اكتشاف التصادم، معالجة الإدخال، واجهة/تجربة المستخدم للعبة، الصوت', 
            'نشر ألعابك الصغيرة الأولى على itch.io (مجاني، واجهة ممتازة لمعرض أعمالك)'
          ] 
        },
        { 
          level: 'شارك في Game Jams (مجاني، ضروري للتقدم السريع)', 
          items: [
            'Ludum Dare — الأكثر شهرة، 48-72 ساعة', 
            'itch.io Game Jams — المئات طوال العام، لجميع المستويات', 
            'Global Game Jam — حدث عالمي سنوي'
          ] 
        }
      ]
    }
  },
  {
    id: 'phase2',
    icon: 'Code',
    title: {
      fr: 'PHASE 2 — Spécialisation',
      en: 'PHASE 2 — Specialization',
      ar: 'المرحلة 2 — التخصص'
    },
    roadmap: {
      fr: [
        { 
          level: 'Programmation avancée', 
          items: [
            'Architecture de jeu (ECS - Entity Component System), design patterns (State Machine, Observer)', 
            'IA de jeu : pathfinding (A*), behavior trees, FSM', 
            'Réseau/multijoueur : Netcode, Photon, Mirror (Unity), Unreal\'s replication system', 
            'Optimisation : profiling, memory management, LOD'
          ] 
        },
        { 
          level: 'Game Art & 3D', 
          items: [
            'Outils gratuits : Blender (modélisation/animation 3D, gratuit, niveau industrie), Krita (art 2D, gratuit), GIMP (retouche, gratuit)', 
            'Outils payants standards : Photoshop, ZBrush, Substance Painter (Adobe/Adobe suite)', 
            'Pixel art : Aseprite (payant ~20$, très abordable) ou Piskel (gratuit, en ligne)'
          ] 
        },
        { 
          level: 'Game Design pur', 
          items: [
            'Level design, économie de jeu (pour jeux mobile/F2P), narrative design', 
            'Outils : Twine (narration interactive, gratuit), Miro/Figma (prototypage, gratuit)'
          ] 
        },
        { 
          level: 'Mobile Game Dev & VR/AR', 
          items: [
            'Mobile : Unity reste dominant pour mobile (iOS/Android)',
            'Monétisation : IAP, publicité, systèmes F2P',
            'VR/AR (en forte croissance 2026) : Unity XR Toolkit / Unreal VR templates (gratuits)', 
            'Casques abordables pour tester : Meta Quest (le plus accessible)'
          ] 
        }
      ],
      en: [
        { 
          level: 'Advanced Programming', 
          items: [
            'Game architecture (ECS - Entity Component System), design patterns (State Machine, Observer)', 
            'Game AI: pathfinding (A*), behavior trees, FSM', 
            'Network/multiplayer: Netcode, Photon, Mirror (Unity), Unreal\'s replication system', 
            'Optimization: profiling, memory management, LOD'
          ] 
        },
        { 
          level: 'Game Art & 3D', 
          items: [
            'Free tools: Blender (3D modeling/animation, free, industry level), Krita (2D art, free), GIMP (retouching, free)', 
            'Standard paid tools: Photoshop, ZBrush, Substance Painter (Adobe/Adobe suite)', 
            'Pixel art: Aseprite (paid ~$20, very affordable) or Piskel (free, online)'
          ] 
        },
        { 
          level: 'Pure Game Design', 
          items: [
            'Level design, game economy (for mobile/F2P games), narrative design', 
            'Tools: Twine (interactive narrative, free), Miro/Figma (prototyping, free)'
          ] 
        },
        { 
          level: 'Mobile Game Dev & VR/AR', 
          items: [
            'Mobile: Unity remains dominant for mobile (iOS/Android)',
            'Monetization: IAP, ads, F2P systems',
            'VR/AR (strong growth 2026): Unity XR Toolkit / Unreal VR templates (free)', 
            'Affordable headsets to test: Meta Quest (most accessible)'
          ] 
        }
      ],
      ar: [
        { 
          level: 'برمجة متقدمة', 
          items: [
            'معمارية اللعبة (ECS)، أنماط التصميم (State Machine, Observer)', 
            'الذكاء الاصطناعي للعبة: تحديد المسار (A*)، أشجار السلوك (behavior trees)، FSM', 
            'الشبكة/متعدد اللاعبين: Netcode, Photon, Mirror (Unity), Unreal\'s replication', 
            'التحسين: profiling, memory management, LOD'
          ] 
        },
        { 
          level: 'فن الألعاب و 3D', 
          items: [
            'أدوات مجانية: Blender (نمذجة/رسوم 3D، مجاني، مستوى الصناعة)، Krita (فن 2D، مجاني)، GIMP (تعديل، مجاني)', 
            'أدوات مدفوعة قياسية: Photoshop, ZBrush, Substance Painter', 
            'Pixel art: Aseprite (~20$، ميسور التكلفة جداً) أو Piskel (مجاني، عبر الإنترنت)'
          ] 
        },
        { 
          level: 'تصميم الألعاب البحت', 
          items: [
            'تصميم المستوى، اقتصاد اللعبة (لألعاب الجوال/F2P)، التصميم السردي', 
            'الأدوات: Twine (سرد تفاعلي، مجاني)، Miro/Figma (نماذج أولية، مجاني)'
          ] 
        },
        { 
          level: 'تطوير الهاتف و VR/AR', 
          items: [
            'الجوال: Unity يظل المسيطر على الجوال (iOS/Android)',
            'تحقيق الدخل: IAP، الإعلانات، أنظمة F2P',
            'الواقع الافتراضي/المعزز (نمو قوي 2026): Unity XR Toolkit / Unreal VR templates (مجاني)', 
            'نظارات ميسورة التكلفة للاختبار: Meta Quest (الأكثر وصولاً)'
          ] 
        }
      ]
    }
  },
  {
    id: 'phase3',
    icon: 'Award',
    title: {
      fr: 'PHASE 3 — Certifications (facultatives mais utiles pour le CV)',
      en: 'PHASE 3 — Certifications (optional but useful for CV)',
      ar: 'المرحلة 3 — الشهادات (اختيارية لكنها مفيدة للسيرة الذاتية)'
    },
    general: {
      fr: [
        '• Unity Certified Associate (Game Developer) : ~150$ (Reconnue par les recruteurs, prouve les bases)',
        '• Unity Certified Professional : ~250$ (Niveau intermédiaire/avancé)',
        '• Unreal Engine Certification : Gratuit à payant selon organisme (Moins standardisée que Unity mais utile)',
        '• CompTIA / diplômes classiques : Variable (Peu utilisés dans le jeu vidéo)',
        '⚠ Réalité de l\'industrie du jeu vidéo : contrairement à la cybersécurité, ce secteur valorise le portfolio et les jeux publiés bien plus que les certifications. Un itch.io avec 3-5 jeux jouables complets vaut plus que n\'importe quel certificat.'
      ],
      en: [
        '• Unity Certified Associate (Game Developer): ~$150 (Recognized by recruiters, proves the basics)',
        '• Unity Certified Professional: ~$250 (Intermediate/advanced level)',
        '• Unreal Engine Certification: Free to paid depending on organization (Less standardized than Unity but useful)',
        '• CompTIA / classic degrees: Variable (Rarely used in video games)',
        '⚠ Reality of the video game industry: unlike cybersecurity, this sector values the portfolio and published games much more than certifications. An itch.io with 3-5 complete playable games is worth more than any certificate.'
      ],
      ar: [
        '• Unity Certified Associate (Game Developer): ~150$ (معترف بها من قبل مسؤولي التوظيف، تثبت الأساسيات)',
        '• Unity Certified Professional: ~250$ (مستوى متوسط/متقدم)',
        '• Unreal Engine Certification: من مجاني إلى مدفوع حسب المنظمة (أقل توحيدًا من Unity ولكنها مفيدة)',
        '• CompTIA / الشهادات الكلاسيكية: متغيرة (نادرًا ما تستخدم في ألعاب الفيديو)',
        '⚠ حقيقة صناعة ألعاب الفيديو: على عكس الأمن السيبراني، يقدّر هذا القطاع المعرض (portfolio) والألعاب المنشورة أكثر بكثير من الشهادات. حساب itch.io مع 3-5 ألعاب كاملة قابلة للعب يساوي أكثر من أي شهادة.'
      ]
    }
  },
  {
    id: 'stack',
    icon: 'Monitor',
    title: {
      fr: 'Apprendre 100% gratuitement à la maison',
      en: 'Learn 100% for free at home',
      ar: 'تعلم 100% مجانًا في المنزل'
    },
    general: {
      fr: [
        'Matériel minimum : PC avec carte graphique dédiée recommandée (mais Godot et prototypage 2D tournent sur presque n\'importe quoi)',
        'Chaînes YouTube gratuites de référence :',
        '• Brackeys',
        '• GDQuest',
        '• Game Maker\'s Toolkit (analyse de design, excellent pour comprendre la théorie)',
        '• Sebastian Lague (programmation avancée/algorithmes de jeu)'
      ],
      en: [
        'Minimum hardware: PC with dedicated graphics card recommended (but Godot and 2D prototyping run on almost anything)',
        'Free reference YouTube channels:',
        '• Brackeys',
        '• GDQuest',
        '• Game Maker\'s Toolkit (design analysis, excellent for understanding theory)',
        '• Sebastian Lague (advanced programming/game algorithms)'
      ],
      ar: [
        'الحد الأدنى للأجهزة: يُنصح باستخدام جهاز كمبيوتر ببطاقة رسومات مخصصة (لكن Godot والنماذج الأولية ثنائية الأبعاد تعمل على أي شيء تقريبًا)',
        'قنوات YouTube المرجعية المجانية:',
        '• Brackeys',
        '• GDQuest',
        '• Game Maker\'s Toolkit (تحليل التصميم، ممتاز لفهم النظرية)',
        '• Sebastian Lague (البرمجة المتقدمة / خوارزميات اللعبة)'
      ]
    },
    tools: {
      fr: [
        { usage: 'Moteur', recommended: 'Godot (100% gratuit et open-source) ou Unity Personal (gratuit jusqu\'à un certain revenu)' },
        { usage: 'Art', recommended: 'Blender, Krita, GIMP, Piskel' },
        { usage: 'Audio', recommended: 'Audacity (édition), LMMS ou Bosca Ceoil (composition musicale gratuite)' },
        { usage: 'Versioning', recommended: 'Git + GitHub (gratuit, indispensable pour montrer ton travail)' },
        { usage: 'Prototypage rapide', recommended: 'Figma (gratuit)' }
      ],
      en: [
        { usage: 'Engine', recommended: 'Godot (100% free and open-source) or Unity Personal (free up to a certain revenue)' },
        { usage: 'Art', recommended: 'Blender, Krita, GIMP, Piskel' },
        { usage: 'Audio', recommended: 'Audacity (editing), LMMS or Bosca Ceoil (free music composition)' },
        { usage: 'Versioning', recommended: 'Git + GitHub (free, essential to show your work)' },
        { usage: 'Rapid Prototyping', recommended: 'Figma (free)' }
      ],
      ar: [
        { usage: 'المحرك', recommended: 'Godot (مجاني 100% ومفتوح المصدر) أو Unity Personal (مجاني حتى دخل معين)' },
        { usage: 'الفن', recommended: 'Blender, Krita, GIMP, Piskel' },
        { usage: 'الصوت', recommended: 'Audacity (تحرير), LMMS أو Bosca Ceoil (تأليف موسيقي مجاني)' },
        { usage: 'التحكم بالنسخ', recommended: 'Git + GitHub (مجاني، ضروري لعرض عملك)' },
        { usage: 'النماذج السريعة', recommended: 'Figma (مجاني)' }
      ]
    }
  },
  {
    id: 'tech',
    icon: 'Cpu',
    title: {
      fr: 'Nouvelles technologies 2026-2027 à intégrer dans ton apprentissage',
      en: 'New technologies 2026-2027 to integrate into your learning',
      ar: 'التقنيات الجديدة 2026-2027 لدمجها في تعلمك'
    },
    general: {
      fr: [
        'D\'après les tendances sectorielles actuelles :',
        '• L\'IA générative transforme profondément la production : la génération procédurale explose, avec des systèmes IA qui créent des variations infinies d\'environnements, et environ la moitié des studios utilisent déjà l\'IA en production active, avec la quasi-totalité des développeurs utilisant des outils IA pour la création d\'assets.',
        '• MetaHuman Creator (Unreal) et des outils similaires démocratisent la création de personnages réalistes assistée par IA, rendant ces techniques accessibles sans être expert en machine learning.',
        '• 2026 marque l\'apparition des premiers jeux "AI-native" — conçus dès le départ autour de systèmes IA plutôt qu\'avec de l\'IA ajoutée après coup : mondes dynamiques qui réagissent en temps réel, PNJ avec mémoire persistante et relations évolutives, narration procédurale qui s\'adapte aux choix du joueur.',
        '• Démocratisation via l\'IA : un développeur solo ou une micro-équipe de 3-5 personnes peut désormais produire des jeux qui rivalisent en qualité avec des studios AAA, grâce aux outils IA, à la génération procédurale et au scripting visuel.',
        '• Le cross-platform devient un standard non-négociable : les joueurs s\'attendent à retrouver leur progression et leurs achats entre console, PC et mobile.',
        '• Le développement mobile continue de dominer en volume et en marge, avec une forte demande pour les développeurs capables de gérer du F2P et de la monétisation.',
        '• Compétence à développer pour 2027 : maîtrise des outils IA de génération d\'assets (texte-vers-3D, texte-vers-texture), workflows hybrides humain-IA, et compréhension du design pour l\'accessibilité (intégrée dès la conception plutôt qu\'ajoutée après coup).'
      ],
      en: [
        'According to current industry trends:',
        '• Generative AI profoundly transforms production: procedural generation explodes, with AI systems creating infinite variations of environments, and about half of studios already use AI in active production, with almost all developers using AI tools for asset creation.',
        '• MetaHuman Creator (Unreal) and similar tools democratize AI-assisted realistic character creation, making these techniques accessible without being a machine learning expert.',
        '• 2026 marks the appearance of the first "AI-native" games — designed from the ground up around AI systems rather than with AI added as an afterthought: dynamic worlds reacting in real-time, NPCs with persistent memory and evolving relationships, procedural narrative adapting to player choices.',
        '• Democratization via AI: a solo developer or a micro-team of 3-5 people can now produce games that rival AAA studios in quality, thanks to AI tools, procedural generation, and visual scripting.',
        '• Cross-platform becomes a non-negotiable standard: players expect to find their progression and purchases across console, PC, and mobile.',
        '• Mobile development continues to dominate in volume and margin, with strong demand for developers capable of managing F2P and monetization.',
        '• Skill to develop for 2027: mastery of AI asset generation tools (text-to-3D, text-to-texture), hybrid human-AI workflows, and understanding of design for accessibility (integrated from conception rather than added as an afterthought).'
      ],
      ar: [
        'وفقًا لاتجاهات القطاع الحالية:',
        '• الذكاء الاصطناعي التوليدي يغير الإنتاج بشكل عميق: تنفجر التوليد الإجرائي (procedural generation)، مع أنظمة ذكاء اصطناعي تنشئ اختلافات لا حصر لها للبيئات، وحوالي نصف الاستوديوهات تستخدم بالفعل الذكاء الاصطناعي في الإنتاج النشط، مع استخدام جميع المطورين تقريبًا لأدوات الذكاء الاصطناعي لإنشاء الأصول.',
        '• يعمل MetaHuman Creator (Unreal) والأدوات المماثلة على إضفاء الطابع الديمقراطي على إنشاء شخصيات واقعية بمساعدة الذكاء الاصطناعي، مما يجعل هذه التقنيات متاحة دون أن تكون خبيرًا في التعلم الآلي.',
        '• يمثل عام 2026 ظهور أول ألعاب "AI-native" — مصممة منذ البداية حول أنظمة الذكاء الاصطناعي بدلاً من إضافة الذكاء الاصطناعي كفكرة لاحقة: عوالم ديناميكية تتفاعل في الوقت الفعلي، شخصيات غیر لاعبة (NPCs) بذاكرة مستمرة وعلاقات متطورة، وسرد إجرائي يتكيف مع اختيارات اللاعب.',
        '• إضفاء الطابع الديمقراطي عبر الذكاء الاصطناعي: يمكن الآن لمطور منفرد أو فريق صغير من 3-5 أشخاص إنتاج ألعاب تنافس جودة استوديوهات AAA، بفضل أدوات الذكاء الاصطناعي، والتوليد الإجرائي، والبرمجة النصية المرئية (visual scripting).',
        '• يصبح اللعب عبر المنصات معيارًا غير قابل للتفاوض: يتوقع اللاعبون العثور على تقدمهم ومشترياتهم عبر وحدة التحكم، والكمبيوتر الشخصي، والجوال.',
        '• يستمر تطوير الأجهزة المحمولة في الهيمنة من حيث الحجم والهامش، مع طلب قوي على المطورين القادرين على إدارة F2P وتحقيق الدخل.',
        '• المهارة التي يجب تطويرها لعام 2027: إتقان أدوات الذكاء الاصطناعي لإنشاء الأصول (تحويل النص إلى ثلاثي الأبعاد، تحويل النص إلى نسيج)، وسير عمل هجين بين الإنسان والذكاء الاصطناعي، وفهم التصميم لإمكانية الوصول (مدمج منذ الحمل بدلاً من إضافته بعد الواقعة).'
      ]
    }
  },
  {
    id: 'salaries',
    icon: 'TrendingUp',
    title: {
      fr: 'Salaires réels 2026 (base honnête pour anticiper 2027)',
      en: 'Real Salaries 2026 (honest basis to anticipate 2027)',
      ar: 'الرواتب الحقيقية 2026 (أساس صادق لتوقع 2027)'
    },
    general: {
      fr: [
        '⚠ Comme pour la cybersécurité, aucune donnée "2027" certifiée n\'existe en juillet 2026 — voici les chiffres réels les plus récents disponibles (sources : ERI SalaryExpert, Jobicy, ZipRecruiter, PayScale, Glassdoor, Qubit Labs, Lemon.io).',
        'Note (Pays arabes/MENA) : les données spécifiques au Maroc pour ce métier sont encore rares dans les enquêtes salariales internationales — la comparaison la plus proche reste l\'Égypte, économie et coût de la vie relativement similaires.'
      ],
      en: [
        '⚠ As with cybersecurity, no certified "2027" data exists in July 2026 — here are the most recent real figures available (sources: ERI SalaryExpert, Jobicy, ZipRecruiter, PayScale, Glassdoor, Qubit Labs, Lemon.io).',
        'Note (Arab countries/MENA): specific data for Morocco for this profession is still rare in international salary surveys — the closest comparison remains Egypt, relatively similar economy and cost of living.'
      ],
      ar: [
        '⚠ كما هو الحال مع الأمن السيبراني، لا توجد بيانات "2027" معتمدة في يوليو 2026 — إليك أحدث الأرقام الحقيقية المتاحة (المصادر: ERI SalaryExpert, Jobicy, ZipRecruiter, PayScale, Glassdoor, Qubit Labs, Lemon.io).',
        'ملاحظة (الدول العربية/الشرق الأوسط وشمال أفريقيا): لا تزال البيانات الخاصة بالمغرب لهذه المهنة نادرة في استطلاعات الرواتب الدولية — تظل أقرب مقارنة هي مصر، ذات الاقتصاد وتكلفة المعيشة المتشابهين نسبيًا.'
      ]
    },
    salaries: {
      fr: [
        { 
          region: 'Pays arabes / MENA', 
          items: [
            'Arabie Saoudite (Game Programmer) : SAR 143 300 – 253 100 (~38 200 – 67 500 $)', 
            'Arabie Saoudite (Game Developer moyenne) : SAR ~207 400 (~55 300 $)',
            'Émirats Arabes Unis (Game Developer moyenne) : AED ~270 000 (~73 500 $)', 
            'Émirats Arabes Unis (Game Designer moyenne) : AED ~257 200 (~70 000 $)',
            'Égypte (Game Developer moyenne) : EGP ~381 200 (~7 700 $) - pouvoir d\'achat local réel bien supérieur à ce chiffre converti brut'
          ] 
        },
        { 
          region: 'International', 
          items: [
            'USA — Unity Developer : ~$108 000 (fourchette $81 500 – $124 000, jusqu\'à $180 000 pour les meilleurs)', 
            'USA — Unreal Engine Developer : ~$110 000 – $120 000 (jusqu\'à $147 000 pour les spécialistes)', 
            'USA — Game Programmer (moyenne globale) : $116 000 (junior ~$80 000 → senior $150 000+)', 
            'USA — AI Game Developer (spécialisation IA) : ~$142 000', 
            'France : ~$83 850/an (junior $50 000-67 000, senior $100 000-150 000)',
            'Allemagne : ~$85 500/an',
            'Suisse — Unity Developer : ~$105 500/an',
            'Pologne (référence Europe de l\'Est) : ~$40 800/an (Unity) — $45 600/an (Unreal)',
            'Canada : ~$98 400/an (Unity)'
          ] 
        }
      ],
      en: [
        { 
          region: 'Arab countries / MENA', 
          items: [
            'Saudi Arabia (Game Programmer): SAR 143,300 – 253,100 (~$38,200 – 67,500)', 
            'Saudi Arabia (Game Developer average): SAR ~207,400 (~$55,300)',
            'UAE (Game Developer average): AED ~270,000 (~$73,500)', 
            'UAE (Game Designer average): AED ~257,200 (~$70,000)',
            'Egypt (Game Developer average): EGP ~381,200 (~$7,700) - real local purchasing power much higher than this gross converted figure'
          ] 
        },
        { 
          region: 'International', 
          items: [
            'USA — Unity Developer: ~$108,000 (range $81,500 – $124,000, up to $180,000 for the best)', 
            'USA — Unreal Engine Developer: ~$110,000 – $120,000 (up to $147,000 for specialists)', 
            'USA — Game Programmer (global average): $116,000 (junior ~$80,000 → senior $150,000+)', 
            'USA — AI Game Developer (AI specialization): ~$142,000', 
            'France: ~$83,850/yr (junior $50,000-67,000, senior $100,000-150,000)',
            'Germany: ~$85,500/yr',
            'Switzerland — Unity Developer: ~$105,500/yr',
            'Poland (Eastern Europe reference): ~$40,800/yr (Unity) — $45,600/yr (Unreal)',
            'Canada: ~$98,400/yr (Unity)'
          ] 
        }
      ],
      ar: [
        { 
          region: 'الدول العربية / MENA', 
          items: [
            'السعودية (Game Programmer): 143,300 – 253,100 ريال (~38,200 – 67,500 دولار)', 
            'السعودية (مطور ألعاب متوسط): ~207,400 ريال (~55,300 دولار)',
            'الإمارات (مطور ألعاب متوسط): ~270,000 درهم (~73,500 دولار)', 
            'الإمارات (مصمم ألعاب متوسط): ~257,200 درهم (~70,000 دولار)',
            'مصر (مطور ألعاب متوسط): ~381,200 جنيه (~7,700 دولار) - القوة الشرائية المحلية الحقيقية أعلى بكثير من هذا الرقم الإجمالي المحول'
          ] 
        },
        { 
          region: 'دولياً', 
          items: [
            'الولايات المتحدة — مطور Unity: ~108,000$ (نطاق 81,500$ – 124,000$، حتى 180,000$ للأفضل)', 
            'الولايات المتحدة — مطور Unreal Engine: ~110,000$ – 120,000$ (حتى 147,000$ للمتخصصين)', 
            'الولايات المتحدة — مبرمج ألعاب (متوسط عالمي): 116,000$ (مبتدئ ~80,000$ → خبير 150,000$+)', 
            'الولايات المتحدة — مطور ألعاب ذكاء اصطناعي: ~142,000$', 
            'فرنسا: ~83,850$/سنوياً (مبتدئ 50,000-67,000$, خبير 100,000-150,000$)',
            'ألمانيا: ~85,500$/سنوياً',
            'سويسرا — مطور Unity: ~105,500$/سنوياً',
            'بولندا (مرجع أوروبا الشرقية): ~40,800$/سنوياً (Unity) — 45,600$/سنوياً (Unreal)',
            'كندا: ~98,400$/سنوياً (Unity)'
          ] 
        }
      ]
    }
  },
  {
    id: 'retenir',
    icon: 'Bulb',
    title: {
      fr: 'Ce qu\'il faut retenir',
      en: 'What you need to remember',
      ar: 'ما يجب أن تتذكره'
    },
    general: {
      fr: [
        '• L\'écart de rémunération se réduit avec le freelance/remote. Un développeur basé au Maroc/Égypte peut travailler pour des studios US/UE via Upwork, Lemon.io, ou en contrat direct, et toucher une part significative des tarifs internationaux.',
        '• Unreal Engine paie généralement 10-20% de plus qu\'Unity, mais Unity reste plus demandé pour le mobile/indie.',
        '• Les compétences IA (procedural generation, AI-assisted workflows) sont le levier salarial le plus fort en ce moment — la demande pour Unreal Engine croît de façon disproportionnée par rapport aux autres compétences.',
        '• Le portfolio prime sur le diplôme. Contrairement à d\'autres secteurs tech, un développeur autodidacte avec 2-3 jeux solides publiés peut être compétitif face à un diplômé sans réalisations concrètes.',
        'Guide compilé pour un apprentissage 100% légal et gratuit (ou à faible coût). Le jeu vidéo est un secteur créatif où la pratique et le portfolio comptent plus que tout diplôme.'
      ],
      en: [
        '• The pay gap is shrinking with freelance/remote work. A developer based in Morocco/Egypt can work for US/EU studios via Upwork, Lemon.io, or direct contract, and earn a significant portion of international rates.',
        '• Unreal Engine generally pays 10-20% more than Unity, but Unity remains more in demand for mobile/indie.',
        '• AI skills (procedural generation, AI-assisted workflows) are the strongest salary lever right now — demand for Unreal Engine is growing disproportionately compared to other skills.',
        '• The portfolio takes precedence over the diploma. Unlike other tech sectors, a self-taught developer with 2-3 solid published games can be competitive against a graduate with no concrete achievements.',
        'Guide compiled for 100% legal and free (or low-cost) learning. Video games are a creative sector where practice and the portfolio count more than any diploma.'
      ],
      ar: [
        '• تتقلص فجوة الأجور مع العمل الحر/عن بعد. يمكن لمطور مقره في المغرب/مصر العمل لاستوديوهات أمريكية/أوروبية عبر Upwork أو Lemon.io أو العقد المباشر، وكسب جزء كبير من الأسعار الدولية.',
        '• يدفع Unreal Engine عمومًا بنسبة 10-20٪ أكثر من Unity، لكن يظل Unity مطلوبًا أكثر للجوال/indie.',
        '• مهارات الذكاء الاصطناعي (التوليد الإجرائي، مسارات العمل بمساعدة الذكاء الاصطناعي) هي الرافعة الأقوى للرواتب في الوقت الحالي — ينمو الطلب على Unreal Engine بشكل غير متناسب مقارنة بالمهارات الأخرى.',
        '• المعرض (portfolio) له الأسبقية على الشهادة. على عكس قطاعات التكنولوجيا الأخرى، يمكن للمطور العصامي الذي لديه 2-3 ألعاب قوية منشورة أن يكون منافسًا لخريج ليس لديه إنجازات ملموسة.',
        'تم تجميع الدليل لتعلم قانوني ومجاني 100% (أو بتكلفة منخفضة). ألعاب الفيديو هي قطاع إبداعي حيث الممارسة والمعرض مهمان أكثر من أي شهادة.'
      ]
    }
  }
];
