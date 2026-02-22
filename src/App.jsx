import { useState } from 'react'
import './App.css'
// --- 1. 必须在组件外部定义事件库，确保变量在加载时就存在 ---
const EVENT_POOL = {
  kid: [ // 0-7岁：好奇心、身体发育、探索本能
    {
      title: "神秘的蝴蝶",
      desc: "一只色彩斑斓的蝴蝶停在你的鼻尖上。",
      options: [
        { text: "试着捕捉 (奇+20 康-5)", effect: (p) => ({ ...p, curious: p.curious + 20, health: p.health - 5 }), log: "你追着蝴蝶跑了一整天，虽然没抓到但很开心。" },
        { text: "静静观察 (智+15 奇+10)", effect: (p) => ({ ...p, iq: p.iq + 15, curious: p.curious + 10 }), log: "你发现了蝴蝶翅膀的对称美，陷入了沉思。" }
      ]
    },
    {
      title: "泥巴的味道",
      desc: "你发现有一块泥巴闻起来竟然有点像巧克力。",
      options: [
        { text: "尝一口 (饱+10 康-10)", effect: (p) => ({ ...p, full: p.full + 10, health: p.health - 10 }), log: "事实证明，泥巴就是泥巴，你闹了肚子。" },
        { text: "用它画画 (魅+20 奇+10)", effect: (p) => ({ ...p, charm: p.charm + 20, curious: p.curious + 10 }), log: "你在猪圈墙上画了一副抽象派杰作。" }
      ]
    },
    {
      title: "农场主的旧草帽",
      desc: "一顶散发着汗水和阳光味道的草帽掉在地上。",
      options: [
        { text: "当成窝垫 (康+15 智-5)", effect: (p) => ({ ...p, health: p.health + 15, iq: p.iq - 5 }), log: "这是你睡过最香的一个午觉。" },
        { text: "撕碎研究 (奇+25 智+10)", effect: (p) => ({ ...p, curious: p.curious + 25, iq: p.iq + 10 }), log: "你拆解了编织结构，明白了什么是‘经纬’。" }
      ]
    },
    // ----- 新增童年事件 -----
    {
      title: "会唱歌的小溪",
      desc: "水槽的水管破了，水流在地上冲出了一条小沟渠。",
      options: [
        { text: "跳水坑 (康+10 奇+20)", effect: (p) => ({ ...p, health: p.health + 10, curious: p.curious + 20 }), log: "你学会了猪刨式，虽然姿势不太雅观。" },
        { text: "修好它 (智+20 重-5)", effect: (p) => ({ ...p, iq: p.iq + 20, weight: p.weight - 5 }), log: "你用嘴巴把水管叼回了原位，感觉自己是个工程师。" }
      ]
    },
    {
      title: "月光下的影子",
      desc: "月光把你的影子拉得很长，你动它也动。",
      options: [
        { text: "和影子打架 (重+10 魅-5)", effect: (p) => ({ ...p, weight: p.weight + 10, charm: p.charm - 5 }), log: "你气喘吁吁，发现永远打不过它。" },
        { text: "思考光学原理 (智+25)", effect: (p) => ({ ...p, iq: p.iq + 25 }), log: "你隐约明白了光的直线传播，虽然还不会说这个词。" }
      ]
    },
    {
      title: "咪的尾巴",
      desc: "农场里的猫‘咪’在晒太阳，尾巴在你面前晃来晃去。",
      options: [
        { text: "一把抓住 (奇+20 康-20)", effect: (p) => ({ ...p, curious: p.curious + 20, health: p.health - 20 }), log: "猫回头给了你一爪子，你明白了什么叫‘老虎屁股摸不得’。" },
        { text: "静静看着 (智+10 魅+15)", effect: (p) => ({ ...p, iq: p.iq + 10, charm: p.charm + 15 }), log: "你在想，你也会遇到你的咪吗" }
      ]
    }
  ],
  teen: [ // 8-15岁：社交欲望、叛逆、体格增长
    {
      title: "思考未来",
      desc: "未来会不会有一种技术，会让机器人说话呢",
      options: [
        { text: "继续探索 (智+20)", effect: (p) => ({ ...p, iq: p.iq + 20 }), log: "你尝试学习计算机知识" },
        { text: "不再思考 (健康+100)", effect: (p) => ({ ...p, health: p.health + 100 }), log: "放弃卷是对的，躺平捏" }
      ]
    },
    {
      title: "深夜逃亡计划",
      desc: "你发现栅栏下面有个松动的洞，今晚是绝佳的机会。",
      options: [
        { text: "钻出去看看 (奇+30 康-15)", effect: (p) => ({ ...p, curious: p.curious + 30, health: p.health - 15 }), log: "外面的世界很精彩，但你差点被看门狗抓到。" },
        { text: "加固家园 (智+15 重+10)", effect: (p) => ({ ...p, iq: p.iq + 15, weight: p.weight + 10 }), log: "外面的世界太危险，你决定把自己的窝修得更舒服。" }
      ]
    },
    {
      title: "猪圈领袖挑战",
      desc: "一群中猪正在选老大，大家都在看你。",
      options: [
        { text: "武力压制 (重+20 康-10 魅+10)", effect: (p) => ({ ...p, weight: p.weight + 20, health: p.health - 10, charm: p.charm + 10 }), log: "你靠块头赢得了尊重，但身上留下了疤痕。" },
        { text: "智慧调停 (智+30 魅+20)", effect: (p) => ({ ...p, iq: p.iq + 30, charm: p.charm + 20 }), log: "你成功平息了纠纷，成为了军师级的人物。" }
      ]
    },
    // ----- 新增少年事件 -----
    {
      title: "母猪们的八卦",
      desc: "几位长辈在角落里议论新来的饲养员，说他的发型很奇怪。",
      options: [
        { text: "参与八卦 (魅+15 重+10)", effect: (p) => ({ ...p, charm: p.charm + 15, weight: p.weight + 10 }), log: "你学会了社交的快乐，但也没少吃人家递过来的零食。" },
        { text: "特立独行 (智+20 奇+15)", effect: (p) => ({ ...p, iq: p.iq + 20, curious: p.curious + 15 }), log: "你觉得谈论外表很无聊，不如去研究那个自动喂食器的原理。" }
      ]
    },
    {
      title: "秋千轮胎",
      desc: "一棵树上挂着一个旧轮胎，风一吹就晃。",
      options: [
        { text: "跳进去玩 (康+15 奇+15)", effect: (p) => ({ ...p, health: p.health + 15, curious: p.curious + 15 }), log: "你发现了推力和摆动的奥秘，玩得不亦乐乎。" },
        { text: "挑战咬断绳子 (重+5 康-10)", effect: (p) => ({ ...p, weight: p.weight + 5, health: p.health - 10 }), log: "绳子没断，你的牙差点断了。" }
      ]
    }],

  adult: [ // 16-23岁：追求真理、权力、代码真相
    {
      title: "权力的诱惑",
      desc: "老住长要退休了，他问你是否愿意接管这里的秩序。",
      options: [
        { text: "接管领地 (魅+40 智-10)", effect: (p) => ({ ...p, charm: p.charm + 20, iq: p.iq - 10 }), log: "你成为了这里的老大，以后干饭不用排队了。" },
        { text: "追求自由 (智+40 奇+20)", effect: (p) => ({ ...p, iq: p.iq + 40, curious: p.curious + 20 }), log: "你拒绝了头衔，决定继续探索世界的终极真相。" }
      ]
    },
    {
      title: "螺蛳粉的诱惑",
      desc: "你今天突然特别想吃螺蛳粉",
      options: [
        { text: "立刻去吃 (体重+20)", effect: (p) => ({ ...p,weight: p.weight + 20}), log: "螺蛳粉真的太好吃了。" },
        { text: "克制 (智+20)", effect: (p) => ({ ...p, iq: p.iq + 20 }), log: "蒸蚌" }
      ]
    },
    {
      title: "蓝色药丸",
      desc: "食槽边躺着一颗闪烁蓝光的胶囊，这看起来不像是食物。",
      options: [
        { text: "吞下它 (智+20 康-10 奇+10)", effect: (p) => ({ ...p, iq: p.iq + 20, health: p.health - 10, curious: p.curious + 10 }), log: "你的眼中出现了极光，你有一种异样的感觉。" },
        { text: "无视它 (魅+20 康+20)", effect: (p) => ({ ...p, charm: p.charm + 20, health: p.health + 20 }), log: "你想起‘咪’的教导，平凡也是一种力量。" }
      ]
    },
    // ----- 新增成年事件 -----
    {
      title: "天空的裂缝",
      desc: "你抬头看天，突然发现云层后面似乎有一些奇怪的绿色代码在流动，转瞬即逝。",
      options: [
        { text: "深入研究 (智+50 奇+30)", effect: (p) => ({ ...p, iq: p.iq + 50, curious: p.curious + 30 }), log: "你开始坚信这个世界是虚拟的，并尝试寻找更多证据。" },
        { text: "认为眼花了 (康+30)", effect: (p) => ({ ...p, health: p.health + 30 }), log: "你摇了摇头，觉得是最近没睡好，不如多睡一会儿。" }
      ]
    },
    {
      title: "AI养猪",
      desc: "农场引进了全自动智能喂养系统，摄像头精准识别每一头猪。",
      options: [
        { text: "对抗系统 (奇+40 康-20)", effect: (p) => ({ ...p, curious: p.curious + 40, health: p.health - 20 }), log: "你试图用泥巴遮住身上的识别编码，但差点被当成病猪隔离。" },
        { text: "顺应系统 (魅+30 重+15)", effect: (p) => ({ ...p, charm: p.charm + 30, weight: p.weight + 15 }), log: "你学会了在镜头前表现得温顺可爱，总能多吃一份加餐。" }
      ]
    },
    {
      title: "远方的卡车声",
      desc: "你听到远处传来巨大的卡车引擎声，空气中隐约有血腥味。老猪们脸色凝重。",
      options: [
        { text: "领导反抗 (魅+40 康-30)", effect: (p) => ({ ...p, charm: p.charm + 40, health: p.health - 30 }), log: "你号召大家越狱，但响应者寥寥，你被关进了单独的隔间。" },
        { text: "最后的晚餐 (重+50)", effect: (p) => ({ ...p, weight: p.weight + 50 }), log: "你预感到了什么，决定吃顿好的。这顿饭格外的香。" }
      ]
    }
  ]
};

export default function App() {

  
  // --- 2. 状态初始化 ---
  const [gameState, setGameState] = useState('cover'); 
  const [playerName, setPlayerName] = useState('基米');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [logs, setLogs] = useState([]);

  const initialStats = {
    age: 0, ap: 3, 
    full: 80, health: 80, iq: 0, charm: 20, curious: 20, weight: 20,
    books: 0, readBooks: 0,
    miProgress: 0, isMiFound: false,
    eventCount: 0,
    hasReached500: false, // 记录是否领过500g奖励
    hasReached1000: false // 记录是否领过1000g奖励
  };

  const [pig, setPig] = useState(initialStats);

  const addLog = (m) => setLogs(prev => [m, ...prev].slice(0, 6));

     // --- 新增这个辅助函数 ---
  const triggerRandomEvent = (p) => {
    let pool;
    // 根据当前 pig 的年龄选择对应的事件池
    if (p.age < 5) pool = EVENT_POOL.kid;
    else if (p.age < 16) pool = EVENT_POOL.teen;
    else pool = EVENT_POOL.adult;

    // 从选中的池子里随机抽一个
    const ev = pool[Math.floor(Math.random() * pool.length)];
    setCurrentEvent(ev);
    setGameState('event');
  };

  // --- 3. 核心函数 ---
  const handleAction = (type) => {
    let p = { ...pig };

    // --- 新增：行动资源检查逻辑 ---
    if (type === 'observe' && p.curious <= 0) {
      addLog("❌ 你太累了，已经没有好奇心去观察世界了。");
      return; 
    }
    if (type === 'explore' && p.full < 30) {
        addLog("❌ 肚子太饿了，没力气跑去林子里探险。");
        return;
    }
    if (type === 'read' && p.books <= 0) {
        // 虽然 UI 已经控制了，但逻辑层加个保险
        return;
    }
    switch(type) {
      case 'eat': 
        p.full += 40; p.weight += 20; p.health += 20; 
        addLog("【行动】干饭：饱腹+40 重量+20 健康+20"); 
        break;
      case 'observe': 
        p.iq += 10; p.curious -= 20; p.full -= 20; 
        addLog("【行动】观察：智慧+10 好奇-20 饱腹-20"); 
        break;
      case 'roll': 
        p.curious += 10; p.health -= 5; 
        addLog("【行动】打滚：好奇+10 健康-5"); 
        break;
      case 'explore': 
        p.full -= 30; p.curious += 20; p.health -= 10;
        const rand = Math.random();
        if (rand < 0.35) {
          addLog("【探险】你在林子里转了一圈，什么也没发现。");
        } else if (rand < 0.8) { 
          p.books += 1; 
          addLog("【探险】你捡到了一本沾满泥土的书！书籍+1"); 
        } else { 
          p.miProgress += 1; 
          addLog(`【探险】你察觉到“咪”的气息 (${p.miProgress}/5)`);
          if (p.miProgress >= 5) p.isMiFound = true;
        }
        break;
      case 'read':
        if (p.books > 0) {
          p.books -= 1; p.readBooks += 1; p.charm += 10; p.full -= 20; p.curious += 10;
          addLog("【行动】看书：魅力+10 饱腹-20 好奇+10");
        }
        break;
      case 'playWithMi':
        p.iq += 10; p.charm += 10; 
        addLog("【行动】与咪玩耍：智慧+10 魅力+10");
        break;
    }

    p.full = Math.min(p.full, 100);
    p.health = Math.min(p.health, 100);
    p.ap -= 1;

    // --- ★ 修改重点：即时死亡判定 ★ ---
    if (p.full <= 0 || p.health <= 0) {
      setPig(p); // 即使死了也更新一下数值，让玩家死个明白
      setGameState('death');
      return; // 死了就直接结束，不往下走了
    }

    if (p.weight >= 500 && !p.hasReached500) {
      p.hasReached500 = true;
      setPig(p);
      setGameState('milestone500');
      return; // 暂停后续逻辑，先看弹窗
    }
    if (p.weight >= 1000 && !p.hasReached1000) {
      p.hasReached1000 = true;
      setPig(p);
      setGameState('milestone1000');
      return;
    }

    setPig(p);

    if (p.ap === 0) {
      if (p.full <= 0 || p.health <= 0) {
        setGameState('death');
      } else {
        // 使用传递进去的 p，而不是全局 pig
       setTimeout(() => triggerRandomEvent(p), 500);
      }
    }



  };

  const handleEventChoice = (choice) => {
    let nextP = choice.effect(pig);
    addLog(`💬 事件：${choice.log}`);

    // --- ★ 修改重点：事件导致的即时死亡 ★ ---
    if (nextP.full <= 0 || nextP.health <= 0) {
      setPig(nextP);
      setGameState('death');
      return;
    }

    nextP.eventCount += 1;

    if (nextP.eventCount < 1) {
      setPig(nextP);
      triggerRandomEvent(nextP);
    } else {
      nextYear(nextP);
    }
  };

  const nextYear = (p) => {
    const nextP = {
      ...p,
      age: p.age + 1,
      ap: 3,
      eventCount: 0,
      full: p.full - 20,
      weight: p.weight - 10,
      health: p.health - 5,
      iq: Math.max(0, p.iq - 5),
      charm: Math.max(0, p.charm - 5),
      curious: Math.max(0, p.curious - 5)
    };

    if (nextP.age >= 24) {
      setGameState('ending');
    } else if (nextP.full <= 0 || nextP.health <= 0) {
      setGameState('death');
    } else {
      setPig(nextP);
      setGameState('play');
      addLog(`🎈 --- ${nextP.age}岁生日快乐！ ---`);
    }
  };

  const resetGame = () => {
    setPig(initialStats);
    setLogs([]);
    setGameState('story');
  };

  // --- 4. 结局渲染逻辑 ---
  const getEnding = () => {
    if (pig.isMiFound) return { title: "【真结局：你遇到了你的咪】", text: `最喜欢的JK，生日快乐！今天开始你又变大只一点了，是一只健健康康的大大大大大大大大大大大大大大大大大大大大大大大大米住了！过去一岁的JK是只特别厉害特别好让我感受到很多很多爱的可爱小住，会坚强的面对坏东西，会花好多时间探索各种事情的解决方案，会想办法逗咪开心，会和咪一起吃好吃的做好吃的，是个各方面都变厉害的小住~

希望24岁的你更开心，更健康，更幸福，能够收获喜欢的满意的工作和生活，我也会一直照顾好小住（蹭蹭）~` };
    if (pig.readBooks >= 10) return { title: "【职业结局：处长住】", text: `你读遍了农场所有的书，现在你是这里的最高管理者。24岁生日快乐！` };
    if (pig.iq >= 300) return { title: "【传奇结局：博士住】", text: `24岁生日 这天，${playerName}住出版了《干饭哲学》，成为了后世住崇拜的偶像。` };
    return { title: "【普通结局：普通住】", text: "平淡且快乐的一生。24岁生日快乐！你觉得饱餐一顿就很幸福。" };
  };

  // --- 5. 条件渲染页面 ---
if (gameState === 'milestone500') return (
    <div className="screen milestone">
      <h2>🥈 体重突破 500g！</h2>
      <p>【成就：扎实的小猪】</p>
      <p>你现在跑起来像个小肉弹，农场主看你的眼神充满了期待（和口水）。</p>
      <p className="bonus">🎁 奖励：好奇心 +30，健康 +20</p>
      <button className="main-btn" onClick={() => {
        setPig(prev => ({ ...prev, curious: prev.curious + 30, health: prev.health + 20 }));
        setGameState('play');
      }}>收下奖励继续</button>
    </div>
  );

  // 1000g 弹窗
  if (gameState === 'milestone1000') return (
    <div className="screen milestone">
      <h2>🥇 体重突破 1000g！</h2>
      <p>【成就：吨位级住生】</p>
      <p>你已经是猪圈里不可忽视的存在了！走路时地板都在微微颤抖。</p>
      <p className="bonus">🎁 奖励：智慧 +50，魅力 +50</p>
      <button className="main-btn" onClick={() => {
        setPig(prev => ({ ...prev, iq: prev.iq + 50, charm: prev.charm + 50 }));
        setGameState('play');
      }}>我是最胖的！继续</button>
    </div>
  );

  if (gameState === 'cover') return (
    <div className="screen">
      <h1>🐷 {playerName}住模拟器</h1>
      {/* 新增：游戏规则面板 */}
      <div className="rules-box">
        <h3>📜 养猪生存守则</h3>
        <ul>
          <li><strong>生存：</strong> 饱腹 ❤️ 或 健康 🍎 归零将直接导致转生。</li>
          <li><strong>成长：</strong> 每年有 <strong>3</strong> 次行动机会，消耗完后会触发年度随机事件。</li>
          <li><strong>门槛：</strong> 请多增加智慧和阅读吧</li>
          <li><strong>目标：</strong> 活到 24 岁生日，根据你的属性解锁不同的“住生”结局。</li>
        </ul>
      </div>
      <div className="input-box">
        命名：<input value={playerName} onChange={e => setPlayerName(e.target.value)} /> 住
      </div>
      <button className="main-btn" onClick={() => setGameState('story')}>开始人生</button>
    </div>
  );

  if (gameState === 'story') return (
    <div className="screen story">
      <h2>🎉 你出生了！</h2>
      <p>你是一只充满灵性的小住，名叫 <strong>{playerName}住</strong>。</p>
      <p>这世界很大，记得经常吃饭，保命要紧。</p>
      <button className="main-btn" onClick={() => setGameState('play')}>进入模拟器</button>
    </div>
  );

  if (gameState === 'death') return (
    <div className="screen death">
      <h2>💀 你倒下了...</h2>
      <p>朦胧中，一个名为“咪”的生物把你复活成小住。</p>
      <button className="main-btn" onClick={resetGame}>重新开始</button>
    </div>
  );

  if (gameState === 'event' && currentEvent) return (
    <div className="screen event-panel">
      <div className="event-badge">📅 年度随机事件</div>
      <h3>{currentEvent.title}</h3>
      <p className="event-desc">{currentEvent.desc}</p>
      <div className="choice-list">
        {currentEvent.options.map((opt, i) => (
          <button key={i} className="main-btn" style={{margin: '10px 0', width: '100%'}} onClick={() => handleEventChoice(opt)}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );

  if (gameState === 'ending') {
    const end = getEnding();
    return (
      <div className="screen final">
        <h2>{end.title}</h2>
        <p>{end.text}</p>
        <button className="main-btn" onClick={resetGame}>再次轮回</button>
      </div>
    );
  }

  return (
    <div className="game-layout">
      <div className="status-panel">
        <h2 className="pig-name">{playerName}住</h2>
        <div className="stage-tag">{pig.age < 5 ? '幼年期' : pig.age < 16 ? '青春期' : '成熟期'}</div>
        <div className="age-bar">进度: {pig.age} / 23 年</div>
        <div className="ap-bar">体力值: {Array(pig.ap).fill('⚡').join(' ')}</div>
        
        <div className="stat-grid">
          <div className={`stat ${pig.full < 30 ? 'warn' : ''}`}>🍎 饱腹: {pig.full}</div>
          <div className={`stat ${pig.health < 30 ? 'warn' : ''}`}>❤️ 健康: {pig.health}</div>
          <div className="stat">🧠 智慧: {pig.iq}</div>
          <div className="stat">✨ 魅力: {pig.charm}</div>
          <div className="stat">👀 好奇: {pig.curious}</div>
          <div className="stat">⚖️ 重量: {pig.weight}</div>
        </div>
        
        <div className="inventory">
          🎒 书箱: {pig.books} | 已阅: {pig.readBooks}
          {pig.isMiFound && <div className="mi-found">💖 与咪的羁绊已开启</div>}
        </div>
      </div>

      <div className="action-panel">
      <button onClick={() => handleAction('eat')}>吃东西 (+40饱腹 +20重 +20康)</button>

  {/* 观察：如果好奇心为0，禁用按钮 */}
  <button 
    className={pig.curious <= 0 ? 'btn-disabled' : ''}
    disabled={pig.curious <= 0} 
    onClick={() => handleAction('observe')}
  >
    观察人类 (+10智 -20奇 -20饱) {pig.curious - 20 < 0 && "(好奇不足)"}
  </button>

  <button onClick={() => handleAction('roll')}>打滚 (+10奇 -5康)</button>
        
        {pig.age >= 5 && (
    <button 
      className={pig.full < 30 ? 'btn-disabled' : 'btn-explore'}
      disabled={pig.full < 30}
      onClick={() => handleAction('explore')}
    >
      外出探险 (-30饱 +20奇 -10康) {pig.full < 30 && "(体力不足)"}
    </button>
  )}

  {/* 看书：如果没有书，不显示或禁用 */}
  {pig.books > 0 && (
    <button className="btn-read" onClick={() => handleAction('read')}>
      看书 (+10魅 +10奇 -20饱)
    </button>
  )}
        {pig.isMiFound && <button className="btn-mi" onClick={() => handleAction('playWithMi')}>与咪玩耍 (+10智 +10魅)</button>}

        <div className="log-window">
          <div className="log-header">📝 游戏日志</div>
          {logs.map((l, i) => <div key={i} className="log-line">{l}</div>)}
        </div>
      </div>
    </div>
  );
}