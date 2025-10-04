// 天体图文应用配置文件
// Astronomical Graphics Application Configuration

// ==================== 天体配置 ====================
const PLANETS = {
  // 行星距离 (AU)
  DISTANCE: {
    '水星': 0.3871,
    '金星': 0.7233,
    '火星': 1.5237,
    '木星': 5.2028,
    '土星': 9.5388,
    '天王星': 19.1914,
    '海王星': 30.0611,
    '冥王星': 30,
  },

  // 行星颜色 (RGB)
  COLORS: {
    '太阳': 'rgb(255,0,0)',
    '水星': 'rgb(0,0,0)',
    '金星': 'rgb(200,200,150)',
    '火星': 'rgb(200,50,50)',
    '木星': 'rgb(0,200,200)',
    '土星': 'rgb(254,201,10)',
    '天王星': 'rgb(98,137,152)',
    '海王星': 'rgb(54,99,161)',
    '冥王星': 'rgb(54,80,110)',
    '月亮': 'rgb(250,123,0)'
  },

  // 行星半径
  RADII: {
    '太阳': 1.6,
    '水星': 0.8,
    '金星': 1,
    '火星': 1,
    '木星': 1.6,
    '土星': 1.3,
    '天王星': 1.2,
    '海王星': 1.2,
    '冥王星': 0.8,
    '月亮': 1.1,
  },

  // 半径比例 (用于距离显示模式)
  RADIUS_RATIO: {
    '太阳': 1,
    '水星': 1,
    '金星': 1,
    '火星': 1,
    '木星': 2.8 / 5.2,
    '土星': 3.5 / 9,
    '天王星': 4.9 / 19,
    '海王星': 5.5 / 30,
    '冥王星': 6 / 40,
    '月亮': 70,
  },

  // 行星中文名称映射
  CHINESE_NAMES: {
    'Moon': '月亮',
    'Sun': '太阳',
    'Mercury': '水星',
    'Venus': '金星',
    'Mars': '火星',
    'Jupiter': '木星',
    'Saturn': '土星',
    'Uranus': '天王星',
    'Neptune': '海王星',
    'Pluto': '冥王星',
  }
};

// ==================== 历法配置 ====================
const CALENDAR = {
  // 回归年长度
  TROPICAL_YEAR: 365.25,

  // 历元起始日期
  EPOCH_DATE: new Date(1962, 1, 5),

  // 天干地支
  TIANGAN: '甲乙丙丁戊己庚辛壬癸'.split(''),
  DIZHI: '子丑寅卯辰巳午未申酉戌亥'.split(''),

  // 天干地支基准
  TIANGAN_BASE: 0, // 甲年甲月
  DIZHI_BASE: 2,   // 寅年寅月

  // 每日毫秒数
  DAY_MILLISECONDS: 3600 * 24 * 1000,

  // 一百年天数
  CENTURY_DAYS: 36525,

  // 历法修正日期
  GREGORIAN_START: new Date(1582, 9, 15),
  REFORM_START: new Date(1500, 2, 11),

  // 28宿名称
  XIU_28_NAMES: '角亢氐房心尾箕斗牛女虚危室壁奎娄胃昴毕觜参井鬼柳星张翼轸',

  // 28宿J2000赤经基准数据 (角宿一起始)
  XIU_28_BASE_RA: [
    13 * 3600 + 26 * 60 + 24.28, // 角
    14 * 3600 + 14 * 60 + 7.11,  // 亢
    14 * 3600 + 52 * 60 + 8.56,  // 氐
    16 * 3600 + 0 * 60 + 13.65,  // 房
    16 * 3600 + 22 * 60 + 34.11, // 心
    16 * 3600 + 51 * 60 + 37.67, // 尾
    18 * 3600 + 7 * 60 + 15.29,  // 箕
    18 * 3600 + 47 * 60 + 3.57,  // 斗
    20 * 3600 + 22 * 60 + 16.35, // 牛
    20 * 3600 + 48 * 60 + 53.46, // 女
    21 * 3600 + 32 * 60 + 44.46, // 虚
    22 * 3600 + 6 * 60 + 56.32,  // 危
    23 * 3600 + 5 * 60 + 52.98,  // 室
    0 * 3600 + 14 * 60 + 24.21,  // 壁
    0 * 3600 + 48 * 60 + 32.71,  // 奎
    1 * 3600 + 55 * 60 + 54.27,  // 娄
    2 * 3600 + 44 * 60 + 48.1,   // 胃
    3 * 3600 + 46 * 60 + 14.82,  // 昴
    4 * 3600 + 29 * 60 + 58.12,  // 毕
    5 * 3600 + 36 * 60 + 5.75,   // 觜
    5 * 3600 + 41 * 60 + 55.95,  // 参
    6 * 3600 + 24 * 60 + 22.01,  // 井
    8 * 3600 + 32 * 60 + 55.36,  // 鬼
    8 * 3600 + 38 * 60 + 53.34,  // 柳
    9 * 3600 + 28 * 60 + 43.94,  // 星
    9 * 3600 + 52 * 60 + 35.94,  // 张
    11 * 3600 + 0 * 60 + 54.37,  // 翼
    12 * 3600 + 16 * 60 + 59.8,   // 轸
  ],

  // 24节气名称
  SOLAR_TERMS: [
    '春分', '清明', '谷雨', '立夏', '小满', '芒种',
    '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
    '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
    '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰'
  ]
};

// ==================== 绘图配置 ====================
const DRAWING = {
  // 画布尺寸
  CANVAS: {
    WIDTH_DEFAULT: 1100,
    WIDTH_DISTANCE: 1800,
    WIDTH_7YAO: 1300,
    HEIGHT: 1200,
    MAX_WIDTH: 2300
  },

  // 中心点和半径
  CENTER: {
    X: 1300 / 2,  // 650
    Y: 1200 / 2,  // 600
    RADIUS: 315,
    CROSS_PIXELS: 8
  },

  // 轨道缩放
  ORBIT_SCALE: 6.0,

  // 地平圈配置
  HORIZON: {
    RADIUS_OFFSET: 20,
    CENTER_OFFSET_X: 200,
    TEXT_OFFSET: 100
  },

  // 刻度配置
  SCALE: {
    R24: 295,        // 24节气圈半径
    RX: 355,         // 28宿圈半径
    R1_BASE: 315,    // 基础半径
    R2_OFFSET: -20,  // 内圈偏移
    LINE_WIDTH: 1.2, // 刻度线宽
    HOUR_TICK: 6,    // 小时刻度长度
    SUB_TICK: 15     // 子刻度长度
  },

  // 字体配置
  FONT: {
    DEFAULT: '15px monospace',
    SMALL: '12px monospace',
    TINY: '10px monospace',
    HEADER: '16px monospace',
    SYMBOL: '16px monospace'
  },

  // 颜色配置
  COLORS: {
    BACKGROUND: 'white',
    TEXT: 'black',
    GRID: 'rgb(50,100,230)',
    ECLIPTIC: 'rgb(180,140,0)',
    EQUATOR: 'rgb(255,0,0)',
    HORIZON: 'rgb(50,100,230)',
    RETROGRADE: 'red',
    CURRENT: 'rgb(250,0,0)',
    GRAY: 'gray',
    LIGHT_GRAY: '#ccc'
  }
};

// ==================== 默认设置配置 ====================
const DEFAULT_SETTINGS = {
  faceMode: true,              // 是否正面图
  guijiMode: false,            // 是否轨迹图
  show24Jieqi: true,
  show24JieqiClockwise: true,
  show24JieqiArea: false,
  show28Xiu: true,
  use360: true,
  show28XiuArea: false,
  showDouJian: true,
  showYueJian: true,
  show10Yueli: true,
  showLine: false,
  showPlanetData: true,
  showDirection: true,
  showSunPlanetTrack: false,
  showNowString: true,
  southUp: false,
  useEcliptic: false,
  BeiDouFaceSouth: true,
  showPlanetDistance: false,
  faceNorthImage: true,
  useDecAndElipticInNoDistanceMode: false,
  onlyShow7Yao: false,
  showOtherStars: true,
};

// ==================== 键盘快捷键配置 ====================
const KEYBOARD_SHORTCUTS = {
  // 时间导航
  J: { action: 'nextday', params: [-1], desc: '后退一天' },
  K: { action: 'nextday', params: [1], desc: '前进一天' },
  H: { action: 'home', desc: '回到当前时间' },
  N: { action: 'nextHour', params: [-1], desc: '后退一小时' },
  M: { action: 'nextHour', params: [1], desc: '前进一小时' },
  D: { action: 'nextMinute', params: [-1], desc: '后退一分钟' },
  F: { action: 'nextMinute', params: [1], desc: '前进一分钟' },

  // 视图切换
  I: { action: 'toggle', prop: 'faceMode', desc: '切换正面/侧面图' },
  O: { action: 'toggle', prop: 'guijiMode', desc: '切换轨迹模式' },
  Y: { action: 'toggle', prop: 'southUp', desc: '正南方朝上开关' },
  W: { action: 'toggle', prop: 'BeiDouFaceSouth', desc: '切换北斗视图' },
  Q: { action: 'toggle', prop: 'useEcliptic', desc: '切换黄道/赤道坐标' },

  // 显示选项
  U: { action: 'toggle', prop: 'showSunPlanetTrack', desc: '显示太阳系轨道' },
  L: { action: 'toggle', prop: 'show24JieqiClockwise', desc: '切换24节气顺逆时针' },
  B: { action: 'toggle', prop: 'showLine', desc: '切换行星连线' },
  P: { action: 'toggle', prop: 'showPlanetData', desc: '切换行星数据显示' },
  T: { action: 'toggle', prop: 'showPlanetDistance', desc: '切换行星距离显示' },
  S: { action: 'toggle', prop: 'useDecAndElipticInNoDistanceMode', desc: '切换赤纬/黄纬显示' },
  G: { action: 'toggle', prop: 'use360', desc: '切换28宿360°/365.25°' },

  // 快速跳转
  A: { action: 'jumpToDate', date: '1962-02-05', desc: '回到历元' },
  Z: { action: 'setTime', time: '06:00:00', desc: '跳到06:00' },
  X: { action: 'setTime', time: '00:00:00', desc: '跳到00:00' },
  C: { action: 'setTime', time: '18:00:00', desc: '跳到18:00' },

  // 时间段跳转
  E: { action: 'timeSpan', direction: -1, desc: '后退时间段' },
  R: { action: 'timeSpan', direction: 1, desc: '前进时间段' }
};

// ==================== 地理位置默认配置 ====================
const DEFAULT_POSITION = {
  latitude: 27.8,   // 纬度
  longitude: 113.1, // 经度
  altitude: 100     // 海拔
};


// ==================== 物理常量 ====================
const PHYSICS = {
  SUN_RADIUS: 695700.0,        // 太阳半径 (km)
  KM_PER_AU: 149597870.7,     // 1天文单位对应的公里数
  EARTH_TILT: 23.5,           // 地球黄赤交角 (度)
  SOLAR_TIME_OFFSET: 12       // 太阳时计算偏移
};

// ==================== 计算参数 ====================
const CALCULATION = {
  UPDATE_INTERVAL: 1000,       // 更新间隔 (毫秒)
  RETROGRADE_CHECK_DAYS: 365,  // 逆行检查天数
  MOON_PHASE_CHECK_DAYS: 27.5, // 月相检查天数
  TIME_SEARCH_FUTURE: 1.2,     // 时间搜索未来系数
  DEFAULT_TIME_SPAN: 30,       // 默认时间跨度
  DEFAULT_TIME_UNIT: '日'      // 默认时间单位
};

// 将配置对象挂载到全局作用域，以便其他脚本使用
window.ASTRONOMY_CONFIG = {
  PLANETS,
  CALENDAR,
  DRAWING,
  DEFAULT_SETTINGS,
  DEFAULT_POSITION,
  KEYBOARD_SHORTCUTS,
  PHYSICS,
  CALCULATION
};