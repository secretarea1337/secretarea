import { useLanguage } from '../src/contexts/LanguageContext';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiWolframlanguage } from 'react-icons/si';
import Icon from './Icon';
import { CommentItem } from './CommentItem';

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  reactions: {
    like: number;
    dislike: number;
    love: number;
  };
}

export interface Comment {
  id: string;
  itemId: string;
  author: string;
  text: string;
  tags: string[];
  reactions: {
    like: number;
    dislike: number;
    love: number;
  };
  timestamp: string;
  replies?: CommentReply[];
}

const AVAILABLE_TAGS = [
  "Masterpiece 🏆", "Buggy 🐛", "Hidden Gem 💎", 
  "Nostalgia 🕰️", "Overrated 📉", "Must Play 🔥",
  "Great Story 📖", "Hardcore 💀", "Chill ☕"
];

const NAME_ADJECTIVES = ['Ghost', 'Cyber', 'Dark', 'Elite', 'Ninja', 'Shadow', 'Neo', 'Tech', 'Sniper', 'Agent', 'Dr', 'Kira', 'Alpha', 'Pro', 'Hacker', 'Silent', 'Crazy', 'Mad', 'Toxic', 'Epic', 'Mystic', 'Iron', 'Blood', 'Ice', 'Fire', 'Venom', 'Doom', 'Void', 'Savage', 'Furious', 'Solid', 'Ahmed', 'Youssef', 'Ali', 'Omar', 'Alex', 'Ivan', 'Carlos', 'Kenji', 'Moha', 'Sayed'];
const NAME_NOUNS = ['Protocol', 'Gamer', 'Knight', 'Guru', 'Zero', 'Sec', 'Pro', 'Wolf', 'Dragon', 'Code', '1337', 'X', '99', 'DZ', 'Maroc', 'Sniper', 'Hunter', 'Killer', 'Slayer', 'Beast', 'Fox', 'Bear', 'Tiger', 'Lion', 'Viper', 'Phantom', 'Wraith', 'Demon', 'Angel', 'Samurai', 'Ronin', 'KSA', 'EG', 'Dev', 'San', 'Matrix', 'Smith', 'Brasil', 'Japan', 'Russian', 'Germany'];

const getFakeTextsForGames = (title: string = 'this game') => [
  { lang: 'en', text: `Works perfectly! Thanks for the upload.` },
  { lang: 'ar', text: `شغال 100%، شكرا جزيلا على المجهود` },
  { lang: 'darija', text: `nadi canadi khouya, lay 7fdek` },
  { lang: 'fr', text: `Super, installation très facile. Merci!` },
  { lang: 'es', text: `¡Funciona de maravilla! Saludos desde España.` },
  { lang: 'ru', text: `Всё работает отлично, спасибо автору!` },
  { lang: 'zh', text: `非常感谢，下载速度很快，完美运行！` },
  { lang: 'ja', text: `完璧に動作しました。ありがとうございます！` },
  { lang: 'ko', text: `잘 작동합니다. 공유해주셔서 감사합니다!` },
  { lang: 'en', text: `Been looking for ${title} everywhere. You are a lifesaver. 😍` },
  { lang: 'ar', text: `أسطورة، جاري التحميل والتجربة 🔥` },
  { lang: 'darija', text: `tbarkellah 3lik a sat, dima top` },
  { lang: 'en', text: `Just tested ${title} on Windows 11 23H2, running flawlessly without any crashes or bugs. Great packing job!` },
  { lang: 'en', text: `Installation took a bit longer than expected due to unpacking speed, but it completely works and performance is solid. Recommended.` },
  { lang: 'en', text: `My antivirus flagged one of the files as a false positive, added it to exclusions and everything is running smooth.` },
  { lang: 'en', text: `This is the most stable version of ${title} I found online. Can confirm it works perfectly even on my low end machine. 🚀` },
  { lang: 'en', text: `I faced a missing DLL error initially, but reinstalling vcredist fixed it immediately. Thanks bro! 👊` },
  { lang: 'ar', text: `شغال بدون أي مشاكل، سرعة التحميل خرافية.` },
  { lang: 'ar', text: `للي يواجه مشكلة في التثبيت، طفوا الانتي فايروس وتشتتغل معاكم طبيعي، تسلم ايدك على الرفع.` },
  { lang: 'darija', text: `khedama mzyan. bnesba l drari li makatbghich tkhdm lhm ytiro l windows defender rah kaymskheha` },
  { lang: 'darija', text: `wa narri tbarkellah 3lik akhouya, hadchi m9wd w madi ma fih tachi mochkil` },
  { lang: 'es', text: `Probado en Windows 10, y el rendimiento es brutal. Ningún tipo de malware, 100% limpio.` },
  { lang: 'es', text: `Tuve un pequeño error al inicio, pero ejecutarlo como administrador lo solucionó.` },
  { lang: 'fr', text: `Testé sur ma machine, aucune perte de FPS. Le crack est très propre, bravo.` },
  { lang: 'fr', text: `J\'ai dû mettre à jour mes pilotes graphiques mais après ça, que du bonheur. 😎` },
  { lang: 'ru', text: `Репак шикарный, установился за 10 минут. Никаких лагов и вылетов нет.` },
  { lang: 'ru', text: `Была проблема с запуском, но нужно было просто обновить DirectX. Автору респект!` },
  { lang: 'en', text: `If anyone gets a black screen on startup for ${title}, try unchecking the full screen optimization in properties.` },
  { lang: 'en', text: `Literally the only site I trust for these files. Always top notch quality and fast mirrors. ❤️` },
  { lang: 'en', text: `Was skeptical at first about the file size for ${title}, but the compression is just insane. Fully verified it with CRC check.` },
  { lang: 'ar', text: `النسخة ذي فيها كل الإضافات لـ ${title} صح ؟ لاني دورت عليها كثير.` },
  { lang: 'ar', text: `ما شاء الله عليك، اول مره اشوف موقع يوفر كذا روابط سريعه ومافيها إعلانات مزعجة.` },
  { lang: 'darija', text: `Chokran bzaaaf 3la lmjhod dyalek, ch7al w ana kan9leb 3liha mcrackya mzyan` },
  { lang: 'pt', text: `Funcionando perfeitamente irmão! Parabéns pelo trabalho excelente.` },
  { lang: 'de', text: `Läuft einwandfrei ohne jegliche Probleme. Vielen Dank für die Mühe!` },
  { lang: 'tr', text: `Sorunsuz çalışıyor, emekleriniz için çok teşekkür ederim.` },
  { lang: 'en', text: `I absolutely love ${title}! ❤️ Played it all weekend, couldn't stop.` },
  { lang: 'en', text: `Who designed the boss fights in ${title}? They are ridiculously hard! 🤬` },
  { lang: 'en', text: `Not gonna lie, the story in ${title} made me cry a little at the end. 😭` },
  { lang: 'en', text: `Why did the intro take 2 hours? Still a solid 8/10 tho. 😂` },
  { lang: 'ar', text: `قصة ${title} عبارة عن تحفة فنية بصراحة! أبدعوا فيها بشكل كبير. ❤️` },
  { lang: 'en', text: `This game is an absolute unit! ${title} lived up to the hype for once. 🙌` },
  { lang: 'en', text: `Bruh, my PC sounds like a jet engine running ${title}. 😂 but totally worth it. 🛫` },
  { lang: 'en', text: `Honestly I wasn't expecting much, but ${title} completely blew me away. 10/10` },
  { lang: 'ar', text: `أخيراً لقيت ${title} برابط مباشر! أنقذتني يا بطل 🥇` },
  { lang: 'en', text: `The graphics in ${title} are next level. Literally took screenshots every 5 mins 📸` },
  { lang: 'darija', text: `${title} l3ba mraya a drari, li mzl mjarbhash ydirha tchargi db 🔥🔥` },
  { lang: 'es', text: `¡${title} es una locura! Los gráficos son espectaculares. 🤯` },
  { lang: 'fr', text: `J'ai pleuré de joie en trouvant ${title} ici. Merci le Boss ! 👑` },
  { lang: 'en', text: `I've uninstalled and reinstalled ${title} like 3 times now because I keep coming back to it. Addicting af.` },
  { lang: 'en', text: `Did anyone else experience framedrops in the city area? It's playable but kinda annoying :/` },
  { lang: 'en', text: `I hate the ending of ${title} so much... why did they do my boy like that?! 😡` },
  { lang: 'en', text: `Me before playing ${title}: "It's probably overhyped." Me after 50 hours: "I owe this masterpiece an apology." 🙇‍♂️` },
  { lang: 'ar', text: `لعبة ${title} جابت لي الضغط والسكر من صعوبتها، بس الممتع إني ما قدرت أوقف لعب 😅` },
  { lang: 'ar', text: `أحببت كل لحظة في ${title}. شكراً على الرفع الرائع والنسخة الخالية من المشاكل! 💕` },
  { lang: 'es', text: `Sinceramente, ${title} es el mejor juego que he probado este año. Increíble.` },
  { lang: 'fr', text: `C'est normal que je bloque sur le même boss dans ${title} depuis 3 heures ? Je vais casser ma manette 🤬` },
  { lang: 'ru', text: `Атмосфера в ${title} просто невероятная. Играешь и забываешь про реальность. ✨` },
  { lang: 'pt', text: `Mano, ${title} travou no meu PC da Xuxa, mas no do meu amigo rodou liso. O jogo é bom demais kkkk` },
  { lang: 'en', text: `Pro tip for ${title}: Save often! The autosave is merciless... lost 2 hours of progress 😭` },
  { lang: 'en', text: `The OST for ${title} is an absolute banger. Literally listening to it on Spotify right now 🎧🔥` },
  { lang: 'en', text: `I was having an awful week, and playing ${title} actually made me feel a lot better. Thank you. 💖` },
  { lang: 'darija', text: `wa layn3al tasilt had l boss lakhr, chwht mn 7yati 😡😂` },
  { lang: 'en', text: `Wait wait wait... is ${title} actually this good or am I dreaming? The mechanics are so fluid! ✨` }
];

const getFakeTextsForTools = (title: string = 'this tool') => [
  { lang: 'en', text: `Works perfectly on my system! Really needed ${title} for my workflow. Thank you! 💻` },
  { lang: 'ar', text: `تطبيق ممتاز ومفيد جداً. شكراً لك على رفع أحدث نسخة من ${title} وبدون مشاكل.` },
  { lang: 'darija', text: `nadi lprogram, kan m7ttajo druri f khedmti. lay 7fdk a bro 🙏` },
  { lang: 'fr', text: `L'installation de ${title} s'est très bien passée. Excellent outil au quotidien.` },
  { lang: 'es', text: `¡${title} es justo lo que estaba buscando! Funciona muy fluido y no consume recursos.` },
  { lang: 'ru', text: `Отличная программа, всё активировалось без проблем. Огромное спасибо! 🛠️` },
  { lang: 'zh', text: `完美兼容我的电脑，非常实用的工具！` },
  { lang: 'ja', text: `期待通りに機能しました。重宝しています！` },
  { lang: 'en', text: `Been searching for a clean version of ${title} for weeks. You saved my sanity! 😍` },
  { lang: 'ar', text: `يا سلام عليك! البرنامج مفعل وجاهز. والله إنك أسطورة 🔥` },
  { lang: 'darija', text: `khedam 10/10, makrahtch tzidna hta plugins dyalo ila kano. thlay f rasek 👑` },
  { lang: 'en', text: `Tested ${title} on a fresh Windows 11 install, running flawlessly without any annoying popups. Great repacking!` },
  { lang: 'en', text: `My antivirus flagged it at first, but I whitelisted the patcher and it fully activated ${title}. Running smooth now.` },
  { lang: 'en', text: `This is the most stable build of ${title} I've found online. The performance optimization is actually insane. 🚀` },
  { lang: 'ar', text: `البرنامج شغال بدون أي مشاكل والتفعيل مدى الحياة. أفضل موقع لتحميل البرامج بدون إعلانات مزعجة.` },
  { lang: 'ar', text: `للي تواجهه مشكلة في تنصيب ${title}، تأكدوا أنكم تقفلون النت وقت التفعيل وتشتغل تمام التمام!` },
  { lang: 'darija', text: `li bgha ytbto ytfy lwifi w antivirus, rah khedam naddiii a drari.` },
  { lang: 'es', text: `Rendimiento brutal. Ha mejorado mi productividad un 200%. 100% limpio sin malware.` },
  { lang: 'fr', text: `Aucun bug rencontré, l'interface de ${title} est vraiment propre et réactive. Je valide. 😎` },
  { lang: 'ru', text: `Прога просто топ! Установилась за минуту, работает как часы.` },
  { lang: 'en', text: `I love how lightweight ${title} is compared to the alternatives. Doesn't hog my RAM at all. 🧠` },
  { lang: 'en', text: `I had a crash on launch initially, but running it as Administrator fixed it immediately. Just a heads up for anyone else!` },
  { lang: 'ar', text: `ممكن توفير التحديث القادم متى ما نزل؟ صراحة صرت أعتمد عليكم في كل شيء.` },
  { lang: 'en', text: `If you're hesitating to download ${title}, just do it. It automated half of my daily tasks. 😂` },
  { lang: 'es', text: `¡Increíble la cantidad de utilidades que tiene esta versión! Muy recomendado. 🤯` },
  { lang: 'fr', text: `Je pleurais sur mon ancien logiciel, ${title} est tellement plus rapide et moderne. 👏` },
  { lang: 'pt', text: `Mano, esse app salvou meu dia. Fácil de usar e bem direto ao ponto. Vlw demais! kkk` },
  { lang: 'en', text: `Pro tip: You can customize the shortcuts in settings to make ${title} even faster for your workflow. 🎧` },
  { lang: 'en', text: `Literally the only site I trust for these apps. Always top notch quality and secure mirrors. ❤️` },
  { lang: 'darija', text: `wa fin khesni nrkli la bghit nbdel lougha drari ? lmohim lprogram sda9 nadi ✅` }
];

const getFakeTextsForSaves = (title: string = 'this file') => [
  { lang: 'en', text: `This 100% save file for ${title} saved my life! Skipped the grinding. 💯` },
  { lang: 'ar', text: `تخزينة أسطورية، شكراً لك وفرت علي ساعات من اللعب الممل في ${title} ❤️` },
  { lang: 'darija', text: `tbarkellah 3lik, fkitina mn l grind. save nadi ✅` },
  { lang: 'fr', text: `Save à 100% parfaite, tout est débloqué. Merci beaucoup !` },
  { lang: 'es', text: `¡Esta partida guardada es una maravilla! Todo desbloqueado. 😎` },
  { lang: 'ru', text: `Отличное сохранение на 100%, всё открыто! Спасибо!` },
  { lang: 'zh', text: `完美的100%全收集存档，太省心了！` },
  { lang: 'en', text: `Finally all characters unlocked! Installation was super easy. 🔥` },
  { lang: 'ar', text: `شباب الطريقة شغالة ومضمونة 100%، شكراً على الرفع.` },
  { lang: 'darija', text: `nadi lay 7fdk, bghit njerb l mawaslat kharj l khedma, mzyana 👏` },
  { lang: 'en', text: `Works flawlessly. Put it in my save folder and everything loaded correctly. 🎮` },
  { lang: 'en', text: `Does this DLC unlocker work for the latest version? Edit: Yes it does! 😍` },
  { lang: 'en', text: `The language pack fixed my issue! Now playing in my native language. 👍` },
  { lang: 'ar', text: `ملف التعريب ممتاز جداً ومافيه أي أخطاء، أنصحكم فيه.` },
  { lang: 'ar', text: `شغال التختيم بكل شيء ماكس! الفلوس، الأسلحة، كل شيء 100%. خيالي 💸` },
  { lang: 'darija', text: `mod d ltofanatif mzyan, lfer9 kayban f grafikk. sadi9i m3a dak l patch mzyan` },
  { lang: 'es', text: `Todo full, dinero ilimitado y todos los coches desbloqueados. Rápido y seguro 🚘` },
  { lang: 'fr', text: `Super fix, le jeu ne crash plus au lancement. Excellent travail ! 🛠️` },
  { lang: 'ru', text: `Патч помог решить проблему с текстурами. Молодцы.` },
  { lang: 'en', text: `If you can't find the save folder, it's usually in AppData\\Local. Just drop it there and replace! 📂` },
  { lang: 'en', text: `I accidentally deleted my save after 60 hours in ${title}... you literally rescued my playthrough. 😭❤️` },
  { lang: 'ar', text: `تخزينة كاملة مكملة، بس لا تنسون تاخذون نسخة احتياطية لتخزينتكم الأصلية قبل النقل.` },
  { lang: 'en', text: `The mods and extras included are amazing. Completely changed my experience with ${title} 🙌` },
  { lang: 'es', text: `Instalé las texturas HD y parece un juego de nueva generación. ¡Increíble! ✨` },
  { lang: 'fr', text: `Wow, c'est exactement ce qu'il me fallait pour reprendre le jeu sans tout refaire. 🚀` },
  { lang: 'pt', text: `Save game perfeito, nível máximo e com todos os itens. Show de bola!` },
  { lang: 'en', text: `Best save file ever! Tested it and got no ban since it's just local data. Awesome. 🛡️` },
  { lang: 'en', text: `Could you please upload a save file right before the final boss? This 100% one is great though! 🙏` },
  { lang: 'darija', text: `chokran a khay, rah dlite l patch w l3ba wlat katrta7. top 👍` }
];

function seededRandom(seed: number) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzS2jQfIave1KcB0_JdlE7Akv0y5i2HzR2N_Cy3vrCTs5q7r-Uv8duxrlv7lZiAKA3eiw/exec';

export const CommentsSection: React.FC<{ itemId: string, itemTitle?: string, itemCategory?: string }> = ({ itemId, itemTitle, itemCategory }) => {
  const { dir, t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fakeComments = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < itemId.length; i++) hash = itemId.charCodeAt(i) + ((hash << 5) - hash);
    
    const numFakes = Math.floor(seededRandom(hash) * 12) + 5; // 5 to 16 comments
    const fakes: Comment[] = [];
    
    // Determine category texts
    const isTool = itemCategory === 'architect' || itemId.startsWith('A') || itemId.startsWith('tool-');
    const isSave = itemCategory === 'extra' || itemId.startsWith('E');
    
    let texts = getFakeTextsForGames(itemTitle || 'this game');
    if (isTool) {
        texts = getFakeTextsForTools(itemTitle || 'this tool');
    } else if (isSave) {
        texts = getFakeTextsForSaves(itemTitle || 'this save');
    }
    
    // Randomize order based on seed but keep it deterministic
    const shuffledTexts = [...texts].sort((a, b) => seededRandom(hash + a.text.length) - 0.5);
    
    // We only create as many fakes as we have unique text templates to avoid repetition
    const actualNumFakes = Math.min(numFakes, shuffledTexts.length);
    
    const usedAuthors = new Set<string>();

    for (let i = 0; i < actualNumFakes; i++) {
        const seed = hash + i * 100;
        
        let authorStr = '';
        let loopSafe = 0;
        // Generate unique author
        do {
            const tempSeed = seed + loopSafe * 13;
            const nameAdjIdx = Math.floor(seededRandom(tempSeed) * NAME_ADJECTIVES.length);
            const nameNounIdx = Math.floor(seededRandom(tempSeed + 1) * NAME_NOUNS.length);
            const nameSuffix = Math.floor(seededRandom(tempSeed + 2) * 9999);
            authorStr = `${NAME_ADJECTIVES[nameAdjIdx]}_${NAME_NOUNS[nameNounIdx]}${nameSuffix}`;
            loopSafe++;
        } while (usedAuthors.has(authorStr) && loopSafe < 10);
        usedAuthors.add(authorStr);

        const tagIdx = Math.floor(seededRandom(seed + 4) * AVAILABLE_TAGS.length);
        
        const daysAgo = Math.floor(seededRandom(seed + 5) * 30) + 1;
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);

        const hasReplies = seededRandom(seed + 9) > 0.6;
        const numReplies = hasReplies ? Math.floor(seededRandom(seed + 10) * 3) + 1 : 0;
        const fakeReplies: CommentReply[] = [];
        
        let replyBank = [
            "Totally agree with this!", "Thanks for the heads up.", "Same here lol.", "Interesting point!", 
            "Appreciate the info bro 🙏", "Exactly what I was looking for, thanks!", "Didn't know that, thanks for sharing.", 
            "Can confirm this works on my end too.", "Awesome, going to try this out now.", "Good to know! 🔥", 
            "I had the same issue, glad it's fixed now.", "Was wondering about this, thanks!", "Legit advice right here.", 
            "tbarkellah 3lik a khouya", "شكراً جزيلاً، جاري التجربة", "Works perfectly for me as well.", 
            "I was getting errors before but this makes sense.", "Thanks man, you saved me a lot of time.", "Bro this is actually so helpful.", 
            "Ah I see, that makes a lot of sense now.", "You're an absolute legend for this.", "Glad I scrolled down to read the comments first.", 
            "Perfect timing, I needed exactly this.", "Any idea if this works on the new update?", "Merci pour l'astuce !", 
            "¡Gracias por la información!", "This community is the best 😂", "Big if true.", "Nah I don't think that's right...", 
            "Thanks for clarifying that.", "Oh wow, I completely missed that detail.", "I've been stuck on this for hours, bless you.", 
            "Wait, really? I gotta check this.", "My antivirus is acting up but I'll trust this.", "Thanks bro, really appreciate it.", 
            "LFG! Exactly what I needed.", "Good looks. 👊", "Ayo thanks for the heads up.", "Finally a real answer.", "Super helpful, thanks!", "Good catch!",
            "This is why I love this site.", "You dropped this 👑", "Is this safe?", "I can verify this.", "Facts.", "Fr bro.", "100%", "This actually worked wtf", "Bruh thank you", "I was so confused until I read this",
            "This was super insightful, appreciate the detail.", "Took me a while to get it but this made it click.", "Can you elaborate on that a bit more?", "Man this saved my whole day.", "Such a goated reply.", "You always have the best tips here.", "I tried doing it another way and failed, this works perfectly.", "Honestly never thought about it like that before."
        ];
        
        if (itemCategory === 'game') {
            replyBank = [...replyBank, "Does this version include the latest DLC?", "My FPS dropped a bit but it's playable.", "Is this the repack version or full?", "Can I use my old saves with this?", "Multiplayer works perfectly fine guys!"];
        } else if (itemCategory === 'hypervisor') {
            replyBank = [...replyBank, "Does this bypass anti-cheat?", "Make sure to disable Secure Boot first.", "My VM is running so much smoother now.", "Did you pass through the GPU successfully?", "Is this detected by Vanguard?"];
        } else if (itemCategory === 'steamtools' || itemCategory === 'tools') {
            replyBank = [...replyBank, "This tool is a lifesaver.", "Make sure to run it as administrator.", "Does it work on Windows 11?", "False positive on VirusTotal, it's safe.", "How do I configure the settings?"];
        } else if (itemCategory === 'savegame' || itemId.startsWith('E')) {
            replyBank = [...replyBank, "100% completion? Awesome.", "Where do I put the save file?", "My game doesn't recognize the save.", "Thanks, skipping that boring tutorial now.", "Does this unlock all characters?"];
        }
        
        for (let j = 0; j < numReplies; j++) {
            const rd = new Date(d);
            rd.setHours(rd.getHours() + Math.floor(seededRandom(seed + 11 + j) * 24) + 1);
            
            // Smart author name generation for replies
            const rSeed = seed + 12 + j;
            let rAuthorStr = '';
            let rLoopSafe = 0;
            do {
                const tempSeed = rSeed + rLoopSafe * 13;
                const rNameAdjIdx = Math.floor(seededRandom(tempSeed) * NAME_ADJECTIVES.length);
                const rNameNounIdx = Math.floor(seededRandom(tempSeed + 1) * NAME_NOUNS.length);
                const rNameSuffix = Math.floor(seededRandom(tempSeed + 2) * 9999);
                rAuthorStr = `${NAME_ADJECTIVES[rNameAdjIdx]}_${NAME_NOUNS[rNameNounIdx]}${rNameSuffix}`;
                rLoopSafe++;
            } while ((usedAuthors.has(rAuthorStr) || rAuthorStr === authorStr) && rLoopSafe < 10);
            usedAuthors.add(rAuthorStr);

            const rText = replyBank[Math.floor(seededRandom(seed + 13 + j) * replyBank.length)];

            fakeReplies.push({
                id: `fake-reply-${itemId}-${i}-${j}`,
                author: rAuthorStr,
                text: rText,
                timestamp: rd.toISOString(),
                reactions: {
                    like: Math.floor(seededRandom(seed + 14 + j) * 10),
                    dislike: 0,
                    love: 0
                }
            });
        }

        fakes.push({
            id: `fake-${itemId}-${i}`,
            itemId,
            author: authorStr,
            text: shuffledTexts[i].text,
            tags: [AVAILABLE_TAGS[tagIdx]],
            reactions: {
                like: Math.floor(seededRandom(seed + 6) * 50) + 5,
                dislike: Math.floor(seededRandom(seed + 7) * 3),
                love: Math.floor(seededRandom(seed + 8) * 20) + 1
            },
            timestamp: d.toISOString(),
            replies: fakeReplies
        });
    }
    
    return fakes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [itemId, itemTitle, itemCategory]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setFetching(true);
      let loadedComments: Comment[] = [];
      let fetchSuccess = false;
      try {
        // Try fetching from Google Sheet
        const response = await fetch(`${API_ENDPOINT}?action=getComments&itemId=${itemId}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            loadedComments = data.comments || [];
            fetchSuccess = true;
          }
        }
      } catch (error) {
        // Suppressed warning
      }

      // Fallback to local storage if script fails or isn't updated
      if (!fetchSuccess) {
          const localData = localStorage.getItem(`comments_${itemId}`);
          if (localData) {
            loadedComments = JSON.parse(localData);
          }
      } else {
          // Sync local storage with DB state
          localStorage.setItem(`comments_${itemId}`, JSON.stringify(loadedComments));
      }
      
      // Merge real and fake comments, sort by date
      const allComments = [...fakeComments, ...loadedComments];
      const uniqueComments = Array.from(new Map(allComments.map(c => [c.id, c])).values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const ids = uniqueComments.map(c => c.id);
      if (new Set(ids).size !== ids.length) console.error('DUPLICATES IN UNIQUE COMMENTS:', ids);
      setComments(uniqueComments);
      
      setFetching(false);
    };

    loadComments();
  }, [itemId, fakeComments]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 3) // Max 3 tags
    );
  };

  const handleReaction = async (commentId: string, replyId: string | null, type: 'like' | 'dislike' | 'love') => {
    // Optimistic update
    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        if (replyId) {
          const replies = c.replies ? [...c.replies] : [];
          const rIdx = replies.findIndex(r => r.id === replyId);
          if (rIdx >= 0) {
            replies[rIdx] = { ...replies[rIdx], reactions: { ...replies[rIdx].reactions, [type]: replies[rIdx].reactions[type] + 1 } };
          }
          return { ...c, replies };
        }
        return { ...c, reactions: { ...c.reactions, [type]: c.reactions[type] + 1 } };
      }
      return c;
    });
    setComments(updatedComments);
    localStorage.setItem(`comments_${itemId}`, JSON.stringify(updatedComments));

    // Try sending to Google Sheet
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'reactComment', commentId, replyId, type }),
        mode: 'no-cors'
      });
    } catch (e) {
      // Ignore errors if script isn't updated
    }
  };

  
  const handleReplySubmit = async (commentId: string, replyText: string) => {
    const reply: CommentReply = {
      id: Date.now().toString(),
      author: authorName.trim() || 'Anonymous Wolf',
      text: replyText,
      timestamp: new Date().toISOString(),
      reactions: { like: 0, dislike: 0, love: 0 }
    };
    
    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    });
    
    setComments(updatedComments);
    localStorage.setItem(`comments_${itemId}`, JSON.stringify(updatedComments));
    
    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'addReply', commentId, reply }),
        mode: 'no-cors'
      });
    } catch (e) {
      // Ignored
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const commentData: Comment = {
      id: Date.now().toString(),
      itemId,
      author: authorName.trim() || 'Anonymous Wolf',
      text: newComment.trim(),
      tags: selectedTags,
      reactions: { like: 0, dislike: 0, love: 0 },
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [commentData, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`comments_${itemId}`, JSON.stringify(updatedComments));

    try {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'addComment', comment: commentData }),
        mode: 'no-cors'
      });
    } catch (error) {
      console.warn("Failed to save to Google Sheet, saved locally.");
    }

    setNewComment('');
    setSelectedTags([]);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8"
    >
      <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Icon name="MessageSquare" size={24} className="text-blue-500" /> {t('Join the Conversation')} </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
            <SiWolframlanguage size={20} className="text-slate-700 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder={t("Your Alias (Optional)...")} 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 pb-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors mb-4 placeholder:text-slate-600 dark:text-slate-400"
              maxLength={20}
            />
            <textarea
              id="comment-input"
              placeholder={t("Drop your intel, review, or funny thoughts here...")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows={3}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Tags Selection */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-500 uppercase tracking-wider mb-2">Tag this Intel (Max 3):</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading || !newComment.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
            {t('Post Intel')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {fetching ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader" size={24} className="text-blue-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <SiWolframlanguage size={40} className="mx-auto text-slate-700 dark:text-slate-300 dark:text-slate-700 mb-3 opacity-50" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-500">No intel dropped yet. Be the first wolf to howl!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <CommentItem 
                key={`${comment.id}-${index}`}
                comment={comment}
                onReaction={handleReaction}
                onReplySubmit={handleReplySubmit}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Wolf Intel Dispatch Terminal Footer Widget */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-blue-500/25 shadow-xl relative overflow-hidden text-white backdrop-blur-md">
          {/* Subtle Cyberpunk ambient glow */}
          <div className="absolute -top-10 -end-10 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -start-10 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Info & status badge */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <SiWolframlanguage size={22} className="text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase">
                    {t('Wolf Intel Dispatch')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    {t('Status: Synchronized')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('Got a working fix, crack update, or tip?')}
                </p>
              </div>
            </div>

            {/* Right: Quick actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('comment-input');
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Icon name="MessageSquare" size={13} />
                <span>{t('Share intel above')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const modal = document.getElementById('modal-scroll-container');
                  if (modal) {
                    modal.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                title={t('Back to Top')}
              >
                <Icon name="ArrowUp" size={13} />
                <span className="hidden xs:inline">{t('Back to Top')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
