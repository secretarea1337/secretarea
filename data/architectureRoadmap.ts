export type Language = 'fr' | 'en' | 'ar';

export interface RoadmapItem {
  id: string;
  title: Record<Language, string>;
  subtitle?: Record<Language, string>;
  roadmap?: Record<Language, { level: string; items: string[] }[]>;
  tools?: Record<Language, { usage: string; recommended: string; alternative?: string }[]>;
  salaries?: Record<Language, { region: string; items: string[] }[]>;
  general?: Record<Language, string[]>;
  children?: string[];
  side: 'left' | 'right' | 'center';
}

export const roadmapData: RoadmapItem[] = [
  {
    id: 'start',
    title: {
      fr: 'Fondations (Tronc Commun)',
      en: 'Foundations (Common Core)',
      ar: 'الأساسيات (الأساس المشترك)'
    },
    subtitle: {
      fr: 'Dessin & culture visuelle',
      en: 'Drawing & Visual Culture',
      ar: 'الرسم والثقافة البصرية'
    },
    general: {
      fr: [
        'Les 8 domaines se recoupent énormément. Voici la logique de progression recommandée, du "tronc commun" vers la spécialisation.',
        'BIM n\'est pas un 9ème métier isolé : c\'est une méthode/logiciel que tu superposes à l\'architecture, au paysage ou à l\'urbanisme. Je le traite comme une couche de compétences à ajouter, pas comme un parcours à part.'
      ],
      en: [
        'The 8 domains overlap significantly. Here is the recommended progression logic, from the "common core" towards specialization.',
        'BIM is not an isolated 9th profession: it is a method/software that you overlay on architecture, landscape, or urban planning. I treat it as a skill layer to add, not as a separate path.'
      ],
      ar: [
        'تتداخل المجالات الثمانية بشكل كبير. إليك منطق التقدم الموصى به، من "الأساس المشترك" نحو التخصص.',
        'نمذجة معلومات البناء (BIM) ليست مهنة تاسعة معزولة: إنها طريقة/برنامج يتم إضافته إلى الهندسة المعمارية أو المناظر الطبيعية أو التخطيط الحضري. أتعامل معها كطبقة مهارات إضافية، وليس كمسار منفصل.'
      ]
    },
    children: ['architecture', 'design-industriel', 'bim'],
    side: 'center'
  },
  {
    id: 'architecture',
    title: {
      fr: '1. ARCHITECTURE',
      en: '1. ARCHITECTURE',
      ar: '1. الهندسة المعمارية'
    },
    side: 'left',
    children: ['architecture-interieur', 'architecture-paysagere', 'urbanisme'],
    roadmap: {
      fr: [
        { level: 'Niveau 0 - Fondations (6-12 mois)', items: ['Dessin à main levée, perspective, ombres/lumière', 'Géométrie descriptive, croquis d\'observation', 'Histoire de l\'architecture (mouvements, grands architectes)', 'Maquette physique (carton, balsa)'] },
        { level: 'Niveau 1 - Formation académique (Bac+5 classique au Maroc/France)', items: ['École nationale d\'architecture (ENA Rabat, Casablanca, Marrakech, Fès, Tétouan au Maroc) ou école privée reconnue', 'Studios de projet (du logement individuel au grand équipement)', 'Structure, résistance des matériaux, thermique du bâtiment', 'Réglementation, code de l\'urbanisme, normes parasismiques'] },
        { level: 'Niveau 2 - Outils numériques', items: ['AutoCAD (2D), puis SketchUp ou Rhino (3D conceptuel)', 'Passage progressif vers un logiciel BIM (Revit ou ArchiCAD)', 'Rendu / visualisation : Lumion, Enscape, Twinmotion, D5 Render, ou V-Ray'] },
        { level: 'Niveau 3 - Professionnalisation', items: ['Stage obligatoire + inscription à l\'Ordre des Architectes (au Maroc) ou HMONP (France)', 'Spécialisation possible : architecture durable/passive, patrimoine/restauration, architecture de santé, architecture parasismique'] },
        { level: 'Niveau 4 - Expertise/carrière', items: ['Chef de projet -> associé -> architecte libéral avec cabinet propre', 'Certifications environnementales : LEED, HQE, BREEAM'] }
      ],
      en: [
        { level: 'Level 0 - Foundations (6-12 months)', items: ['Freehand drawing, perspective, shadows/light', 'Descriptive geometry, observational sketching', 'History of architecture (movements, great architects)', 'Physical modeling (cardboard, balsa)'] },
        { level: 'Level 1 - Academic training (Classic 5-year degree in Morocco/France)', items: ['National School of Architecture (ENA Rabat, Casablanca, Marrakech, Fez, Tetouan in Morocco) or recognized private school', 'Project studios (from individual housing to large facilities)', 'Structure, strength of materials, building thermals', 'Regulations, urban planning code, seismic standards'] },
        { level: 'Level 2 - Digital Tools', items: ['AutoCAD (2D), then SketchUp or Rhino (conceptual 3D)', 'Gradual transition to BIM software (Revit or ArchiCAD)', 'Rendering / visualization: Lumion, Enscape, Twinmotion, D5 Render, or V-Ray'] },
        { level: 'Level 3 - Professionalization', items: ['Mandatory internship + registration with the Order of Architects (in Morocco) or HMONP (France)', 'Possible specialization: sustainable/passive architecture, heritage/restoration, healthcare architecture, seismic architecture'] },
        { level: 'Level 4 - Expertise/Career', items: ['Project manager -> partner -> freelance architect with own firm', 'Environmental certifications: LEED, HQE, BREEAM'] }
      ],
      ar: [
        { level: 'المستوى 0 - الأساسيات (6-12 شهرًا)', items: ['الرسم الحر، المنظور، الظلال/الضوء', 'الهندسة الوصفية، الرسم الملاحظ', 'تاريخ الهندسة المعمارية (الحركات، كبار المهندسين المعماريين)', 'النمذجة المادية (الكرتون، خشب البلسا)'] },
        { level: 'المستوى 1 - التدريب الأكاديمي (درجة 5 سنوات كلاسيكية في المغرب/فرنسا)', items: ['المدرسة الوطنية للهندسة المعمارية (ENA الرباط، الدار البيضاء، مراكش، فاس، تطوان في المغرب) أو مدرسة خاصة معترف بها', 'استوديوهات المشاريع (من السكن الفردي إلى المرافق الكبيرة)', 'الهيكل، قوة المواد، حرارة المبنى', 'اللوائح، قانون التخطيط الحضري، المعايير الزلزالية'] },
        { level: 'المستوى 2 - الأدوات الرقمية', items: ['أوتوكاد (2D)، ثم سكتش أب أو راينو (3D مفاهيمي)', 'انتقال تدريجي إلى برمجيات BIM (ريفيت أو أركيكاد)', 'التصيير / التصور: لوميون، إن سكيب، توين موشن، دي 5 ريندر، أو في-راي'] },
        { level: 'المستوى 3 - الاحتراف', items: ['تدريب إلزامي + التسجيل في هيئة المهندسين المعماريين (في المغرب) أو HMONP (فرنسا)', 'تخصص محتمل: هندسة مستدامة/سلبية، تراث/ترميم، هندسة الرعاية الصحية، هندسة مقاومة للزلازل'] },
        { level: 'المستوى 4 - الخبرة/المسيرة المهنية', items: ['مدير مشروع -> شريك -> مهندس معماري حر يمتلك مكتبه الخاص', 'الشهادات البيئية: LEED, HQE, BREEAM'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'BIM/documentation', recommended: 'Autodesk Revit', alternative: 'ArchiCAD (plus intuitif, meilleur sur Mac)' },
        { usage: 'Conception rapide IA', recommended: 'Snaptrude (cloud, génère un plan en 30 min)', alternative: 'Autodesk Forma' },
        { usage: 'Modélisation libre', recommended: 'Rhino + Grasshopper', alternative: 'SketchUp' },
        { usage: 'Rendu photoréaliste', recommended: 'Enscape, Twinmotion, D5 Render', alternative: 'Lumion Pro (upscaler IA 4K)' },
        { usage: 'IA générative de plans', recommended: 'Maket, TestFit, Finch 3D', alternative: 'Ark Design AI' },
        { usage: 'Habillage/visualisation IA', recommended: 'Veras (plugin Revit/SketchUp/Rhino/ArchiCAD)', alternative: 'MoldaSpace' },
        { usage: 'Gratuit/open-source', recommended: 'FreeCAD (workbench BIM), BlenderBIM', alternative: '-' }
      ],
      en: [
        { usage: 'BIM/documentation', recommended: 'Autodesk Revit', alternative: 'ArchiCAD (more intuitive, better on Mac)' },
        { usage: 'Fast AI Design', recommended: 'Snaptrude (cloud, generates a plan in 30 min)', alternative: 'Autodesk Forma' },
        { usage: 'Freeform modeling', recommended: 'Rhino + Grasshopper', alternative: 'SketchUp' },
        { usage: 'Photorealistic rendering', recommended: 'Enscape, Twinmotion, D5 Render', alternative: 'Lumion Pro (AI 4K upscaler)' },
        { usage: 'Generative AI for plans', recommended: 'Maket, TestFit, Finch 3D', alternative: 'Ark Design AI' },
        { usage: 'AI dressing/visualization', recommended: 'Veras (Revit/SketchUp/Rhino/ArchiCAD plugin)', alternative: 'MoldaSpace' },
        { usage: 'Free/open-source', recommended: 'FreeCAD (BIM workbench), BlenderBIM', alternative: '-' }
      ],
      ar: [
        { usage: 'نمذجة معلومات البناء (BIM)/التوثيق', recommended: 'أوتوديسك ريفيت', alternative: 'أركيكاد (أكثر بديهية، أفضل على الماك)' },
        { usage: 'تصميم سريع بالذكاء الاصطناعي', recommended: 'سنابترود (سحابي، يولد خطة في 30 دقيقة)', alternative: 'أوتوديسك فورما' },
        { usage: 'نمذجة حرة', recommended: 'راينو + جراسهوبر', alternative: 'سكتش أب' },
        { usage: 'تصيير واقعي', recommended: 'إن سكيب، توين موشن، دي 5 ريندر', alternative: 'لوميون برو (ترقية 4K بالذكاء الاصطناعي)' },
        { usage: 'ذكاء اصطناعي توليدي للخطط', recommended: 'ماكيت، تيست فيت، فينش 3D', alternative: 'آرك ديزاين AI' },
        { usage: 'إكساء/تصور بالذكاء الاصطناعي', recommended: 'فيراس (إضافة ريفيت/سكتش أب/راينو/أركيكاد)', alternative: 'مولدا سبيس' },
        { usage: 'مجاني/مفتوح المصدر', recommended: 'فري كاد (واجهة BIM)، بلندر BIM', alternative: '-' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Débutant/junior (0-3 ans) : ~8 000-15 000 MAD/mois salarié en cabinet', 'Confirmé (3-8 ans) : ~15 000-20 000 MAD/mois', 'Senior/chef de projet : ~20 000-29 000 MAD/mois', 'Associé/architecte indépendant avec cabinet établi : très variable, peut dépasser largement (~257 000 MAD/an moyenne)', 'BIM Manager en cabinet marocain : ~173 000-182 000 MAD/an', 'Architecte en chef : ~356 000-374 000 MAD/an'] },
        { region: 'International', items: ['USA : médiane $96 690/an (BLS, mai 2024)', 'France : moyenne €50 000-67 000/an selon source', 'Golfe (Dubaï/UAE) : architectes seniors bien au-dessus de la moyenne européenne, souvent net d\'impôt'] }
      ],
      en: [
        { region: 'Morocco', items: ['Beginner/junior (0-3 years): ~8,000-15,000 MAD/month employee in firm', 'Mid-level (3-8 years): ~15,000-20,000 MAD/month', 'Senior/project manager: ~20,000-29,000 MAD/month', 'Partner/freelance architect with established firm: highly variable, can greatly exceed (~257,000 MAD/year average)', 'BIM Manager in Moroccan firm: ~173,000-182,000 MAD/year', 'Chief Architect: ~356,000-374,000 MAD/year'] },
        { region: 'International', items: ['USA: median $96,690/year (BLS, May 2024)', 'France: average €50,000-67,000/year depending on source', 'Gulf (Dubai/UAE): senior architects well above European average, often tax-free'] }
      ],
      ar: [
        { region: 'المغرب', items: ['مبتدئ/جونيور (0-3 سنوات): ~8,000-15,000 درهم/شهر موظف في مكتب', 'متمرس (3-8 سنوات): ~15,000-20,000 درهم/شهر', 'أقدم/مدير مشروع: ~20,000-29,000 درهم/شهر', 'شريك/مهندس مستقل بمكتب مؤسس: متغير جدا، يمكن أن يتجاوز بكثير (~257,000 درهم/سنة متوسط)', 'مدير BIM في مكتب مغربي: ~173,000-182,000 درهم/سنة', 'كبير المهندسين المعماريين: ~356,000-374,000 درهم/سنة'] },
        { region: 'عالميا', items: ['الولايات المتحدة: متوسط 96,690 دولار/سنة (BLS، مايو 2024)', 'فرنسا: متوسط 50,000-67,000 يورو/سنة حسب المصدر', 'الخليج (دبي/الإمارات): المهندسون المعماريون الكبار أعلى بكثير من المتوسط الأوروبي، غالبا معفى من الضرائب'] }
      ]
    }
  },
  {
    id: 'architecture-interieur',
    title: {
      fr: '2. ARCHITECTURE D\'INTÉRIEUR & DÉCORATION',
      en: '2. INTERIOR ARCHITECTURE & DECORATION',
      ar: '2. الهندسة المعمارية الداخلية والديكور'
    },
    side: 'left',
    roadmap: {
      fr: [
        { level: 'Fondations', items: ['Théorie des couleurs, ergonomie, anthropométrie', 'Matériaux (bois, textile, revêtements, éclairage)', 'Dessin technique + relevé de plans existants'] },
        { level: 'Formation', items: ['École spécialisée (au Maroc : instituts privés type LISAA, ESAV, écoles de décoration) ou architecture avec spécialisation intérieure', 'Réglementation ERP (établissements recevant du public) si tu veux faire du commercial/hôtellerie', 'Éclairage technique (lux, température de couleur)'] },
        { level: 'Outils numériques', items: ['SketchUp + plugins de rendu -> très standard pour l\'intérieur', 'Logiciels dédiés déco : Chief Architect, Live Home 3D, Roomstyler', 'Home staging virtuel IA : InstantInterior AI, Collov AI, ReRoom, RoomGPT'] },
        { level: 'Professionnalisation', items: ['Book/portfolio (Instagram, Pinterest, Behance — canal de vente très important dans ce métier)', 'Réseau avec fournisseurs, artisans, entreprises de BTP', 'Spécialisation : résidentiel haut de gamme, hôtellerie, retail, bureaux'] }
      ],
      en: [
        { level: 'Foundations', items: ['Color theory, ergonomics, anthropometry', 'Materials (wood, textile, coverings, lighting)', 'Technical drawing + surveying existing plans'] },
        { level: 'Training', items: ['Specialized school (in Morocco: private institutes like LISAA, ESAV, decoration schools) or architecture with interior specialization', 'ERP regulations (establishments receiving the public) if you want to do commercial/hospitality', 'Technical lighting (lux, color temperature)'] },
        { level: 'Digital Tools', items: ['SketchUp + rendering plugins -> very standard for interiors', 'Dedicated deco software: Chief Architect, Live Home 3D, Roomstyler', 'Virtual AI home staging: InstantInterior AI, Collov AI, ReRoom, RoomGPT'] },
        { level: 'Professionalization', items: ['Book/portfolio (Instagram, Pinterest, Behance — very important sales channel in this profession)', 'Network with suppliers, craftsmen, construction companies', 'Specialization: high-end residential, hospitality, retail, offices'] }
      ],
      ar: [
        { level: 'الأساسيات', items: ['نظرية الألوان، بيئة العمل، القياسات البشرية', 'المواد (الخشب، المنسوجات، الأغطية، الإضاءة)', 'الرسم الفني + مسح الخطط الحالية'] },
        { level: 'التدريب', items: ['مدرسة متخصصة (في المغرب: معاهد خاصة مثل LISAA، ESAV، مدارس الديكور) أو هندسة معمارية بتخصص داخلي', 'لوائح ERP (المؤسسات التي تستقبل الجمهور) إذا كنت ترغب في العمل التجاري/الفندقي', 'الإضاءة الفنية (اللوكس، درجة حرارة اللون)'] },
        { level: 'الأدوات الرقمية', items: ['سكتش أب + إضافات التصيير -> قياسي جدا للداخل', 'برامج الديكور المخصصة: Chief Architect, Live Home 3D, Roomstyler', 'إعداد المنزل الافتراضي بالذكاء الاصطناعي: InstantInterior AI, Collov AI, ReRoom, RoomGPT'] },
        { level: 'الاحتراف', items: ['كتاب/ملف أعمال (انستغرام، بنترست، بيهانس — قناة مبيعات مهمة جدا في هذه المهنة)', 'شبكة مع الموردين والحرفيين وشركات البناء', 'التخصص: سكني راقي، ضيافة، تجزئة، مكاتب'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'Modélisation intérieure', recommended: 'SketchUp Pro, Chief Architect, Live Home 3D' },
        { usage: 'Rendu rapide', recommended: 'Enscape, D5 Render, V-Ray' },
        { usage: 'Home staging / relooking photo IA', recommended: 'InstantInterior AI ($13.50/mois), Collov AI, RoomGPT' },
        { usage: 'Planches tendances / mood board', recommended: 'Milanote, Canva Pro, Pinterest' },
        { usage: 'Devis/gestion de projet déco', recommended: 'Houzz Pro, Studio Designer' }
      ],
      en: [
        { usage: 'Interior modeling', recommended: 'SketchUp Pro, Chief Architect, Live Home 3D' },
        { usage: 'Fast rendering', recommended: 'Enscape, D5 Render, V-Ray' },
        { usage: 'Home staging / AI photo makeover', recommended: 'InstantInterior AI ($13.50/month), Collov AI, RoomGPT' },
        { usage: 'Trend boards / mood board', recommended: 'Milanote, Canva Pro, Pinterest' },
        { usage: 'Quotes/deco project management', recommended: 'Houzz Pro, Studio Designer' }
      ],
      ar: [
        { usage: 'النمذجة الداخلية', recommended: 'سكتش أب برو، تشيف أركيتيكت، لايف هوم 3D' },
        { usage: 'تصيير سريع', recommended: 'إن سكيب، دي 5 ريندر، في-راي' },
        { usage: 'إعداد المنزل / تغيير الصورة بالذكاء الاصطناعي', recommended: 'InstantInterior AI (13.50 دولار/شهر)، Collov AI, RoomGPT' },
        { usage: 'لوحات الاتجاهات / لوحة المزاج', recommended: 'ميلانوت، كانفا برو، بنترست' },
        { usage: 'عروض الأسعار/إدارة مشاريع الديكور', recommended: 'هاوز برو، ستوديو ديزاينر' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Junior/assistant : ~9 500-11 400 MAD/mois', 'Confirmé (2-5 ans) : ~15 000-16 300 MAD/mois', 'Senior (5-10 ans) : ~20 300 MAD/mois', 'Décorateur indépendant avec clientèle établie : peut largement dépasser ces chiffres'] },
        { region: 'International', items: ['USA : médiane interior designer ~$63 000-65 000/an (BLS)', 'France : ~$30 000-45 000/an salarié, plus en indépendant établi', 'Luxe (Marrakech, clientèle internationale) offre des honoraires nettement supérieurs'] }
      ],
      en: [
        { region: 'Morocco', items: ['Junior/assistant: ~9,500-11,400 MAD/month', 'Mid-level (2-5 years): ~15,000-16,300 MAD/month', 'Senior (5-10 years): ~20,300 MAD/month', 'Freelance decorator with established clientele: can greatly exceed these figures'] },
        { region: 'International', items: ['USA: median interior designer ~$63,000-65,000/year (BLS)', 'France: ~$30,000-45,000/year employee, more if established freelance', 'Luxury (Marrakech, international clientele) offers significantly higher fees'] }
      ],
      ar: [
        { region: 'المغرب', items: ['جونيور/مساعد: ~9,500-11,400 درهم/شهر', 'متمرس (2-5 سنوات): ~15,000-16,300 درهم/شهر', 'أقدم (5-10 سنوات): ~20,300 درهم/شهر', 'مصمم ديكور مستقل مع عملاء مؤسسين: يمكن أن يتجاوز هذه الأرقام بكثير'] },
        { region: 'عالميا', items: ['الولايات المتحدة: متوسط مصمم داخلي ~63,000-65,000 دولار/سنة (BLS)', 'فرنسا: ~30,000-45,000 يورو/سنة موظف، أكثر كمستقل مؤسس', 'الفخامة (مراكش، عملاء دوليون) تقدم أتعاب أعلى بكثير'] }
      ]
    }
  },
  {
    id: 'architecture-paysagere',
    title: {
      fr: '4. ARCHITECTURE PAYSAGÈRE',
      en: '4. LANDSCAPE ARCHITECTURE',
      ar: '4. هندسة المناظر الطبيعية'
    },
    side: 'left',
    roadmap: {
      fr: [
        { level: 'Roadmap', items: ['Botanique appliquée, pédologie (sciences du sol), hydrologie', 'Écologie urbaine, gestion des eaux pluviales', 'Formation spécialisée (rare au Maroc — souvent double cursus architecture + spécialisation, ou écoles françaises type ENSP Versailles)', 'Logiciels : AutoCAD/Revit pour le technique, + logiciels SIG (GIS) pour l\'analyse de site', 'Spécialisations 2026 en forte demande : restauration écologique, infrastructures vertes/résilientes, gestion de l\'eau'] }
      ],
      en: [
        { level: 'Roadmap', items: ['Applied botany, pedology (soil science), hydrology', 'Urban ecology, stormwater management', 'Specialized training (rare in Morocco — often double major architecture + specialization, or French schools like ENSP Versailles)', 'Software: AutoCAD/Revit for technical, + GIS software for site analysis', 'High demand specializations in 2026: ecological restoration, green/resilient infrastructure, water management'] }
      ],
      ar: [
        { level: 'خارطة الطريق', items: ['علم النبات التطبيقي، علم التربة (علوم التربة)، الهيدرولوجيا', 'البيئة الحضرية، إدارة مياه الأمطار', 'تدريب متخصص (نادر في المغرب — غالبا تخصص مزدوج هندسة معمارية + تخصص، أو مدارس فرنسية مثل ENSP Versailles)', 'البرمجيات: أوتوكاد/ريفيت للتقنية، + برامج نظم المعلومات الجغرافية (GIS) لتحليل الموقع', 'تخصصات 2026 مطلوبة بشدة: الاستعادة البيئية، البنية التحتية الخضراء/المرنة، إدارة المياه'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'Conception BIM paysage', recommended: 'Vectorworks Landmark (référence du secteur)' },
        { usage: 'SIG / analyse de site', recommended: 'QGIS (gratuit), ArcGIS' },
        { usage: 'Modélisation végétale', recommended: 'Lumion (bibliothèque végétale riche), SketchUp' },
        { usage: 'Analyse environnementale', recommended: 'Autodesk Forma (analyse solaire/vent/bruit)' }
      ],
      en: [
        { usage: 'Landscape BIM design', recommended: 'Vectorworks Landmark (industry reference)' },
        { usage: 'GIS / site analysis', recommended: 'QGIS (free), ArcGIS' },
        { usage: 'Vegetation modeling', recommended: 'Lumion (rich vegetation library), SketchUp' },
        { usage: 'Environmental analysis', recommended: 'Autodesk Forma (solar/wind/noise analysis)' }
      ],
      ar: [
        { usage: 'تصميم BIM للمناظر الطبيعية', recommended: 'فيكتوروركس لاندمارك (مرجع الصناعة)' },
        { usage: 'نظم المعلومات الجغرافية / تحليل الموقع', recommended: 'QGIS (مجاني)، ArcGIS' },
        { usage: 'نمذجة النباتات', recommended: 'لوميون (مكتبة نباتية غنية)، سكتش أب' },
        { usage: 'التحليل البيئي', recommended: 'أوتوديسك فورما (تحليل الشمس/الرياح/الضوضاء)' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Pas de données fiables isolées — profession encore très peu structurée au Maroc, souvent absorbée dans les bureaux d\'architecture. À estimer sur la base des salaires architecture avec un léger discount (marché de niche).'] },
        { region: 'International', items: ['USA : médiane BLS ~$65 760 à $75 000-87 000/an selon PayScale/Glassdoor 2026', 'Meilleurs secteurs : gouvernement/administration publique ($92k), construction ($90k)', 'Croissance projetée ~4% (BLS 2024-2034)'] }
      ],
      en: [
        { region: 'Morocco', items: ['No reliable isolated data — profession still very unstructured in Morocco, often absorbed into architecture or urban planning offices. Estimate based on architecture salaries with a slight discount (niche market).'] },
        { region: 'International', items: ['USA: median BLS ~$65,760 to $75,000-87,000/year according to PayScale/Glassdoor 2026', 'Best sectors: government/public administration ($92k), construction ($90k)', 'Projected growth ~4% (BLS 2024-2034)'] }
      ],
      ar: [
        { region: 'المغرب', items: ['لا توجد بيانات معزولة موثوقة — لا تزال المهنة غير منظمة جدا في المغرب، وغالبا ما يتم استيعابها في مكاتب الهندسة المعمارية أو التخطيط الحضري. تُقدر بناء على رواتب الهندسة المعمارية مع خصم طفيف (سوق متخصص).'] },
        { region: 'عالميا', items: ['الولايات المتحدة: متوسط BLS ~65,760 إلى 75,000-87,000 دولار/سنة وفقا لـ PayScale/Glassdoor 2026', 'أفضل القطاعات: الحكومة/الإدارة العامة (92 ألف دولار)، البناء (90 ألف دولار)', 'النمو المتوقع ~4% (BLS 2024-2034)'] }
      ]
    }
  },
  {
    id: 'urbanisme',
    title: {
      fr: '5. URBANISME',
      en: '5. URBAN PLANNING',
      ar: '5. التخطيط الحضري'
    },
    side: 'left',
    roadmap: {
      fr: [
        { level: 'Roadmap', items: ['Master requis dans la plupart des pays (souvent Bac+5, parfois double cursus architecture/géographie/sciences politiques)', 'Droit de l\'urbanisme, zonage, planification stratégique', 'SIG (GIS) — compétence quasi-obligatoire', 'Modélisation urbaine 3D et simulation (mobilité, densité, ensoleillement)', 'Spécialisations fortes en 2026 : villes intelligentes ("smart cities"), résilience climatique, mobilité douce'] }
      ],
      en: [
        { level: 'Roadmap', items: ['Master\'s required in most countries (often 5-year degree, sometimes double major architecture/geography/political science)', 'Urban planning law, zoning, strategic planning', 'GIS — almost mandatory skill', '3D urban modeling and simulation (mobility, density, sunlight)', 'Strong specializations in 2026: smart cities, climate resilience, soft mobility'] }
      ],
      ar: [
        { level: 'خارطة الطريق', items: ['الماجستير مطلوب في معظم البلدان (غالبا 5 سنوات، أحيانا تخصص مزدوج هندسة معمارية/جغرافيا/علوم سياسية)', 'قانون التخطيط الحضري، تقسيم المناطق، التخطيط الاستراتيجي', 'نظم المعلومات الجغرافية (GIS) — مهارة شبه إلزامية', 'النمذجة والمحاكاة الحضرية ثلاثية الأبعاد (التنقل، الكثافة، ضوء الشمس)', 'تخصصات قوية في 2026: المدن الذكية، المرونة المناخية، التنقل الناعم'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'SIG/analyse territoriale', recommended: 'QGIS, ArcGIS Pro' },
        { usage: 'Modélisation urbaine 3D', recommended: 'CityEngine (Esri), Rhino + Grasshopper' },
        { usage: 'Analyse/masterplanning IA', recommended: 'Autodesk Forma, Sidewalk Labs Delve' },
        { usage: 'Simulation de trafic/mobilité', recommended: 'VISSIM, SUMO (open-source)' }
      ],
      en: [
        { usage: 'GIS/territorial analysis', recommended: 'QGIS, ArcGIS Pro' },
        { usage: '3D urban modeling', recommended: 'CityEngine (Esri), Rhino + Grasshopper' },
        { usage: 'AI Analysis/masterplanning', recommended: 'Autodesk Forma, Sidewalk Labs Delve' },
        { usage: 'Traffic/mobility simulation', recommended: 'VISSIM, SUMO (open-source)' }
      ],
      ar: [
        { usage: 'نظم المعلومات الجغرافية/التحليل الإقليمي', recommended: 'QGIS, ArcGIS Pro' },
        { usage: 'نمذجة حضرية ثلاثية الأبعاد', recommended: 'سيتي إنجين (Esri)، راينو + جراسهوبر' },
        { usage: 'تحليل/تخطيط رئيسي بالذكاء الاصطناعي', recommended: 'أوتوديسك فورما، سايدووك لابز ديلف' },
        { usage: 'محاكاة المرور/التنقل', recommended: 'VISSIM, SUMO (مفتوح المصدر)' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Très peu de données publiques fiables — profession très majoritairement publique (agences urbaines, collectivités), grilles de la fonction publique marocaine à consulter.'] },
        { region: 'International', items: ['USA : médiane BLS $83 720/an (mai 2024)', 'Croissance projetée ~3% (2024-2034)', 'Public vs privé et zone métropolitaine vs rurale sont les 2 facteurs qui font le plus varier le salaire'] }
      ],
      en: [
        { region: 'Morocco', items: ['Very little reliable public data — predominantly public profession (urban agencies, local authorities), Moroccan civil service scales should be consulted.'] },
        { region: 'International', items: ['USA: median BLS $83,720/year (May 2024)', 'Projected growth ~3% (2024-2034)', 'Public vs private and metropolitan vs rural areas are the 2 factors that cause the most salary variation'] }
      ],
      ar: [
        { region: 'المغرب', items: ['القليل جدا من البيانات العامة الموثوقة — مهنة عامة في الغالب (الوكالات الحضرية، السلطات المحلية)، يجب الرجوع إلى جداول الخدمة المدنية المغربية.'] },
        { region: 'عالميا', items: ['الولايات المتحدة: متوسط BLS 83,720 دولار/سنة (مايو 2024)', 'النمو المتوقع ~3% (2024-2034)', 'العام مقابل الخاص والمناطق الحضرية مقابل الريفية هما العاملان اللذان يسببان أكبر تباين في الراتب'] }
      ]
    }
  },
  {
    id: 'design-industriel',
    title: {
      fr: '6. DESIGN INDUSTRIEL',
      en: '6. INDUSTRIAL DESIGN',
      ar: '6. التصميم الصناعي'
    },
    side: 'right',
    children: ['scenographie'],
    roadmap: {
      fr: [
        { level: 'Roadmap', items: ['Dessin technique + esquisse rapide de concept', 'Ergonomie, matériaux, procédés de fabrication (injection plastique, moulage, usinage)', 'CAO paramétrique : SolidWorks ou Fusion 360 (standard du secteur)', 'Prototypage rapide : impression 3D, découpe laser', 'Design UX si orientation produit connecté/digital', 'Portfolio orienté "process" (du croquis au produit fini) — très valorisé par les recruteurs'] }
      ],
      en: [
        { level: 'Roadmap', items: ['Technical drawing + rapid concept sketching', 'Ergonomics, materials, manufacturing processes (plastic injection, molding, machining)', 'Parametric CAD: SolidWorks or Fusion 360 (industry standard)', 'Rapid prototyping: 3D printing, laser cutting', 'UX Design if connected/digital product orientation', 'Portfolio oriented towards "process" (from sketch to finished product) — highly valued by recruiters'] }
      ],
      ar: [
        { level: 'خارطة الطريق', items: ['الرسم الفني + رسم المفهوم السريع', 'بيئة العمل، المواد، عمليات التصنيع (حقن البلاستيك، الصب، التشغيل الآلي)', 'التصميم بمساعدة الحاسوب البارامتري: سوليدووركس أو فيوجن 360 (معيار الصناعة)', 'النماذج الأولية السريعة: الطباعة ثلاثية الأبعاد، القطع بالليزر', 'تصميم تجربة المستخدم (UX) إذا كان التوجه نحو منتج متصل/رقمي', 'ملف أعمال موجه نحو "العملية" (من الرسم إلى المنتج النهائي) — يحظى بتقدير كبير من قبل مسؤولي التوظيف'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'CAO produit', recommended: 'SolidWorks, Autodesk Fusion 360' },
        { usage: 'Sculpture digitale', recommended: 'Rhino + Grasshopper, Blender' },
        { usage: 'Rendu produit', recommended: 'KeyShot (référence absolue en design produit)' },
        { usage: 'Prototypage/génératif IA', recommended: 'Autodesk Fusion (générative design intégré)' },
        { usage: 'Croquis rapide/idéation', recommended: 'Procreate (iPad), Adobe Fresco' }
      ],
      en: [
        { usage: 'Product CAD', recommended: 'SolidWorks, Autodesk Fusion 360' },
        { usage: 'Digital sculpting', recommended: 'Rhino + Grasshopper, Blender' },
        { usage: 'Product rendering', recommended: 'KeyShot (absolute reference in product design)' },
        { usage: 'Prototyping/generative AI', recommended: 'Autodesk Fusion (integrated generative design)' },
        { usage: 'Fast sketching/ideation', recommended: 'Procreate (iPad), Adobe Fresco' }
      ],
      ar: [
        { usage: 'التصميم بمساعدة الحاسوب للمنتج', recommended: 'سوليدووركس، أوتوديسك فيوجن 360' },
        { usage: 'النحت الرقمي', recommended: 'راينو + جراسهوبر، بلندر' },
        { usage: 'تصيير المنتج', recommended: 'كي شوت (مرجع مطلق في تصميم المنتجات)' },
        { usage: 'النماذج الأولية/الذكاء الاصطناعي التوليدي', recommended: 'أوتوديسك فيوجن (تصميم توليدي مدمج)' },
        { usage: 'رسم سريع/تفكير', recommended: 'برو كرييت (آيباد)، أدوبي فريسكو' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Données quasi inexistantes de façon fiable pour ce métier de niche — le secteur industriel (automobile, aéronautique) recrute plutôt des ingénieurs produit/process que des "designers industriels".'] },
        { region: 'International', items: ['USA : médiane généralement citée entre $70 000 et $85 000/an (BLS)', 'Secteurs les mieux payés : automobile, électronique grand public, aérospatial'] }
      ],
      en: [
        { region: 'Morocco', items: ['Almost non-existent reliable data for this niche profession — the industrial sector (automotive, aeronautics) tends to recruit product/process engineers rather than "industrial designers".'] },
        { region: 'International', items: ['USA: median generally cited between $70,000 and $85,000/year (BLS)', 'Highest paid sectors: automotive, consumer electronics, aerospace'] }
      ],
      ar: [
        { region: 'المغرب', items: ['بيانات موثوقة شبه معدومة لهذه المهنة المتخصصة — يميل القطاع الصناعي (السيارات والطيران) إلى توظيف مهندسي المنتجات/العمليات بدلاً من "المصممين الصناعيين".'] },
        { region: 'عالميا', items: ['الولايات المتحدة: المتوسط المذكور عموما بين 70,000 و 85,000 دولار/سنة (BLS)', 'القطاعات الأعلى أجرا: السيارات، الإلكترونيات الاستهلاكية، الطيران'] }
      ]
    }
  },
  {
    id: 'scenographie',
    title: {
      fr: '7. SCÉNOGRAPHIE / DESIGN D\'ESPACE',
      en: '7. SCENOGRAPHY / SPACE DESIGN',
      ar: '7. السينوغرافيا / تصميم الفضاء'
    },
    side: 'right',
    roadmap: {
      fr: [
        { level: 'Roadmap', items: ['Théâtre, muséographie, événementiel — trois débouchés très différents à choisir tôt', 'Formation spécialisée rare (écoles d\'art dramatique, écoles de design d\'espace, ou architecture + spécialisation scénographie)', 'Technique lumière/son (essentiel : DMX, éclairage scénique)', 'Logiciels de plan de scène + simulation d\'éclairage', 'Gestion de projet événementiel (délais très courts, budgets serrés — compétence de gestion critique)'] }
      ],
      en: [
        { level: 'Roadmap', items: ['Theater, museography, events — three very different outlets to choose early', 'Specialized training is rare (drama schools, space design schools, or architecture + scenography specialization)', 'Light/sound technique (essential: DMX, stage lighting)', 'Stage plan software + lighting simulation', 'Event project management (very short deadlines, tight budgets — critical management skill)'] }
      ],
      ar: [
        { level: 'خارطة الطريق', items: ['المسرح، علم المتاحف، الفعاليات — ثلاثة منافذ مختلفة جدا يجب اختيارها مبكرا', 'التدريب المتخصص نادر (مدارس الدراما، مدارس تصميم الفضاء، أو هندسة معمارية + تخصص سينوغرافيا)', 'تقنية الإضاءة/الصوت (أساسي: DMX، إضاءة المسرح)', 'برامج تخطيط المسرح + محاكاة الإضاءة', 'إدارة مشاريع الفعاليات (مواعيد نهائية قصيرة جدا، ميزانيات ضيقة — مهارة إدارة حاسمة)'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'Plan de scène/espace', recommended: 'Vectorworks Spotlight (référence absolue du secteur)' },
        { usage: 'Simulation lumière', recommended: 'WYSIWYG, Capture' },
        { usage: 'Rendu d\'ambiance', recommended: 'SketchUp + Enscape, Lumion' },
        { usage: 'Muséographie/scénario visiteur', recommended: 'Twinmotion (très utilisé pour parcours immersifs)' }
      ],
      en: [
        { usage: 'Stage/space plan', recommended: 'Vectorworks Spotlight (absolute industry reference)' },
        { usage: 'Lighting simulation', recommended: 'WYSIWYG, Capture' },
        { usage: 'Atmosphere rendering', recommended: 'SketchUp + Enscape, Lumion' },
        { usage: 'Museography/visitor scenario', recommended: 'Twinmotion (widely used for immersive journeys)' }
      ],
      ar: [
        { usage: 'مخطط المسرح/الفضاء', recommended: 'فيكتوروركس سبوت لايت (المرجع المطلق في الصناعة)' },
        { usage: 'محاكاة الإضاءة', recommended: 'WYSIWYG, Capture' },
        { usage: 'تصيير الجو', recommended: 'سكتش أب + إن سكيب، لوميون' },
        { usage: 'علم المتاحف/سيناريو الزائر', recommended: 'توين موشن (مستخدم على نطاق واسع في الرحلات الغامرة)' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['Marché de niche, quasi aucune donnée statistique publique fiable. Les scénographes marocains travaillent souvent en freelance sur des contrats événementiels (festivals, etc). Rémunération très variable au projet.'] },
        { region: 'International', items: ['France : scénographe salarié en institution culturelle ~€28 000-40 000/an ; freelance très variable', 'USA : "Set/Exhibit Designer" médiane BLS ~$60 000-65 000/an'] }
      ],
      en: [
        { region: 'Morocco', items: ['Niche market, almost no reliable public statistical data. Moroccan scenographers often work freelance on event contracts (festivals, etc). Remuneration highly variable per project.'] },
        { region: 'International', items: ['France: salaried scenographer in cultural institution ~€28,000-40,000/year; freelance highly variable', 'USA: "Set/Exhibit Designer" median BLS ~$60,000-65,000/year'] }
      ],
      ar: [
        { region: 'المغرب', items: ['سوق متخصص، لا توجد تقريبا بيانات إحصائية عامة موثوقة. غالبا ما يعمل السينوغرافيون المغاربة كمستقلين في عقود الفعاليات (المهرجانات، إلخ). أجر متغير جدا لكل مشروع.'] },
        { region: 'عالميا', items: ['فرنسا: سينوغرافي براتب في مؤسسة ثقافية ~28,000-40,000 يورو/سنة؛ المستقل متغير جدا', 'الولايات المتحدة: "مصمم ديكور/معارض" متوسط BLS ~60,000-65,000 دولار/سنة'] }
      ]
    }
  },
  {
    id: 'bim',
    title: {
      fr: '3. BIM (Building Information Modeling)',
      en: '3. BIM (Building Information Modeling)',
      ar: '3. نمذجة معلومات البناء (BIM)'
    },
    side: 'right',
    general: {
      fr: ['BIM = une compétence transversale, pas un métier isolé. Tu l\'ajoutes à architecture, paysage, urbanisme ou ingénierie.'],
      en: ['BIM = a transversal skill, not an isolated profession. You add it to architecture, landscape, urban planning or engineering.'],
      ar: ['نمذجة معلومات البناء (BIM) = مهارة عرضية، وليست مهنة معزولة. يمكنك إضافتها إلى الهندسة المعمارية أو المناظر الطبيعية أو التخطيط الحضري أو الهندسة.']
    },
    roadmap: {
      fr: [
        { level: '1. Bases CAO', items: ['Maîtriser AutoCAD ou équivalent 2D'] },
        { level: '2. Logiciel BIM principal', items: ['Revit (standard international/USA) OU ArchiCAD (standard Europe/petites structures)'] },
        { level: '3. Interopérabilité IFC', items: ['Comprendre le format IFC (norme ISO 19650), essentiel pour collaborer entre corps de métier'] },
        { level: '4. Coordination/clash detection', items: ['Navisworks (Autodesk)'] },
        { level: '5. Scripting/paramétrique', items: ['Dynamo (gratuit, pour Revit) ou Grasshopper (pour Rhino) — différenciant fort'] },
        { level: '6. Certification', items: ['Formation ISO 19650, certifications Autodesk officielles'] },
        { level: '7. Spécialisation carrière', items: ['BIM Modeleur -> BIM Coordinateur -> BIM Manager (5-7 ans d\'XP BIM) -> Virtual Design & Construction (VDC)'] }
      ],
      en: [
        { level: '1. CAD Basics', items: ['Master AutoCAD or equivalent 2D'] },
        { level: '2. Main BIM software', items: ['Revit (international/USA standard) OR ArchiCAD (Europe/small structures standard)'] },
        { level: '3. IFC Interoperability', items: ['Understand the IFC format (ISO 19650 standard), essential for collaborating between trades'] },
        { level: '4. Coordination/clash detection', items: ['Navisworks (Autodesk)'] },
        { level: '5. Scripting/parametric', items: ['Dynamo (free, for Revit) or Grasshopper (for Rhino) — strong differentiator'] },
        { level: '6. Certification', items: ['ISO 19650 training, official Autodesk certifications'] },
        { level: '7. Career specialization', items: ['BIM Modeler -> BIM Coordinator -> BIM Manager (5-7 years BIM XP) -> Virtual Design & Construction (VDC)'] }
      ],
      ar: [
        { level: '1. أساسيات التصميم بمساعدة الحاسوب (CAD)', items: ['إتقان أوتوكاد أو ما يعادله ثنائي الأبعاد'] },
        { level: '2. برنامج BIM الرئيسي', items: ['ريفيت (المعيار الدولي/الأمريكي) أو أركيكاد (معيار أوروبا/الهياكل الصغيرة)'] },
        { level: '3. قابلية التشغيل البيني IFC', items: ['فهم تنسيق IFC (معيار ISO 19650)، ضروري للتعاون بين المهن'] },
        { level: '4. التنسيق/اكتشاف التعارض', items: ['نافيس وركس (أوتوديسك)'] },
        { level: '5. البرمجة النصية/البارامترية', items: ['دينامو (مجاني، لريفيت) أو جراسهوبر (لراينو) — عامل تمييز قوي'] },
        { level: '6. الشهادات', items: ['تدريب ISO 19650، شهادات أوتوديسك الرسمية'] },
        { level: '7. التخصص الوظيفي', items: ['نمذج BIM -> منسق BIM -> مدير BIM (5-7 سنوات خبرة BIM) -> التصميم والبناء الافتراضي (VDC)'] }
      ]
    },
    tools: {
      fr: [
        { usage: 'Authoring BIM', recommended: 'Autodesk Revit, ArchiCAD' },
        { usage: 'Coordination/clash detection', recommended: 'Navisworks, Solibri' },
        { usage: 'Scripting/automatisation', recommended: 'Dynamo (gratuit), Grasshopper' },
        { usage: 'Open-source', recommended: 'BlenderBIM (IFC natif), FreeCAD BIM workbench' },
        { usage: 'Cloud collaboratif', recommended: 'BIMcloud (ArchiCAD), BIM 360 / Autodesk Construction Cloud' },
        { usage: 'Assistant IA (2026)', recommended: 'Archicad AI Assistant, Glyph AI' }
      ],
      en: [
        { usage: 'BIM Authoring', recommended: 'Autodesk Revit, ArchiCAD' },
        { usage: 'Coordination/clash detection', recommended: 'Navisworks, Solibri' },
        { usage: 'Scripting/automation', recommended: 'Dynamo (free), Grasshopper' },
        { usage: 'Open-source', recommended: 'BlenderBIM (native IFC), FreeCAD BIM workbench' },
        { usage: 'Collaborative cloud', recommended: 'BIMcloud (ArchiCAD), BIM 360 / Autodesk Construction Cloud' },
        { usage: 'AI Assistant (2026)', recommended: 'Archicad AI Assistant, Glyph AI' }
      ],
      ar: [
        { usage: 'تأليف BIM', recommended: 'أوتوديسك ريفيت، أركيكاد' },
        { usage: 'التنسيق/اكتشاف التعارض', recommended: 'نافيس وركس، سوليبري' },
        { usage: 'البرمجة النصية/الأتمتة', recommended: 'دينامو (مجاني)، جراسهوبر' },
        { usage: 'مفتوح المصدر', recommended: 'بلندر BIM (IFC أصلي)، فري كاد واجهة BIM' },
        { usage: 'سحابة تعاونية', recommended: 'BIMcloud (أركيكاد)، BIM 360 / أوتوديسك كونستراكشن كلاود' },
        { usage: 'مساعد الذكاء الاصطناعي (2026)', recommended: 'مساعد أركيكاد بالذكاء الاصطناعي، جليف AI' }
      ]
    },
    salaries: {
      fr: [
        { region: 'Maroc', items: ['BIM Specialist : ~186 000 MAD/an (~15 500 MAD/mois)', 'BIM Manager : ~173 000-182 000 MAD/an (~14 500-15 200 MAD/mois)'] },
        { region: 'International', items: ['USA : BIM Manager moyenne $96 000-126 000/an', 'Europe : BIM Manager gagne généralement 30-50% de plus qu\'un BIM Coordinateur', 'Dubaï/UAE : BIM Manager ~AED 380 000-500 000/an (très élevé, net d\'impôt)'] }
      ],
      en: [
        { region: 'Morocco', items: ['BIM Specialist: ~186,000 MAD/year (~15,500 MAD/month)', 'BIM Manager: ~173,000-182,000 MAD/year (~14,500-15,200 MAD/month)'] },
        { region: 'International', items: ['USA: BIM Manager average $96,000-126,000/year', 'Europe: BIM Manager generally earns 30-50% more than a BIM Coordinator', 'Dubai/UAE: BIM Manager ~AED 380,000-500,000/year (very high, tax-free)'] }
      ],
      ar: [
        { region: 'المغرب', items: ['أخصائي BIM: ~186,000 درهم/سنة (~15,500 درهم/شهر)', 'مدير BIM: ~173,000-182,000 درهم/سنة (~14,500-15,200 درهم/شهر)'] },
        { region: 'عالميا', items: ['الولايات المتحدة: متوسط مدير BIM 96,000-126,000 دولار/سنة', 'أوروبا: يكسب مدير BIM عموما 30-50% أكثر من منسق BIM', 'دبي/الإمارات: مدير BIM ~380,000-500,000 درهم/سنة (عالي جدا، معفى من الضرائب)'] }
      ]
    }
  }
];
