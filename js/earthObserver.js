// 天体图文应用主脚本
let { ref, reactive, toRefs, onMounted, watch } = Vue;

Array.prototype.at = function(idx) {
  return this[idx < 0 ? this.length + idx : idx];
}
const app = {
  setup() {
    const { PLANETS, CALENDAR, DRAWING, DEFAULT_SETTINGS, DEFAULT_POSITION, PHYSICS, CALCULATION } = window.ASTRONOMY_CONFIG;
    const ryear = CALENDAR.TROPICAL_YEAR;
    function Pad(s, w) {
      s = s.toFixed(0);
      while (s.length < w) {
        s = '0' + s;
      }
      return s;
    }
    function FormatDate(date, m, d) {
      if(!date) return '';
      var year = date.getFullYear(); //Pad(date.getFullYear(), 4);
      if(year <= 0) year = '前' + (1 - year);
      else year = '元始' + year;
      var month = Pad(m > 0 ? m : 1 + date.getMonth(), 2);
      var day = Pad(d > 0 ? d : date.getDate(), 2);
      var hour = Pad(date.getHours(), 2);
      var minute = Pad(date.getMinutes(), 2);
      var second = Pad(date.getSeconds(), 2);
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    function FormatTime(date){
      if(!date) return '';
      var hour = Pad(date.getHours(), 2);
      var minute = Pad(date.getMinutes(), 2);
      var second = Pad(date.getSeconds(), 2);
      return `${hour}:${minute}:${second}`;
    }

    const now = ref(new Date());

    // 基础数据
    let settings = localStorage.getItem('settings');
    let defaults = { s: DEFAULT_SETTINGS };
    if (!settings) {
      settings = reactive(defaults)
    } else {
      settings = reactive(JSON.parse(settings));
      if(!settings.s){
        settings = reactive(defaults);
      }
      for(let k in defaults.s){
        if(k in settings.s){
          // 有就算了
        }else{
          settings.s[k] = defaults.s[k];
        }
      }
    }
    let position = localStorage.getItem('position');
    if(!position) {
      position = reactive({ s: DEFAULT_POSITION });
    }else{
      position = reactive(JSON.parse(position));
    }

    function getPosition(){
      return position.s;
    }
    function setPosition(k, v){
      position.s[k] = v;
    }
    // 行星距离表
    const planetDist = PLANETS.DISTANCE;
    const planetDistMin = {};
    const planetDistMax = {};
    for (let k in planetDist) {
      let min = Math.abs(planetDist[k] - 1);
      planetDistMin[k] = min;
      planetDistMax[k] = planetDist[k] + 1 - min;
    }
    // 28宿赤经数据
    let x28cj = [...CALENDAR.XIU_28_BASE_RA];
    let x28a = [];
    for (let z = 0; z < 28; z++) {
      let next = z + 1;
      if (next > 27) next = 0;
      let f1 = x28cj[z];
      let f2 = x28cj[next];
      let ff = f2 - f1;
      if (ff < 0) ff += 24 * 3600;
      ff = ff / (24 * 3600) * ryear;
      x28a.push(ff);
    }
    // console.log(x28a2);
    const x28n = CALENDAR.XIU_28_NAMES;

    function resetX28a(){
      let x28a = [];
      for (let z = 0; z < 28; z++) {
        let next = z + 1;
        if (next > 27) next = 0;
        let f1 = x28cj[z];
        let f2 = x28cj[next];
        let ff = f2 - f1;
        if (ff < 0) ff += 24 * 3600;
        ff = ff / (24 * 3600) * ryear;
        x28a.push(ff);
      }
    }

    function nextday(dd) {
      killInterval();
      let day = now.value;
      let newDay = new Date(day);
      newDay.setDate(newDay.getDate() + dd);
      now.value = newDay; // 创建新的Date对象确保响应式更新
      paint();
      // 同步所有视图
      syncTimeToAllViews();
    }

    function nextHour(dh){
      killInterval();
      let day = now.value;
      let newDay = new Date(day);
      newDay.setHours(newDay.getHours() + dh);
      now.value = newDay; // 创建新的Date对象确保响应式更新
      paint();
      // 同步所有视图
      syncTimeToAllViews();
    }

    function nextMinute(dm){
      killInterval();
      let day = now.value;
      let newDay = new Date(day);
      newDay.setMinutes(newDay.getMinutes() + dm);
      now.value = newDay; // 创建新的Date对象确保响应式更新
      paint();
      // 同步所有视图
      syncTimeToAllViews();
    }

    // 天文计算：
    function getXDdataByRA(para) {
      let ra = para.ra;
      if (!ra) ra = para;
      while (ra > 24) ra -= 24;
      while (ra < 0) ra += 24;
      let a = ra * 3600 - x28cj[0];
      if (a < 0) a += 24 * 3600;
      a = a / (24 * 3600) * ryear;
      let idx = 0;
      let sum = 0;
      let stop = false;
      for (let i = 0; i < x28a.length; i++) {
        let cur = x28a[i];
        if (cur + sum > a) {
          break;
        }
        sum += cur;
        idx += 1;
      }
      let du = (a - sum).toFixed(2);
      let percent = (du / x28a[idx]).toFixed(2) * 100;
      let xiu = '青龙';
      if (idx >= 7 && idx <= 13) {
        xiu = '玄武';
      } else if (idx >= 14 && idx <= 20) {
        xiu = '白虎';
      } else if (idx >= 21) {
        xiu = '朱雀';
      }
      let dist2 = 0;
      if (para.body != '月亮' && para.body != '太阳' && para.dist) {
        dist2 = (para.dist - planetDistMin[para.body]) / planetDistMax[para.body] * 100;
      }
      return Object.assign({
        ra,
        vec: para.vec,
        body: para.body,
        xiang: xiu,
        xiu: x28n[idx],
        du,
        percent: percent.toFixed(2),
        duAll: a.toFixed(2),
        dist: para.dist ?? '',
        dist2: dist2.toFixed(1)
      }, para);
    }
    function getXDByRA(para) {
      let d = getXDdataByRA(para);
      return `${d.xiang}·${d.xiu}宿${d.du}度 [${d.percent}%][${d.duAll}]-赤纬[${d.dec}]-距离[${d.dist}]`
    }

    // 根据节气计算真昏正南星宿
    function getX28SunOffset(ra) {
      let n235 = (23 + 26 / 60) / 360 * 2 * Math.PI;
      let sita = ra / 24 * 2 * Math.PI;
      let b = Math.sin(n235) * Math.sin(sita) * Math.tan(getPosition().latitude / 360 * 2 * Math.PI);
      b = b / Math.cos(Math.asin(Math.sin(n235) * Math.sin(sita)));
      b = Math.asin(b) / 2 / Math.PI * 24;
      return b;
    }

    // 格式化24小时制角度
    function formatHourDeg(h) {
      let hour = parseInt(h) + '';
      let minute = (h - hour) * 60;
      let sec = (minute - parseInt(minute)) * 60;
      minute = '' + parseInt(minute);
      let rest = sec - parseInt(sec);
      sec = '' + parseInt(sec);
      return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${sec.padStart(2, '0')}${rest.toFixed(2).replace(/^0/, '')}`
    }

    function getJupiterAngle(day) {
      let pos = getPosition();
      let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);
      let equ = Astronomy.Equator('Jupiter', day, observer, true, true);
      let time = now.value;
      let matrix = Astronomy.Rotation_EQD_ECT(time);
      equ.evec = Astronomy.RotateVector(matrix, equ.vec);
      const vecKey = settings.s.useEcliptic ? 'evec' : 'vec';
      let [x,y] = [equ[vecKey].x, equ[vecKey].y];
      let res = Math.atan(y / x);
      // console.log('x,y:', x, y);
      return x < 0 ? res + Math.PI : res;
    }

    function getRA(body, time, matrix, computeRetro) {
      let pos = getPosition();
      let today = time;
      if(!matrix){
        matrix = Astronomy.Rotation_EQD_ECT(time);
      }
      let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);
      let equ_ofdate = Astronomy.Equator(body, today, observer, true, true);
      let equ_j2000 = Astronomy.Equator(body, today, observer, false, true);
      equ_ofdate.evec = Astronomy.RotateVector(matrix, equ_ofdate.vec);
      let hdvec = Astronomy.GeoVector(body, today, true);
      let ecliptic = Astronomy.Ecliptic(hdvec);
      equ_ofdate.elat = ecliptic.elat;
      equ_ofdate.elon = ecliptic.elon;
      let hor = Astronomy.Horizon(today, observer, equ_j2000.ra, equ_j2000.dec, 'normal');
      equ_ofdate.hor = hor;
      equ_ofdate.timeAngle = formatHourDeg(Astronomy.HourAngle(body,now.value,observer));

      equ_ofdate.retroState = computeRetro ? getRetrogradeState(body, observer) : {
          state: 1
        };

      // let beta = Math.sin(hor.azimuth/360*2*Math.PI)*Math.cos(hor.altitude/360*2*Math.PI);
      // equ_ofdate.ta = 24 - Math.asin(beta) / (2*Math.PI) * 24;
      equ_ofdate.body = PLANETS.CHINESE_NAMES[body];
      // console.log(body, equ_ofdate);
      return equ_ofdate;
    }

    function getPureDate(d){
      let dd = new Date(d);
      dd.setHours(0);
      dd.setMinutes(0);
      dd.setSeconds(0);
      return dd;
    }

    // 获取逆行信息
    function getRetrogradeState(body, observer){
      if(body == 'Sun' || body == 'Moon') return {state: 1};
      let nn = getPureDate(now.value);
      let ytd = new Date(nn);
      ytd.setDate(ytd.getDate() - 1);
      let equ_ofdate = Astronomy.Equator(body, nn, observer, true, true);
      let equ = Astronomy.Equator(body, ytd, observer, true, true);
      let diff = equ_ofdate.ra - equ.ra;
      // if(body == 'Venus')console.log(diff)
      if(diff > 0 && diff < 1 || diff < -23){ // 春分点附近容易出问题
        // 正在顺行
        return {
          state: 1
        }
      }

      // console.log(body, equ.ra, diff);
      let retro = [equ_ofdate.ra];
      let today = new Date(nn);
      for(let i = 1; i < 365; i++){
        today.setDate(today.getDate() - 1);
        equ = Astronomy.Equator(body, today, observer, true, true);
        let last = retro.at(-1);
        diff = equ.ra - last;
        // console.log(nn,today, i, diff);
        if(diff < 0 && diff > -1 || diff > 23){  // 春分点附近逆行
          return {
            state: 0,
            days: i - 1
          }
        }
        retro.push(equ.ra);
      }
    }

    const info = ref([]);

    // 常用大星赤经
  
    // 行星绘图
    const PlanetOrbitScale = DRAWING.ORBIT_SCALE;
    const crossPixels = DRAWING.CENTER.CROSS_PIXELS;
    const planet_color = PLANETS.COLORS;
    const planet_radius = PLANETS.RADII;
    const radius_ratio = PLANETS.RADIUS_RATIO;

    function rotateXY(x, y, angle){
      let rr = Math.sqrt(x*x + y*y);
      x = rr * Math.cos(angle);
      y = rr * Math.sin(angle);
      return [x, y];
    }
    function drawCircle(ctx, r, scale, direct, start, end, color, stroke, scolor){
      ctx.save();
      ctx.rotate(-direct)
      ctx.scale(scale, 1);
      ctx.beginPath();
      ctx.arc(0, 0, r, start, end);
      ctx.fillStyle = color;
      ctx.fill();
      if(stroke){
        ctx.strokeStyle = scolor;
        ctx.stroke();
      }
      if(start < 0 && color == 'white'){
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(0, r);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
      }
      ctx.restore();
    }

    // 绘制图片
    let jupiterImg = new Image();
    jupiterImg.src = 'assets/images/jupiter.png';
    let saturnImg = new Image();
    saturnImg.src = 'assets/images/saturn.png';
    // kdr: 刻度开始半径， kdl: 刻度长
    function PlotPlanet(graph, context, planet, symbol, radius, cx, cy, kdr, kdl, southAngle, sidereal) {
      const vecKey = settings.s.useEcliptic ? 'evec' : 'vec';
      const pixels = 900;//Math.min(graph.width, graph.height) / 2;
      let x = settings.s.faceMode ? planet[vecKey].x : planet[vecKey].y;
      let y = settings.s.faceMode ? planet[vecKey].y : planet[vecKey].z;
      [x, y] = [x * radius_ratio[symbol], y * radius_ratio[symbol]];
      const angle = Math.atan(y/x) + (x < 0 ? Math.PI : 0) + southAngle;
      [x, y] = rotateXY(x, y, angle);

      // console.log(symbol, (x / PlanetOrbitScale) * pixels, pixels);
      const xx = settings.s.BeiDouFaceSouth ? 1 : -1;
      const ctx = context;
      const isSun = symbol == '太阳';
      let ignoreR = 230;
      if(settings.s.useDecAndElipticInNoDistanceMode) ignoreR -= 20;
      let elat_ratio = 2.8;
      const latitude = settings.s.useDecAndElipticInNoDistanceMode ? planet.dec : planet.elat*elat_ratio;
      const pdiff = ignoreR * 23.5 / 90;
      const crossAngle = southAngle + Math.PI/2;

      const px = cx + xx*(settings.s.showPlanetDistance ? (x / PlanetOrbitScale) * pixels : ignoreR*(90+latitude)/90*Math.cos(angle));
      const py = cy - (settings.s.showPlanetDistance ? (y / PlanetOrbitScale) * pixels : ignoreR*(90+latitude)/90*Math.sin(angle));
      if(!settings.s.showPlanetDistance && (symbol == '月亮' || isSun)) {
        radius *= isSun ? 1.1 : 1.6;
      }
      const r = (settings.s.guijiMode ? 0.3 : planet_radius[symbol]) * radius;
      // 绘制内圈的赤/黄道
      if(isSun && !settings.s.showPlanetDistance && settings.s.faceMode && !settings.s.guijiMode){
        ctx.beginPath();
        ctx.lineWidth = 1;
        if(settings.s.useDecAndElipticInNoDistanceMode){
          // console.log(pdiff, crossAngle)
          // 画黄道
          ctx.save();
          ctx.translate(cx + pdiff*Math.cos(crossAngle)*xx, cy - pdiff*Math.sin(crossAngle));
          ctx.rotate(crossAngle);
          ctx.scale(1, 1.033);
          ctx.strokeStyle = 'rgb(180,140,0)';
          ctx.arc(0, 0, ignoreR, 0, 2*Math.PI);
          ctx.stroke();
          ctx.restore();
          // 画赤道
          ctx.beginPath();
          ctx.arc(cx, cy, ignoreR, 0, 2*Math.PI);
          ctx.strokeStyle = 'rgb(255,0,0)';
          ctx.stroke();
          // TODO: 画地平线, 无法精确表示升落标准，是否有必要还需要考虑
          if(settings.s.southUp){
            let pos = getPosition();
            let sita = Math.atan(pos.latitude/90);
            let xb = ignoreR/Math.sin(2*sita);
            ctx.save()
            ctx.beginPath();
            ctx.arc(cx, cy - pos.latitude/90*ignoreR, 5, 0, 2*Math.PI);
            ctx.stroke();
            ctx.beginPath();
            let [a,b,c] = [xb, xb - ignoreR*pos.latitude/90, kdr];
            let alpha = Math.acos((a*a + b*b - c*c)/(2*a*b))
            ctx.translate(cx, cy + xb - ignoreR*pos.latitude/90);
            // ctx.scale(0.95, 1)
            ctx.arc(0, 0, xb, Math.PI*3/2 - alpha, Math.PI*3/2 + alpha);
            ctx.strokeStyle = 'gray';
            ctx.stroke();
            ctx.restore();
          }
        }else{
          // 绘制黄道圈
          ctx.arc(cx, cy, ignoreR, 0, 2*Math.PI);
          ctx.strokeStyle = 'rgb(180,140,0)';
          ctx.stroke();
        }

        // 绘制真太阳时钟表盘
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = settings.s.useDecAndElipticInNoDistanceMode ? 'red' : 'rgb(180,140,0)';
        ctx.lineWidth = 1;
        ctx.font = "11px monospace";
        ctx.fillStyle = 'gray';
        let w = ctx.measureText('子').width;
        let t = 6;
        let angle = settings.s.southUp ? 0 : -sidereal;
        const x = settings.s.BeiDouFaceSouth ? 1 : -1;
        for(let i = 0; i < 24; i++){
          ctx.beginPath();
          let sita = -i * Math.PI / 12 - Math.PI/2 + angle;
          let sin = Math.sin(sita);
          let cos = Math.cos(sita);
          let s = i % 2;
          let len = s==0 ? 6 : 15;
          ctx.moveTo(ignoreR*cos*x, -ignoreR*sin);
          ctx.lineTo((ignoreR-len)*cos*x, -(ignoreR-len)*sin)
          ctx.stroke();
          if(s==0){
            let j = i/2;
            ctx.fillStyle = j % 3 == 0 ? 'red' : 'gray';
            // ctx.fillText('子丑寅卯辰巳午未申酉戌亥'[j], (ignoreR + t)*cos*x - w/2, -(ignoreR + t)*sin+3);
            let ex = 6;
            ctx.fillText('子丑寅卯辰巳午未申酉戌亥'[j], (ignoreR - len - ex)*cos*x - w/2, -(ignoreR - len - ex)*sin+3);
          }
        }
        for(let i = 0; i < 360; i++){
          ctx.beginPath();
          let sita = i * Math.PI / 180 + angle;
          let sin = Math.sin(sita);
          let cos = Math.cos(sita);
          let len = 2;
          ctx.moveTo(ignoreR*cos*x, -ignoreR*sin);
          ctx.lineTo((ignoreR-len)*cos*x, -(ignoreR-len)*sin)
          ctx.stroke();
        }
        ctx.restore();
      }
      // 太阳表盘绘制完毕，仅绘制一次

      // 绘制行星星体
      // 先画白道
      // 白道图：无距离，只显示黄道圈的情况，绘制接下来30天的白道点图
      if(!settings.s.showPlanetDistance && symbol == '月亮' && !settings.s.useDecAndElipticInNoDistanceMode){
        let time = new Date(now.value);
        let jg = 2;
        function drawMoon(time, fn){
          let ra = getRA('Moon', time);
          let x = ra.vec.x;
          let y = ra.vec.y;
          const angle = Math.atan(y/x) + (x < 0 ? Math.PI : 0) + southAngle;
          let latitude = settings.s.useDecAndElipticInNoDistanceMode ? ra.dec : ra.elat*elat_ratio;
          const px = cx + xx*ignoreR*(90+latitude)/90*Math.cos(angle);
          const py = cy - ignoreR*(90+latitude)/90*Math.sin(angle);
          // console.log(getPureDate(time),px,py,ra.elat,ignoreR);
          fn(px, py);
        }
        for(let i = 1; i <= 27.5*(24/jg); i++){
          time.setHours(time.getHours() + jg);
          drawMoon(time, (px, py) => {
            context.beginPath();
            context.arc(px, py, 1, 0, 2 * Math.PI);
            context.style = 'rgb(200,200,200)';
            context.fillStyle = 'gray';
            context.fill();
          })
        }
        // 标记近地点，远地点
        let apsis = Astronomy.SearchLunarApsis(now.value);
        let tmp = new Date(apsis.time.date);
        tmp.setHours(tmp.getHours() + 1);
        let next = Astronomy.SearchLunarApsis(tmp);
        function drawApsis(txt){
          return (px, py) => {
            context.fillStyle = 'red';
            let w2 = context.measureText(txt).width/2;
            context.fillText(txt, px - w2, py + 6);
          }
        }
        [apsis, next].forEach((aps) =>{
          drawMoon(aps.time.date, drawApsis(aps.kind == 0 ? '近' : '远'))
        })
      }
      // 再画月球
      if(!settings.s.showPlanetDistance && symbol == '月亮') {
        context.beginPath();
        let jiajiao = Astronomy.PairLongitude('Moon','Sun',now.value);
        let direct = angle - Math.PI/2;
        if(!settings.s.BeiDouFaceSouth)direct = Math.PI - direct;
        // 半圆
        ctx.save();
        ctx.strokeStyle = '#e0e0e0';
        ctx.translate(px, py);
        // console.log(Math.floor(jiajiao/90));
        if(jiajiao < 90){
          drawCircle(ctx, r, 1, 0, 0, 2*Math.PI, '#e0e0e0', true, '#404040');
          drawCircle(ctx, r, 1, direct, Math.PI/2, Math.PI*3/2, '#404040');
          drawCircle(ctx, r, 1-jiajiao/90, direct, -Math.PI/2, Math.PI/2, '#404040');
        }else if(jiajiao < 180){
          jiajiao -= 90;
          drawCircle(ctx, r, 1, 0, 0, 2*Math.PI, '#404040');
          drawCircle(ctx, r-1, jiajiao/90, direct, Math.PI/2, Math.PI*3/2, '#e0e0e0');
          drawCircle(ctx, r-1, 1, direct, -Math.PI/2, Math.PI/2, '#e0e0e0');
        }else if(jiajiao < 270){
          jiajiao -= 180;
          drawCircle(ctx, r, 1, 0, 0, 2*Math.PI, '#404040');
          drawCircle(ctx, r-1, 1, direct, Math.PI/2, Math.PI*3/2, '#e0e0e0');
          drawCircle(ctx, r-1, 1-jiajiao/90, direct, -Math.PI/2, Math.PI/2, '#e0e0e0');
        }else{
          jiajiao -= 270;
          drawCircle(ctx, r, 1, 0, 0, 2*Math.PI, '#e0e0e0', true, '#404040');
          drawCircle(ctx, r, jiajiao/90, direct, Math.PI/2, Math.PI*3/2, '#404040');
          drawCircle(ctx, r, 1, direct, -Math.PI/2, Math.PI/2, '#404040');
        }
        ctx.restore();
      }else{
        if(symbol == '木星'){
          let s = 20;
          ctx.drawImage(jupiterImg, px - s/2, py - s/2, s, s);
        }else if(symbol == '土星'){
          let s = 20;
          ctx.drawImage(saturnImg, px - s/2, py - s/2, s, s);
        }else{
          context.beginPath();
          const r = (settings.s.guijiMode ? 0.3 : planet_radius[symbol]) * radius;
          context.arc(px, py, r, 0, 2 * Math.PI);
          context.style = 'rgb(200,200,200)';
          context.fillStyle = planet_color[symbol];
          context.fill();
        }
      }

  
      // 画太阳光芒
      if(isSun && !settings.s.guijiMode){
        ctx.save()
        ctx.translate(px, py);
        const r = planet_radius[symbol] * radius;
        let start = r + 3;
        let end = start + 5;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        for(let i = 0; i < 8; i++){
          let angle = i*Math.PI/4;
          let cos = Math.cos(angle);
          let sin = Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(start*cos, start*sin);
          ctx.lineTo(end*cos, end*sin);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 黄道圈内行星简写名
      if(settings.s.faceMode && !settings.s.showPlanetDistance && !settings.s.guijiMode
          && !'太阳,月亮'.includes(symbol)){
        ctx.save();
        ctx.font = '16px monospace';
        let retro = planet.retroState.state == 0;
        ctx.fillStyle = retro ? 'red' : '#e0e0e0';
        if(retro){
          ctx.font = 'bold 16px monospace';
          ctx.strokeStyle = 'red';
        }
        let name = symbol.substr(0,1);
        let r = ignoreR - 45;
        let w = ctx.measureText(name).width/2;
        let retroR = r - 25;
        let showName = !'木星,土星'.includes(symbol);
        if(settings.s.useDecAndElipticInNoDistanceMode){
          let [x, y] = [cx+xx*pdiff*Math.cos(crossAngle), cy-pdiff*Math.sin(crossAngle)];
          // ctx.beginPath();
          // ctx.moveTo(x, y);
          // ctx.lineTo(px, py);
          // ctx.stroke();
          ctx.translate(x, y);
          let [dx,dy] = [px-x, py-y];
          let tmp = Math.atan(dy/dx) + (dx < 0 ? Math.PI : 0);
          if(showName) ctx.fillText(name, r*Math.cos(tmp) - w, r*Math.sin(tmp) + 6);
          if(retro){
            let w2 = ctx.measureText(planet.retroState.days).width/2;
            ctx.fillText(planet.retroState.days, retroR*Math.cos(tmp) - w2, retroR*Math.sin(tmp) + 6);
            ctx.strokeRect(r*Math.cos(tmp) - w - 2, r*Math.sin(tmp) - 11, w + 12, 22);
            if(!showName) ctx.fillText('逆', r*Math.cos(tmp) - w, r*Math.sin(tmp) + 6);
          }
        }else{
          if(showName) ctx.fillText(name, cx + xx*r*Math.cos(angle) - w, cy - r*Math.sin(angle) + 6);
          if(retro){
            let w2 = ctx.measureText(planet.retroState.days).width/2;
            ctx.fillText(planet.retroState.days, cx + xx*retroR*Math.cos(angle) - w2, cy - retroR*Math.sin(angle) + 6);
            ctx.strokeRect(cx + xx*r*Math.cos(angle) - w - 2, cy - r*Math.sin(angle) - 11, w + 12, 22);
            if(!showName) ctx.fillText('逆', cx + xx*r*Math.cos(angle) - w, cy - r*Math.sin(angle) + 6);
          }
        }
        ctx.restore()
      }

      // 画行星与地球连线以及文字标识
      let out = !'水星,金星,月亮,太阳'.includes(symbol);
      context.strokeStyle = planet_color[symbol];
      // 现在24节气圈内画刻度
      if((settings.s.show24Jieqi || settings.s.show28Xiu) && !settings.s.guijiMode && settings.s.faceMode){
        let [x0, y0] = [(x / PlanetOrbitScale) * pixels, (y / PlanetOrbitScale) * pixels];;
        let r = Math.sqrt(x0*x0 + y0*y0); //
        if(r < (kdr + kdl) || !settings.s.showLine || !settings.s.showPlanetDistance){
          context.beginPath();
          context.lineWidth = 1.2;
          let cw = settings.s.show24JieqiClockwise;
          if(cw){
            kdr += 30;
            kdl -= 25;
          }
          // 内圈的往里多一点
          if(r < kdr) {
            kdr -= 5;
            kdl += 5;
          }
          // 外圈的往外多一点
          if(r > kdr + kdl) {
            kdr += cw ? 5 : 0;
            kdl += cw ? 5 : 5;
          }
          if(isSun){
            kdl += 5;
          }
          context.moveTo(cx + kdr*Math.cos(angle)*xx, cy - kdr*Math.sin(angle));
          context.lineTo(cx + (kdr+kdl)*Math.cos(angle)*xx, cy - (kdr+kdl)*Math.sin(angle));
          context.stroke();
        }
        context.lineWidth = 1;
      }
      // 画行星与地球连线
      if(settings.s.showLine && !settings.s.guijiMode && settings.s.faceMode){
          const rx = px - r*Math.cos(angle)*xx;
          const ry = py + r*Math.sin(angle);
          context.beginPath();
          context.moveTo(cx + crossPixels*Math.cos(angle)*xx, cy - crossPixels*Math.sin(angle));
          context.lineTo(rx, ry);
          context.stroke();
      }
      // 以太阳为中心，绘制各大行星轨道
      if(settings.s.showSunPlanetTrack && settings.s.showPlanetDistance && !settings.s.guijiMode && settings.s.faceMode && !'月亮,天王星,海王星'.includes(symbol)){
        let sun = info.value.find(x => x.body == '太阳');
        let s = radius_ratio[symbol];
        let [sunx, suny] = [sun[vecKey].x, sun[vecKey].y];
        let [x0, y0] = isSun ? [0, 0] : [planet[vecKey].x*s, planet[vecKey].y*s];
        let [dx, dy] = [sunx - x0, suny - y0];
        let r = Math.sqrt(dx*dx + dy*dy);
        r = r/PlanetOrbitScale * pixels;
        // 根据angle变化太阳中心坐标
        let sunAngle = Math.atan(suny/sunx) + (sunx < 0 ? Math.PI : 0) + southAngle;
        [sunx, suny] = rotateXY(sunx, suny, sunAngle);
        // console.log(symbol,sunx,suny,angle,r);
        context.lineWidth = 0.5;
        context.beginPath()
        context.arc(cx + (sunx / PlanetOrbitScale) * pixels*xx,
                    cy - (suny / PlanetOrbitScale) * pixels,
                    r, 0, 2*Math.PI);
        context.stroke();
      }
      if(settings.s.guijiMode || !settings.s.showPlanetDistance){
        return;
      }
      let retro = planet.retroState?.state == 0;
      context.font = '16px monospace';
      if(retro) context.font = 'bold 16px monospace';
      context.fillStyle = isSun || retro ? 'rgb(255,0,0)' : 'rgb(0,180,128)';
      if (settings.s.faceMode && settings.s.showPlanetData) {
        context.fillText(`${symbol}${retro?'[逆' + planet.retroState.days + '日]':''}`, px - 5, py + radius + 15);
        context.fillText(`${planet.dec.toFixed(1)}°`, px - 5, py + radius + 15 + 16);
        if(symbol == '太阳')return;
        if (out) {
          context.fillText(`${planet.dist2}%`, px - 5, py + radius + 15 + 16 * 2);
          if (planet.elat < 0) {
            context.fillStyle = 'red';
          }
          context.fillText(`${planet.elat.toFixed(2)}°`, px - 5, py + radius + 15 + 16 * 3);
        } else {
          if (planet.elat < 0) {
            context.fillStyle = 'red';
          }
          context.fillText(`${planet.elat.toFixed(2)}°`, px - 5, py + radius + 15 + 16 * 2);
        }
      } else if(settings.s.showPlanetData) {
        context.fillText(`${symbol}[${planet.dec.toFixed(1)}°]${out ? planet.dist2 + '%' : ''}[${planet.elat.toFixed(1)}°]`, px - 5, py + radius + 15);
      }
    }

    const gan0 = CALENDAR.TIANGAN_BASE; // 甲年甲月
    const di0 = CALENDAR.DIZHI_BASE;  // 寅年寅月
    const initDay = CALENDAR.EPOCH_DATE;
    const tiangan = CALENDAR.TIANGAN;
    const dizhi = CALENDAR.DIZHI;
    const dayMicroSeconds = CALENDAR.DAY_MILLISECONDS;
    function getOriginOffset(){
      return parseInt((getPureDate(now.value) - initDay) / dayMicroSeconds);
    }
    function get10yl() {
      let today = getPureDate(now.value);
      let diff = parseInt((today - initDay) / dayMicroSeconds);
      let diffbak = diff;
      while(diff < 0) diff += 3590;
      let g = parseInt(diff / 359);
      let gy = diff % 359;
      let year = (gan0 + g) % 10;
      let month = parseInt(gy / 36);
      let monthd = parseInt(gy % 36) + 1;
      // console.log(g,gy,diff);
      return {
        year, month,
        gan: tiangan[month],
        gy: gy+1, monthd, diff:diffbak,
      }
      // return `
      // 十月历：${tiangan[year]}年 ${tiangan[month]}月 第${monthd}天，总第${gy}天
      // `;
    }
    function get12yl(observer) {
      let today = getPureDate(now.value);
      let diff = parseInt((today - initDay) / dayMicroSeconds);
      let offset = diff;
      let prevDay = diff < 0;
      let z = prevDay ? -1 : 1;
      if(prevDay) offset = -1 - offset;
      // 此时offset为正
      let offset1 = offset + parseInt(offset / 4608)
      let offset2 = parseInt(-offset / 28800) * z;
      let offset3 = parseInt(offset / 4608)//4608天进1天
      // while(diff < 0) diff += 361*12;
      let d = parseInt(offset1 / 361);
      if(prevDay){
        d = (d + 1) % 12
        d = d !== 0 ? 12 - d : d
      }else{
        d = d % 12;
      }

      let dy = prevDay ? 361 - (offset1 % 361) : offset1 % 361 + 1;
      let year = (di0 + d) % 12;

      let body = 'Sun';
      let hdvec = Astronomy.GeoVector(body, now.value, true);
      let ecliptic = Astronomy.Ecliptic(hdvec);
      let elon = ecliptic.elon;
      elon += 45; // 以立春点为0点
      if(elon > 360) elon -= 360;
      let month = parseInt(elon/30) + 2;
      if(month > 11) month -= 12;
      // console.log(elon, month);
      return {
        year,
        dizhi: dizhi[year],
        month,
        dy,
        offset2, offset3:offset3 * z
      }
      // return `
      // 十二月历：${dizhi[year]}年 ${x}月，总第${dy}天
      // `
    }

    let graph;
    let context;

    function calculateCanvasSize() {
      // 获取容器的可用尺寸
      const container = graph.parentElement;
      const maxWidth = container.clientWidth - 40; // 减去padding
      const maxHeight = container.clientHeight - 40; // 减去padding

      // 根据容器大小计算合适的canvas尺寸
      let width = settings.s.showPlanetDistance ?
                  (settings.s.onlyShow7Yao ? DRAWING.CANVAS.WIDTH_7YAO : DRAWING.CANVAS.WIDTH_DISTANCE)
                  : DRAWING.CANVAS.WIDTH_DEFAULT;
      let height = DRAWING.CANVAS.HEIGHT;

      // 如果配置尺寸超过容器，则按比例缩放
      if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = Math.floor(height * scale);
      }

      if (height > maxHeight) {
        const scale = maxHeight / height;
        height = maxHeight;
        width = Math.floor(width * scale);
      }

      return { width, height };
    }

    function resetCanvas() {
      const { width, height } = calculateCanvasSize();
      graph.width = width;
      graph.height = height;

      // 更新配置中的中心点坐标
      DRAWING.CENTER.X = width / 2;
      DRAWING.CENTER.Y = height / 2;

      // 根据画布大小调整基础半径
      const scale = Math.min(width / DRAWING.CANVAS.WIDTH_DEFAULT, height / DRAWING.CANVAS.HEIGHT);
      DRAWING.CENTER.RADIUS = Math.floor(400 * scale); // 基础半径400 * 缩放比例
      DRAWING.SCALE.R24 = Math.floor(380 * scale);     // 24节气圈半径
      DRAWING.SCALE.RX = Math.floor(440 * scale);      // 28宿圈半径
      DRAWING.SCALE.R1_BASE = Math.floor(400 * scale); // 基础半径
    }
    function draw24jq(context, cx, cy, r, clock, southAngle) {
      context.font = '16px monospace';
      context.fillStyle = 'rgb(255,0,0)'
      let txt = '冬至';
      let s = context.measureText(txt).width/2;
      cx -= s
      cy += 6;

      // 二分二至
      let x = clock ? -1 : 1;
      // if(clock && settings.s.southUp){
      //   southAngle = -southAngle;
      // }
      let sita = southAngle;
      // console.log(southAngle);
      let dt1 = r * Math.sin(sita);
      let dt2 = r * Math.cos(sita);
      context.fillText(`春分`, cx + dt2 * x, cy - dt1);
      context.fillText(`夏至`, cx - dt1 * x, cy - dt2);
      context.fillText(`秋分`, cx - dt2 * x, cy + dt1);
      context.fillText(`冬至`, cx + dt1 * x, cy + dt2);
      // 给二分二至画红框框
      context.strokeStyle = 'red';
      let l = 1;
      context.strokeRect(cx + dt2 * x - l, cy - dt1-s, s*2+l*2, 20);
      context.strokeRect(cx - dt1 * x - l, cy - dt2-s, s*2+l*2, 20);
      context.strokeRect(cx - dt2 * x - l, cy + dt1-s, s*2+l*2, 20);
      context.strokeRect(cx + dt1 * x - l, cy + dt2-s, s*2+l*2, 20);

      // 四立
      context.font = '12px monospace'
      // context.fillStyle = 'rgb(80,120,180)';
      context.fillStyle = 'rgb(120,120,140)';
      sita = Math.PI / 4 + southAngle;
      dt1 = r * Math.sin(sita);
      dt2 = r * Math.cos(sita);
      context.fillText(`立夏`, cx + dt2 * x, cy - dt1);
      context.fillText(`立秋`, cx - dt1 * x, cy - dt2);
      context.fillText(`立冬`, cx - dt2 * x, cy + dt1);
      context.fillText(`立春`, cx + dt1 * x, cy + dt2);

      // 节
      context.fillStyle = 'rgb(120,120,140)';
      sita = Math.PI / 12 + southAngle;
      dt1 = r * Math.sin(sita);
      dt2 = r * Math.cos(sita);
      context.fillText(`清明`, cx + dt2 * x, cy - dt1);
      context.fillText(`小暑`, cx - dt1 * x, cy - dt2);
      context.fillText(`寒露`, cx - dt2 * x, cy + dt1);
      context.fillText(`小寒`, cx + dt1 * x, cy + dt2);

      // 气
      context.font = '15px monospace'
      context.fillStyle = 'rgb(180,30,30)';
      sita = Math.PI / 12 * 2 + southAngle;
      dt1 = r * Math.sin(sita);
      dt2 = r * Math.cos(sita);
      context.fillText(`谷雨`, cx + dt2 * x, cy - dt1);
      context.fillText(`大暑`, cx - dt1 * x, cy - dt2);
      context.fillText(`霜降`, cx - dt2 * x, cy + dt1);
      context.fillText(`大寒`, cx + dt1 * x, cy + dt2);

      // 气
      sita = Math.PI / 12 * 4 + southAngle;
      dt1 = r * Math.sin(sita);
      dt2 = r * Math.cos(sita);
      context.fillText(`小满`, cx + dt2 * x, cy - dt1);
      context.fillText(`处暑`, cx - dt1 * x, cy - dt2);
      context.fillText(`小雪`, cx - dt2 * x, cy + dt1);
      context.fillText(`雨水`, cx + dt1 * x, cy + dt2);

      // 节
      context.font = '12px monospace'
      context.fillStyle = 'rgb(120,120,140)';
      sita = Math.PI / 12 * 5 + southAngle;
      dt1 = r * Math.sin(sita);
      dt2 = r * Math.cos(sita);
      context.fillText(`芒种`, cx + dt2 * x, cy - dt1);
      context.fillText(`白露`, cx - dt1 * x, cy - dt2);
      context.fillText(`大雪`, cx - dt2 * x, cy + dt1);
      context.fillText(`惊蛰`, cx + dt1 * x, cy + dt2);
    }

    function drawNowDirection(context, southAngle, cx, cy, r1, r2, txt, color){
      let cos = Math.cos(southAngle);
      let sin = Math.sin(southAngle)
      let w = context.measureText(txt).width;
      let s = settings.s.BeiDouFaceSouth ? 1 : -1;
      let rt = r2;
      r2 -= 16;
      context.beginPath();
      context.moveTo(cx + r1*cos*s, cy - r1*sin);
      context.strokeStyle = color ?? 'red';
      context.lineTo(cx + (r2-w/2)*cos*s, cy - (r2-w/2)*sin);
      context.stroke();
      context.fillText(txt, cx + r2*cos*s - w/2, cy - r2*sin + 6);
    }

    // 绘制主程序
    function paint() {
      syncNowValue();
      if (!settings.s.guijiMode) {
        resetCanvas();
      }
      // Draw a cross at the SSB location.
      const cx = graph.width / 2;  // 动态计算画布中心X坐标
      const cy = graph.height / 2; // 动态计算画布中心Y坐标
      const r = DRAWING.CENTER.RADIUS;
      const xx = settings.s.BeiDouFaceSouth ? 1 : -1;
      let pos = getPosition();
      let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);
      // console.log(cx, cy);

      const nowDate = now.value;
      let sidereal = (Astronomy.SiderealTime(now.value) + pos.longitude/15) % 24;
      // console.log('恒星时：', sidereal/24*360);
      sidereal = sidereal/24 * 2 * Math.PI;
      sidereal = Math.PI/2 - sidereal;
      let southAngle = settings.s.southUp ? sidereal : 0;
      // console.log('sa:', southAngle);

      if(settings.s.faceMode && !settings.s.guijiMode){
        context.font = '15px monospace';
        context.fillStyle = settings.s.useEcliptic ? '#caa45d' : 'red';
        context.fillText(settings.s.useEcliptic ? '黄道坐标':'赤道坐标',
                        cx - context.measureText('黄道坐标').width/2, cy - (r-50));
        context.fillStyle = '#e0e0e0';
        context.fillText(settings.s.BeiDouFaceSouth ? '面南':'面北',
                        cx - context.measureText('面南').width/2, cy - (r-50) + 20);
      }
      const r24 = DRAWING.SCALE.R24;
      if (settings.s.show24Jieqi && settings.s.faceMode && !settings.s.guijiMode) {
        let clockWise = settings.s.show24JieqiClockwise || !settings.s.BeiDouFaceSouth;
        draw24jq(context, cx, cy, r, clockWise, southAngle);
        context.beginPath();
        let r1 = r24;
        let r2 = settings.s.show24JieqiArea ? 0 : r1 - 9;
        let ignoreR = 230;
        if(settings.s.useDecAndElipticInNoDistanceMode) ignoreR -= 20;
        // 绘制24节气圆
        context.arc(cx, cy, r1, 0, 2 * Math.PI);
        context.strokeStyle = 'rgb(50,100,230)';
        context.stroke();
        // 画15度刻度
        context.lineWidth = 1.2;
        let x = clockWise ? -1 : 1;
        let oldr2 = r2;
        for(let i = 0; i < 24; i++){
          let angle = i/24*2*Math.PI - southAngle;
          r2 = i%2 == 0 ? oldr2 : oldr2-10;
          r2t = r2;
          if(i % 6 == 0)r2 = ignoreR;
          if(i == 6)r2 = 0;  // 冬至点延长线到圆心
          context.strokeStyle = i == 6 ? '#404040' : 'rgb(50,100,230)';
          context.beginPath();
          context.moveTo(cx + r2*Math.cos(angle)*x, cy + r2*Math.sin(angle));
          context.lineTo(cx + r1*Math.cos(angle)*x, cy + r1*Math.sin(angle));
          context.stroke();
          if(i % 2 == 0){
            context.font = "11px monospace";
            context.fillStyle = 'gray';
            let j = 12 - i/2 + 3;
            if(j > 11) j -= 12;
            context.fillStyle = j % 3 == 0 ? 'red' : 'gray';
            context.fillText('子丑寅卯辰巳午未申酉戌亥'[j], cx + (ignoreR+9)*Math.cos(angle)*x - context.measureText('子').width/2, cy + (ignoreR+9)*Math.sin(angle)+3);
            context.fillText('子丑寅卯辰巳午未申酉戌亥'[j], cx + (r2t-4)*Math.cos(angle)*x - context.measureText('子').width/2, cy + (r2t-4)*Math.sin(angle)+3);
          }
        }
        // 画5度刻度
        context.lineWidth = 1;
        r2 = settings.s.show24JieqiArea ? 0 : r1 - 5;
        for(let i = 0; i < 360/5; i++){
          let angle = i/360*5*2*Math.PI - southAngle;
          context.beginPath();
          context.moveTo(cx + r2*Math.cos(angle)*x, cy + r2*Math.sin(angle));
          context.lineTo(cx + r1*Math.cos(angle)*x, cy + r1*Math.sin(angle));
          context.stroke();
        }
        // 画1度的刻度
        r2 = settings.s.show24JieqiArea ? 0 : r1 - 3;
        context.lineWidth = 0.5;
        for(let i = 0; i < 360; i++){
          let angle = i/360*2*Math.PI - southAngle;
          context.beginPath();
          context.moveTo(cx + r2*Math.cos(angle)*x, cy + r2*Math.sin(angle));
          context.lineTo(cx + r1*Math.cos(angle)*x, cy + r1*Math.sin(angle));
          context.stroke();
        }

        context.lineWidth = 1;
      }

      // 标注28宿（直接用赤经绘图）
      const rx = DRAWING.SCALE.RX;
      // 先画24节气所在28宿的刻度
      if(!settings.s.guijiMode){
        for(let i = 0; i < 24; i++){
          let a = i*Math.PI/12 + southAngle;
          context.beginPath();
          context.strokeStyle = '#e0e0e0';
          let r1 = rx - 20;
          let r2 = r1 - 6;
          context.moveTo(cx + r2*Math.cos(a)*xx, cy - r2*Math.sin(a));
          context.lineTo(cx + r1*Math.cos(a)*xx, cy - r1*Math.sin(a));
          context.stroke();
        }
      }
      if (settings.s.show28Xiu && settings.s.faceMode && !settings.s.guijiMode) {
        let r1 = rx - 35;
        let r2 = settings.s.show28XiuArea ? 0 : r1 + 10;
        context.font = '15px monospace';
        let width = context.measureText('角').width/2;
        let colors = ['rgb(17,127,120)', 'rgb(180,180,180)', 'rgb(150,180,180)', 'rgb(200,80,80)']
        context.beginPath();
        context.arc(cx, cy, r1, 0, 2 * Math.PI);
        context.strokeStyle = 'rgb(130,100,230)';
        context.stroke();
        // 先获得当前时间28宿钜星赤经
        x28cj.splice(0);
        for (let i = 1; i <= 28; i++) {
          if(settings.s.useEcliptic){
            let elon = Astronomy.EclipticLongitude('Star' + i, nowDate);
            x28cj.push(elon*240); // 360度制:elon/360 * 24 * 3600
          }else{
            let equ = Astronomy.Equator('Star' + i, nowDate, observer, true, true);
            x28cj.push(equ.ra*3600);
          }
        }
        resetX28a();
        let x28s = [];
        let unit = settings.s.use360 ? 360 : 365.25;
        for (let i = 0; i < 28; i++) {
          let j = (i+1) % 28;
          let r = (x28cj[j] - x28cj[i])/240;
          r = r * unit / 360;
          if(r < 0) r += unit;
          let zs = Math.trunc(r);
          let xs = r - zs;
          if(xs < 0.33) r = zs;
          else if(xs > 0.66) r = zs + 1;
          else r = zs + 0.5;
          x28s.push(r);
        }
        // console.log(x28cj, x28a);
        // let sum = 0;
        for (let i = 0; i < x28cj.length; i++) {
          let cj = x28cj[i] / (24 * 3600) * 2 * Math.PI + southAngle;
          dt1 = (rx - 15) * Math.cos(cj) * xx;
          dt2 = (rx - 15) * Math.sin(cj);
          context.fillStyle = colors[parseInt(i / 7)];
          context.font = '15px monospace';
          context.fillText(x28n[i], cx + dt1 - width, cy - dt2 + 5);
          // 宿度总度
          context.font = '10px monospace';
          dt1 = (rx + 10) * Math.cos(cj) * xx;
          dt2 = (rx + 10) * Math.sin(cj);
          // sum += parseFloat(x28s[i]);
          context.fillText(x28s[i], cx + dt1 - context.measureText(x28s[i]).width/2, cy + dt2 + 5);
          // 标注大刻度
          let x = xx;
          context.beginPath();
          context.moveTo(cx + r2*Math.cos(cj)*x, cy - r2*Math.sin(cj));
          context.lineTo(cx + r1*Math.cos(cj)*x, cy - r1*Math.sin(cj));
          context.stroke();
        }
        // console.log(sum)

        r2 = r1 + 3;
        // 标注刻度，360度标准
        let x = xx;
        for(let i = 0; i<28; i++){
          let init = x28cj[i] / (24 * 3600) * 2 * Math.PI + southAngle;
          let next = x28cj[i+1>27?0:i+1] / (24 * 3600) * 2 * Math.PI + southAngle;
          if(next < init && init - next < Math.PI){
            next = x28cj[i+2>27?0:i+2] / (24 * 3600) * 2 * Math.PI + southAngle;
            i += 1;
          }
          if(next < init) next += 2*Math.PI;
          let dx = settings.s.use360 ? 1 : 360/365.25;
          let j = 0 + dx;
          let cj = init + j/180*Math.PI;
          // 标注刻度
          while(cj < next){
            context.beginPath();
            context.moveTo(cx + r2*Math.cos(cj)*x, cy - r2*Math.sin(cj));
            context.lineTo(cx + r1*Math.cos(cj)*x, cy - r1*Math.sin(cj));
            context.stroke();
            j += dx;
            cj = init + j/180*Math.PI;
          }
        }
      }

      // 绘制北斗七星
      if(settings.s.faceMode && !settings.s.guijiMode){
        let r_bd = 60;
        let ratio = 6.6;
        let starR = 3;
        let xys = [];
        // 北斗地平线Y坐标
        let groundY = cy + r_bd*ratio*pos.latitude/90;
        let downColor = '#bbb';
        lat = 0;
        lon = 0;
        for (let i = 1; i <= 8; i++) {
          if(settings.s.useEcliptic){
            let hdvec = Astronomy.GeoVector(i < 8 ? ('BD' + i) : 'Dajiao', nowDate, true);
            let ecliptic = Astronomy.Ecliptic(hdvec);
            lat = ecliptic.elat;
            lon = ecliptic.elon/360*24;
          }else{
            let equ = Astronomy.Equator(i < 8 ? ('BD' + i) : 'Dajiao', nowDate, observer, true, true);
            lat = equ.dec;
            lon = equ.ra;
          }

          // equs.push(equ.ra);
          let jd = -lon/12*Math.PI - southAngle;
          if(settings.s.BeiDouFaceSouth) jd = -jd;
          let wd = 1 - lat/90;
          let x = -r_bd * wd * Math.cos(jd);
          let y = -r_bd * wd * Math.sin(jd);
          if(settings.s.BeiDouFaceSouth)[x, y] = [-x, -y];
          // console.log('BD' + i, x, y);
          let px = cx + x*ratio;
          let py = cy - y*ratio;
          if(i < 8){
            xys.push([px,py]);
          }
          context.beginPath();
          context.arc(px, py, starR, 0, 2 * Math.PI);
          context.fillStyle = 'rgb(200,200,200)';
          if(i == 1 || i == 8)context.fillStyle = 'rgb(224,80,40)';
          if(py > groundY && i < 8)context.fillStyle = downColor;
          context.fill();
        }

        // 北斗七星连线
        for(let i = 0; i < xys.length-1; i++){
          context.beginPath();
          context.strokeStyle = 'gray';
          context.moveTo(...xys[i]);
          context.lineTo(...xys[i+1]);
          context.stroke();
        }

        // 绘制其他恒星
        if(settings.s.showOtherStars){
          r_bd = r_bd;

          // context.beginPath();
          // context.arc(cx,cy,r_bd*ratio,0,2*Math.PI);
          // context.stroke();
          for(let j = 0; j < starList.length; j++){
            xys = [];
            let starX = starList[j];

            // 为特定星宿增加半径偏移，避免与28宿圈叠加
            // 角宿、亢宿、虚宿、危宿、觜宿、参宿需要更大的半径
            let extraRadius = 0;
            if(j >= 1 && j <= 6) { // 角宿到参宿
              extraRadius = 25; // 增加25像素半径，避免超出画布
            }

            // 绘制星点
            for(let i = 0; i < starX.pos.length; i++){
              Astronomy.DefineStar('Other', ...starX.pos[i]);
              if(settings.s.useEcliptic){
                let hdvec = Astronomy.GeoVector('Other', nowDate, true);
                let ecliptic = Astronomy.Ecliptic(hdvec);
                lat = ecliptic.elat;
                lon = ecliptic.elon/360*24;
              }else{
                let equ = Astronomy.Equator('Other', nowDate, observer, true, true);
                lat = equ.dec;
                lon = equ.ra;
              }
              // let equ = Astronomy.Equator('Other', nowDate, observer, true, true);
              let jd = -lon/12*Math.PI - southAngle;
              if(settings.s.BeiDouFaceSouth) jd = -jd;
              let yy = settings.s.faceNorthImage ? 1 : xx;
              let wd = 1 + yy*lat/90 + (settings.s.useEcliptic ? -0.05 : 0);//equ.dec < 0 ? 1.2 + equ.dec/90 : 1 - equ.dec/90;
              let currentRadius = r_bd + extraRadius;
              let x = -currentRadius * wd * Math.cos(jd);
              let y = -currentRadius * wd * Math.sin(jd);
              if(settings.s.BeiDouFaceSouth)[x, y] = [-x, -y];
              // console.log('BD' + i, x, y);
              let px = cx + x*ratio;
              let py = cy - y*ratio;
              xys.push([px,py]);
              context.beginPath();
              context.arc(px, py, j == starList.length - 2 ? 0.8 : starR, 0, 2 * Math.PI);
              context.fillStyle = 'rgb(200,200,200)';
              if(i == 0)context.fillStyle = 'rgb(224,80,40)';
              context.fill();
            }
            // 绘制星座连线
            for(let i = 0; i < starX.line.length; i++){
              context.beginPath();
              context.strokeStyle = 'gray';
              context.moveTo(...xys[starX.line[i][0]]);
              context.lineTo(...xys[starX.line[i][1]]);
              context.stroke();
            }
          }
        }
      }

      
      // 标注此时正南方向
      if(settings.s.showDirection && !settings.s.guijiMode && settings.s.faceMode){
        let r1 = rx + 25 + 12;
        let sa = settings.s.southUp ? Math.PI/2 : Math.PI/2 - sidereal;

        let r = settings.s.useDecAndElipticInNoDistanceMode ? 210 : 230;
        // r += 13;
        drawNowDirection(context, sa, cx, cy, r, r1, '正南')
        drawNowDirection(context, sa + Math.PI/2, cx, cy, r, r1, '正东', 'gray')
        drawNowDirection(context, sa + Math.PI, cx, cy, r, r1, '正北', 'gray')
        drawNowDirection(context, sa - Math.PI/2, cx, cy, r, r1, '正西', 'gray')
      }

      // 画地球圆圈
      context.beginPath();
      context.arc(cx, cy, crossPixels, 0, 2 * Math.PI);
      context.strokeStyle = 'rgb(35,66,121)';
      context.stroke();
      // context.style = 'rgb(200,200,200)';
      context.fillStyle = '#e0e0e0';
      context.fill();

      // 画地球北极点
      if(settings.s.faceMode){
        context.beginPath();
        let northPolarR = (settings.s.useEcliptic ? crossPixels*23.5/90 : 0);
        let x = settings.s.BeiDouFaceSouth ? 1 : -1;
        context.arc(cx - northPolarR*Math.sin(southAngle)*x, cy - northPolarR*Math.cos(southAngle) , 1.6, 0, 2*Math.PI);
        context.fillStyle = '#404040';
        context.fill();
        // 黄道面下画赤道
        if(settings.s.useEcliptic){
          let ctx = context;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(-southAngle);
          ctx.scale(1, 0.7);
          ctx.beginPath();
          ctx.arc(0, 0, crossPixels, 0, Math.PI);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 绘制行星
      // console.time('planet');
      refreshInfo((data) => PlotPlanet(graph, context, data, data.body, 5, cx, cy, r24, rx-r24-20, southAngle, sidereal));
      // console.timeEnd('planet');

      // 日期显示
      if(settings.s.showNowString && !settings.s.guijiMode){
        context.fillStyle = 'gray';
        // 公历日期
        let dateTxt = FormatDate(...getJulianDate(now.value));
        let w = context.measureText(dateTxt).width;
        let y = cy + (rx + 80);
        context.fillText(dateTxt, cx - w/2, y);
        // 农历日期
        let l = Lunar.fromDate(getJulianDate(now.value)[0]);
        let txt = '';
        let sun = info.value.find(x => x.body == '太阳');
        if(settings.s.useEcliptic){
          let jiajiao = Astronomy.PairLongitude('Jupiter','Sun',now.value);
          if(jiajiao > 180)jiajiao = 360 - jiajiao;
          let jj = Astronomy.PairLongitude('Saturn','Sun',now.value);
          if(jj > 180) jj = 360 - jj;
          let jj2 = Astronomy.PairLongitude('Jupiter','Saturn',now.value);
          if(jj2 > 180) jj2 = 360 - jj2;
          txt = `木日${jiajiao.toFixed(2)}°,土日${jj.toFixed(2)}°,木土${jj2.toFixed(2)}°`;
        }else{
          let jupiter = info.value.find(x => x.body == '木星');
          let saturn = info.value.find(x => x.body == '土星');
          let jiajiao = Math.abs(sun.ra - jupiter.ra)/24*360;
          if(jiajiao > 180)jiajiao = 360 - jiajiao;
          let jj = Math.abs(sun.ra - saturn.ra)/24*360;
          if(jj > 180) jj = 360 - jj;
          let jj2 = Math.abs(saturn.ra - jupiter.ra)/24*360;
          if(jj2 > 180) jj2 = 360 - jj2;
          txt = `木日${jiajiao.toFixed(2)}°,土日${jj.toFixed(2)}°,木土${jj2.toFixed(2)}°`;
        }
        w = context.measureText(txt).width;
        context.fillText(txt, cx - w/2, y + 18);
        let solarTime = getTrueSolarTime(observer, now.value);
        let [H,M,S] = solarTime.split(':').map(x => parseInt(x));
        let [h,m,s] = [now.value.getHours(), now.value.getMinutes(), now.value.getSeconds()];
        if(Math.abs(H - h) > 12){
          h = -(h - 24);
        }
        let diff = Math.abs(H*3600+M*60+S - h*3600 - m*60 - s)
        h = parseInt(diff / 3600);
        m = parseInt((diff - h*3600)/60);
        s = diff % 60;
        // 差历元天数
        txt = `距历元${getOriginOffset()}天,真太阳时差[${h}:${m}:${s}]`;
        w = context.measureText(txt).width;
        context.fillText(txt, cx - w/2, y + 18 + 18);
        // 红色真太阳时
        context.fillStyle = 'red';
        context.fillText(solarTime, cx - context.measureText(solarTime).width/2, cy - 36);

        // 农历日期信息
        txt = l.toString().replace(/.*年/,'');
        context.fillText(txt, cx - context.measureText(txt).width/2, cy - 18);
        let elon = sun.elon + 90;
        if(elon > 360) elon -= 360;
        let ra = sun.ra + 6;
        if(ra > 24) ra -= 24;
        txt = settings.s.useEcliptic ? `${getFormatTime(elon/360*24)}`
                : `${getFormatTime(ra)}`;
        context.fillText(txt, cx - context.measureText(txt).width/2, cy + 54); // 下移18像素
        txt = '日年角';
        context.fillText(txt, cx - context.measureText(txt).width/2, cy + 54 + 18);
        ra = 24 - ra;
        elon = 360 - elon;
        txt = settings.s.useEcliptic ? `${getFormatTime(elon/360*24)}`
                : `${getFormatTime(ra)}`;
        context.fillStyle = '#ccc';
        context.fillText(txt, cx - context.measureText(txt).width/2, cy + 54 + 18*2);
        txt = '冬至点脚下时';
        context.fillText(txt, cx - context.measureText(txt).width/2, cy + 54 + 18*3);
        // let diffTxt = `差[${h}:${m}:${s}]`;
        // context.fillText(diffTxt, cx - context.measureText(diffTxt).width/2, cy - 18);
      }

      if(!settings.s.guijiMode){
        // 金星、水星与太阳夹角
        // Mercury,Venus
        let txt0 = '', txt = '', txt2 = '', when = '';
        const venus = info.value.find(x => x.body == '金星');
        const mercury = info.value.find(x => x.body == '水星');
        const moon = info.value.find(x => x.body == '月亮');
        if(settings.s.useEcliptic){
          let jiajiao = Astronomy.PairLongitude('Venus','Sun',now.value);
          let jj = Astronomy.PairLongitude('Mercury','Sun',now.value);
          let jj2 = Astronomy.PairLongitude('Moon','Sun',now.value);
          txt0 = `日月夹角${(jj2).toFixed(2)}°, /12° = ${(jj2/12).toFixed(1)}`;
          txt = `金日夹角${(jiajiao>180?360-jiajiao:jiajiao).toFixed(2)}°, ${jiajiao < 180 ?'昏见':'晨见'}, 现高度角${venus.hor.altitude.toFixed(2)}°`;
          txt2 = `水日夹角${(jj>180?360-jj:jj).toFixed(2)}°, ${jj < 180 ?'昏见':'晨见'}, 现高度角${mercury.hor.altitude.toFixed(2)}°`;
        }else{
          let sun = info.value.find(x => x.body == '太阳');
          let jiajiao = (venus.ra - sun.ra)/24*360;
          if(jiajiao < 0) jiajiao += 360;
          let jj = (mercury.ra - sun.ra)/24*360;
          if(jj < 0) jj += 360;
          let jj2 = (moon.ra - sun.ra)/24*360;
          if(jj2 < 0) jj2 += 360;
          txt0 = `日月夹角${(jj2).toFixed(2)}°, /12° = ${(jj2/12).toFixed(1)}`;
          txt = `金日夹角${(jiajiao>180?360-jiajiao:jiajiao).toFixed(2)}°, ${jiajiao < 180 ?'昏见':'晨见'}, 现高度角${venus.hor.altitude.toFixed(2)}°`;
          txt2 = `水日夹角${(jj>180?360-jj:jj).toFixed(2)}°, ${jj < 180 ?'昏见':'晨见'}, 现高度角${mercury.hor.altitude.toFixed(2)}°`;
        }
        const x = 50;
        let y = cy + (rx + 80) - 18*6;
        context.fillStyle = '#e0e0e0';
        let zd = settings.s.use360 ? '(360度制)' : '(365.25度制)';
        context.fillText(settings.s.useEcliptic?`黄经${zd}:`:`赤经${zd}:`, x, y-18*2);
        context.fillText(txt0, x, y-18);
        context.fillText(txt, x, y);
        context.fillText(txt2, x, y + 18);
      }

      // 晨昏蒙影
      if(settings.s.faceMode && !settings.s.showPlanetDistance && !settings.s.guijiMode){
        const sun = info.value.find(x => x.body == '太阳');
        const sunR = PHYSICS.SUN_RADIUS;
        const sita = sunR / Astronomy.KM_PER_AU / sun.dist / Math.PI * 180;
        // console.log(sita);
        const future = CALCULATION.TIME_SEARCH_FUTURE;
        let up0 = Astronomy.SearchAltitude('Sun',observer,1,now.value, future, -sita);
        let down18 = Astronomy.SearchAltitude('Sun',observer,-1,now.value, future, -18);
        let nn = new Date(now.value);
        if(up0 && down18){
          if(up0.date < down18.date){
            nn = new Date(up0);
            nn.setHours(0); nn.setMinutes(0); nn.setSeconds(0);
          }else{
            nn.setHours(12); nn.setMinutes(0); nn.setSeconds(0);
          }
          let down0 = Astronomy.SearchAltitude('Sun',observer,-1,nn, future, -sita);
          let rise = Astronomy.SearchRiseSet('Sun',observer,1,nn,future);
          let set = Astronomy.SearchRiseSet('Sun',observer,-1,nn,future);
          let up6 = Astronomy.SearchAltitude('Sun',observer,1,nn, future, -6);
          let up12 = Astronomy.SearchAltitude('Sun',observer,1,nn, future, -12);
          let up18 = Astronomy.SearchAltitude('Sun',observer,1,nn, future, -18);
          let down6 = Astronomy.SearchAltitude('Sun',observer,-1,nn, future, -6);
          let down12 = Astronomy.SearchAltitude('Sun',observer,-1,nn, future, -12);
          const x = 50;
          let y = cy + (rx + 80) - 18*2;
          let ctx = context;
          ctx.fillStyle = 'red';
          ctx.fillText('本地时:', x, y - 18);
          ctx.fillStyle = 'gray';
          if(up0.date < down18.date){
            let txt = `位置：日出[${FormatTime(up0.date)}], 日落[${FormatTime(down0.date)}]`;
            ctx.fillStyle = now.value < up0.date ? 'green' : 'gray';;
            ctx.fillText(txt, x, y);
            txt = `实测：日出[${FormatTime(rise.date)}], 日落[${FormatTime(set.date)}]`;
            ctx.fillStyle = now.value < rise.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18);
            txt = `民用：晨蒙影[${FormatTime(up6.date)}], 昏蒙影[${FormatTime(down6.date)}]`;
            ctx.fillStyle = now.value < up6.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*2);
            txt = `航海：晨蒙影[${FormatTime(up12.date)}], 昏蒙影[${FormatTime(down12.date)}]`;
            ctx.fillStyle = now.value < up12.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*3);
            txt = `天文：晨蒙影[${FormatTime(up18.date)}], 昏蒙影[${FormatTime(down18.date)}]`;
            ctx.fillStyle = now.value < up18.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*4);
            // console.log(FormatDate(up0.date),FormatDate(nn),FormatDate(up6.date),FormatDate(up12.date),FormatDate(up18.date));
          }else{
            let txt = `位置：日落[${FormatTime(down0.date)}], 明天日出[${FormatTime(up0.date)}]`;
            ctx.fillStyle = now.value < down0.date ? 'green' : 'gray';;
            ctx.fillText(txt, x, y);
            txt = `实测：日落[${FormatTime(set.date)}], 明天日出[${FormatTime(rise.date)}]`;
            ctx.fillStyle = now.value < set.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18);
            txt = `民用：昏蒙影[${FormatTime(down6.date)}], 明天晨蒙影[${FormatTime(up6.date)}]`;
            ctx.fillStyle = now.value < down6.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*2);
            txt = `航海：昏蒙影[${FormatTime(down12.date)}], 明天晨蒙影[${FormatTime(up12.date)}]`;
            ctx.fillStyle = now.value < down12.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*3);
            txt = `天文：昏蒙影[${FormatTime(down18.date)}], 明天晨蒙影[${FormatTime(up18.date)}]`;
            ctx.fillStyle = now.value < down18.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*4);
          }

          // 真太阳时
          y += 18*6;
          ctx.fillStyle = 'red';
          ctx.fillText('真太阳时:', x, y - 18);
          ctx.fillStyle = 'gray';
          if(up0.date < down18.date){
            let txt = `位置：日出[${getTrueSolarTime(observer,up0.date)}], 日落[${getTrueSolarTime(observer,down0.date)}]`;
            ctx.fillStyle = now.value < up0.date ? 'green' : 'gray';;
            ctx.fillText(txt, x, y);
            txt = `实测：日出[${getTrueSolarTime(observer,rise.date)}], 日落[${getTrueSolarTime(observer,set.date)}]`;
            ctx.fillStyle = now.value < rise.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18);
            txt = `民用：晨蒙影[${getTrueSolarTime(observer,up6.date)}], 昏蒙影[${getTrueSolarTime(observer,down6.date)}]`;
            ctx.fillStyle = now.value < up6.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*2);
            txt = `航海：晨蒙影[${getTrueSolarTime(observer,up12.date)}], 昏蒙影[${getTrueSolarTime(observer,down12.date)}]`;
            ctx.fillStyle = now.value < up12.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*3);
            txt = `天文：晨蒙影[${getTrueSolarTime(observer,up18.date)}], 昏蒙影[${getTrueSolarTime(observer,down18.date)}]`;
            ctx.fillStyle = now.value < up18.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*4);
          }else{
            let txt = `位置：日落[${getTrueSolarTime(observer,down0.date)}], 明天日出[${getTrueSolarTime(observer,up0.date)}]`;
            ctx.fillStyle = now.value < down0.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y);
            txt = `实测：日落[${getTrueSolarTime(observer,set.date)}], 明天日出[${getTrueSolarTime(observer,rise.date)}]`;
            ctx.fillStyle = now.value < set.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18);
            txt = `民用：昏蒙影[${getTrueSolarTime(observer,down6.date)}], 明天晨蒙影[${getTrueSolarTime(observer,up6.date)}]`;
            ctx.fillStyle = now.value < down6.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*2);
            txt = `航海：昏蒙影[${getTrueSolarTime(observer,down12.date)}], 明天晨蒙影[${getTrueSolarTime(observer,up12.date)}]`;
            ctx.fillStyle = now.value < down12.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*3);
            txt = `天文：昏蒙影[${getTrueSolarTime(observer,down18.date)}], 明天晨蒙影[${getTrueSolarTime(observer,up18.date)}]`;
            ctx.fillStyle = now.value < down18.date ? 'green' : 'gray';
            ctx.fillText(txt, x, y + 18*4);
          }
        }
      }

      }

    function getFormatTime(ra){
      let milli = Math.round(ra * 3.6e+6);
      let second = 0 | (milli / 1000);
      milli %= 1000;
      let minute = 0 | (second / 60);
      second %= 60;
      let hour = 0 | (minute / 60);
      minute %= 60;
      hour %= 24;

      function f(x, n) {
        let s = x.toFixed(0);
        while (s.length < n)
            s = '0' + s;
        return s;
      }

      return `${f(hour,2)}:${f(minute,2)}:${f(second,2)}`
    }

    function getTrueSolarTime(observer, date) {
      const hourAngle = Astronomy.HourAngle(Astronomy.Body.Sun, date, observer);
      const solarTimeHours = (hourAngle + 12) % 24;

      return getFormatTime(solarTimeHours);
    }

    const direction = ref([]);

    function refreshInfo(fn) {
      info.value = [];
      let time = now.value;
      let matrix = Astronomy.Rotation_EQD_ECT(time);
      // 冥王星的计算在超出2000年范围后计算变得很慢，故去除
      let planets = [];
      let planetsStr = 'Sun,Moon,Mercury,Venus,Mars,Jupiter,Saturn';
      if(!settings.s.onlyShow7Yao) planetsStr += ',Uranus,Neptune';
      planetsStr.split(',')
        .forEach(body => {
          let ra = getRA(body, time, matrix, body != 'Sun' && body != 'Moon');
          let data = getXDdataByRA(ra);
          planets.push(data);
          // if (fn) {
          //   fn(data);
          // }
        });
      info.value = planets.sort((x,y)=>x.dist<y.dist)
      if(fn){
        planets.forEach(d => fn(d));
      }
    }

    function makeInterval(){
      return setInterval(() => {
      now.value = new Date();
      refreshInfo();
      paint();
      // 同步所有视图
      syncTimeToAllViews();
    }, CALCULATION.UPDATE_INTERVAL);
    }

    let intIdx = makeInterval();

    function killInterval() {
      if (intIdx > 0) {
        clearInterval(intIdx);
        intIdx = 0;
      }
    }

    const timeSpan = ref(CALCULATION.DEFAULT_TIME_SPAN);
    const timeUnit = ref(CALCULATION.DEFAULT_TIME_UNIT);

    window.onkeydown = function (event) {
      let k = event.keyCode;
      if(event.ctrlKey || event.altKey || event.metaKey){
        return;
      }
      killInterval();
      if (k == 74) { // J
        nextday(-1);
        syncTimeToAllViews();
      } else if (k == 75) { // K
        nextday(1);
        syncTimeToAllViews();
      } else if (k == 72) { // H
        now.value = new Date();
        intIdx = makeInterval();
        paint();
        syncTimeToAllViews();
      } else if (k == 73) { // I
        settings.s.faceMode = !settings.s.faceMode;
        resetCanvas();
        paint();
        syncTimeToAllViews();
      } else if (k == 79) { // O
        settings.s.guijiMode = !settings.s.guijiMode;
        resetCanvas();
        paint();
        syncTimeToAllViews();
      }else if(k == 85) { // U 显示与否太阳系轨道
        settings.s.showSunPlanetTrack = !settings.s.showSunPlanetTrack;
        paint();
        syncTimeToAllViews();
      }else if(k == 78) { // N 前跳一小时
        nextHour(-1);
        syncTimeToAllViews();
      }else if(k == 77){ // M 后跳一小时
        nextHour(1);
        syncTimeToAllViews();
      }else if(k == 68){ // D 前跳一分钟
        nextMinute(-1);
        syncTimeToAllViews();
      }else if(k == 70){ // F 后跳一分钟
        nextMinute(1);
        syncTimeToAllViews();
      }else if(k == 89){ // Y 正南方朝上开关
        settings.s.southUp = !settings.s.southUp;
        paint();
        syncTimeToAllViews();
      }else if(k == 76){ // L 切换24节气顺逆时针
        settings.s.show24JieqiClockwise = !settings.s.show24JieqiClockwise;
        paint();
        syncTimeToAllViews();
      }else if(k == 66){ // B 切换行星与地球连线
        settings.s.showLine = !settings.s.showLine;
        paint();
        syncTimeToAllViews();
      }else if(k == 80){ // P 切换是否显示行星名与数据
        settings.s.showPlanetData = !settings.s.showPlanetData;
        paint();
        syncTimeToAllViews();
      }else if(k == 81){ // Q 切换至黄道俯视面
        settings.s.useEcliptic = !settings.s.useEcliptic;
        paint();
        syncTimeToAllViews();
      }else if(k == 65){ // A 回到历元1962/2/5
        now.value = new Date(1962,1,5);
        paint();
        syncTimeToAllViews();
      }else if(k == 90){ // Z 跳到当天的 06:00:00
        now.value.setHours(6);
        now.value.setMinutes(0);
        now.value.setSeconds(getTrueSolarTimeDiff());
        paint();
        syncTimeToAllViews();
      }else if(k == 88){ // X 跳到当天的 00:00:00
        if(!event.shiftKey){
          now.value.setDate(now.value.getDate() + (now.value.getHours() < 12 ? 0 : 1));
        }
        now.value.setHours(event.shiftKey ? 12 : 0);
        now.value.setMinutes(0);
        now.value.setSeconds(getTrueSolarTimeDiff());
        paint();
        syncTimeToAllViews();
      }else if(k == 67){ // C 跳到当天的 18:00:00
        now.value.setHours(18);
        now.value.setMinutes(0);
        now.value.setSeconds(getTrueSolarTimeDiff());
        paint();
        syncTimeToAllViews();
      }else if(k == 87){ // W 切换北斗视图
        settings.s.BeiDouFaceSouth = !settings.s.BeiDouFaceSouth;
        paint();
        syncTimeToAllViews();
      }else if(k == 32){ // 空格键，暂停/播放太阳系动画
        event.preventDefault();
        if (window.solarSystemVisualizer) {
          solarSystemSettings.animationSpeed = solarSystemSettings.animationSpeed > 0 ? 0 : 1;
          window.solarSystemVisualizer.animationSpeed = parseInt(solarSystemSettings.animationSpeed);
        }
      }else if(k == 69){ // E， 后退若干时间段
        let day = parseFloat((timeSpan.value+'').replace(/[,，]/g,''));
        if(timeUnit.value == '月') day *= 30;
        if(timeUnit.value == '年') day *= 365.25;
        now.value.setDate(now.value.getDate() - day);
        paint();
        syncTimeToAllViews();
      }
      else if(k == 82){ // R， 前进若干时间段
        let day = parseFloat((timeSpan.value+'').replace(/[,，]/g,''));
        if(timeUnit.value == '月') day *= 30;
        if(timeUnit.value == '年') day *= 365.25;
        now.value.setDate(now.value.getDate() + day);
        paint();
        syncTimeToAllViews();
      }else if(k == 84){ // T, 切换是否展示行星距离
        settings.s.showPlanetDistance = !settings.s.showPlanetDistance;
        paint();
        syncTimeToAllViews();
      }else if(k == 83){ // S, 切换新模式下（不展示行星距离）是否用赤纬绘制
        settings.s.useDecAndElipticInNoDistanceMode = !settings.s.useDecAndElipticInNoDistanceMode;
        paint();
        syncTimeToAllViews();
      }else if(k == 71){ // G, 切换28宿用360度或者365.25度划分
        settings.s.use360 = !settings.s.use360;
        paint();
        syncTimeToAllViews();
      }
    }

    function getTrueSolarTimeDiff(){
      let pos = getPosition();
      let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);
      let solarTime = getTrueSolarTime(observer, now.value);
      let [H,M,S] = solarTime.split(':').map(x => parseInt(x));
      let [h,m,s] = [now.value.getHours(), now.value.getMinutes(), now.value.getSeconds()];
      if(Math.abs(H - h) > 12){
        h = -(h - 24);
      }
      return Math.abs(H*3600+M*60+S - h*3600 - m*60 - s);
    }

    function init28Xiu(){
      // J2000赤经赤纬数据
      // 大角
      Astronomy.DefineStar('Dajiao', 14+(15+39.31/60)/60, (19+(10+4.2/60)/60), 36.71); // 大角
      // 青龙七宿
      Astronomy.DefineStar('Star1', 13+(25+11.82/60)/60, -(11+(9+42.6/60)/60), 249.74); // 角
      Astronomy.DefineStar('Star2', 14+(12+53.79/60)/60, -(10+(16+23/60)/60), 254.81); // 亢
      Astronomy.DefineStar('Star3', 14+(50+52.33/60)/60, -(16+(2+31.2/60)/60), 75.8); // 氐
      Astronomy.DefineStar('Star4', 15+(58+50.46/60)/60, -(26+(6+47.6/60)/60), 585.56); // 房
      Astronomy.DefineStar('Star5', 16+(21+10.53/60)/60, -(25+(35+31.5/60)/60), 734.59); // 心
      Astronomy.DefineStar('Star6', 16+(51+51.16/60)/60, -(38+(2+45.1/60)/60), 874.41); // 尾
      Astronomy.DefineStar('Star7', 18+(5+47/60)/60, -(30+(25+30.4/60)/60), 96.87); // 箕
      // 玄武七宿
      Astronomy.DefineStar('Star8', 18+(45+38.08/60)/60, -(26+(59+27.6/60)/60), 239.29); // 斗
      Astronomy.DefineStar('Star9', 20+(20+59.35/60)/60, -(14+(46+58/60)/60), 555.63); // 牛
      Astronomy.DefineStar('Star10', 20+(47+39.26/60)/60, -(9+(29+50.9/60)/60), 207.74); // 女
      Astronomy.DefineStar('Star11', 21+(31+32.27/60)/60, -(5+(34+21.9/60)/60), 537.33); // 虚
      Astronomy.DefineStar('Star12', 22+(5+45.87/60)/60, -(0+(19+16.7/60)/60), 523.53); // 危
      Astronomy.DefineStar('Star13', 23+(4+44.68/60)/60, (15+(12+17.3/60)/60), 133.34); // 室
      Astronomy.DefineStar('Star14', 0+(13+13.44/60)/60, (15+(11+0.6/60)/60), 391.54); // 壁
      // 白虎七宿
      Astronomy.DefineStar('Star15', 0+(47+19.64/60)/60, (24+(16+4/60)/60), 189.19); // 奎，取奎宿二
      Astronomy.DefineStar('Star16', 1+(54+38.40/60)/60, (20+(48+30.1/60)/60), 58.66); // 娄
      Astronomy.DefineStar('Star17', 2+(43+27.31/60)/60, (27+(42+30.5/60)/60), 284.85); // 胃
      Astronomy.DefineStar('Star18', 3+(44+53.11/60)/60, (24+(6+50.4/60)/60), 404.66); // 昴
      Astronomy.DefineStar('Star19', 4+(28+37.95/60)/60, (19+(10+49.6/60)/60), 146.65); // 毕
      Astronomy.DefineStar('Star20', 5+(34+50.28/60)/60, (9+(29+19.7/60)/60), 1087.19); // 觜，取觜宿二
      Astronomy.DefineStar('Star21', 5+(40+46.58/60)/60, -(1+(56+38.6/60)/60), 817.43); // 参，取参宿一
      // 朱雀七宿
      Astronomy.DefineStar('Star22', 6+(22+58.99/60)/60, (22+(30+46.2/60)/60), 231.65); // 井
      Astronomy.DefineStar('Star23', 8+(31+37.05/60)/60, (18+(5+33.3/60)/60), 445.57); // 鬼
      Astronomy.DefineStar('Star24', 8+(37+40.61/60)/60, (5+(42+8.4/60)/60), 162.19); // 柳
      Astronomy.DefineStar('Star25', 9+(27+36.52/60)/60, -(8+(39+34.1/60)/60), 180.3); // 星
      Astronomy.DefineStar('Star26', 9+(51+30/60)/60, -(14+(50+51/60)/60), 263.88); // 张
      Astronomy.DefineStar('Star27', 10+(59+46.79/60)/60, -(18+(17+52.2/60)/60), 159.18); // 翼
      Astronomy.DefineStar('Star28', 12+(15+48.92/60)/60, -(17+(32+30.2/60)/60), 153.63); // 轸
    }

    function initBeiDou(){
      Astronomy.DefineStar('BD1', 11+(3+45.54/60)/60, 61+(44+52.9/60)/60, 123.64); // 天枢
      Astronomy.DefineStar('BD2', 11+(1+52.62/60)/60, 56+(22+43.3/60)/60, 79.74); // 天璇
      Astronomy.DefineStar('BD3', 11+(53+51.49/60)/60, 53+(41+25.5/60)/60, 83.18); // 天玑
      Astronomy.DefineStar('BD4', 12+(15+27.04/60)/60, 57+(1+41.5/60)/60, 80.51); // 天权
      Astronomy.DefineStar('BD5', 12+(54+2.98/60)/60, 55+(57+17.7/60)/60, 82.55); // 玉衡
      Astronomy.DefineStar('BD6', 13+(23+56.49/60)/60, 54+(55+12.6/60)/60, 78.16); // 开阳
      Astronomy.DefineStar('BD7', 13+(47+32.48/60)/60, 49+(18+28.4/60)/60, 103.94); // 摇光
    }

    const starList = [
      // 南斗六星
      {
        pos:[
          [19+(2+35.24/60)/60, -(29+(52+49.1/60)/60), 89.09], // 天府
          [19+(6+54.77/60)/60, -(27+(40+20.2/60)/60), 116.99], // 天梁
          [18+(55+14.56/60)/60, -(26+(17+50.8/60)/60), 227.76], // 天机
          [18+(45+38.11/60)/60, -(26+(59+27.5/60)/60), 239.29], // 天同
          [18+(27+56.83/60)/60, -(25+(25+23.3/60)/60), 78.18], // 天相
          [18+(13+44.6/60)/60, -(21+(3+32.7/60)/60), 36239.6], // 七杀
        ],
        line:[
          [0,1],[1,2],[2,3],[3,4],[4,5]
        ]
      },
      // 角宿
      {
        pos:[
          [13+(25+11.88/60)/60, -(11+(9+43/60)/60), 249.74], // 角宿一
          [13+(34+41.58/60)/60, -(0+(35+50.3/60)/60), 73.52], // 角宿二
        ],
        line:[[0,1]]
      },
      // 亢宿
      {
        pos:[
          [14+(12+53.85/60)/60, -(10+(16+23.3/60)/60), 254.81], // 亢宿一
          [14+(16+0.9/60)/60, -(6+(0+12.5/60)/60), 72.53], // 亢宿二
          [14+(28+11.88/60)/60, -(2+(13+45.2/60)/60), 135.05], // 亢宿三
          [14+(19+6.62/60)/60, -(13+(22+15.6/60)/60), 186.48], // 亢宿四
        ],
        line:[[0,1],[1,2],[0,3]],
      },
      // // 氐宿
      // {
      //   pos:[
      //     [14+(50+52.4/60)/60, -(16+(2+31.5/60)/60), 75.8], // 氐宿一
      //     [15+(12+12.98/60)/60, -(19+(47+28.9/60)/60), 379.69], // 氐宿二
      //     [15+(35+31.25/60)/60, -(14+(47+22.4/60)/60), 163.16], // 氐宿三
      //     [15+(17+0.1/60)/60, -(9+(23+0.8/60)/60), 185.11], // 氐宿四
      //   ],
      //   line:[[0,1],[1,2],[2,3]],
      // },
      // // 房宿
      // {
      //   pos:[
      //     [15+(58+50.53/60)/60, -(26+(6+47.8/60)/60), 585.56], // 房宿一
      //     [15+(56+52.47/60)/60, -(29+(12+46.8/60)/60), 472.01], // 房宿二
      //     [16+(0+19.42/60)/60, -(22+(37+17/60)/60), 401.67], // 房宿三
      //     [16+(5+25.64/60)/60, -(19+(48+18.8/60)/60), 530.34], // 房宿四
      //   ],
      //   line:[[0,1],[0,2],[2,3]],
      // },
      // // 心宿
      // {
      //   pos:[
      //     [16+(29+23.69/60)/60, -(26+(25+52.8/60)/60), 553.75], // 心宿二
      //     [16+(21+10.6/60)/60, -(25+(35+31.6/60)/60), 734.59], // 心宿一
      //     [16+(35+52.14/60)/60, -(28+(12+54.7/60)/60), 474.06], // 心宿三
      //   ],
      //   line:[[0,1],[0,2]],
      // },
      // // 尾宿
      // {
      //   pos:[
      //     [16+(50+7.81/60)/60, -(34+(17+40.5/60)/60), 63.71], // 尾宿二
      //     [16+(51+51.23/60)/60, -(38+(2+45/60)/60), 874.41], // 尾宿一
      //     [16+(53+58.65/60)/60, -(42+(21+36.4/60)/60), 4593.75], // 尾宿三
      //     [17+(12+7.93/60)/60, -(43+(14+21.9/60)/60), 73.48], // 尾宿四
      //     [17+(37+17.79/60)/60, -(42+(59+46.7/60)/60), 272.02], // 尾宿五
      //     [17+(47+33.74/60)/60, -(40+(7+33/60)/60), 1929.92], // 尾宿六
      //     [17+(42+27.96/60)/60, -(39+(1+44.3/60)/60), 483.19], // 尾宿七
      //     [17+(33+35.31/60)/60, -(37+(6+10.3/60)/60), 571.2], // 尾宿八
      //     [17+(30+44.64/60)/60, -(37+(17+41.3/60)/60), 576.25], // 尾宿九
      //   ],
      //   line:[[0,1],[0,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
      // },
      // // 箕宿
      // {
      //   pos:[
      //     [18+(5+47.04/60)/60, -(30+(25+30.3/60)/60), 96.87], // 箕宿一
      //     [18+(20+58.37/60)/60, -(29+(49+41.2/60)/60), 347.71], // 箕宿二
      //     [18+(24+8.75/60)/60, -(34+(23+5.3/60)/60), 143.3], // 箕宿三
      //     [18+(17+35.99/60)/60, -(36+(45+44.6/60)/60), 145.93], // 箕宿四
      //   ],
      //   line:[[0,1],[1,2],[2,3]],
      // },
      // 虚宿
      {
        pos:[
          [21+(31+32.25/60)/60, -(5+(34+22.1/60)/60), 537.33], // 虚宿一
          [21+(15+48.2/60)/60, (5+(14+45.4/60)/60), 190.29], // 虚宿二
        ],
        line:[[0,1]]
      },
      // 危宿
      {
        pos:[
          [22+(5+45.84/60)/60, -(0+(19+17.1/60)/60), 523.53], // 危宿一
          [22+(10+11.09/60)/60, (6+(11+49.7/60)/60), 92.29], // 危宿二
          [21+(44+9.9/60)/60, (9+(52+25.9/60)/60), 689.55], // 危宿三
        ],
        line:[[0,1],[1,2]]
      },
      // 觜宿
      {
        pos:[
          [5+(35+9.27/60)/60, (9+(56+0.1/60)/60), 1055.52], // 觜宿一
          [5+(34+50.23/60)/60, (9+(29+19.5/60)/60), 1087.19], // 觜宿二
          [5+(36+55.52/60)/60, (9+(17+16.3/60)/60), 117.49], // 觜宿三
        ],
        // line:[[0,1],[0,2]]
        line:[]
      },
      // 参宿
      {
        pos:[
          [5+(40+46.54/60)/60, -(1+(56+38.9/60)/60), 817.43], // 参宿一
          [5+(36+13.8/60)/60, -(1+(12+12.5/60)/60), 1976.71], // 参宿二
          [5+(32+1.37/60)/60, -(0+(18+2/60)/60), 916.17], // 参宿三
          [5+(55+11.42/60)/60, (7+(24+22.1/60)/60), 497.95], // 参宿四
          [5+(25+8.79/60)/60, (6+(20+55/60)/60), 252.44], // 参宿五
          [5+(47+46.43/60)/60, -(9+(40+18/60)/60), 647.14], // 参宿六
          [5+(14+33.18/60)/60, -(8+(12+13.2/60)/60), 862.85], // 参宿七
        ],
        line:[[0,1],[1,2],[0,3],[2,4],[0,5],[2,6]]
      },
    ];


    function testComputeRetrograde(body){
      const retro1 = {};
      const retro2 = {};
      const rdiff = {};
      let pos = getPosition();
      let observer = new Astronomy.Observer(pos.latitude, pos.longitude, pos.altitude);

      if(!retro1[body]){
        retro1[body] = [];
      }
      if(!retro2[body]){
        retro2[body] = [];
      }
      if(!rdiff[body]){
        rdiff[body] = [];
      }
      let r = retro1[body];
      let r2 = retro2[body];
      let rd = rdiff[body];
      // 往前找
      // 往后找
      for(let i = 0; i < 3650; i++){
        let today = new Date(now.value.getFullYear(), now.value.getMonth(), now.value.getDate() + i);
        let equ = Astronomy.Equator(body, today, observer, true, true);
        let last = r.at(-1);
        if(!last){
          r.push(equ.ra);
          continue;
        };
        let diff = equ.ra - last;
        if(diff > 0 || diff < -20){
          // 顺行
          r.push(equ.ra);
          rd.push(Math.abs(diff));
        }else{
          // 逆行
          r2.push(equ.ra);
          rd.push(diff);
        }
        if(r2.length > 0){
          console.log(body,'逆行日期：', FormatDate(today))
          break;
        }
      }
    }

    onMounted(() => {
      init28Xiu();
      initBeiDou();
      setTimeout(() => {
        graph = document.getElementById('my');
        context = graph.getContext('2d');
        resetCanvas();
        paint();

        // 初始化太阳系可视化
        const solarCanvas = document.getElementById('solar-system-canvas');
        if (solarCanvas) {
          window.solarSystemVisualizer = new SolarSystemVisualizer();
          window.solarSystemVisualizer.setExternalTimeManager({ now: now });
          window.solarSystemVisualizer.currentTime = new Date(now.value); // 同步初始时间
          window.solarSystemVisualizer.init(solarCanvas);
        }

        // 启动太阳系动画循环
        startSolarSystemAnimationLoop();

        // 添加窗口大小变化监听器
        window.addEventListener('resize', () => {
          resetCanvas();
          paint();
        });
      }, 1);

      // console.time('retro');
      // //Mercury,Venus,Mars,Jupiter,Saturn
      // testComputeRetrograde('Jupiter');
      // testComputeRetrograde('Mercury');
      // testComputeRetrograde('Venus');
      // testComputeRetrograde('Mars');
      // testComputeRetrograde('Saturn');
      // console.timeEnd('retro');

      // 这段注释的代码：绘制12年的轨迹图
      // if(!now.value.getDate){
      //   now.value = new Date();
      // }
      // settings.s.guijiMode = true;
      // for(let i = 0; i< 360*12; i++){
      //   let d = now.value.getDate();
      //   now.value.setDate(d + 1);
      //   paint();
      // }

      // graph.addEventListener('touchstart', e=>{
      //   nextday(1);
      // }, false);
      // if (navigator.geolocation) {
      //   //一次性获取位置的请求
      //   navigator.geolocation.getCurrentPosition(pos => {
      //     'latitude,longitude,altitude'.split(',').forEach(key => {
      //       setPosition(key, pos.coords[key] ?? position.value[key]);
      //     });
      //     // position.value = posi
      //   });
      // }
    })

    function saveSettings(){
      // console.log(JSON.stringify(settings))
      localStorage.setItem("settings", JSON.stringify(settings));
    }

    function savePosition(){
      localStorage.setItem('position', JSON.stringify(position));
    }

    const today = reactive({
      s:{
        year: now.value.getFullYear(),
        month:now.value.getMonth() + 1,
        day:  now.value.getDate(),
        hour: now.value.getHours(),
        minute:now.value.getMinutes(),
        seconds:now.value.getSeconds()
      }
    });

    const Y1582_10_15 = CALENDAR.GREGORIAN_START;
    const Y1500_3_1 = CALENDAR.REFORM_START;
    const JulianInit = new Date(1962,1, 5-2437701);
    const year100Days = CALENDAR.CENTURY_DAYS;
    function getJulianDate(dd){
      let date = new Date(dd);
      if(date >= Y1582_10_15)return [date,0,0];
      let d = date.getDate();
      if(date >= Y1500_3_1){
        date.setDate(d - 10);
        return [date,0,0];
      }
      let days = 10;
      let y = 1500;
      let diff = Math.ceil((Y1500_3_1 - date)/dayMicroSeconds);
      while(diff > 0){
        if(y % 400 != 0){
          days -= 1;
        }
        y -= 100;
        diff -= year100Days
      }
      date.setDate(d - days);
      return diff + year100Days == 1 ? [date,2,29] : [date,0,0];
    }

    let nowBak = null;
    function syncNowValue(){
      let [n,month,day] = getJulianDate(now.value);
      today.s.year = n.getFullYear();
      today.s.month = month > 0 ? month : n.getMonth() + 1;
      today.s.day = day > 0 ? day : n.getDate();
      today.s.hour = n.getHours();
      today.s.minute = n.getMinutes();
      today.s.seconds = n.getSeconds();
      nowBak = {
        year: today.s.year, month:today.s.month, day:today.s.day,
        hour:today.s.hour, minute:today.s.minute, seconds:today.s.seconds
      }
    }
    function getDateByInput(a){
      let d = new Date(a.year,a.month-1,a.day,a.hour,a.minute,a.seconds);
      let s = a.year < 0;
      d.setFullYear((s?'-':'')+(a.year+'').replace('-','').padStart(4,'0'));
      return d;
    }
    function nowProcess(cls, value){
      if(isNaN(value) || (cls=='year' && (value == '-' || value == ''))){
        return;
      }
      killInterval();
      let oldDate = getDateByInput(nowBak ?? today.s);
      today.s[cls] = value;
      let newDate = getDateByInput(today.s);
      let updatedDate = new Date(now.value);
      updatedDate.setSeconds(updatedDate.getSeconds() + (newDate-oldDate)/1000);
      now.value = updatedDate; // 创建新的Date对象确保响应式更新
      paint();
    }

    // UI状态管理
    const showCalendarSection = ref(false);
    const showAdvancedSection = ref(false);
    const showShortcutsSection = ref(true);

    // 太阳系设置
    const solarSystemSettings = reactive({
      showOrbits: true,
      showLabels: true,
      showCoords: false,
      animationSpeed: 0
    });

    // 更新太阳系设置
    function updateSolarSystemSettings() {
      if (window.solarSystemVisualizer) {
        window.solarSystemVisualizer.showOrbits = solarSystemSettings.showOrbits;
        window.solarSystemVisualizer.showLabels = solarSystemSettings.showLabels;
        window.solarSystemVisualizer.showCoords = solarSystemSettings.showCoords;
        window.solarSystemVisualizer.animationSpeed = parseInt(solarSystemSettings.animationSpeed);
        window.solarSystemVisualizer.update();
      }
    }

    // 统一的时间同步函数 - 确保两个视图时间完全一致
    function syncTimeToAllViews() {
      if (window.solarSystemVisualizer) {
        // 太阳系视图使用外部时间管理器，不需要设置currentTime
        // 直接更新即可，会自动使用最新的now.value
        window.solarSystemVisualizer.update();
      }
    }

    // 统一的动画处理 - 当太阳系有动画速度时
    function handleSolarSystemAnimation() {
      if (window.solarSystemVisualizer && solarSystemSettings.animationSpeed > 0) {
        // 更新太阳系时间
        now.value.setTime(now.value.getTime() + parseInt(solarSystemSettings.animationSpeed) * 1000);
        refreshInfo();
        paint();
        syncTimeToAllViews();
      }
    }

    // 太阳系动画循环函数
    function startSolarSystemAnimationLoop() {
      let animationId;

      function animate() {
        if (window.solarSystemVisualizer && solarSystemSettings.animationSpeed > 0) {
          handleSolarSystemAnimation();
          animationId = requestAnimationFrame(animate);
        } else {
          // 如果动画速度为0，停止动画循环
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
        }
      }

      // 监听动画速度变化
      watch(solarSystemSettings, (newSettings) => {
        if (newSettings.animationSpeed > 0) {
          // 启动动画
          animate();
        } else {
          // 停止动画
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
        }
      }, { deep: true });

      // 如果初始速度大于0，立即启动动画
      if (solarSystemSettings.animationSpeed > 0) {
        animate();
      }
    }

    // 时间控制函数已经在前面添加了太阳系同步逻辑

    // 修改nowProcess函数
    const originalNowProcess = nowProcess;
    nowProcess = function(cls, value) {
      originalNowProcess(cls, value);
      setTimeout(syncTimeToAllViews, 50); // 延迟同步确保时间已更新
    };

    return {
      now, info, position, nextday, nextHour, nextMinute,
      formatHourDeg,
      direction, paint, resetCanvas, calculateCanvasSize,
      settings, saveSettings, savePosition,
      nowProcess, today,
      timeSpan, timeUnit,
      showCalendarSection, showAdvancedSection, showShortcutsSection,
      solarSystemSettings, updateSolarSystemSettings,
      octoberCalendar: Vue.computed(() => {
      // 明确依赖响应式数据
      const currentTime = now.value.getTime();
      return get10yl();
    }),
      ganzhiCalendar: Vue.computed(() => {
      // 明确依赖响应式数据
      const currentTime = now.value.getTime();
      try {
        const l = Lunar.fromDate(getJulianDate(now.value)[0]);
        return {
          year: l.getYearInGanZhi(),
          month: l.getMonthInGanZhiExact(),
          day: l.getDayInGanZhiExact(),
          time: l.getTimeInGanZhi()
        };
      } catch (e) {
        // 如果计算失败，返回默认值
        return { year: '甲子', month: '甲子', day: '甲子', time: '甲子' };
      }
    }),
    lunarInfo: Vue.computed(() => {
      // 明确依赖响应式数据
      const currentTime = now.value.getTime();
      try {
        const l = Lunar.fromDate(getJulianDate(now.value)[0]);
        return l.toString().replace(/.*年/,'');
      } catch (e) {
        // 如果计算失败，返回默认值
        return '正月初一';
      }
    }),
    doujianInfo: Vue.computed(() => {
      // 明确依赖响应式数据
      const currentTime = now.value.getTime();
      try {
        const observer = new Astronomy.Observer(position.s.latitude, position.s.longitude, position.s.altitude);
        return get12yl(observer);
      } catch (e) {
        // 如果计算失败，返回默认值
        return { year: 0, dizhi: '', month: 0, dy: 0, offset2: 0, offset3: 0 };
      }
    }),
      tiangan: tiangan,
      dizhi: CALENDAR.DIZHI
    }
  }
}

Vue.createApp(app).mount('#app')