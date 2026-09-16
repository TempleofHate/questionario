import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { skullQuestions } from '../src/data/skull.js';
import { containsPoint } from '../src/hotspots.js';
import { STORAGE_KEY, SKULL_STORAGE_KEY } from '../src/engine.js';
const baseURL = process.env.QUIZ_URL || 'http://127.0.0.1:5173';
const inside = q => {
  for (const polygon of q.hotspots) {
    const center = {x:polygon.reduce((s,p)=>s+p[0],0)/polygon.length,y:polygon.reduce((s,p)=>s+p[1],0)/polygon.length};
    if (containsPoint(q.hotspots,center)) return center;
    let best, clearance = -1;
    const distance = (x,y,a,b) => {
      const dx=b[0]-a[0],dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
      return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
    };
    for (let x=Math.min(...polygon.map(p=>p[0]));x<Math.max(...polygon.map(p=>p[0]));x+=0.2)
      for(let y=Math.min(...polygon.map(p=>p[1]));y<Math.max(...polygon.map(p=>p[1]));y+=0.2) {
        if(!containsPoint([polygon],{x,y}))continue;
        const d=Math.min(...polygon.map((a,j)=>distance(x,y,a,polygon[(j+1)%polygon.length])));
        if(d>clearance){clearance=d;best={x,y};}
      }
    if(best)return best;
  }
  throw Error(q.id);
};
await mkdir('.impeccable/review',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
try {
  for (const mobile of [false,true]) {
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install();
    await page.goto(baseURL);
    await page.getByRole('button',{name:'Iniciar quiz',exact:true}).click();
    await page.getByRole('radio').first().check();
    await page.getByRole('button',{name:'Confirmar resposta',exact:true}).click();
    const legacy=await page.evaluate(k=>localStorage.getItem(k),STORAGE_KEY);
    await page.getByRole('button',{name:'Crânio visual · 70 questões',exact:true}).click();
    await page.getByRole('button',{name:'Iniciar quiz visual',exact:true}).click();
    const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SKULL_STORAGE_KEY);
    for (let i=0;i<70;i++) {
      const q=skullQuestions[i];
      await page.locator('.image-plane img').evaluate(img=>img.decode());
      assert.equal(await page.locator('progress').getAttribute('max'),'70');
      const rects=await page.locator('.image-plane').evaluate(el=>{
        const a=el.querySelector('img').getBoundingClientRect(),b=el.querySelector('svg').getBoundingClientRect();
        return {delta:Math.max(...['x','y','width','height'].map(k=>Math.abs(a[k]-b[k]))),overflow:document.documentElement.scrollWidth>innerWidth,full:a.height<=el.closest('.image-scroll').clientHeight+2};
      });
      assert.ok(rects.delta<0.1,`${q.id}: matching image/SVG coordinates`);
      assert.equal(rects.overflow,false);assert.equal(rects.full,true,`${q.id}: full unexpanded photo`);
      if(i===0)await page.screenshot({path:`.impeccable/review/skull-${mobile?'mobile':'desktop'}.png`,fullPage:true});
      const type=i%3===2?'timeout':i%3===1?'wrong':'correct';
      const point=type==='correct'?inside(q):{x:2,y:2};
      if(type==='timeout')await page.clock.fastForward(61000);
      else {
        // Zoom preserves registration and permits precise touches on small structures.
        if(i===21)await page.getByRole('button',{name:'Ampliar imagem',exact:true}).click();
        await page.locator('.image-plane').evaluate((el,p)=>{
          const scroller=el.closest('.image-scroll');
          scroller.scrollLeft=el.offsetWidth*p.x/100-scroller.clientWidth/2;
          scroller.scrollTop=el.offsetHeight*p.y/100-scroller.clientHeight/2;
          scroller.scrollIntoView({block:'center'});
        },point);
        const rect=await page.locator('[data-hotspot]').boundingBox();
        const x=rect.x+rect.width*point.x/100,y=rect.y+rect.height*point.y/100;
        if(mobile)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
      }
      const expected=type==='timeout'?'Tempo esgotado':type==='correct'?'Resposta correta':'Resposta incorreta';
      await page.locator('#feedback-title').waitFor();
      assert.equal(await page.locator('#feedback-title').innerText(),expected,`${q.id}: ${mobile?'touch':'click'}`);
      assert.equal(await page.locator('.feedback .justification p').innerText(),q.explanation);
      assert.equal(await page.locator('.correct-region').count(),q.hotspots.length);
      assert.equal(await page.locator('[data-hotspot]').count(),0);
      const before=JSON.stringify(await saved());
      await page.locator('.image-plane').click({position:{x:10,y:10}});
      assert.equal(JSON.stringify(await saved()),before,'second click blocked');
      if(i<3) {
        await page.screenshot({path:`.impeccable/review/skull-${type}-${mobile?'mobile':'desktop'}.png`,fullPage:true});
        await page.reload();
        assert.equal(await page.locator('#feedback-title').innerText(),expected,'feedback restored');
        assert.equal((await saved()).index,i);
      }
      await page.getByRole('button',{name:i===69?'Ver resultado':'Próxima questão',exact:true}).click();
    }
    assert.equal((await saved()).screen,'results');
    assert.match(await page.locator('.result-summary').innerText(),/24\s*\/ 70/);
    await page.getByRole('button',{name:'Revisar respostas',exact:true}).click();
    assert.equal(await page.locator('.review-item').count(),70);
    assert.equal(await page.locator('.review-item img').count(),70);
    assert.equal(await page.locator('.review-item .justification').count(),70);
    await page.locator('#review-filter').selectOption('timeout');
    assert.equal(await page.locator('.review-item').count(),23);
    await page.locator('#review-filter').selectOption('wrong');
    assert.equal(await page.locator('.review-item').count(),46);
    await page.getByRole('button',{name:'Músculos · 150 questões',exact:true}).click();
    assert.equal(await page.evaluate(k=>localStorage.getItem(k),STORAGE_KEY),legacy,'legacy session unchanged');
    assert.equal(await page.locator('progress').getAttribute('max'),'150');
    await page.getByRole('button',{name:'Crânio visual · 70 questões',exact:true}).click();
    assert.equal((await saved()).answers.length,70);
    await context.close();
    console.log(`70/70 ${mobile?'mobile touch':'desktop click'}: alignment, correct/error/timeout, locking, persistence, results, review OK`);
  }
  assert.deepEqual(errors,[]);
  await writeFile('.impeccable/review/skull-browser-report.json',JSON.stringify({passed:true,questions:70,viewports:[1440,390],correct:24,errors:46,timeouts:23,localImages:11,legacyProgressPreserved:true,consoleErrors:errors},null,2));
} finally {await browser.close();}
