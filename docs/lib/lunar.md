# Lunar.js 中国农历库使用文档

## 概述

Lunar.js 是一个专门用于中国农历计算的JavaScript库，提供了完整的农历日期转换、节气计算、干支纪年等功能。本项目中使用它来显示农历信息和传统历法数据。

## 基本信息

- **库类型**: 中国农历计算库
- **主要功能**: 农历公历转换、二十四节气、干支纪年、传统节日
- **文件位置**: `js/lib/lunar.js`
- **使用方式**: UMD模块，支持浏览器和Node.js环境

## 核心功能

### 1. 农历日期对象创建

#### 从公历日期创建农历对象
```javascript
// 从公历日期创建农历对象
let lunar = Lunar.fromDate(date);

// 示例：获取当前日期的农历信息
let now = new Date();
let lunar = Lunar.fromDate(now);
console.log(lunar.toString()); // 输出农历日期字符串
```

#### 农历对象属性
```javascript
let lunar = Lunar.fromDate(new Date());

// 获取农历年月日
lunar.year     // 农历年份
lunar.month    // 农历月份 (1-12)
lunar.day      // 农历日期 (1-30)
lunar.isLeap   // 是否为闰月

// 获取干支纪年
lunar.ganzhiYear   // 干支年
lunar.ganzhiMonth  // 干支月
lunar.ganzhiDay    // 干支日

// 获取生肖
lunar.zodiac   // 生肖 (鼠、牛、虎、兔等)
```

### 2. 日期格式化

#### 字符串输出
```javascript
let lunar = Lunar.fromDate(new Date());

// 完整农历字符串
console.log(lunar.toString());
// 输出示例: "二〇二四年腊月初八"

// 自定义格式
lunar.format('YYYY年MM月DD日');  // 二〇二四年腊月初八
lunar.format('农历YYYY年');     // 农历二〇二四年
```

### 3. 节气计算

#### 获取当前节气
```javascript
let lunar = Lunar.fromDate(new Date());

// 获取当前节气
let jieqi = lunar.getJieQi();
console.log(jieqi); // 输出当前节气名称，如: "大寒"

// 获取下个节气
let nextJieqi = lunar.getNextJieQi();
console.log(nextJieqi.name);   // 下个节气名称
console.log(nextJieqi.date);   // 下个节气日期
```

#### 二十四节气列表
```javascript
// 获取年份的所有节气
let yearJieqi = lunar.getYearJieQi();
yearJieqi.forEach(jq => {
    console.log(`${jq.name}: ${jq.date}`);
});
```

### 4. 传统节日

#### 获取节日信息
```javascript
let lunar = Lunar.fromDate(new Date());

// 获取当天节日
let festivals = lunar.getFestivals();
festivals.forEach(festival => {
    console.log(festival.name);  // 节日名称
    console.log(festival.type);  // 节日类型
});
```

### 5. 天干地支计算

#### 干支纪年
```javascript
let lunar = Lunar.fromDate(new Date());

// 获取天干
let tiangan = lunar.getTiangan(); // 甲、乙、丙、丁...

// 获取地支
let dizhi = lunar.getDizhi();     // 子、丑、寅、卯...

// 获取完整干支
let ganzhi = lunar.getGanzhi();   // 甲子、乙丑...
```

### 6. 月份相关

#### 闰月判断
```javascript
let lunar = Lunar.fromDate(new Date());

// 判断是否为闰月
if (lunar.isLeap) {
    console.log(`今年闰${lunar.month}月`);
}

// 获取闰月信息
let leapMonth = lunar.getLeapMonth();
if (leapMonth > 0) {
    console.log(`今年闰${leapMonth}月`);
}
```

## 项目中的典型应用

### 显示农历信息
```javascript
// 在应用中显示农历日期
function displayLunarDate() {
    let solarDate = getJulianDate(now.value)[0];  // 获取公历日期
    let lunar = Lunar.fromDate(solarDate);        // 转换为农历

    // 显示农历信息
    let lunarText = lunar.toString().replace(/.*年/, ''); // 移除年份部分
    context.fillText(lunarText, centerX, centerY);

    // 显示干支信息
    let ganzhi = lunar.getGanzhi();
    context.fillText(`干支: ${ganzhi}`, centerX, centerY + 20);
}
```

### 计算传统历法
```javascript
// 结合传统历法系统
function calculateTraditionalCalendar(date) {
    let lunar = Lunar.fromDate(date);

    // 获取农历月建
    let month = lunar.month;
    let ganzhiMonth = lunar.getGanzhiMonth();

    // 获取年份信息
    let year = lunar.year;
    let zodiac = lunar.zodiac;

    return {
        lunarYear: year,
        lunarMonth: month,
        lunarDay: lunar.day,
        ganzhiYear: lunar.getGanzhiYear(),
        ganzhiMonth: ganzhiMonth,
        ganzhiDay: lunar.getGanzhiDay(),
        zodiac: zodiac,
        isLeap: lunar.isLeap
    };
}
```

## 日期计算工具

### 精确日期处理
```javascript
// ExactDate 工具 - 处理历史日期的精确计算
let exactDate = ExactDate.fromYmdHms(2024, 1, 1, 12, 0, 0);

// 计算两个日期之间的天数
let days = ExactDate.getDaysBetweenYmd(2024, 1, 1, 2024, 2, 1);
console.log(days); // 31天
```

### 月份天数
```javascript
// 获取月份天数
let daysInMonth = SolarUtil.getDaysInMonth(year, month);

// 获取年份天数
let daysInYear = SolarUtil.getDaysInYear(year);
```

## 注意事项

1. **历史准确性**: 库考虑了中国历史历法改革，如1582年的公历改革
2. **时区处理**: 使用本地时区，确保农历日期的准确性
3. **闰月处理**: 正确处理农历闰月，符合传统历法规则
4. **节气精度**: 基于天文计算，确保节气时间的准确性

## 常用农历术语对照

| 农历术语 | 说明 |
|---------|------|
| 正月 | 农历第一个月 |
| 腊月 | 农历第十二个月 |
| 闰月 | 农历闰月，如"闰四月" |
| 朔望月 | 月相周期，约29.53天 |
| 二十四节气 | 立春、雨水、惊蛰...等 |
| 天干 | 甲、乙、丙、丁、戊、己、庚、辛、壬、癸 |
| 地支 | 子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥 |
| 生肖 | 鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪 |

## 使用示例

```javascript
// 完整示例：获取当前农历信息
function getCurrentLunarInfo() {
    let now = new Date();
    let lunar = Lunar.fromDate(now);

    console.log('公历:', now.toLocaleDateString());
    console.log('农历:', lunar.toString());
    console.log('干支年:', lunar.getGanzhiYear());
    console.log('生肖:', lunar.zodiac);
    console.log('节气:', lunar.getJieQi());

    // 检查是否有节日
    let festivals = lunar.getFestivals();
    if (festivals.length > 0) {
        console.log('节日:', festivals.map(f => f.name).join(', '));
    }

    return lunar;
}

// 调用示例
getCurrentLunarInfo();
```

这个库为天体图文应用提供了完整的中国农历和传统历法支持，使得应用能够显示丰富的中华文化天文信息。