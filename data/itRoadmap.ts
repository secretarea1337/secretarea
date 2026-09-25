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
}

export const itRoadmapData: RoadmapItem[] = [
  {
    id: 'intro',
    title: {
      fr: 'Catégories & Compléments 2026',
      en: 'Categories & 2026 Complements',
      ar: 'الفئات والإضافات 2026'
    },
    subtitle: {
      fr: 'White, Black, Grey Hat, Blue & Purple Team',
      en: 'White, Black, Grey Hat, Blue & Purple Team',
      ar: 'القبعة البيضاء، السوداء، الرمادية، الفريق الأزرق والأرجواني'
    },
    general: {
      fr: [
        '⚠ Règle d\'or : Tout ce que tu apprends ici doit être pratiqué sur des systèmes que tu possèdes ou qui sont légalement autorisés. Hacker sans autorisation est un crime. La vraie voie professionnelle est white hat / ethical hacker, avec contrat, scope écrit et rapport.'
      ],
      en: [
        '⚠ Golden Rule: Everything learned must be practiced on authorized systems. Hacking without authorization is a crime. The true professional path is white hat / ethical hacker, with a contract, written scope, and report.'
      ],
      ar: [
        '⚠ القاعدة الذهبية: كل ما تتعلمه يجب ممارسته على أنظمة مصرح بها. الاختراق بدون إذن جريمة. المسار المهني الحقيقي هو القبعة البيضاء / الهاكر الأخلاقي، مع عقد ونطاق مكتوب وتقرير.'
      ]
    },
    roadmap: {
      fr: [
        {
          level: '⚪ White Hat (Hacker éthique)',
          items: [
            'Définition : Trouve des failles avec autorisation écrite.',
            'Statut : 100% légal, salarié ou freelance.',
            'Missions : Pentest, audit, bug bounty, red teaming, formation.',
            'Revenu : Salarié (junior 25-45k$/an) ou bug bounty (jusqu\'à 6 chiffres/an).'
          ]
        },
        {
          level: '⚫ Black Hat',
          items: [
            'Définition : Exploite des failles sans autorisation (vol, extorsion, sabotage).',
            'Statut : Criminel (ex: loi 07-03 au Maroc, peines de prison).',
            'Réalité : La majorité se font arrêter. Pari perdant sur le long terme.',
            'NB : Ce guide ne couvre jamais l\'exploitation illégale.'
          ]
        },
        {
          level: '⚫⚪ Grey Hat',
          items: [
            'Définition : Teste sans autorisation mais sans intention malveillante.',
            'Statut : Illégal techniquement. L\'accès non autorisé est le problème. À éviter.'
          ]
        },
        {
          level: '🛡️ Blue Team (Défense)',
          items: [
            'Mission : Détecter, bloquer et répondre aux attaques.',
            'Statut : 100% légal (SOC Analyst, Incident Responder).',
            'Contexte 2026 : Pénurie mondiale de talents, plus facile d\'obtenir un 1er emploi qu\'en pentest.',
            'Quotidien : SIEM, analyse réseau, réponse à incident, threat hunting, forensics, hardening.'
          ]
        },
        {
          level: '🟣 Purple Team',
          items: [
            'Définition : Collaboration structurée Red Team (attaque) + Blue Team (défense).',
            'Tendance 2026 : Très demandé car il connecte l\'offensif et le défensif en temps réel.'
          ]
        }
      ],
      en: [
        {
          level: '⚪ White Hat (Ethical Hacker)',
          items: [
            'Definition: Finds flaws with written authorization.',
            'Status: 100% legal, salaried or freelance.',
            'Missions: Pentest, audit, bug bounty, red teaming, training.',
            'Income: Salaried (junior $25-45k/yr) or bug bounty (up to 6 figures/yr).'
          ]
        },
        {
          level: '⚫ Black Hat',
          items: [
            'Definition: Exploits flaws without authorization (theft, extortion, sabotage).',
            'Status: Criminal (e.g., prison sentences).',
            'Reality: Most get caught. A losing bet in the long run.',
            'Note: This guide never covers illegal exploitation.'
          ]
        },
        {
          level: '⚫⚪ Grey Hat',
          items: [
            'Definition: Tests without authorization but without malicious intent.',
            'Status: Technically illegal. Unauthorized access is the issue. Avoid.'
          ]
        },
        {
          level: '🛡️ Blue Team (Defense)',
          items: [
            'Mission: Detect, block, and respond to attacks.',
            'Status: 100% legal (SOC Analyst, Incident Responder).',
            '2026 Context: Global talent shortage, easier to get a 1st job than in pentest.',
            'Daily: SIEM, network analysis, incident response, threat hunting, forensics, hardening.'
          ]
        },
        {
          level: '🟣 Purple Team',
          items: [
            'Definition: Structured collaboration between Red Team (attack) + Blue Team (defense).',
            '2026 Trend: Highly demanded as it connects offensive and defensive in real time.'
          ]
        }
      ],
      ar: [
        {
          level: '⚪ القبعة البيضاء (الهاكر الأخلاقي)',
          items: [
            'التعريف: يجد الثغرات بإذن كتابي.',
            'الوضع: قانوني 100%، موظف أو مستقل.',
            'المهام: اختبار اختراق، تدقيق، صيد ثغرات، فريق أحمر، تدريب.',
            'الدخل: موظف (مبتدئ 25-45 ألف$/سنة) أو صيد ثغرات (حتى 6 أرقام).'
          ]
        },
        {
          level: '⚫ القبعة السوداء',
          items: [
            'التعريف: يستغل الثغرات بدون إذن (سرقة، ابتزاز، تخريب).',
            'الوضع: مجرم (مثل السجن والغرامات).',
            'الواقع: يتم القبض على الأغلبية. رهان خاسر.',
            'ملاحظة: هذا الدليل لا يغطي الاستغلال غير القانوني أبدًا.'
          ]
        },
        {
          level: '⚫⚪ القبعة الرمادية',
          items: [
            'التعريف: يختبر بدون إذن ولكن بلا نية خبيثة.',
            'الوضع: غير قانوني فنيًا. المشكلة في الوصول غير المصرح به. تجنبه.'
          ]
        },
        {
          level: '🛡️ الفريق الأزرق (الدفاع)',
          items: [
            'المهمة: اكتشاف، حظر، والاستجابة للهجمات.',
            'الوضع: قانوني 100% (محلل SOC، مستجيب للحوادث).',
            'سياق 2026: نقص عالمي، أسهل في الحصول على أول وظيفة مقارنة باختبار الاختراق.',
            'يوميًا: SIEM، تحليل الشبكة، الاستجابة للحوادث، صيد التهديدات، التحقيقات، التحصين.'
          ]
        },
        {
          level: '🟣 الفريق الأرجواني',
          items: [
            'التعريف: تعاون منظم بين الفريق الأحمر (هجوم) والفريق الأزرق (دفاع).',
            'اتجاه 2026: مطلوب بشدة لأنه يربط الهجوم والدفاع في الوقت الفعلي.'
          ]
        }
      ]
    }
  },
  {
    id: 'start',
    title: {
      fr: 'Phase 0 — Fondations IT',
      en: 'Phase 0 — IT Foundations',
      ar: 'المرحلة 0 — أساسيات تقنية المعلومات'
    },
    subtitle: {
      fr: '2-4 mois, obligatoire, gratuit',
      en: '2-4 months, mandatory, free',
      ar: '2-4 أشهر، إلزامي، مجاني'
    },
    general: {
      fr: ['Tu ne peux pas casser un système que tu ne comprends pas.'],
      en: ['You cannot break a system you do not understand.'],
      ar: ['لا يمكنك اختراق نظام لا تفهمه.']
    },
    roadmap: {
      fr: [
        {
          level: '1. Réseaux',
          items: ['Modèle OSI/TCP-IP, subnetting, DNS, DHCP, HTTP/HTTPS, VPN', 'Ressources : Professor Messer, Practical Networking']
        },
        {
          level: '2. Systèmes d\'exploitation',
          items: ['Linux : ligne de commande, permissions, processus, bash scripting (OverTheWire Bandit)', 'Distributions : Kali Linux / Parrot OS', 'Windows : Active Directory, PowerShell, registre']
        },
        {
          level: '3. Programmation',
          items: ['Python (obligatoire pour scripting/exploits)', 'Bash', 'C (comprendre buffer overflow, mémoire)', 'JavaScript/PHP (web hacking)']
        },
        {
          level: '4. Bases sécurité',
          items: ['CIA triad, Cryptographie de base, CVE/CVSS', 'Certifs optionnelles : CompTIA Network+ / A+']
        }
      ],
      en: [
        {
          level: '1. Networking',
          items: ['OSI/TCP-IP model, subnetting, DNS, DHCP, HTTP/HTTPS, VPN', 'Resources: Professor Messer, Practical Networking']
        },
        {
          level: '2. Operating Systems',
          items: ['Linux: command line, permissions, processes, bash scripting (OverTheWire Bandit)', 'Distributions: Kali Linux / Parrot OS', 'Windows: Active Directory, PowerShell, registry']
        },
        {
          level: '3. Programming',
          items: ['Python (mandatory for scripting/exploits)', 'Bash', 'C (understand buffer overflow, memory)', 'JavaScript/PHP (web hacking)']
        },
        {
          level: '4. Security Basics',
          items: ['CIA triad, Basic cryptography, CVE/CVSS', 'Optional Certs: CompTIA Network+ / A+']
        }
      ],
      ar: [
        {
          level: '1. الشبكات',
          items: ['نموذج OSI/TCP-IP، تقسيم الشبكات، DNS، DHCP، HTTP/HTTPS، VPN', 'المصادر: Professor Messer، Practical Networking']
        },
        {
          level: '2. أنظمة التشغيل',
          items: ['لينكس: سطر الأوامر، الصلاحيات، العمليات، bash (OverTheWire Bandit)', 'التوزيعات: Kali Linux / Parrot OS', 'ويندوز: Active Directory، PowerShell، الريجستري']
        },
        {
          level: '3. البرمجة',
          items: ['بايثون (إلزامي للسكريبتات)', 'Bash', 'سي C (لفهم الذاكرة)', 'جافا سكريبت/PHP (لاختراق الويب)']
        },
        {
          level: '4. أساسيات الأمن',
          items: ['مثلث CIA، أساسيات التشفير، CVE/CVSS', 'شهادات اختيارية: CompTIA Network+ / A+']
        }
      ]
    }
  },
  {
    id: 'phase1',
    title: {
      fr: 'Phase 1 — Bases Sécurité Offensive',
      en: 'Phase 1 — Offensive Security Basics',
      ar: 'المرحلة 1 — أساسيات الأمن الهجومي'
    },
    subtitle: {
      fr: '3-6 mois',
      en: '3-6 months',
      ar: '3-6 أشهر'
    },
    roadmap: {
      fr: [
        {
          level: 'Concepts Clés',
          items: ['OWASP Top 10 (la base du web hacking)', 'Méthodologie de pentest : Reconnaissance → Scanning → Enumeration → Exploitation → Post-Exploitation → Reporting', 'Cryptographie appliquée (hashing, encoding vs encryption, JWT)']
        },
        {
          level: 'Plateformes d\'entraînement',
          items: [
            'TryHackMe (débutant-friendly, chemins guidés)',
            'HackTheBox (plus difficile, référence de l\'industrie)',
            'PortSwigger Web Security Academy (le meilleur pour le web hacking)',
            'OverTheWire (wargames)',
            'PicoCTF (CTF pour débutants)',
            'VulnHub (VMs vulnérables)'
          ]
        }
      ],
      en: [
        {
          level: 'Key Concepts',
          items: ['OWASP Top 10 (the foundation of web hacking)', 'Pentest Methodology: Reconnaissance → Scanning → Enumeration → Exploitation → Post-Exploitation → Reporting', 'Applied Cryptography (hashing, encoding vs encryption, JWT)']
        },
        {
          level: 'Training Platforms',
          items: [
            'TryHackMe (beginner-friendly, guided paths)',
            'HackTheBox (harder, industry reference)',
            'PortSwigger Web Security Academy (best for web hacking)',
            'OverTheWire (wargames)',
            'PicoCTF (CTF for beginners)',
            'VulnHub (vulnerable VMs)'
          ]
        }
      ],
      ar: [
        {
          level: 'المفاهيم الأساسية',
          items: ['OWASP Top 10 (أساس اختراق الويب)', 'منهجية اختبار الاختراق: الاستطلاع ← المسح ← التعداد ← الاستغلال ← ما بعد الاستغلال ← التقارير', 'التشفير التطبيقي (الهاش، التشفير مقابل الترميز، JWT)']
        },
        {
          level: 'منصات التدريب',
          items: [
            'TryHackMe (مناسب للمبتدئين)',
            'HackTheBox (أكثر صعوبة، معيار الصناعة)',
            'PortSwigger Web Security Academy (الأفضل للويب)',
            'OverTheWire (ألعاب اختراق)',
            'PicoCTF (للمبتدئين)',
            'VulnHub (أجهزة مصابة للتحميل)'
          ]
        }
      ]
    }
  },
  {
    id: 'web-hacking',
    title: {
      fr: 'Web Application Hacking',
      en: 'Web Application Hacking',
      ar: 'اختراق تطبيقات الويب'
    },
    roadmap: {
      fr: [
        {
          level: 'Concepts & Outils',
          items: ['OWASP Top 10, OWASP Testing Guide', 'Burp Suite (Community gratuit, Pro payant)', 'SQLi, XSS, CSRF, SSRF, IDOR, XXE, Auth bypass, Business logic flaws']
        },
        {
          level: 'Labs Pratiques',
          items: ['PortSwigger Academy (gratuit, complet)', 'DVWA', 'bWAPP', 'Juice Shop (OWASP)']
        }
      ],
      en: [
        {
          level: 'Concepts & Tools',
          items: ['OWASP Top 10, OWASP Testing Guide', 'Burp Suite (Community free, Pro paid)', 'SQLi, XSS, CSRF, SSRF, IDOR, XXE, Auth bypass, Business logic flaws']
        },
        {
          level: 'Practical Labs',
          items: ['PortSwigger Academy (free, comprehensive)', 'DVWA', 'bWAPP', 'Juice Shop (OWASP)']
        }
      ],
      ar: [
        {
          level: 'المفاهيم والأدوات',
          items: ['OWASP Top 10, OWASP Testing Guide', 'Burp Suite', 'SQLi, XSS, CSRF, SSRF, IDOR, XXE, تجاوز المصادقة، ثغرات المنطق']
        },
        {
          level: 'مختبرات عملية',
          items: ['PortSwigger Academy (مجاني وشامل)', 'DVWA', 'bWAPP', 'Juice Shop']
        }
      ]
    }
  },
  {
    id: 'network-hacking',
    title: {
      fr: 'Network / Infra Hacking',
      en: 'Network / Infra Hacking',
      ar: 'اختراق الشبكات والبنية التحتية'
    },
    roadmap: {
      fr: [
        {
          level: 'Concepts & Outils',
          items: ['Nmap, Wireshark, Netcat, Metasploit Framework', 'Active Directory attacks (Kerberoasting, Pass-the-hash, BloodHound)']
        },
        {
          level: 'Labs Pratiques',
          items: ['HackTheBox (easy à insane)', 'Proving Grounds (Offsec)']
        }
      ],
      en: [
        {
          level: 'Concepts & Tools',
          items: ['Nmap, Wireshark, Netcat, Metasploit Framework', 'Active Directory attacks (Kerberoasting, Pass-the-hash, BloodHound)']
        },
        {
          level: 'Practical Labs',
          items: ['HackTheBox (easy to insane)', 'Proving Grounds (Offsec)']
        }
      ],
      ar: [
        {
          level: 'المفاهيم والأدوات',
          items: ['Nmap, Wireshark, Netcat, Metasploit Framework', 'هجمات Active Directory (Kerberoasting, Pass-the-hash, BloodHound)']
        },
        {
          level: 'مختبرات عملية',
          items: ['HackTheBox', 'Proving Grounds (Offsec)']
        }
      ]
    }
  },
  {
    id: 'mobile-hacking',
    title: {
      fr: 'Mobile Hacking (Android/iOS)',
      en: 'Mobile Hacking (Android/iOS)',
      ar: 'اختراق الموبايل (Android/iOS)'
    },
    roadmap: {
      fr: [
        {
          level: 'Concepts & Outils',
          items: ['OWASP Mobile Top 10, MASVS/MASTG', 'Outils : MobSF, Frida, Jadx, apktool, Burp Suite']
        },
        {
          level: 'Labs Pratiques',
          items: ['OWASP MASTG Crackmes', 'InsecureBankv2', 'DIVA Android']
        }
      ],
      en: [
        {
          level: 'Concepts & Tools',
          items: ['OWASP Mobile Top 10, MASVS/MASTG', 'Tools: MobSF, Frida, Jadx, apktool, Burp Suite']
        },
        {
          level: 'Practical Labs',
          items: ['OWASP MASTG Crackmes', 'InsecureBankv2', 'DIVA Android']
        }
      ],
      ar: [
        {
          level: 'المفاهيم والأدوات',
          items: ['OWASP Mobile Top 10, MASVS/MASTG', 'الأدوات: MobSF, Frida, Jadx, apktool, Burp Suite']
        },
        {
          level: 'مختبرات عملية',
          items: ['OWASP MASTG Crackmes', 'InsecureBankv2', 'DIVA Android']
        }
      ]
    }
  },
  {
    id: 'cloud-hacking',
    title: {
      fr: 'Cloud Hacking',
      en: 'Cloud Hacking',
      ar: 'اختراق السحابة'
    },
    subtitle: {
      fr: 'AWS / Azure / GCP',
      en: 'AWS / Azure / GCP',
      ar: 'AWS / Azure / GCP'
    },
    roadmap: {
      fr: [
        {
          level: 'Vecteurs & Outils',
          items: ['Misconfigurations IAM, S3 buckets ouverts, privesc cloud', 'Outils : ScoutSuite, Prowler, Pacu']
        },
        {
          level: 'Labs Pratiques',
          items: ['flAWS.cloud', 'CloudGoat', 'HackTheBox Cloud track']
        }
      ],
      en: [
        {
          level: 'Vectors & Tools',
          items: ['IAM Misconfigurations, open S3 buckets, cloud privesc', 'Tools: ScoutSuite, Prowler, Pacu']
        },
        {
          level: 'Practical Labs',
          items: ['flAWS.cloud', 'CloudGoat', 'HackTheBox Cloud track']
        }
      ],
      ar: [
        {
          level: 'المتجهات والأدوات',
          items: ['إعدادات IAM الخاطئة، S3 buckets المفتوحة، تصعيد الصلاحيات السحابية', 'الأدوات: ScoutSuite, Prowler, Pacu']
        },
        {
          level: 'مختبرات عملية',
          items: ['flAWS.cloud', 'CloudGoat', 'HackTheBox Cloud track']
        }
      ]
    }
  },
  {
    id: 'privilege-escalation',
    title: {
      fr: 'Privilege Escalation',
      en: 'Privilege Escalation',
      ar: 'تصعيد الصلاحيات'
    },
    subtitle: {
      fr: 'Server / Windows-Linux',
      en: 'Server / Windows-Linux',
      ar: 'سيرفرات ويندوز ولينكس'
    },
    roadmap: {
      fr: [
        {
          level: 'Ressources & Techniques',
          items: ['Références : GTFOBins, LOLBAS', 'Buffer overflows (TryHackMe Buffer Overflow Prep)']
        },
        {
          level: 'Labs',
          items: ['HackTheBox', 'TryHackMe']
        }
      ],
      en: [
        {
          level: 'Resources & Techniques',
          items: ['References: GTFOBins, LOLBAS', 'Buffer overflows (TryHackMe Buffer Overflow Prep)']
        },
        {
          level: 'Labs',
          items: ['HackTheBox', 'TryHackMe']
        }
      ],
      ar: [
        {
          level: 'المصادر والتقنيات',
          items: ['مراجع: GTFOBins, LOLBAS', 'تجاوز سعة المخزن المؤقت']
        },
        {
          level: 'مختبرات',
          items: ['HackTheBox', 'TryHackMe']
        }
      ]
    }
  },
  {
    id: 'certifications',
    title: {
      fr: 'Phase 3 — Certifications',
      en: 'Phase 3 — Certifications',
      ar: 'المرحلة 3 — الشهادات'
    },
    general: {
      fr: ['Conseil : eJPT / PNPT / Security+ pour commencer → OSCP est le tournant pour Junior Pentester → CRTO pour Red Team.'],
      en: ['Advice: eJPT / PNPT / Security+ to start → OSCP is the turning point for Junior Pentester → CRTO for Red Team.'],
      ar: ['نصيحة: ابدأ بـ eJPT / PNPT / Security+ ← ثم OSCP لتصبح مختبر اختراق مبتدئ ← CRTO لـ Red Team.']
    },
    tools: {
      fr: [
        { usage: 'Débutant', recommended: 'eJPT (~250$)', alternative: 'Bon premier certif pratique' },
        { usage: 'Débutant/Junior', recommended: 'CompTIA Security+ (~370$)', alternative: 'Demandé par RH' },
        { usage: 'Junior Pentester', recommended: 'PNPT (~450$)', alternative: 'Excellent rapport qualité/prix' },
        { usage: 'Référence', recommended: 'OSCP (~1600$)', alternative: 'Ouvre les portes' },
        { usage: 'Web spécialisé', recommended: 'OSWE (~1600$)', alternative: 'Expert web app' },
        { usage: 'Red Team', recommended: 'CRTO (~400$)', alternative: 'Référence Red Team' },
        { usage: 'Blue Team', recommended: 'BTL1/BTL2 (~90-400$)', alternative: 'Bon début Blue Team' }
      ],
      en: [
        { usage: 'Beginner', recommended: 'eJPT (~$250)', alternative: 'Good first practical cert' },
        { usage: 'Beginner/Junior', recommended: 'CompTIA Security+ (~$370)', alternative: 'HR filter' },
        { usage: 'Junior Pentester', recommended: 'PNPT (~$450)', alternative: 'Excellent value' },
        { usage: 'Global Reference', recommended: 'OSCP (~$1600)', alternative: 'Opens doors' },
        { usage: 'Web Specialized', recommended: 'OSWE (~$1600)', alternative: 'Web app expert' },
        { usage: 'Red Team', recommended: 'CRTO (~$400)', alternative: 'Red Team reference' },
        { usage: 'Blue Team', recommended: 'BTL1/BTL2 (~$90-400)', alternative: 'Good Blue Team start' }
      ],
      ar: [
        { usage: 'مبتدئ', recommended: 'eJPT (~250$)', alternative: 'شهادة عملية جيدة كبداية' },
        { usage: 'مبتدئ/جونيور', recommended: 'CompTIA Security+ (~370$)', alternative: 'مطلوبة من الموارد البشرية' },
        { usage: 'جونيور Pentester', recommended: 'PNPT (~450$)', alternative: 'قيمة ممتازة مقابل السعر' },
        { usage: 'مرجع عالمي', recommended: 'OSCP (~1600$)', alternative: 'يفتح لك الأبواب' },
        { usage: 'متخصص ويب', recommended: 'OSWE (~1600$)', alternative: 'خبير تطبيقات ويب' },
        { usage: 'Red Team', recommended: 'CRTO (~400$)', alternative: 'مرجع Red Team' },
        { usage: 'Blue Team', recommended: 'BTL1/BTL2 (~90-400$)', alternative: 'بداية Blue Team جيدة' }
      ]
    }
  },
  {
    id: 'blue-team',
    title: {
      fr: 'Phase 4 — Blue Team',
      en: 'Phase 4 — Blue Team',
      ar: 'المرحلة 4 — الفريق الأزرق'
    },
    subtitle: {
      fr: 'Défense & SOC Analyst',
      en: 'Defense & SOC Analyst',
      ar: 'الدفاع ومحلل مركز عمليات الأمن'
    },
    general: {
      fr: [
        'Ce qu\'il fait : Surveillance (SIEM), réponse à incident, threat hunting, forensics, hardening.',
        'Purple Team : Collaboration Red Team (attaque) et Blue Team (défense) pour améliorer la détection.',
        'Outils gratuits : Splunk (dev), ELK, Wazuh, Wireshark, Volatility, MISP.',
        'Certifs : BTL1, Security+, BTL2, GCIH, GCFA, CySA+.'
      ],
      en: [
        'What they do: Monitoring (SIEM), incident response, threat hunting, forensics, hardening.',
        'Purple Team: Collaboration between Red Team (attack) and Blue Team (defense) to improve detection.',
        'Free tools: Splunk (dev), ELK, Wazuh, Wireshark, Volatility, MISP.',
        'Certs: BTL1, Security+, BTL2, GCIH, GCFA, CySA+.'
      ],
      ar: [
        'ما يفعله: المراقبة (SIEM)، الاستجابة للحوادث، صيد التهديدات، التحقيقات الرقمية، التحصين.',
        'الفريق الأرجواني (Purple Team): تعاون بين فريق الهجوم وفريق الدفاع لتحسين الاكتشاف.',
        'أدوات مجانية: Splunk (dev), ELK, Wazuh, Wireshark, Volatility, MISP.',
        'شهادات: BTL1, Security+, BTL2, GCIH, GCFA, CySA+.'
      ]
    },
    roadmap: {
      fr: [
        {
          level: 'Rôles (Progression)',
          items: ['SOC Analyst Tier 1/2', 'Incident Responder', 'Threat Hunter', 'Digital Forensics Analyst', 'Detection Engineer']
        },
        {
          level: 'Compétences à maîtriser',
          items: ['SIEM, Analyse logs (Sysmon), Trafic réseau (Zeek)', 'EDR, MITRE ATT&CK, Forensics, Playbooks (NIST)']
        },
        {
          level: 'Labs gratuits',
          items: ['LetsDefend, Blue Team Labs Online, CyberDefenders, TryHackMe SOC Level 1']
        }
      ],
      en: [
        {
          level: 'Roles (Progression)',
          items: ['SOC Analyst Tier 1/2', 'Incident Responder', 'Threat Hunter', 'Digital Forensics Analyst', 'Detection Engineer']
        },
        {
          level: 'Skills to master',
          items: ['SIEM, Log analysis (Sysmon), Network traffic (Zeek)', 'EDR, MITRE ATT&CK, Forensics, Playbooks (NIST)']
        },
        {
          level: 'Free Labs',
          items: ['LetsDefend, Blue Team Labs Online, CyberDefenders, TryHackMe SOC Level 1']
        }
      ],
      ar: [
        {
          level: 'الأدوار (التدرج)',
          items: ['محلل SOC المستوى 1/2', 'مستجيب للحوادث', 'صائد التهديدات', 'محلل جنائي رقمي', 'مهندس اكتشاف']
        },
        {
          level: 'مهارات يجب إتقانها',
          items: ['SIEM، تحليل السجلات (Sysmon)، حركة الشبكة (Zeek)', 'EDR، إطار MITRE ATT&CK، التحقيقات، خطط الاستجابة (NIST)']
        },
        {
          level: 'مختبرات مجانية',
          items: ['LetsDefend, Blue Team Labs Online, CyberDefenders, TryHackMe SOC Level 1']
        }
      ]
    }
  },
  {
    id: 'salaries',
    title: {
      fr: 'Salaires réels 2026',
      en: 'Real Salaries 2026',
      ar: 'الرواتب الحقيقية 2026'
    },
    subtitle: {
      fr: 'Détails des Rémunérations',
      en: 'Remuneration Details',
      ar: 'تفاصيل الأجور'
    },
    general: {
      fr: [
        'L\'écart régional se réduit avec le télétravail. Le bug bounty peut dépasser le salaire local.',
        'Les certifications (OSCP, CRTO) et l\'expérience Cloud/AI security sont les leviers de négociation salariale les plus forts en 2026-2027.',
        'Le Blue Team paie presque aussi bien que le Red Team aux USA, avec une barrière d\'entrée plus basse.',
        'Notes : Les chiffres pour certains pays du Golfe ont une forte marge d\'erreur. Les secteurs bancaire/défense paient nettement au-dessus des moyennes pour du personnel certifié OSCP/CRTO.'
      ],
      en: [
        'The regional gap is narrowing with remote work. Bug bounty can exceed local salaries.',
        'Certs (OSCP, CRTO) and Cloud/AI security experience are the strongest negotiation levers for 2026-2027.',
        'Blue Team pays almost as well as Red Team in the US, with a lower barrier to entry.',
        'Notes: Gulf countries data has high margin of error. Banking/defense sectors pay significantly higher for OSCP/CRTO certified personnel.'
      ],
      ar: [
        'الفجوة الإقليمية تتقلص مع العمل عن بعد. صيد الثغرات يمكن أن يتجاوز الراتب المحلي.',
        'الشهادات (OSCP, CRTO) وخبرة Cloud/AI هي أقوى أدوات التفاوض لعام 2026-2027.',
        'الفريق الأزرق يدفع تقريباً مثل الفريق الأحمر في أمريكا، مع حاجز دخول أقل.',
        'ملاحظات: بيانات دول الخليج بها هامش خطأ مرتفع. القطاع المصرفي والدفاع يدفعان أعلى بكثير للحاصلين على OSCP/CRTO.'
      ]
    },
    salaries: {
      fr: [
        { region: 'Pays arabes / MENA (Pentester & Blue Team)', items: [
          'Arabie Saoudite (Pentester moy) : 90 000 – 227 000 SAR (~24 000 – 60 500 $)', 
          'Arabie Saoudite (Junior/Senior) : ~32 000 – 97 000 $',
          'Émirats Arabes Unis (Pentester moy) : 101 700 – 308 000 AED (~27 700 – 84 000 $)',
          'Égypte (Pentester moy) : ~31 400 $',
          'Égypte (Junior/Senior) : ~18 800 – 56 500 $',
          'Maroc (SOC Analyst / Blue Team moy) : ~150 500 MAD (~15 000 $)',
          'Qatar (Cybersecurity/SOC Analyst) : 31-42 $/h (~65 000 – 88 000 $)'
        ]},
        { region: 'International (Pentester)', items: [
          'États-Unis : 123 000$ – 143 000$/an (Junior : ~90 500$, Senior : ~123 000$+)', 
          'Suisse : CHF 120 000 – 180 000/an',
          'Allemagne : 62 500€ – 87 000€/an (Junior : ~48 000€, Senior : ~98 000€)',
          'France : ~45 000€ – 65 000€/an (Junior : ~35 000€, Senior : ~70 000€+)',
          'Australie : Au-dessus de la moyenne mondiale'
        ]},
        { region: 'International (Blue Team / SOC Analyst — USA)', items: [
          'SOC Analyst (Tier 1) : ~100 000$ – 102 000$/an (Fourchette: 75k – 140k$)', 
          'Incident Response Analyst : ~106 000$ – 108 000$/an (Fourchette: 84k – 142k$)',
          'Detection/Security Engineer : ~135 000$/an (Fourchette: 105k – 175k$)',
          'Threat Intelligence Analyst : ~148 000$/an (Fourchette: 105k – 175k$)',
          'Digital Forensics Analyst : ~88 000$/an (Fourchette: 65k – 115k$)',
          'GRC Analyst : ~116 000$/an (Fourchette: 92k – 150k$)'
        ]}
      ],
      en: [
        { region: 'Arab Countries / MENA (Pentester & Blue Team)', items: [
          'Saudi Arabia (Avg Pentester): 90,000 – 227,000 SAR (~$24,000 – $60,500)', 
          'Saudi Arabia (Junior/Senior): ~$32,000 – $97,000',
          'UAE (Avg Pentester): 101,700 – 308,000 AED (~$27,700 – $84,000)',
          'Egypt (Avg Pentester): ~$31,400',
          'Egypt (Junior/Senior): ~$18,800 – $56,500',
          'Morocco (SOC Analyst / Blue Team avg): ~150,500 MAD (~$15,000)',
          'Qatar (Cybersecurity/SOC Analyst): $31-42/h (~$65,000 – $88,000)'
        ]},
        { region: 'International (Pentester)', items: [
          'USA: $123,000 – $143,000/yr (Junior: ~$90,500, Senior: ~$123,000+)', 
          'Switzerland: CHF 120,000 – 180,000/yr',
          'Germany: €62,500 – €87,000/yr (Junior: ~€48,000, Senior: ~€98,000)',
          'France: ~€45,000 – €65,000/yr (Junior: ~€35,000, Senior: ~€70,000+)',
          'Australia: Above global average'
        ]},
        { region: 'International (Blue Team / SOC Analyst — USA)', items: [
          'SOC Analyst (Tier 1): ~$100,000 – $102,000/yr (Range: $75k – $140k)', 
          'Incident Response Analyst: ~$106,000 – $108,000/yr (Range: $84k – $142k)',
          'Detection/Security Engineer: ~$135,000/yr (Range: $105k – $175k)',
          'Threat Intelligence Analyst: ~$148,000/yr (Range: $105k – $175k)',
          'Digital Forensics Analyst: ~$88,000/yr (Range: $65k – $115k)',
          'GRC Analyst: ~$116,000/yr (Range: $92k – $150k)'
        ]}
      ],
      ar: [
        { region: 'الدول العربية / الشرق الأوسط (Pentester & Blue Team)', items: [
          'السعودية (متوسط Pentester): 90 ألف – 227 ألف ريال (~24 ألف – 60.5 ألف $)', 
          'السعودية (مبتدئ/خبير): ~32 ألف – 97 ألف $',
          'الإمارات (متوسط Pentester): 101.7 ألف – 308 ألف درهم (~27.7 ألف – 84 ألف $)',
          'مصر (متوسط Pentester): ~31.4 ألف $',
          'مصر (مبتدئ/خبير): ~18.8 ألف – 56.5 ألف $',
          'المغرب (متوسط SOC Analyst / Blue Team): ~150.5 ألف درهم (~15 ألف $)',
          'قطر (محلل أمن/SOC): 31-42 $/ساعة (~65 ألف – 88 ألف $)'
        ]},
        { region: 'دولي (Pentester)', items: [
          'أمريكا: 123 ألف$ – 143 ألف$/سنة (مبتدئ: ~90.5 ألف$, خبير: ~123 ألف$+)', 
          'سويسرا: 120 ألف – 180 ألف فرنك/سنة',
          'ألمانيا: 62.5 ألف€ – 87 ألف€/سنة (مبتدئ: ~48 ألف€, خبير: ~98 ألف€)',
          'فرنسا: ~45 ألف€ – 65 ألف€/سنة (مبتدئ: ~35 ألف€, خبير: ~70 ألف€+)',
          'أستراليا: أعلى من المتوسط العالمي'
        ]},
        { region: 'دولي (Blue Team / SOC Analyst — أمريكا)', items: [
          'محلل SOC (المستوى 1): ~100 ألف$ – 102 ألف$/سنة (النطاق: 75 ألف – 140 ألف$)', 
          'محلل استجابة للحوادث: ~106 ألف$ – 108 ألف$/سنة (النطاق: 84 ألف – 142 ألف$)',
          'مهندس كشف/أمن: ~135 ألف$/سنة (النطاق: 105 ألف – 175 ألف$)',
          'محلل استخبارات التهديدات: ~148 ألف$/سنة (النطاق: 105 ألف – 175 ألف$)',
          'محلل جنائي رقمي: ~88 ألف$/سنة (النطاق: 65 ألف – 115 ألف$)',
          'محلل GRC: ~116 ألف$/سنة (النطاق: 92 ألف – 150 ألف$)'
        ]}
      ]
    }
  },
  {
    id: 'tools-lab',
    title: {
      fr: 'Boîte à Outils & Lab',
      en: 'Toolbox & Lab',
      ar: 'صندوق الأدوات والمختبر'
    },
    roadmap: {
      fr: [
        {
          level: 'Construire ton Lab (Gratuit)',
          items: [
            '1. VirtualBox / VMware (hyperviseur)',
            '2. Kali Linux (machine attaquante)',
            '3. Machines vulnérables : Metasploitable, DVWA, VulnHub, CloudGoat',
            '4. Réseau interne isolé (Host-only)',
            '5. pfSense (firewall)',
            '6. Active Directory Lab : GOAD (Game of Active Directory)'
          ]
        },
        {
          level: 'Boîte à outils indispensable',
          items: [
            'Recon: Nmap, Amass, Subfinder, Shodan',
            'Web: Burp Suite, OWASP ZAP, sqlmap, ffuf',
            'Exploitation: Metasploit, Hydra, John, Hashcat',
            'AD/Windows: BloodHound, Mimikatz, NetExec, Rubeus',
            'Mobile: MobSF, Frida, Jadx',
            'Cloud: ScoutSuite, Pacu, Prowler',
            'Reverse: Ghidra, IDA Free, x64dbg',
            'OSINT: Maltego CE, theHarvester, SpiderFoot'
          ]
        }
      ],
      en: [
        {
          level: 'Build your Lab (Free)',
          items: [
            '1. VirtualBox / VMware (hypervisor)',
            '2. Kali Linux (attacker machine)',
            '3. Vulnerable machines: Metasploitable, DVWA, VulnHub, CloudGoat',
            '4. Isolated internal network (Host-only)',
            '5. pfSense (firewall)',
            '6. Active Directory Lab: GOAD'
          ]
        },
        {
          level: 'Essential Toolbox',
          items: [
            'Recon: Nmap, Amass, Subfinder, Shodan',
            'Web: Burp Suite, OWASP ZAP, sqlmap, ffuf',
            'Exploitation: Metasploit, Hydra, John, Hashcat',
            'AD/Windows: BloodHound, Mimikatz, NetExec, Rubeus',
            'Mobile: MobSF, Frida, Jadx',
            'Cloud: ScoutSuite, Pacu, Prowler',
            'Reverse: Ghidra, IDA Free, x64dbg',
            'OSINT: Maltego CE, theHarvester, SpiderFoot'
          ]
        }
      ],
      ar: [
        {
          level: 'بناء مختبرك الخاص (مجاني)',
          items: [
            '1. VirtualBox / VMware (برنامج المحاكاة)',
            '2. Kali Linux (جهاز المهاجم)',
            '3. أجهزة مصابة: Metasploitable, DVWA, VulnHub, CloudGoat',
            '4. شبكة داخلية معزولة',
            '5. pfSense (جدار حماية)',
            '6. مختبر Active Directory: مشروع GOAD'
          ]
        },
        {
          level: 'صندوق الأدوات الأساسية',
          items: [
            'الاستطلاع: Nmap, Amass, Subfinder, Shodan',
            'الويب: Burp Suite, OWASP ZAP, sqlmap, ffuf',
            'الاستغلال: Metasploit, Hydra, John, Hashcat',
            'الويندوز وAD: BloodHound, Mimikatz, NetExec, Rubeus',
            'الموبايل: MobSF, Frida, Jadx',
            'السحابة: ScoutSuite, Pacu, Prowler',
            'الهندسة العكسية: Ghidra, IDA Free, x64dbg',
            'OSINT: Maltego CE, theHarvester, SpiderFoot'
          ]
        }
      ]
    }
  },
  {
    id: 'trends',
    title: {
      fr: 'Tendances 2026-2027',
      en: '2026-2027 Trends',
      ar: 'اتجاهات 2026-2027'
    },
    general: {
      fr: [
        'L\'IA accélère les actions offensives, mais la compréhension humaine reste indispensable pour définir le scope.',
        '4 grandes filières : défense, sécurité applicative, pentesting, et le nouveau créneau sécurité IA.',
        'Compétence clé : AI Red Teaming / LLM pentesting (prompt injection, jailbreak).',
        'Vishing boosté par l\'IA (clonage vocal).',
        'Post-quantum cryptography commence à devenir pertinent.'
      ],
      en: [
        'AI accelerates offensive actions, but human understanding remains essential to define the scope.',
        '4 main areas: defense, app sec, pentesting, and the new AI security niche.',
        'Key skill: AI Red Teaming / LLM pentesting (prompt injection, jailbreak).',
        'AI-boosted vishing (voice cloning).',
        'Post-quantum cryptography is starting to become relevant.'
      ],
      ar: [
        'الذكاء الاصطناعي يسرع العمليات الهجومية، لكن الفهم البشري يبقى ضروريًا لتحديد النطاق.',
        '4 مجالات رئيسية: الدفاع، أمن التطبيقات، اختبار الاختراق، وأمن الذكاء الاصطناعي.',
        'مهارة رئيسية: AI Red Teaming / LLM pentesting (حقن الأوامر، اختراق الحماية).',
        'الهندسة الاجتماعية الصوتية المعززة بالذكاء الاصطناعي (استنساخ الصوت).',
        'التشفير ما بعد الكمي يبدأ في أخذ أهمية.'
      ]
    }
  },
  {
    id: 'timeline',
    title: {
      fr: 'Roadmap Chronologique',
      en: 'Chronological Roadmap',
      ar: 'خارطة الطريق الزمنية'
    },
    tools: {
      fr: [
        { usage: 'Mois 1-3', recommended: 'Réseaux, Linux, Python, bases sécurité' },
        { usage: 'Mois 4-6', recommended: 'OWASP Top 10, TryHackMe/PortSwigger, premier lab' },
        { usage: 'Mois 7-9', recommended: 'HackTheBox actif, spécialisation web ou network, viser eJPT' },
        { usage: 'Mois 10-14', recommended: 'Prépa OSCP intensive (PWK/PEN-200), pratique HTB' },
        { usage: 'Mois 15-18', recommended: 'Passage OSCP → candidature Junior Pentester' },
        { usage: 'Mois 18-24+', recommended: 'Spécialisation Red Team (CRTO) ou Cloud/AD, veille continue' }
      ],
      en: [
        { usage: 'Month 1-3', recommended: 'Networking, Linux, Python, security basics' },
        { usage: 'Month 4-6', recommended: 'OWASP Top 10, TryHackMe/PortSwigger, first lab' },
        { usage: 'Month 7-9', recommended: 'Active HTB, web or network spec, aim for eJPT' },
        { usage: 'Month 10-14', recommended: 'Intensive OSCP prep, HTB practice' },
        { usage: 'Month 15-18', recommended: 'Pass OSCP → Junior Pentester application' },
        { usage: 'Month 18-24+', recommended: 'Red Team spec (CRTO) or advanced Cloud/AD, continuous watch' }
      ],
      ar: [
        { usage: 'الأشهر 1-3', recommended: 'الشبكات، لينكس، بايثون، أساسيات الأمن' },
        { usage: 'الأشهر 4-6', recommended: 'OWASP Top 10، TryHackMe/PortSwigger، أول مختبر' },
        { usage: 'الأشهر 7-9', recommended: 'ممارسة HTB، تخصص ويب أو شبكات، استهداف eJPT' },
        { usage: 'الأشهر 10-14', recommended: 'تحضير مكثف لـ OSCP، ممارسة HTB' },
        { usage: 'الأشهر 15-18', recommended: 'اجتياز OSCP ← التقدم لوظيفة Junior Pentester' },
        { usage: 'الأشهر 18-24+', recommended: 'تخصص Red Team (CRTO) أو سحابة/AD، مراقبة مستمرة' }
      ]
    }
  }
];
