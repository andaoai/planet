// 太阳系可视化脚本
// 基于Astronomy.js库的太阳系行星位置可视化

class SolarSystemVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;

        // 时间相关
        this.currentTime = new Date();
        this.animationSpeed = 0;

        // 显示选项
        this.showOrbits = true;
        this.showLabels = true;
        this.showCoords = false;
        this.showDizhi = true;

        // 画布尺寸
        this.canvasSize = 1000;

        // 精确时间输入
        this.yearInput = new Date().getFullYear();
        this.monthInput = new Date().getMonth() + 1;
        this.dayInput = new Date().getDate();
        this.hourInput = new Date().getHours();
        this.minuteInput = new Date().getMinutes();
        this.secondInput = new Date().getSeconds();

        // 行星配置
        this.planets = [
            { name: '水星', englishName: 'Mercury', color: '#A67B5B', radius: 4, orbitRadius: 40 },
            { name: '金星', englishName: 'Venus', color: '#FFC649', radius: 8, orbitRadius: 65 },
            { name: '地球', englishName: 'Earth', color: '#4169E1', radius: 12, orbitRadius: 130 },
            { name: '火星', englishName: 'Mars', color: '#CD5C5C', radius: 6, orbitRadius: 180 },
            { name: '木星', englishName: 'Jupiter', color: '#DAA520', radius: 20, orbitRadius: 240 },
            { name: '土星', englishName: 'Saturn', color: '#F4A460', radius: 18, orbitRadius: 300 },
            { name: '天王星', englishName: 'Uranus', color: '#4FD0E0', radius: 12, orbitRadius: 360 },
            { name: '海王星', englishName: 'Neptune', color: '#4169E1', radius: 12, orbitRadius: 400 },
            { name: '冥王星', englishName: 'Pluto', color: '#9CA4AB', radius: 3, orbitRadius: 440 }
        ];

        // 月球配置
        this.moon = {
            name: '月球',
            englishName: 'Moon',
            color: '#C0C0C0',
            radius: 6,
            orbitRadius: 25, // 月球相对于地球的轨道半径
            isMoon: true
        };

        // 十二地支配置 - 每个地支占30度
        this.dizhi = [
            { name: '子', startAngle: 345, endAngle: 15 },      // 345°-15° (正北，跨越0度)
            { name: '丑', startAngle: 315, endAngle: 345 },     // 315°-345° (修正)
            { name: '寅', startAngle: 285, endAngle: 315 },     // 285°-315° (修正)
            { name: '卯', startAngle: 255, endAngle: 285 },     // 255°-285° (正东，修正)
            { name: '辰', startAngle: 225, endAngle: 255 },     // 225°-255° (修正)
            { name: '巳', startAngle: 195, endAngle: 225 },     // 195°-225° (修正)
            { name: '午', startAngle: 165, endAngle: 195 },     // 165°-195° (正南)
            { name: '未', startAngle: 135, endAngle: 165 },     // 135°-165° (修正)
            { name: '申', startAngle: 105, endAngle: 135 },     // 105°-135° (修正)
            { name: '酉', startAngle: 75, endAngle: 105 },      // 75°-105° (正西，修正)
            { name: '戌', startAngle: 45, endAngle: 75 },       // 45°-75° (修正)
            { name: '亥', startAngle: 15, endAngle: 45 }        // 15°-45° (修正)
        ];

        // 木星十二地支配置（十二次）- 与地球地支相反
        this.jupiterDizhi = [
            { name: '子', startAngle: 165, endAngle: 195 },      // 165°-195° (地球午位)
            { name: '丑', startAngle: 135, endAngle: 165 },      // 135°-165° (地球未位)
            { name: '寅', startAngle: 105, endAngle: 135 },      // 105°-135° (地球申位)
            { name: '卯', startAngle: 75, endAngle: 105 },       // 75°-105° (地球酉位)
            { name: '辰', startAngle: 45, endAngle: 75 },        // 45°-75° (地球戌位)
            { name: '巳', startAngle: 15, endAngle: 45 },        // 15°-45° (地球亥位)
            { name: '午', startAngle: 345, endAngle: 15 },       // 345°-15° (地球子位，跨越0度)
            { name: '未', startAngle: 315, endAngle: 345 },      // 315°-345° (地球丑位)
            { name: '申', startAngle: 285, endAngle: 315 },      // 285°-315° (地球寅位)
            { name: '酉', startAngle: 255, endAngle: 285 },      // 255°-285° (地球卯位)
            { name: '戌', startAngle: 225, endAngle: 255 },      // 225°-255° (地球辰位)
            { name: '亥', startAngle: 195, endAngle: 225 }       // 195°-225° (地球巳位)
        ];
    }

    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;

        // 开始渲染
        this.update();

        // 启动动画循环
        this.animate();
    }

    // 格式化时间
    formatTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    // 计算行星位置
    calculatePlanetPositions() {
        // 优先使用外部时间管理器的时间
        const currentTime = this.getCurrentTime();
        const time = new Astronomy.AstroTime(currentTime);

        this.planets.forEach(planet => {
            try {
                // 获取日心黄道坐标
                const vector = Astronomy.HelioVector(planet.englishName, time);

                // 计算黄经和黄纬
                const ecliptic = Astronomy.Ecliptic(vector);
                planet.ecliptic = ecliptic.elon * 180 / Math.PI; // 转换为度
                planet.latitude = ecliptic.elat * 180 / Math.PI; // 转换为度

                // 计算屏幕坐标
                const angle = (ecliptic.elon * Math.PI) / 180; // 转换为弧度
                const scale = 1; // 可以根据需要调整比例
                planet.x = Math.cos(angle) * planet.orbitRadius * scale;
                planet.y = Math.sin(angle) * planet.orbitRadius * scale;

            } catch (error) {
                console.error(`计算 ${planet.name} 位置时出错:`, error);
                planet.ecliptic = 0;
                planet.latitude = 0;
                planet.x = planet.orbitRadius;
                planet.y = 0;
            }
        });

        // 单独计算月球位置
        try {
            // 获取地球位置
            const earth = this.planets.find(p => p.englishName === 'Earth');
            const earthVector = Astronomy.HelioVector('Earth', time);
            const earthEcliptic = Astronomy.Ecliptic(earthVector);
            const earthAngle = (earthEcliptic.elon * Math.PI) / 180;

            // 直接获取月球的日心坐标
            const moonVectorHeliocentric = Astronomy.HelioVector('Moon', time);
            const moonEclipticHeliocentric = Astronomy.Ecliptic(moonVectorHeliocentric);

            this.moon.ecliptic = moonEclipticHeliocentric.elon * 180 / Math.PI;
            this.moon.latitude = moonEclipticHeliocentric.elat * 180 / Math.PI;

            // 获取月球相对地球的位置（用于绘制月球位置）
            const moonGeoPos = Astronomy.GeoMoon(time);
            const moonRelativeAngle = Math.atan2(moonGeoPos.y, moonGeoPos.x);
            this.moon.relativeX = Math.cos(moonRelativeAngle) * this.moon.orbitRadius;
            this.moon.relativeY = Math.sin(moonRelativeAngle) * this.moon.orbitRadius;

            // 计算月球在太阳系中的实际位置（地球位置 + 月球相对位置）
            const earthScreenX = Math.cos(earthAngle) * earth.orbitRadius;
            const earthScreenY = Math.sin(earthAngle) * earth.orbitRadius;

            this.moon.x = earthScreenX + this.moon.relativeX;
            this.moon.y = earthScreenY + this.moon.relativeY;

        } catch (error) {
            console.error(`计算月球位置时出错:`, error);
            this.moon.ecliptic = 0;
            this.moon.latitude = 0;
            this.moon.x = 125;
            this.moon.y = 0;
            this.moon.relativeX = this.moon.orbitRadius;
            this.moon.relativeY = 0;
        }
    }

    // 绘制函数
    draw() {
        const ctx = this.ctx;
        const centerX = this.canvasSize / 2;
        const centerY = this.canvasSize / 2;

        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

        // 绘制轨道
        if (this.showOrbits) {
            this.planets.forEach(planet => {
                ctx.beginPath();
                ctx.arc(centerX, centerY, planet.orbitRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // 绘制月球轨道（以地球为中心的小圆圈）
            const earth = this.planets.find(p => p.englishName === 'Earth');
            if (earth && this.moon.relativeX !== undefined) {
                const earthX = centerX + earth.x;
                const earthY = centerY - earth.y;

                ctx.beginPath();
                ctx.arc(earthX, earthY, this.moon.orbitRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // 绘制十二地支位置
            if (this.showDizhi) {
                this.drawDizhiPositions(ctx, centerX, centerY);
                this.drawJupiterDizhiPositions(ctx, centerX, centerY);
            }
        }

        // 绘制太阳
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制太阳标签
        if (this.showLabels) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('太阳', centerX, centerY - 20);
        }

        // 绘制行星
        this.planets.forEach(planet => {
            const x = centerX + planet.x;
            const y = centerY - planet.y; // 负号因为屏幕坐标系Y轴向下

            // 绘制行星
            ctx.beginPath();
            ctx.arc(x, y, planet.radius, 0, 2 * Math.PI);
            ctx.fillStyle = planet.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 绘制标签
            if (this.showLabels) {
                ctx.fillStyle = planet.color;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(planet.name, x, y - planet.radius - 5);
            }
        });

        // 绘制月球
        if (this.moon.x !== undefined) {
            const moonX = centerX + this.moon.x;
            const moonY = centerY - this.moon.y;

            // 绘制月球
            ctx.beginPath();
            ctx.arc(moonX, moonY, this.moon.radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.moon.color;
            ctx.fill();
            ctx.strokeStyle = '#C0C0C0';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // 月球添加光晕效果
            ctx.beginPath();
            ctx.arc(moonX, moonY, this.moon.radius + 2, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(192, 192, 192, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 绘制月球标签
            if (this.showLabels) {
                ctx.fillStyle = this.moon.color;
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(this.moon.name, moonX, moonY - this.moon.radius - 3);
            }
        }
    }

    // 绘制十二地支位置 - 以地球轨道为中心
    drawDizhiPositions(ctx, centerX, centerY) {
        const earth = this.planets.find(p => p.englishName === 'Earth');
        const earthOrbitRadius = earth ? earth.orbitRadius : 130; // 地球轨道半径
        const textRadius = earthOrbitRadius + 25; // 地支文字位置

        ctx.save();

        this.dizhi.forEach(dizhi => {
            // 计算地支中心角度（处理跨越0度的情况）
            let centerAngle;
            if (dizhi.startAngle > dizhi.endAngle) {
                // 跨越0度的情况，如子(345°-15°)
                centerAngle = ((dizhi.startAngle + dizhi.endAngle + 360) / 2) % 360;
            } else {
                centerAngle = (dizhi.startAngle + dizhi.endAngle) / 2;
            }

            // 将角度转换为弧度（从正北开始顺时针）
            const angleRad = (centerAngle - 90) * Math.PI / 180; // 调整起始点为正北

            // 计算地支文字位置
            const textX = centerX + Math.cos(angleRad) * textRadius;
            const textY = centerY + Math.sin(angleRad) * textRadius;

            // 绘制地支弧形区域 - 在地球轨道上
            if (dizhi.startAngle > dizhi.endAngle) {
                // 跨越0度的情况，只绘制一个连续的扇形，但处理角度计算
                const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
                const endRad = (dizhi.endAngle + 360 - 90) * Math.PI / 180; // 将结束角度加上360度

                // 绘制外弧
                ctx.beginPath();
                ctx.arc(centerX, centerY, earthOrbitRadius + 15, startRad, endRad, false);

                // 绘制内弧（反向）
                ctx.arc(centerX, centerY, earthOrbitRadius - 15, endRad, startRad, true);
                ctx.closePath();

                ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                // 正常情况
                const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
                const endRad = (dizhi.endAngle - 90) * Math.PI / 180;

                ctx.beginPath();
                ctx.arc(centerX, centerY, earthOrbitRadius + 15, startRad, endRad, false);
                ctx.arc(centerX, centerY, earthOrbitRadius - 15, endRad, startRad, true);
                ctx.closePath();

                ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 绘制从中心到地支边界的引导线
            ctx.beginPath();
            const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
            const endRad = (dizhi.startAngle > dizhi.endAngle ?
                (dizhi.endAngle + 360 - 90) : (dizhi.endAngle - 90)) * Math.PI / 180;

            // 绘制地支边界的两条线（只到地球轨道附近）
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(startRad) * (earthOrbitRadius + 20),
                      centerY + Math.sin(startRad) * (earthOrbitRadius + 20));

            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(endRad) * (earthOrbitRadius + 20),
                      centerY + Math.sin(endRad) * (earthOrbitRadius + 20));

            ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // 绘制地支文字
            ctx.fillStyle = '#ff6b6b';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dizhi.name, textX, textY);
        });

        ctx.restore();
    }

    // 绘制木星十二地支位置（十二次）- 以木星轨道为中心
    drawJupiterDizhiPositions(ctx, centerX, centerY) {
        const jupiter = this.planets.find(p => p.englishName === 'Jupiter');
        const jupiterOrbitRadius = jupiter ? jupiter.orbitRadius : 240; // 木星轨道半径
        const textRadius = jupiterOrbitRadius + 25; // 木星地支文字位置

        ctx.save();

        this.jupiterDizhi.forEach(dizhi => {
            // 计算地支中心角度（处理跨越0度的情况）
            let centerAngle;
            if (dizhi.startAngle > dizhi.endAngle) {
                // 跨越0度的情况，如午(345°-15°)
                centerAngle = ((dizhi.startAngle + dizhi.endAngle + 360) / 2) % 360;
            } else {
                centerAngle = (dizhi.startAngle + dizhi.endAngle) / 2;
            }

            // 将角度转换为弧度（从正北开始顺时针）
            const angleRad = (centerAngle - 90) * Math.PI / 180; // 调整起始点为正北

            // 计算地支文字位置
            const textX = centerX + Math.cos(angleRad) * textRadius;
            const textY = centerY + Math.sin(angleRad) * textRadius;

            // 绘制木星地支弧形区域 - 在木星轨道上
            if (dizhi.startAngle > dizhi.endAngle) {
                // 跨越0度的情况，只绘制一个连续的扇形，但处理角度计算
                const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
                const endRad = (dizhi.endAngle + 360 - 90) * Math.PI / 180; // 将结束角度加上360度

                // 绘制外弧
                ctx.beginPath();
                ctx.arc(centerX, centerY, jupiterOrbitRadius + 15, startRad, endRad, false);

                // 绘制内弧（反向）
                ctx.arc(centerX, centerY, jupiterOrbitRadius - 15, endRad, startRad, true);
                ctx.closePath();

                ctx.fillStyle = 'rgba(218, 165, 32, 0.15)'; // 木星金色
                ctx.fill();
                ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                // 正常情况
                const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
                const endRad = (dizhi.endAngle - 90) * Math.PI / 180;

                ctx.beginPath();
                ctx.arc(centerX, centerY, jupiterOrbitRadius + 15, startRad, endRad, false);
                ctx.arc(centerX, centerY, jupiterOrbitRadius - 15, endRad, startRad, true);
                ctx.closePath();

                ctx.fillStyle = 'rgba(218, 165, 32, 0.15)'; // 木星金色
                ctx.fill();
                ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 绘制从中心到地支边界的引导线
            ctx.beginPath();
            const startRad = (dizhi.startAngle - 90) * Math.PI / 180;
            const endRad = (dizhi.startAngle > dizhi.endAngle ?
                (dizhi.endAngle + 360 - 90) : (dizhi.endAngle - 90)) * Math.PI / 180;

            // 绘制地支边界的两条线（只到木星轨道附近）
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(startRad) * (jupiterOrbitRadius + 20),
                      centerY + Math.sin(startRad) * (jupiterOrbitRadius + 20));

            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(endRad) * (jupiterOrbitRadius + 20),
                      centerY + Math.sin(endRad) * (jupiterOrbitRadius + 20));

            ctx.strokeStyle = 'rgba(218, 165, 32, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // 绘制地支文字
            ctx.fillStyle = '#DAA520'; // 木星金色
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dizhi.name, textX, textY);
        });

        ctx.restore();
    }

    // 时间控制函数
    previousDay() {
        this.currentTime.setDate(this.currentTime.getDate() - 1);
        this.update();
    }

    nextDay() {
        this.currentTime.setDate(this.currentTime.getDate() + 1);
        this.update();
    }

    previousHour() {
        this.currentTime.setHours(this.currentTime.getHours() - 1);
        this.update();
    }

    nextHour() {
        this.currentTime.setHours(this.currentTime.getHours() + 1);
        this.update();
    }

    now() {
        this.currentTime = new Date();
        this.yearInput = this.currentTime.getFullYear();
        this.monthInput = this.currentTime.getMonth() + 1;
        this.dayInput = this.currentTime.getDate();
        this.hourInput = this.currentTime.getHours();
        this.minuteInput = this.currentTime.getMinutes();
        this.secondInput = this.currentTime.getSeconds();
        this.update();
    }

    // 精确时间跳转函数
    jumpToTime() {
        const year = parseInt(this.yearInput);
        const month = parseInt(this.monthInput);
        const day = parseInt(this.dayInput);
        const hour = parseInt(this.hourInput);
        const minute = parseInt(this.minuteInput);
        const second = parseInt(this.secondInput);

        if (year >= 1500 && year <= 2500 &&
            month >= 1 && month <= 12 &&
            day >= 1 && day <= 31 &&
            hour >= 0 && hour <= 23 &&
            minute >= 0 && minute <= 59 &&
            second >= 0 && second <= 59) {

            this.currentTime.setFullYear(year, month - 1, day);
            this.currentTime.setHours(hour, minute, second, 0);
            this.update();
        }
    }

    // 年份控制函数
    jumpToYear() {
        this.currentTime = new Date();
        this.yearInput = this.currentTime.getFullYear();
        this.monthInput = this.currentTime.getMonth() + 1;
        this.dayInput = this.currentTime.getDate();
        this.hourInput = this.currentTime.getHours();
        this.minuteInput = this.currentTime.getMinutes();
        this.secondInput = this.currentTime.getSeconds();
        this.update();
    }

    previousYear() {
        this.currentTime.setFullYear(this.currentTime.getFullYear() - 1);
        this.yearInput = this.currentTime.getFullYear();
        this.update();
    }

    nextYear() {
        this.currentTime.setFullYear(this.currentTime.getFullYear() + 1);
        this.yearInput = this.currentTime.getFullYear();
        this.update();
    }

    // 更新可视化
    update() {
        this.calculatePlanetPositions();
        this.draw();
    }

    // 动画循环
    animate() {
        if (this.animationSpeed > 0 && this.externalTimeManager) {
            // 让外部时间管理器处理时间变化，我们只更新显示
            // 不在这里修改时间，由外部统一管理
            this.update();
        }
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    // 设置外部时间管理器的引用
    setExternalTimeManager(timeManager) {
        this.externalTimeManager = timeManager;
    }

    // 获取当前时间（优先使用外部时间管理器）
    getCurrentTime() {
        if (this.externalTimeManager) {
            return new Date(this.externalTimeManager.now.value);
        }
        return this.currentTime;
    }

    // 键盘事件处理
    handleKeyPress(event) {
        switch(event.key.toLowerCase()) {
            case 'j':
                this.previousDay();
                break;
            case 'k':
                this.nextDay();
                break;
            case 'n':
                this.previousHour();
                break;
            case 'm':
                this.nextHour();
                break;
            case 'h':
                this.now();
                break;
            case 'u':
                this.previousYear();
                break;
            case 'i':
                this.nextYear();
                break;
            case ' ':
                event.preventDefault();
                this.animationSpeed = this.animationSpeed > 0 ? 0 : 1;
                break;
        }
    }

    // 销毁函数
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}