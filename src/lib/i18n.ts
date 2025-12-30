// Internationalization (i18n) - Multi-language support

export type Language = "th" | "en";

export const translations = {
  th: {
    // Common
    back: "กลับ",
    loading: "กำลังโหลด...",
    error: "เกิดข้อผิดพลาด",
    close: "ปิด",
    save: "บันทึก",
    cancel: "ยกเลิก",
    edit: "แก้ไข",
    delete: "ลบ",
    add: "เพิ่ม",
    search: "ค้นหา",
    confirm: "ยืนยัน",

    // Game Selection
    selectGame: "เลือกเกม",
    selectGamePrompt: "เลือกเกมที่ต้องการเล่น",
    kingsCup: "ไพ่โดเรม่อน",
    kingsCupDesc: "King's Cup - สายดื่ม",
    kingsCupSubtitle: "เหล้าไม่หมดไม่ต้องพัก",
    pokDeng: "ไพ่ป๊อกเด้ง",
    pokDengDesc: "Pok Deng - สายพนัน",
    undercover: "Undercover",
    undercoverDesc: "จับมือปราบ - สายสืบ",
    partyMotto: "ดื่มให้สนุก เมาให้กระจาย",
    liveMode: "LIVE",
    liveModeDesc: "Host แชร์หน้าจอการ์ด ผู้เล่นใช้มือถือ",
    enterNameToStart: "ใส่ชื่อของคุณเพื่อเริ่มเกม",
    enterCodeAndName: "ใส่รหัสห้องและชื่อของคุณ",
    roomCodePlaceholder: "รหัสห้อง (6 ตัว)",
    quickStartDesc: "ใส่ชื่อของคุณแล้วเริ่มเล่นเลย!",

    // Theme
    themeChange: "เปลี่ยนธีม",
    themeSelectTheme: "เลือกธีม",

    // Lobby
    createRoom: "สร้างห้อง",
    joinRoom: "เข้าร่วม",
    roomCode: "รหัสห้อง",
    yourName: "ชื่อของคุณ",
    enterName: "ใส่ชื่อ...",
    enterCode: "ใส่รหัส 6 ตัว...",
    createNewRoom: "สร้างห้องใหม่",
    joinRoomBtn: "เข้าร่วมห้อง",
    quickStart: "⚡ เริ่มด่วน",
    creating: "กำลังสร้าง...",
    joining: "กำลังเข้าร่วม...",

    // Room
    room: "ห้อง",
    waitingForPlayers: "รอผู้เล่น",
    players: "ผู้เล่น",
    host: "Host",
    leaveRoom: "ออกจากห้อง",
    startGame: "เริ่มเกม",
    minPlayers: "ต้องมีผู้เล่นอย่างน้อย",
    people: "คน",

    // Undercover Game
    undercoverTitle: "Undercover",
    undercoverSubtitle: "สายลับจับแอ๊บ - หาคนแปลกปลอม!",
    category: "หมวดหมู่",
    allCategories: "ทั้งหมด",
    includeMrWhite: "รวมคนบ้า (Mr. White)",
    revealWord: "ดูคำศัพท์ของคุณ",
    holdToReveal: "แตะค้างเพื่อดู (อย่าให้ใครเห็น!)",
    yourWord: "คำของคุณคือ:",
    holdToView: "แตะค้างเพื่อดูคำ",
    role: "บทบาท",
    startDescribe: "เริ่มบรรยายคำ",
    describePhase: "รอบบรรยาย",
    describeRound: "รอบบรรยาย",
    turn: "ตา",
    nextPlayer: "คนต่อไป",
    nextPerson: "คนต่อไป",
    startVoting: "เริ่มโหวต",
    voting: "โหวต!",
    vote: "โหวต",
    waitingForOthers: "รอผู้เล่นคนอื่น...",
    selectSpy: "เลือกคนที่คุณคิดว่าเป็นสายลับ",
    selectSuspect: "เลือกคนที่คุณคิดว่าเป็นสายลับ",
    voteResult: "ผลโหวต",
    votes: "โหวต",
    continue: "ดำเนินการต่อ",
    gameOver: "จบเกม",
    finalResult: "ผลลัพธ์สุดท้าย",
    restartGame: "เริ่มเกมใหม่",
    civilian: "พลเมือง",
    spy: "สายลับ",
    gameStarted: "🎮 เกมเริ่มแล้ว!",
    eliminated: "ถูกโหวตออก!",
    waitingPlayers: "รอผู้เล่น",
    playersInRoom: "ผู้เล่นในห้อง",
    needMinPlayers: "ต้องมีผู้เล่นอย่างน้อย 4 คน",
    seeYourWord: "ดูคำศัพท์ของคุณ",
    tapToReveal: "แตะค้างเพื่อดู (อย่าให้ใครเห็น!)",
    yourWordIs: "คำของคุณคือ",
    holdToSee: "แตะค้างเพื่อดูคำ",
    alivePlayers: "ผู้เล่นที่ยังอยู่",

    // Vocabulary Manager
    manageWords: "จัดการคำ",
    vocabularyManager: "จัดการคำศัพท์",
    addWord: "เพิ่มคำ",
    editWord: "แก้ไขคำศัพท์",
    editVocabulary: "แก้ไขคำศัพท์",
    addVocabulary: "เพิ่มคำศัพท์ใหม่",
    addNewWord: "เพิ่มคำศัพท์ใหม่",
    categoryName: "หมวดหมู่",
    categoryPlaceholder: "เช่น ของกิน, สถานที่",
    civilianWord: "คำสำหรับพลเมือง",
    civilianPlaceholder: "คำของฝ่ายพลเมือง",
    undercoverWord: "คำสำหรับสายลับ",
    undercoverPlaceholder: "คำของฝ่ายสายลับ",
    searchWords: "ค้นหาคำศัพท์...",
    searchVocabulary: "ค้นหาคำศัพท์...",
    noWords: "ยังไม่มีคำศัพท์",
    noWordsFound: "ไม่พบคำศัพท์ที่ค้นหา",
    noVocabularyFound: "ไม่พบคำศัพท์ที่ค้นหา",
    noVocabularyYet: "ยังไม่มีคำศัพท์ กดเพิ่มคำเพื่อเริ่มต้น",
    addWordToStart: "กดเพิ่มคำเพื่อเริ่มต้น",
    cannotEditDefault: "ไม่สามารถแก้ไขคำเริ่มต้นได้",
    cannotDeleteDefault: "ไม่สามารถลบคำเริ่มต้นได้",
    words: "คำ",

    // Validation
    invalidName: "ชื่อไม่เหมาะสม",
    nameTooShort: "ชื่อสั้นเกินไป (ต้องมีอย่างน้อย 2 ตัวอักษร)",
    nameTooLong: "ชื่อยาวเกินไป (ไม่เกิน 20 ตัวอักษร)",
    nameContainsBadWords: "กรุณาใช้ชื่อที่เหมาะสม",
    roomNotFound: "ไม่พบห้องนี้",
    gameAlreadyStarted: "เกมเริ่มไปแล้ว ไม่สามารถเข้าร่วมได้",

    // PokDeng
    pokDengTitle: "🎴 ป๊อกเด้ง",
    pokDengSubtitle: "เกมไพ่ไทยสุดมัน!",
    bet: "เดิมพัน",
    draw: "จั่ว",
    stand: "อยู่",
    showdown: "เปิดไพ่",
    nextRound: "รอบถัดไป",
    dealer: "เจ้ามือ",
    setDealer: "ตั้งเป็นเจ้ามือ",
    points: "แต้ม",
    multiplier: "เท่า",
    winner: "ชนะ",

    // Toast messages
    roomCreated: "สร้างห้องสำเร็จ! 🎉",
    roomJoined: "เข้าร่วมห้องสำเร็จ! 🎉",
    playerJoined: "👋 ผู้เล่นใหม่เข้ามา",
    playerLeft: " ผู้เล่นออกห้อง",
    leftRoom: "👋 ออกจากห้องแล้ว",
    voted: "✅ โหวตแล้ว",
    youVotedFor: "คุณโหวตให้",
  },
  en: {
    // Common
    back: "Back",
    loading: "Loading...",
    error: "Error",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    search: "Search",
    confirm: "Confirm",

    // Game Selection
    selectGame: "Select Game",
    selectGamePrompt: "Choose a game to play",
    kingsCup: "King's Cup",
    kingsCupDesc: "King's Cup - Drinking Game",
    kingsCupSubtitle: "Drink till you drop!",
    pokDeng: "Pok Deng",
    pokDengDesc: "Pok Deng - Card Game",
    undercover: "Undercover",
    undercoverDesc: "Find the Spy - Detective Game",
    partyMotto: "Drink for fun, Party til' dawn",
    liveMode: "LIVE",
    liveModeDesc: "Host shares screen, players use phones",
    enterNameToStart: "Enter your name to start",
    enterCodeAndName: "Enter room code and your name",
    roomCodePlaceholder: "Room Code (6 digits)",
    quickStartDesc: "Enter your name and start playing!",

    // Theme
    themeChange: "Change Theme",
    themeSelectTheme: "Select Theme",

    // Lobby
    createRoom: "Create Room",
    joinRoom: "Join Room",
    roomCode: "Room Code",
    yourName: "Your Name",
    enterName: "Enter name...",
    enterCode: "Enter 6-digit code...",
    createNewRoom: "Create New Room",
    joinRoomBtn: " Join Room",
    quickStart: "⚡ Quick Start",
    creating: "Creating...",
    joining: "Joining...",

    // Room
    room: "Room",
    waitingForPlayers: "Waiting for players",
    players: "Players",
    host: "Host",
    leaveRoom: "Leave Room",
    startGame: "Start Game",
    minPlayers: "Need at least",
    people: "players",

    // Undercover Game
    undercoverTitle: "Undercover",
    undercoverSubtitle: "Find the impostor among you!",
    category: "Category",
    allCategories: "All",
    includeMrWhite: "Include Mr. White",
    revealWord: "Reveal Your Word",
    holdToReveal: "Hold to reveal (Don't let others see!)",
    yourWord: "Your word is:",
    holdToView: "Hold to view word",
    role: "Role",
    startDescribe: "Start Describing",
    describePhase: "Round",
    describeRound: "Describe Round",
    turn: "Turn",
    nextPlayer: "Next",
    nextPerson: "Next Person",
    startVoting: "Start Voting",
    voting: "Vote!",
    vote: "Vote",
    waitingForOthers: "Waiting for others...",
    selectSpy: "Select who you think is the spy",
    selectSuspect: "Select who you think is the spy",
    voteResult: "Vote Result",
    votes: "votes",
    continue: "Continue",
    gameOver: "Game Over",
    finalResult: "Final Result",
    restartGame: "Restart Game",
    civilian: "Civilian",
    spy: "Undercover",
    gameStarted: "🎮 Game Started!",
    eliminated: "has been eliminated!",
    waitingPlayers: "Waiting for players",
    playersInRoom: "Players in Room",
    needMinPlayers: "Need at least 4 players",
    seeYourWord: "See Your Word",
    tapToReveal: "Hold to reveal (Don't let others see!)",
    yourWordIs: "Your word is",
    holdToSee: "Hold to see word",
    alivePlayers: "Alive Players",

    // Vocabulary Manager
    manageWords: "Manage Words",
    vocabularyManager: "Vocabulary Manager",
    addWord: "Add Word",
    editWord: "Edit Vocabulary",
    editVocabulary: "Edit Vocabulary",
    addVocabulary: "Add New Vocabulary",
    addNewWord: "Add New Vocabulary",
    categoryName: "Category",
    categoryPlaceholder: "e.g. Food, Places",
    civilianWord: "Civilian Word",
    civilianPlaceholder: "Word for civilians",
    undercoverWord: "Undercover Word",
    undercoverPlaceholder: "Word for undercover",
    searchWords: "Search words...",
    searchVocabulary: "Search vocabulary...",
    noWords: "No vocabularies yet",
    noWordsFound: "No matching vocabularies found",
    noVocabularyFound: "No matching vocabularies found",
    noVocabularyYet: "No vocabularies yet. Click Add Word to get started",
    addWordToStart: "Click Add Word to get started",
    cannotEditDefault: "Cannot edit default words",
    cannotDeleteDefault: "Cannot delete default words",
    words: "words",

    // Validation
    invalidName: "Invalid name",
    nameTooShort: "Name too short (minimum 2 characters)",
    nameTooLong: "Name too long (maximum 20 characters)",
    nameContainsBadWords: "Please use an appropriate name",
    roomNotFound: "Room not found",
    gameAlreadyStarted: "Game already started, cannot join",

    // PokDeng
    pokDengTitle: "🎴 Pok Deng",
    pokDengSubtitle: "Thai card game!",
    bet: "Bet",
    draw: "Draw",
    stand: "Stand",
    showdown: "Showdown",
    nextRound: "Next Round",
    dealer: "Dealer",
    setDealer: "Set as Dealer",
    points: "Points",
    multiplier: "x",
    winner: "Winner",

    // Toast messages
    roomCreated: "Room created successfully! 🎉",
    roomJoined: "Joined room successfully! 🎉",
    playerJoined: "👋 New player joined",
    playerLeft: " Player left",
    leftRoom: "👋 Left room",
    voted: "✅ Voted",
    youVotedFor: "You voted for",
  },
};

export type TranslationKey = keyof typeof translations.th;

let currentLanguage: Language = "th";

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
  }
}

export function getLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language");
    if (saved === "th" || saved === "en") {
      currentLanguage = saved;
    }
  }
  return currentLanguage;
}

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key];
}

// Initialize language from localStorage
if (typeof window !== "undefined") {
  getLanguage();
}
