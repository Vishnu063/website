// Original text clues; franchise names appear only as independent editorial references.
export type QuizMode = 'anime'|'character'|'emoji'|'trivia';
export const quizModes = ['anime','character','emoji','trivia'] as const;
export const difficulties = ['easy','normal','hard'] as const;
export const quizBank = [
 {id:'a1',mode:'anime',clue:'A young pirate searches for a legendary treasure while gathering a crew.',choices:['One Piece','Bleach','Haikyu!!','Dr. Stone'],answer:0,hint:'His captain wears a straw hat.',why:'One Piece follows Luffy and the Straw Hat crew on their search for the One Piece.'},
 {id:'a2',mode:'anime',clue:'Two brothers seek a way to undo the cost of a forbidden alchemical experiment.',choices:['Black Clover','Fullmetal Alchemist','Blue Lock','Spy × Family'],answer:1,hint:'Their surname is Elric.',why:'Edward and Alphonse Elric seek to restore their bodies after human transmutation.'},
 {id:'a3',mode:'anime',clue:'A notebook lets its owner kill someone by writing a name while picturing a face.',choices:['Death Note','Erased','Monster','Psycho-Pass'],answer:0,hint:'The investigation has a detective called L.',why:'Death Note builds its central conflict around Light Yagami, the notebook and the detective L.'},
 {id:'a4',mode:'anime',clue:'A small volleyball player aims to compete despite a height disadvantage.',choices:['Slam Dunk','Free!','Haikyu!!','Yuri!!! on Ice'],answer:2,hint:'Karasuno is his school.',why:'Haikyu!! follows Hinata and the Karasuno volleyball team.'},
 {id:'a5',mode:'anime',clue:'A spy builds a pretend family, unaware that his adopted daughter can read minds.',choices:['Spy × Family','Buddy Daddies','Durarara!!','Odd Taxi'],answer:0,hint:'The daughter is Anya.',why:'Spy × Family pairs Loid’s covert mission with Anya’s telepathy and Yor’s secret profession.'},
 {id:'a6',mode:'anime',clue:'After an adventuring party’s victory, an elven mage begins to understand the humans she outlives.',choices:['Frieren: Beyond Journey’s End','Claymore','Magi','Noragami'],answer:0,hint:'Its central journey begins after the Demon King has been defeated.',why:'Frieren reflects on time, grief and companionship after her former party’s adventure.'},
 {id:'c1',mode:'character',clue:'I train as a ninja, carry a powerful fox spirit and dream of leading my village.',choices:['Ichigo Kurosaki','Naruto Uzumaki','Edward Elric','Tanjiro Kamado'],answer:1,hint:'My village is the Hidden Leaf.',why:'Naruto Uzumaki aspires to become Hokage of the Hidden Leaf Village.'},
 {id:'c2',mode:'character',clue:'I am a swordsman in a pirate crew and pursue the title of the world’s greatest swordsman.',choices:['Roronoa Zoro','Guts','Levi Ackerman','Kenshin Himura'],answer:0,hint:'I am known for a three-sword style.',why:'Zoro’s signature three-sword style and ambition are central to his role in One Piece.'},
 {id:'c3',mode:'character',clue:'I hide my telepathy while enjoying life with a spy and an assassin.',choices:['Chihiro','Anya Forger','Shinobu Kocho','Violet Evergarden'],answer:1,hint:'Peanuts are a favorite snack.',why:'Anya Forger is the telepathic child in Spy × Family’s unconventional family.'},
 {id:'c4',mode:'character',clue:'I am an alchemist with a metal arm and leg, traveling with my younger brother.',choices:['Senku Ishigami','Edward Elric','Shoto Todoroki','Yusuke Urameshi'],answer:1,hint:'My title refers to full metal.',why:'Edward Elric uses automail prosthetics and is called the Fullmetal Alchemist.'},
 {id:'c5',mode:'character',clue:'I hunt demons while seeking a way to help my transformed sister.',choices:['Tanjiro Kamado','Denji','Yuta Okkotsu','Inuyasha'],answer:0,hint:'My sister is Nezuko.',why:'Tanjiro’s relationship with Nezuko motivates his journey in Demon Slayer.'},
 {id:'c6',mode:'character',clue:'I rebuild technology after a global petrification event, using scientific knowledge.',choices:['Senku Ishigami','Shikamaru Nara','Armin Arlert','Shigeo Kageyama'],answer:0,hint:'My story is Dr. Stone.',why:'Senku uses science to revive people and rebuild civilization in Dr. Stone.'},
 {id:'e1',mode:'emoji',clue:'🏴‍☠️ 👒 🌊 💎',choices:['One Piece','Cowboy Bebop','Samurai Champloo','Fairy Tail'],answer:0,hint:'A seafaring treasure hunt.',why:'The pirate flag, straw hat, ocean and treasure evoke One Piece.'},
 {id:'e2',mode:'emoji',clue:'📓 ✍️ 🍎 🕵️',choices:['Death Note','Detective Conan','Bungo Stray Dogs','Paranoia Agent'],answer:0,hint:'Writing names changes fates.',why:'The notebook and investigation point to Death Note; apples reference Ryuk.'},
 {id:'e3',mode:'emoji',clue:'🏐 🐦‍⬛ 🏫',choices:['Kuroko’s Basketball','Haikyu!!','Blue Lock','Ace of Diamond'],answer:1,hint:'Karasuno’s imagery includes crows.',why:'Volleyball and the crow motif connect to Karasuno in Haikyu!!.'},
 {id:'e4',mode:'emoji',clue:'🕵️ 👧 🧠 🥜',choices:['Spy × Family','Mob Psycho 100','The Promised Neverland','K-On!'],answer:0,hint:'A pretend family with real secrets.',why:'A spy, telepathic child and peanuts suggest Spy × Family.'},
 {id:'e5',mode:'emoji',clue:'🧪 🪨 🌍 ⚙️',choices:['Dr. Stone','Steins;Gate','Planetes','Space Brothers'],answer:0,hint:'Science after humanity turns to stone.',why:'Petrification and rebuilding technology form the premise of Dr. Stone.'},
 {id:'e6',mode:'emoji',clue:'🤖 👦 ⚗️ 👦',choices:['Fullmetal Alchemist','Astro Boy','Pluto','Gurren Lagann'],answer:0,hint:'Brothers seek to restore their bodies.',why:'The armor-like figure and alchemy evoke the Elric brothers in Fullmetal Alchemist.'},
 {id:'t1',mode:'trivia',clue:'Which sport is at the center of Haikyu!!?',choices:['Volleyball','Football','Tennis','Swimming'],answer:0,hint:'Players keep a ball above a net without holding it.',why:'Haikyu!! follows school volleyball, particularly the Karasuno team.'},
 {id:'t2',mode:'trivia',clue:'What is the name of the country setting for Fullmetal Alchemist’s central military?',choices:['Amestris','Wano','Marley','Fiore'],answer:0,hint:'The Elric brothers are citizens of this country.',why:'Amestris is the principal country in Fullmetal Alchemist.'},
 {id:'t3',mode:'trivia',clue:'Which member of the Forger family can read minds?',choices:['Loid','Yor','Anya','Franky'],answer:2,hint:'The adopted daughter.',why:'Anya has telepathy; her parents are not aware of her ability.'},
 {id:'t4',mode:'trivia',clue:'What title does Naruto hope to earn?',choices:['Hokage','Shogun','Pirate King','State Alchemist'],answer:0,hint:'The leader of his village.',why:'Hokage is the title held by the leader of the Hidden Leaf Village.'},
 {id:'t5',mode:'trivia',clue:'Which protagonist is most associated with using science to rebuild civilization?',choices:['Senku','Luffy','Hinata','Tanjiro'],answer:0,hint:'The series title includes Stone.',why:'Senku’s scientific approach drives the events of Dr. Stone.'},
 {id:'t6',mode:'trivia',clue:'Which of these is an elven mage?',choices:['Frieren','Anya','Riza Hawkeye','Nami'],answer:0,hint:'Her story explores the different timescales of human and elven lives.',why:'Frieren is an elven mage in Frieren: Beyond Journey’s End.'},
] as const;
export const achievements = [
 {id:'first',name:'First chapter',xp:20,description:'Earn your first 20 XP.'},
 {id:'spark',name:'Finding your spark',xp:100,description:'Earn 100 XP.'},
 {id:'voyager',name:'After-hours voyager',xp:300,description:'Earn 300 XP.'},
 {id:'legend',name:'A name worth remembering',xp:1000,description:'Earn 1,000 XP.'},
];
export function hash(value:string) { let x=2166136261; for(const c of value) x=Math.imul(x^c.charCodeAt(0),16777619); return x>>>0; }
export const dayKey=(now=Date.now())=>new Date(now).toISOString().slice(0,10);
export function weekKey(now=Date.now()) { const d=new Date(dayKey(now)+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7); return dayKey(d.getTime()); }
export function missions(now=Date.now()) {
 const daily=[{key:'quiz',name:'Finish three different quiz modes',kind:'quiz',goal:3,xp:45,href:'/games'}, {key:'battle',name:'Win two arena encounters',kind:'combat',goal:2,xp:50,href:'/combat'}, {key:'story',name:'Finish a story chapter',kind:'story',goal:1,xp:35,href:'/story'}, {key:'explore',name:'Visit two districts',kind:'explore',goal:2,xp:30,href:'/world'}, {key:'poll',name:'Vote in a community poll',kind:'poll',goal:1,xp:20,href:'/polls'}];
 const offset=hash(dayKey(now))%daily.length;
 return [...[0,1,2].map(i=>({...daily[(offset+i)%daily.length],period:dayKey(now),since:Date.parse(dayKey(now)+'T00:00:00Z')})),{key:'weekly',name:'Earn ten activity completions this week',kind:'any',goal:10,xp:120,href:'/play',period:weekKey(now),since:Date.parse(weekKey(now)+'T00:00:00Z')}];
}
