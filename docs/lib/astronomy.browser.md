# Astronomy.js 浏览器库使用文档

## 概述

Astronomy.js 是一个专业的天文计算JavaScript库，由Don Cross开发，用于精确计算天体位置、坐标转换、日月食等天文现象。本项目中使用的是v2.4版本。

## 基本信息

- **版本**: 2.4
- **作者**: Don Cross <cosinekitty@gmail.com>
- **许可证**: MIT License
- **GitHub**: https://github.com/cosinekitty/astronomy
- **文件位置**: `js/lib/astronomy.browser.js`

## 核心功能

### 1. 观测者设置
```javascript
// 创建观测者对象
let observer = new Astronomy.Observer(latitude, longitude, altitude);
```

### 2. 天体坐标计算

#### 赤道坐标 (Equatorial Coordinates)
```javascript
// 计算天体赤道坐标
let equ = Astronomy.Equator(body, date, observer, ofdate, aberration);
// 参数说明：
// - body: 天体名称 ('Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune')
// - date: 日期时间对象
// - observer: 观测者对象
// - ofdate: 布尔值，true使用视位置，false使用J2000历元位置
// - aberration: 布尔值，是否包含光行差修正
```

#### 黄道坐标 (Ecliptic Coordinates)
```javascript
// 计算黄道坐标
let hdvec = Astronomy.GeoVector(body, date, correctLight);
let ecliptic = Astronomy.Ecliptic(hdvec);

// 计算黄道经度
let elon = Astronomy.EclipticLongitude(body, date);
```

#### 地平坐标 (Horizontal Coordinates)
```javascript
// 计算地平坐标
let hor = Astronomy.Horizon(date, observer, ra, dec, refraction);
```

### 3. 时间计算

#### 恒星时
```javascript
// 计算地方恒星时
let sidereal = Astronomy.SiderealTime(date);
```

#### 时角
```javascript
// 计算天体时角
let hourAngle = Astronomy.HourAngle(body, date, observer);
```

### 4. 天体关系计算

#### 角距离计算
```javascript
// 计算两个天体之间的角距离
let angle = Astronomy.PairLongitude(body1, body2, date);
```

#### 高度角搜索
```javascript
// 搜索天体达到特定高度角的时间
let event = Astronomy.SearchAltitude(body, observer, direction, startTime, directionDays, altitude);
```

#### 升落时间
```javascript
// 搜索天体升起时间
let rise = Astronomy.SearchRiseSet(body, observer, direction, startTime, futureDays);

// 搜索天体落下时间
let set = Astronomy.SearchRiseSet(body, observer, -1, startTime, futureDays);
```

### 5. 月亮计算

#### 月亮近远地点
```javascript
// 搜索月亮近地点或远地点
let apsis = Astronomy.SearchLunarApsis(date);
```

#### 月相
```javascript
// 计算月相
let phase = Astronomy.MoonPhase(date);
```

### 6. 恒星定义

#### 自定义恒星
```javascript
// 定义恒星位置
Astronomy.DefineStar(name, raHours, decDegrees, distanceParsecs);

// 示例：定义大角星
Astronomy.DefineStar('Dajiao', 14.2577, 19.1812, 36.71);
```

### 7. 坐标转换

#### 旋转矩阵
```javascript
// 创建坐标转换旋转矩阵
let matrix = Astronomy.Rotation_EQD_ECT(date);

// 应用旋转向量
let rotatedVector = Astronomy.RotateVector(matrix, vector);
```

## 项目中的典型应用

### 计算行星位置
```javascript
// 获取行星当前位置数据
function getRA(body, time, matrix, computeRetro) {
    let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);
    let equ_ofdate = Astronomy.Equator(body, time, observer, true, true);
    let equ_j2000 = Astronomy.Equator(body, time, observer, false, true);

    // 坐标转换
    let hdvec = Astronomy.GeoVector(body, time, true);
    let ecliptic = Astronomy.Ecliptic(hdvec);

    // 地平坐标
    let hor = Astronomy.Horizon(time, observer, equ_j2000.ra, equ_j2000.dec, 'normal');

    return {
        ra: equ_ofdate.ra,
        dec: equ_ofdate.dec,
        elat: ecliptic.elat,
        elon: ecliptic.elon,
        hor: hor
    };
}
```

### 计算日月出没
```javascript
// 计算太阳和月亮的升起、落下、晨昏蒙影时间
function calculateSunMoonTimes(observer, date) {
    // 搜索太阳位置事件
    let up0 = Astronomy.SearchAltitude('Sun', observer, 1, date, future, -sita);
    let down18 = Astronomy.SearchAltitude('Sun', observer, -1, date, future, -18);
    let rise = Astronomy.SearchRiseSet('Sun', observer, 1, date, future);
    let set = Astronomy.SearchRiseSet('Sun', observer, -1, date, future);

    // 计算晨昏蒙影
    let up6 = Astronomy.SearchAltitude('Sun', observer, 1, date, future, -6);
    let up12 = Astronomy.SearchAltitude('Sun', observer, 1, date, future, -12);

    return { rise, set, up6, up12 };
}
```

## 重要常量

```javascript
// 天文单位转换
Astronomy.KM_PER_AU        // 1 AU = 149,597,870.69 km
Astronomy.C_AUDAY          // 光速 AU/day = 173.1446326846693

// 角度转换
Astronomy.DEG2RAD          // 度转弧度
Astronomy.RAD2DEG          // 弧度转度
Astronomy.HOUR2RAD         // 小时转弧度
Astronomy.RAD2HOUR         // 弧度转小时
```

## 注意事项

1. **时间精度**: 库内部使用高精度时间计算，确保结果准确
2. **坐标系统**: 支持多种坐标系统（赤道、黄道、地平、银河系）
3. **历史范围**: 支持长期历史计算，考虑了岁差等天文现象
4. **性能**: 专为浏览器优化，适合实时天文应用

## 相关链接

- [官方文档](https://github.com/cosinekitty/astronomy)
- [API参考](https://cosinekitty.github.io/astronomy/)
- [在线演示](https://cosinekitty.com/astronomy/)