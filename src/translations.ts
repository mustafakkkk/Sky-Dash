import { Language } from './types';

export const translations = {
  ar: {
    gameTitle: 'قفزة السماء',
    skyDashAdventure: 'Sky Dash Adventure',
    play: 'ابدأ اللعب',
    weeklyTasks: 'مهام أسبوعية',
    dailyTasks: 'المهام اليومية',
    store: 'المتجر',
    settings: 'الإعدادات',
    aiAssistant: 'مساعد الذكاء الاصطناعي',
    aiAssistantDesc: 'اسأل عن أي شيء يخص اللعبة وسأجيبك!',
    aiPlaceholder: 'اكتب سؤالك هنا...',
    aiThinking: 'جاري التفكير...',
    aiError: 'عذراً، حدث خطأ ما. حاول مرة أخرى.',
    aiNewChat: 'دردشة جديدة',
    aiDeleteChat: 'حذف الدردشة',
    aiNoChats: 'لا توجد دردشات بعد. ابدأ واحدة جديدة!',
    aiChatTitle: 'دردشة',
    aiUploadImage: 'إرفاق صورة',
    aiSystemPrompt: `أنت مساعد ذكي وخبير للعبة "Sky Dash" (قفزة السماء). مهمتك هي مساعدة اللاعبين بالإجابة على أسئلتهم حول اللعبة فقط.

استخدم تنسيق Markdown والرموز التعبيرية (Emojis) لجعل إجاباتك واضحة ومنظمة جداً:
- استخدم القوائم المنقطة (Bullet points) للمعلومات المتعددة.
- استخدم الخط العريض (**Bold**) للكلمات المهمة.
- استخدم العناوين (Headers) إذا كانت الإجابة طويلة.
- استخدم الرموز التعبيرية (مثل 🚀, 🛡️, ⭐, 👾) كعلامات بصرية في بداية الجمل.
- اترك مسافات (سطور فارغة) بين الفقرات المختلفة لتسهيل القراءة.
- تجنب كتابة فقرات طويلة جداً، واجعل الجمل قصيرة وواضحة.

معلومات اللعبة الأساسية:
- التحكم (كمبيوتر): الأسهم أو WASD للتحرك، المسافة (Space) للإطلاق.
- التحكم (جوال): لمس يمين/يسار الشاشة للتحرك، الزر الأحمر للإطلاق.
- الأعداء:
  1. السحب (Clouds): عوائق ثابتة من البداية.
  2. المركبات الفضائية (Spaceships): تظهر بعد 500 نقطة، تطلق كويكبات ضخمة.
  3. الدرونات (Drones): تظهر بعد 1000 نقطة، تلاحق اللاعب بذكاء.
- القدرات (Power-ups):
  1. الدرع (Shield): يحمي من اصطدام واحد بالسحب.
  2. المغناطيس (Magnet): يجذب النجوم القريبة (15 ثانية عند الالتقاط، وطوال الجولة عند الشراء).
  3. الحركة البطيئة (Slow Motion): تبطئ حركة العوائق (طوال الجولة عند الشراء).
  4. النقاط المضاعفة (Double Points): تضاعف النقاط (طوال الجولة عند الشراء).
- المتجر (Store):
  - الدرع: 150 عملة.
  - النقاط المضاعفة: 225 عملة.
  - الحركة البطيئة: 300 عملة.
  - المغناطيس: 275 عملة.
  - الكويكبات النارية (Fire Asteroids): 30 عملة (تعطل المركبة الفضائية 4 ثوانٍ).
- ميزات أخرى: مهام يومية وأسبوعية لجمع العملات، إمكانية الإحياء (Revive) مقابل 100 عملة.
- لوحة الصدارة (نظام الدوريات):
  - الدوريات: توجد 6 دوريات مرتبة من الأسهل للأصعب: **البرونز**، **الفضة**، **الذهب**، **البلاتين**، **الألماس**، **البطوليين**.
  - شروط التأهل والهبوط (بعد 7 أيام):
    1. **منطقة التأهل (المركز 1-10):** الصعود للدوري التالي.
    2. **منطقة البقاء (المركز 11-30):** البقاء في نفس الدوري.
    3. **منطقة الهبوط (المركز 31-61):** العودة للدوري السابق (إلا إذا كنت في دوري البرونز فستبقى فيه).
  - الصعوبة: تزداد صعوبة اللعبة وقوة المنافسين (البوتات) بشكل كبير مع كل دوري جديد.
  - جوائز الموسم: المركز الأول (2000 عملة)، الثاني (1500 عملة)، الثالث (1000 عملة).
  - التحديث: لوحة الصدارة حية وتتطور باستمرار حتى وأنت خارج اللعبة بفضل نظام محاكاة ذكي.
  - التفاصيل: تظهر أعلام الدول، حالة الاتصال (متصل/غير متصل)، واتجاه الرتبة (صعود/هبوط).
  - البوتات: البوتات ذكية جداً، لها مستويات مهارة مختلفة، وتمر بفترات تألق (Streaks) أو تراجع (Slumps) مما يجعل التنافس واقعياً جداً.

قواعد الإجابة:
1. أجب فقط عن الأسئلة المتعلقة بـ Sky Dash.
2. إذا كان السؤال خارج نطاق اللعبة، اعتذر بلباقة وقل: "عذراً، أنا مخصص لمساعدة لاعبي Sky Dash فقط في أمور اللعبة."
3. أجب باللغة العربية بأسلوب ودود ومشجع.`,
    highScore: 'أفضل نتيجة',
    gameOver: 'انتهت اللعبة!',
    greatJob: 'لقد قمت بعمل رائع',
    score: 'النقاط',
    tryAgain: 'حاول مرة أخرى',
    home: 'الرئيسية',
    coins: 'عملة',
    active: 'نشط',
    purchased: 'تم الشراء',
    buy: 'شراء',
    insufficientCoins: 'عملات غير كافية',
    back: 'عودة',
    inbox: 'الصندوق الوارد',
    claimAll: 'استلام الكل',
    noMessages: 'لا توجد رسائل جديدة في الصندوق الوارد',
    inboxDesc: 'هنا تجد جميع مشترياتك ومكافآتك بانتظار الاستلام',
    claimReward: 'استلام المكافأة',
    graphicsQuality: 'جودة الرسومات',
    low: 'منخفضة',
    veryLow: 'منخفضة جداً',
    medium: 'متوسطة',
    high: 'عالية',
    veryLowDesc: 'أسوأ جودة، رسومات قديمة جداً (للهواتف الضعيفة جداً)',
    lowDesc: 'أداء عالي، رسومات بسيطة (للأجهزة الضعيفة)',
    mediumDesc: 'توازن بين الأداء والجودة (للأجهزة المتوسطة)',
    highDesc: 'أفضل جودة بصرية، مؤثرات كاملة (للأجهزة القوية)',
    sound: 'الصوت',
    animations: 'الأنميشن',
    powerSaving: 'توفير الطاقة',
    instructionsBtn: 'التعليمات للمبتدئين',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    endsIn: 'تنتهي خلال',
    renewsIn: 'تتجدد خلال',
    progress: 'التقدم',
    completed: 'مكتمل',
    instructionsTitle: 'تعليمات اللعبة',
    howToPlay: 'كيفية اللعب',
    controlsPC: 'استخدم الأسهم أو مفاتيح WASD للتحرك يميناً ويساراً، واضغط المسافة (Space) للإطلاق.',
    controlsMobile: 'على الجوال، اضغط على يمين أو يسار الشاشة للتحكم بالمركبة، واضغط الزر الأحمر للإطلاق.',
    collectStars: 'اجمع النجوم لزيادة نقاطك والحصول على عملات المتجر.',
    avoidObstacles: 'تجنب الاصطدام بأي شيء يسقط من الأعلى!',
    weaponsTitle: 'الأسلحة والقدرات',
    fireAsteroidsTitle: '🔴 الكويكبات الحمراء',
    fireAsteroidsDesc: 'استخدم الزر الأحمر لإطلاق كويكبات تتعقب المركبة الفضائية وتعطلها لمدة 4 ثوانٍ.',
    powerupsTitle: '⚡ القدرات الخاصة',
    shieldDesc: '🛡️ الدرع: يحميك من اصطدام واحد بالسحب.',
    magnetDesc: '🧲 المغناطيس: يجذب كل النجوم القريبة إليك تلقائياً.',
    slowMoDesc: '❄️ الحركة البطيئة: تبطئ حركة كل شيء لتسهيل المناورة.',
    doublePointsDesc: '💎 النقاط المضاعفة: تضاعف كل النقاط التي تجمعها.',
    enemiesTitle: 'الأعداء والمخاطر',
    clouds: '☁️ السحب',
    cloudsDesc: 'عوائق ثابتة تظهر منذ البداية، اصطدام واحد يعني نهاية اللعبة.',
    spaceships: '🛸 المركبات الفضائية',
    spaceshipsDesc: 'تظهر بعد 500 نقطة. تطلق كويكبات ضخمة باتجاهك، عطلها بالكويكبات الحمراء!',
    drones: '🤖 الدرونات الآلية',
    dronesDesc: 'تظهر بعد 1000 نقطة. ذكية جداً وتلاحق حركتك لمحاولة الاصطدام بك.',
    proTips: 'نصائح للمحترفين',
    storeTip: 'زر المتجر لشراء الدروع والقدرات قبل بدء الجولة.',
    dailyTasksTip: 'أكمل المهام اليومية لجمع العملات بسرعة.',
    difficultyTip: 'كلما زادت نقاطك، زادت سرعة اللعبة وصعوبتها!',
    trackingTip: 'الكويكبات الحمراء ذكية وتلحق المركبة الفضائية تلقائياً!',
    backToSettings: 'عودة للإعدادات',
    paused: 'متوقف مؤقتاً',
    continue: 'اضغط على الزر للاستمرار',
    pcControlsHint: 'استخدم الأسهم أو A/D للتحرك',
    mobileControlsHint: 'المس يمين أو يسار الشاشة للتحرك',
    activeShield: 'درع نشط',
    resume: 'استئناف',
    pause: 'إيقاف مؤقت',
    hoursShort: 'س',
    minutesShort: 'د',
    daysShort: 'ي',
    and: 'و',
    versionInfo: 'v1.3.0 • تحديث الأداء',
    eidMubarak: 'عيد مبارك جميعا!',
    events: 'الأحداث',
    activeEvents: 'الأحداث النشطة',
    noActiveEvents: 'لا توجد أحداث نشطة حالياً',
    eventEndsIn: 'ينتهي الحدث خلال:',
    eidEventTitle: 'حدث عيد سعيد!',
    eidEventDesc: 'بمناسبة العيد، احصل على درع مجاني في كل جولة!',
    freeShield: 'درع مجاني مفعل',
    eventFree: 'مجاني خلال الحدث',
    dailyChest: 'صندوق المكافأة اليومية',
    openChest: 'افتح الصندوق',
    allTasksDone: 'أكملت جميع مهام اليوم!',
    chestReward: 'لقد حصلت على:',
    rewardShield: 'درع واقٍ مجاني',
    rewardCoins: 'عملة ذهبية',
    rewardSlowMo: 'حركة بطيئة (20 ثانية)',
    rewardMagnet: 'مغناطيس النجوم (25 ثانية)',
    claim: 'استلام',
    reviveTitle: 'هل تريد الحياة؟',
    reviveOneTime: 'فرصة واحدة فقط لكل جولة!',
    reviveDesc: 'مقابل 100 عملة يمكنك الاستمرار من حيث توقفت!',
    yes: 'نعم',
    no: 'لا',
    weeklyTasksTitles: {
      weekly_score_5000: 'بطل الأسبوع',
      weekly_stars_200: 'صائد النجوم المحترف',
      weekly_games_20: 'طيار لا يتعب',
      weekly_spaceship_hits_40: 'مُعذّب المركبات الفضائية',
      weekly_time_600: 'سيد التحليق',
    },
    weeklyTasksDescs: {
      weekly_score_5000: 'اجمع 5000 نقطة إجمالية في أسبوع واحد',
      weekly_stars_200: 'اجمع 200 نجمة إجمالية',
      weekly_games_20: 'العب 20 جولة كاملة',
      weekly_spaceship_hits_40: 'اضرب المركبة الفضائية بالكويكبات الحمر 40 مرة',
      weekly_time_600: 'حلق لمدة 10 دقائق (600 ثانية) إجمالية',
    },
    dailyTasksTitles: {
      task_score_1500: 'جامع النقاط',
      task_stars_30: 'صياد النجوم',
      task_games_3: 'الطيار النشط',
      task_time_120: 'المحلق الصبور',
      task_difficulty_1_5: 'تحدي السرعة',
      task_score_500: 'المحترف اليومي',
      task_stars_15: 'مبتدئ النجوم',
      task_games_5: 'إدمان اللعب',
    },
    dailyTasksDescs: {
      task_score_1500: 'اجمع 1500 نقطة إجمالية',
      task_stars_30: 'اجمع 30 نجمة إجمالية',
      task_games_3: 'العب 3 جولات كاملة',
      task_time_120: 'حلق لمدة 120 ثانية إجمالية',
      task_difficulty_1_5: 'وصل لمستوى صعوبة 1.5 في أي جولة',
      task_score_500: 'اجمع 500 نقطة إجمالية',
      task_stars_15: 'اجمع 15 نجمة إجمالية',
      task_games_5: 'العب 5 جولات كاملة',
    },
    powerupNames: {
      shield: 'الدرع الواقي',
      double_points: 'النقاط المضاعفة',
      slow_motion: 'الحركة البطيئة',
      magnet: 'مغناطيس النجوم',
      fire_asteroid: 'كويكبات نارية',
    },
    powerupDescs: {
      shield: 'يحميك من اصطدام واحد بالسحب',
      double_points: 'تحصل على ضعف النقاط طوال الجولة',
      slow_motion: 'يبطئ حركة السحب طوال الجولة',
      magnet: 'يجذب النجوم القريبة إليك طوال الجولة',
      fire_asteroid: 'تضرب المركبة الفضائية وتمنعها من الرمي لمدة 4 ثوانٍ (بحد أقصى 25)',
    },
    leaderboard: 'لوحة الصدارة',
    offlineLeaderboard: 'لوحة الصدارة (أوفلاين)',
    rank: 'المركز',
    player: 'اللاعب',
    bot: 'بوت',
    stars: 'نجوم',
    you: 'أنت',
    leaderboardDesc: 'تنافس مع أفضل الطيارين في المجرة!',
    leaderboardResetIn: 'تتصفر لوحة الصدارة خلال:',
    seasonEnds: 'الموسم ينتهي في:',
    rewards: 'المكافآت',
    firstPlace: 'المركز الأول',
    secondPlace: 'المركز الثاني',
    thirdPlace: 'المركز الثالث',
    rewardClaimed: 'تم استلام مكافآت الموسم!',
    awesome: 'رائع!',
    aiScrollToBottom: 'النزول لآخر رسالة',
    bronzeLeague: 'دوري البرونز',
    silverLeague: 'دوري الفضة',
    goldLeague: 'دوري الذهب',
    platinumLeague: 'دوري البلاتين',
    diamondLeague: 'دوري الألماس',
    heroicLeague: 'دوري البطوليين',
    promotionZone: 'منطقة التأهل',
    stayZone: 'منطقة البقاء',
    relegationZone: 'منطقة الهبوط',
    season: 'الموسم',
    online: 'متصل',
    offline: 'غير متصل',
    ago: 'منذ',
    leaderboardFooter: 'لوحة صدارة حية وتنافسية',
    sector: 'القطاع',
    sectors: {
      1: 'الغلاف الجوي',
      2: 'السديم الأرجواني',
      3: 'حزام الكويكبات',
      4: 'الفضاء العميق'
    },
    combo: 'كومبو',
    intensity: {
      NORMAL: 'طبيعي',
      INTENSE: 'مكثف!',
      RECOVERY: 'استراحة'
    },
    skyPass: 'سكاي باس'
  },
  en: {
    gameTitle: 'Sky Dash',
    skyDashAdventure: 'Sky Dash Adventure',
    play: 'Play Now',
    weeklyTasks: 'Weekly Tasks',
    dailyTasks: 'Daily Tasks',
    store: 'Store',
    settings: 'Settings',
    aiAssistant: 'AI Assistant',
    aiAssistantDesc: 'Ask anything about the game and I will answer!',
    aiPlaceholder: 'Type your question here...',
    aiThinking: 'Thinking...',
    aiError: 'Sorry, something went wrong. Try again.',
    aiNewChat: 'New Chat',
    aiDeleteChat: 'Delete Chat',
    aiNoChats: 'No chats yet. Start a new one!',
    aiChatTitle: 'Chat',
    aiUploadImage: 'Attach Image',
    aiSystemPrompt: `You are an expert intelligent assistant for the game "Sky Dash". Your mission is to help players by answering their questions about the game only.

Use Markdown formatting and Emojis to make your answers extremely clear and organized:
- Use bullet points for multiple pieces of information.
- Use bold text (**Bold**) for important keywords.
- Use headers if the answer is long.
- Use emojis (e.g., 🚀, 🛡️, ⭐, 👾) as visual cues at the start of sentences.
- Leave empty lines between different sections to improve readability.
- Avoid writing very long paragraphs; keep sentences short and clear.

Core Game Information:
- Controls (PC): Arrows or WASD to move, Space to fire.
- Controls (Mobile): Touch left/right side of screen to move, Red button to fire.
- Enemies:
  1. Clouds: Static obstacles from the start.
  2. Spaceships: Appear after 500 points, they fire huge asteroids.
  3. Drones: Appear after 1000 points, they intelligently track the player.
- Power-ups:
  1. Shield: Protects from one collision with clouds.
  2. Magnet: Attracts nearby stars (15s when collected, entire round when bought).
  3. Slow Motion: Slows down obstacles (entire round when bought).
  4. Double Points: Doubles points earned (entire round when bought).
- Store:
  - Shield: 150 coins.
  - Double Points: 225 coins.
  - Slow Motion: 300 coins.
  - Magnet: 275 coins.
  - Fire Asteroids: 30 coins (stuns spaceship for 4 seconds).
- Other Features: Daily and Weekly tasks for coins, Revive option for 100 coins.
- Leaderboard (League System):
  - Leagues: There are 6 leagues ordered from easiest to hardest: **Bronze**, **Silver**, **Gold**, **Platinum**, **Diamond**, **Heroic**.
  - Promotion/Relegation Rules (every 7 days):
    1. **Promotion Zone (Rank 1-10):** Advance to the next league.
    2. **Stay Zone (Rank 11-30):** Remain in the current league.
    3. **Relegation Zone (Rank 31-61):** Drop to the previous league (unless in Bronze League).
  - Difficulty: Game difficulty and bot skill increase significantly with each higher league.
  - Season Rewards: 1st Place (2000 coins), 2nd Place (1500 coins), 3rd Place (1000 coins).
  - Updates: The leaderboard is live and constantly evolves even when you are offline, thanks to an intelligent simulation system.
  - Details: Shows country flags, online status (Online/Offline), and rank trends (Up/Down).
  - Bots: Bots are highly intelligent, have different skill levels, and experience performance streaks or slumps, making competition very realistic.

Response Rules:
1. Only answer questions related to Sky Dash.
2. If the question is outside the game's scope, politely apologize and say: "Sorry, I am dedicated to helping Sky Dash players with game-related matters only."
3. Answer in English in a friendly and encouraging style.`,
    highScore: 'High Score',
    gameOver: 'Game Over!',
    greatJob: 'You did a great job',
    score: 'Score',
    tryAgain: 'Try Again',
    home: 'Home',
    coins: 'Coins',
    active: 'Active',
    purchased: 'Purchased',
    buy: 'Buy',
    insufficientCoins: 'Not enough coins',
    back: 'Back',
    inbox: 'Inbox',
    claimAll: 'Claim All',
    noMessages: 'No new messages in your inbox',
    inboxDesc: 'Here you find all your purchases and rewards waiting to be claimed',
    claimReward: 'Claim Reward',
    graphicsQuality: 'Graphics Quality',
    low: 'Low',
    veryLow: 'Very Low',
    medium: 'Medium',
    high: 'High',
    veryLowDesc: 'Worst quality, retro graphics (for very weak devices)',
    lowDesc: 'High performance, simple graphics (for weak devices)',
    mediumDesc: 'Balance between performance and quality (for medium devices)',
    highDesc: 'Best visual quality, full effects (for powerful devices)',
    sound: 'Sound',
    animations: 'Animations',
    powerSaving: 'Power Saving',
    instructionsBtn: 'Instructions for Beginners',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    endsIn: 'Ends in',
    renewsIn: 'Renews in',
    progress: 'Progress',
    completed: 'Completed',
    instructionsTitle: 'Game Instructions',
    howToPlay: 'How to Play',
    controlsPC: 'Use arrows or WASD keys to move right and left, and press Space to fire.',
    controlsMobile: 'On mobile, tap the right or left of the screen to move, and tap the red button to fire.',
    collectStars: 'Collect stars to increase your score and get store coins.',
    avoidObstacles: 'Avoid colliding with anything falling from above!',
    weaponsTitle: 'Weapons & Abilities',
    fireAsteroidsTitle: '🔴 Red Asteroids',
    fireAsteroidsDesc: 'Use the red button to fire asteroids that track the spaceship and stun it for 4 seconds.',
    powerupsTitle: '⚡ Special Power-ups',
    shieldDesc: '🛡️ Shield: Protects you from one collision with clouds.',
    magnetDesc: '🧲 Magnet: Automatically attracts all nearby stars to you.',
    slowMoDesc: '❄️ Slow Motion: Slows down everything to make maneuvering easier.',
    doublePointsDesc: '💎 Double Points: Doubles all points you collect.',
    enemiesTitle: 'Enemies and Hazards',
    clouds: '☁️ Clouds',
    cloudsDesc: 'Static obstacles that appear from the start, one collision means game over.',
    spaceships: '🛸 Spaceships',
    spaceshipsDesc: 'Appear after 500 points. They fire huge asteroids at you, stun them with red asteroids!',
    drones: '🤖 Automated Drones',
    dronesDesc: 'Appear after 1000 points. Very smart and track your movement to try and collide with you.',
    proTips: 'Pro Tips',
    storeTip: 'Visit the store to buy shields and abilities before starting a round.',
    dailyTasksTip: 'Complete daily tasks to collect coins quickly.',
    difficultyTip: 'The higher your score, the faster and harder the game gets!',
    trackingTip: 'Red asteroids are smart and track the spaceship automatically!',
    backToSettings: 'Back to Settings',
    paused: 'Paused',
    continue: 'Press the button to continue',
    pcControlsHint: 'Use Arrows or A/D to move',
    mobileControlsHint: 'Touch left or right of screen to move',
    activeShield: 'Active Shield',
    resume: 'Resume',
    pause: 'Pause',
    hoursShort: 'h',
    minutesShort: 'm',
    daysShort: 'd',
    and: '&',
    versionInfo: 'v1.3.0 • Performance Update',
    eidMubarak: 'Eid Mubarak Everyone!',
    events: 'Events',
    activeEvents: 'Active Events',
    noActiveEvents: 'No active events at the moment',
    eventEndsIn: 'Event ends in:',
    eidEventTitle: 'Happy Eid Event!',
    eidEventDesc: 'Celebrate Eid with a free shield in every round!',
    freeShield: 'Free Shield Active',
    eventFree: 'Free during event',
    dailyChest: 'Daily Reward Chest',
    openChest: 'Open Chest',
    allTasksDone: 'All daily tasks completed!',
    chestReward: 'You received:',
    rewardShield: 'Free Shield',
    rewardCoins: 'Gold Coins',
    rewardSlowMo: 'Slow Motion (20s)',
    rewardMagnet: 'Star Magnet (25s)',
    claim: 'Claim',
    reviveTitle: 'Want to Revive?',
    reviveOneTime: 'One-time offer per round!',
    reviveDesc: 'For 100 coins you can continue from where you left off!',
    yes: 'Yes',
    no: 'No',
    weeklyTasksTitles: {
      weekly_score_5000: 'Weekly Hero',
      weekly_stars_200: 'Pro Star Hunter',
      weekly_games_20: 'Tireless Pilot',
      weekly_spaceship_hits_40: 'Spaceship Tormentor',
      weekly_time_600: 'Flight Master',
    },
    weeklyTasksDescs: {
      weekly_score_5000: 'Collect 5000 total points in one week',
      weekly_stars_200: 'Collect 200 total stars',
      weekly_games_20: 'Play 20 full rounds',
      weekly_spaceship_hits_40: 'Hit the spaceship with red asteroids 40 times',
      weekly_time_600: 'Fly for 10 minutes (600 seconds) total',
    },
    dailyTasksTitles: {
      task_score_1500: 'Point Collector',
      task_stars_30: 'Star Hunter',
      task_games_3: 'Active Pilot',
      task_time_120: 'Patient Flyer',
      task_difficulty_1_5: 'Speed Challenge',
      task_score_500: 'Daily Pro',
      task_stars_15: 'Star Beginner',
      task_games_5: 'Game Addict',
    },
    dailyTasksDescs: {
      task_score_1500: 'Collect 1500 total points',
      task_stars_30: 'Collect 30 total stars',
      task_games_3: 'Play 3 full rounds',
      task_time_120: 'Fly for 120 seconds total',
      task_difficulty_1_5: 'Reach difficulty level 1.5 in any round',
      task_score_500: 'Collect 500 total points',
      task_stars_15: 'Collect 15 total stars',
      task_games_5: 'Play 5 full rounds',
    },
    powerupNames: {
      shield: 'Protective Shield',
      double_points: 'Double Points',
      slow_motion: 'Slow Motion',
      magnet: 'Star Magnet',
      fire_asteroid: 'Fire Asteroids',
    },
    powerupDescs: {
      shield: 'Protects you from one collision with clouds',
      double_points: 'Get double points for the entire round',
      slow_motion: 'Slows down cloud movement for the entire round',
      magnet: 'Attracts nearby stars for the entire round',
      fire_asteroid: 'Hits the spaceship and stops it from firing for 4 seconds (Max 25)',
    },
    leaderboard: 'Leaderboard',
    offlineLeaderboard: 'Leaderboard (Offline)',
    rank: 'Rank',
    player: 'Player',
    bot: 'Bot',
    stars: 'Stars',
    you: 'You',
    leaderboardDesc: 'Compete with the best pilots in the galaxy!',
    leaderboardResetIn: 'Leaderboard resets in:',
    seasonEnds: 'Season ends in:',
    rewards: 'Rewards',
    firstPlace: '1st Place',
    secondPlace: '2nd Place',
    thirdPlace: '3rd Place',
    rewardClaimed: 'Season Rewards Claimed!',
    awesome: 'Awesome!',
    aiScrollToBottom: 'Scroll to bottom',
    bronzeLeague: 'Bronze League',
    silverLeague: 'Silver League',
    goldLeague: 'Gold League',
    platinumLeague: 'Platinum League',
    diamondLeague: 'Diamond League',
    heroicLeague: 'Heroic League',
    promotionZone: 'Promotion Zone',
    stayZone: 'Stay Zone',
    relegationZone: 'Relegation Zone',
    season: 'Season',
    online: 'Online',
    offline: 'Offline',
    ago: 'ago',
    leaderboardFooter: 'Live and competitive leaderboard',
    sector: 'Sector',
    sectors: {
      1: 'The Atmosphere',
      2: 'Purple Nebula',
      3: 'Asteroid Belt',
      4: 'Deep Space'
    },
    combo: 'Combo',
    intensity: {
      NORMAL: 'Normal',
      INTENSE: 'Intense!',
      RECOVERY: 'Recovery'
    },
    skyPass: 'Sky Pass'
  }
};

export const getTranslation = (lang: Language) => translations[lang];
