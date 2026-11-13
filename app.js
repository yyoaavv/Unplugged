(function(){
  var KEY="reset-tracker-v1";
  var IK=["log","reasons","picked","focus","slips","urges","urgeLog","recovery","ach","helped","rode"];
  var state=freshState(),ITEMS=[],CI=-1,legacy=false;
  try{var raw=localStorage.getItem(KEY);if(raw){var p=JSON.parse(raw);
    if(p&&Array.isArray(p.items)){var g0=Object.assign({},p);delete g0.items;delete g0.sel;state=Object.assign(state,g0);
      ITEMS=p.items.filter(function(x){return x&&typeof x==="object"&&typeof x.id==="string";});
      var ix=-1;ITEMS.forEach(function(x,j){if(x.id===p.sel)ix=j;});CI=ix>=0?ix:(ITEMS.length?0:-1);
      if(CI>=0)IK.forEach(function(k){if(k in ITEMS[CI])state[k]=ITEMS[CI][k];});}
    else if(p&&p.log){state=Object.assign(state,p);legacy=true;}
  }}catch(e){}
  function pushItem(){if(CI>=0)IK.forEach(function(k){ITEMS[CI][k]=state[k];});}
  function save(){
    if(legacy)return;
    pushItem();
    try{var o={};Object.keys(state).forEach(function(k){if(IK.indexOf(k)<0)o[k]=state[k];});o.items=ITEMS;o.sel=CI>=0?ITEMS[CI].id:"";o.v=4;localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}
  }
  var TRIG=[["stress","Stress"],["boredom","Boredom"],["fatigue","Fatigue"],["lonely","Loneliness"],["screen","Late at night"],["pressure","Peer pressure"],["lowmood","Low mood"]];
  var CTX=[["alone","Home alone"],["bedroom","Bedroom"],["inbed","In bed"],["out","Out with others"],["work","Work or school"]];
  var WHEN=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"],["late","After 11 PM"]];
  function ids(a,list){var ok=list.map(function(x){return x[0];});return Array.isArray(a)?a.filter(function(x,i){return ok.indexOf(x)>=0&&a.indexOf(x)===i;}):[];}
  if(state.v!==3){if(state.accent==="teal")state.accent="sage";state.v=3;save();}
  normalize();
  if(legacy){var it0=legacyItem(state,state.log);ITEMS=[it0];CI=0;legacy=false;save();}
  function $(id){return document.getElementById(id);}
  function pad(n){return n<10?"0"+n:""+n;}
  function key(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function parse(k){var a=k.split("-");return new Date(+a[0],+a[1]-1,+a[2]);}
  var todayKey=key(new Date());var sel=todayKey;
  var view=new Date();view.setDate(1);

  function stats(){
    var keys=Object.keys(state.log).sort(),best=0,run=0,total=0,prev=null;
    keys.forEach(function(k){
      if(state.log[k]==="clean"){
        total++;
        if(prev&&Math.round((parse(k)-parse(prev))/86400000)===1&&state.log[prev]==="clean")run++;else run=1;
        if(run>best)best=run;prev=k;
      }else{run=0;prev=k;}
    });
    var cur=0,d=new Date();
    if(state.log[key(d)]!=="clean"&&state.log[key(d)]!=="slip")d.setDate(d.getDate()-1);
    while(state.log[key(d)]==="clean"){cur++;d.setDate(d.getDate()-1);}
    return{cur:cur,best:best,total:total};
  }

  /* ---------- Analysis, achievements, stats ---------- */
  var announce=false,toastT=null;
  function freshState(){return{log:{},reasons:"",mode:"system",accent:"sage",custom:{accent:"#7DA487"},picked:[],slips:{},urges:{},urgeLog:[],recovery:{},ach:{},helped:0,rode:0,themed:false,v:3};}
  function normalize(){
    var tm=Math.floor(+state.timerMin);state.timerMin=(tm>=1&&tm<=120)?tm:10;
    state.breathVib=!!state.breathVib;state.breathSnd=!!state.breathSnd;state.celebrate=state.celebrate!==false;
    if(!state.remind||typeof state.remind!=="object")state.remind={on:false,t:"20:00"};
    state.remind={on:!!state.remind.on,t:/^([01]\d|2[0-3]):[0-5]\d$/.test(state.remind.t||"")?state.remind.t:"20:00"};
    if(typeof state.remLast!=="string")state.remLast="";
    var L=state.lock;
    if(L&&typeof L==="object"&&typeof L.h==="string"&&L.h&&typeof L.s==="string"&&L.n>=4&&L.n<=8){state.lock={h:L.h,s:L.s,n:L.n|0,a:[0,60,300].indexOf(L.a)>=0?L.a:0,f:Math.max(0,L.f|0),u:+L.u>0?+L.u:0};}else delete state.lock;
    if((!state.themed&&state.accent==="indigo")||state.accent==="calm"||state.accent==="slate")state.accent="sage";
    if(!state.focus||typeof state.focus!=="string"){state.focus=(Array.isArray(state.picked)&&(state.picked.indexOf("respect")>=0||state.picked.indexOf("intimacy")>=0))?"porn":"general";}
    if(["general","porn","nicotine","alcohol","gambling","social","gaming"].indexOf(state.focus)<0)state.focus="general";
    if(["calm","box","478","long","sigh"].indexOf(state.breathMode)<0)delete state.breathMode;
    var hexOk=/^#[0-9a-f]{6}$/i;
    if(!Array.isArray(state.picked))state.picked=[];
    if(!state.urges||typeof state.urges!=="object"||Array.isArray(state.urges))state.urges={};
    Object.keys(state.urges).forEach(function(k){
      var n=Math.floor(+state.urges[k]);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!(n>0))delete state.urges[k];else state.urges[k]=Math.min(n,999);
    });
    if(!Array.isArray(state.urgeLog))state.urgeLog=[];
    state.urgeLog=state.urgeLog.filter(function(e){return e&&typeof e==="object"&&/^\d{4}-\d{2}-\d{2}$/.test(e.d);}).slice(-500).map(function(e){
      var b=Math.floor(+e.b),a=Math.floor(+e.a);
      return{d:e.d,b:b>=1&&b<=10?b:0,a:a>=1&&a<=10?a:0};
    });
    if(!state.recovery||typeof state.recovery!=="object"||Array.isArray(state.recovery))state.recovery={};
    Object.keys(state.recovery).forEach(function(k){
      var r=state.recovery[k];
      if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!r||typeof r!=="object"){delete state.recovery[k];return;}
      r.d=typeof r.d==="string"?r.d.slice(0,200):"";r.p=typeof r.p==="string"?r.p.slice(0,200):"";
      if(!r.d&&!r.p)delete state.recovery[k];
    });
    if(!state.slips||typeof state.slips!=="object"||Array.isArray(state.slips))state.slips={};
    Object.keys(state.slips).forEach(function(k){
      var r=state.slips[k];
      if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!r||typeof r!=="object"){delete state.slips[k];return;}
      r.t=ids(r.t,TRIG);r.c=ids(r.c,CTX);r.w=ids([r.w],WHEN)[0]||"";
      if(!r.t.length&&!r.c.length&&!r.w)delete state.slips[k];
    });
    if(!state.ach||typeof state.ach!=="object")state.ach={};
    Object.keys(state.ach).forEach(function(k){if(["reasons","helped","rode","themed","urge1","urge10","urge50"].indexOf(k)<0)delete state.ach[k];});
    state.custom={accent:state.custom&&hexOk.test(state.custom.accent||"")?state.custom.accent:"#7DA487"};
  }
  function analyze(){
    var keys=Object.keys(state.log).sort(),A={clean:0,slip:0,logged:0,runs:[],byDow:[],months:{},dates:{}},run=0,after=false,prev=null,runStart=null,cleanKeys=[],i;
    for(i=0;i<7;i++)A.byDow.push({c:0,s:0});
    function endRun(){if(run>0)A.runs.push({len:run,after:after,start:runStart});run=0;}
    keys.forEach(function(k){
      var v=state.log[k],d=parse(k),ym=k.slice(0,7),m=A.months[ym]||(A.months[ym]={clean:0,slip:0});
      var consec=prev&&Math.round((d-parse(prev))/86400000)===1;
      if(v==="clean"){
        A.clean++;cleanKeys.push(k);A.byDow[d.getDay()].c++;m.clean++;
        if(consec&&state.log[prev]==="clean")run++;
        else{endRun();run=1;runStart=k;after=!!(consec&&state.log[prev]==="slip");}
      }else{A.slip++;A.byDow[d.getDay()].s++;m.slip++;endRun();}
      prev=k;
    });
    endRun();
    A.logged=A.clean+A.slip;
    var sum=0;A.best=0;
    A.runs.forEach(function(r){sum+=r.len;if(r.len>A.best)A.best=r.len;});
    A.avg=A.runs.length?sum/A.runs.length:0;
    A.cur=stats().cur;
    /* The day each log-based achievement was actually earned */
    function addDays(k,n){var d=parse(k);d.setDate(d.getDate()+n);return key(d);}
    function firstRun(f){for(var j=0;j<A.runs.length;j++)if(f(A.runs[j]))return A.runs[j];return null;}
    MS.forEach(function(m){var r=firstRun(function(x){return x.len>=m[0];});if(r)A.dates["streak"+m[0]]=addDays(r.start,m[0]-1);});
    if(keys.length)A.dates.first=keys[0];
    if(keys.length>=30)A.dates.logged30=keys[29];
    [10,50,100,250].forEach(function(n){if(cleanKeys.length>=n)A.dates["total"+n]=cleanKeys[n-1];});
    var rb=firstRun(function(x){return x.after;});if(rb)A.dates.bounce=rb.start;
    var rc=firstRun(function(x){return x.after&&x.len>=7;});if(rc)A.dates.comeback=addDays(rc.start,6);
    var months=Object.keys(A.months);
    for(i=0;i<months.length;i++){
      var ym=months[i],y=+ym.slice(0,4),mo=+ym.slice(5,7),days=new Date(y,mo,0).getDate(),last=ym+"-"+pad(days);
      if(A.months[ym].clean===days&&last<=todayKey){A.dates.cleanmonth=last;break;}
    }
    return A;
  }

  var MS=[[1,"Day one"],[3,"Getting going"],[7,"One week"],[14,"Two weeks"],[30,"One month"],[60,"Two months"],[90,"Three months"],[180,"Half a year"],[365,"One full year"]];
  var ACH=[],prevU=null;
  MS.forEach(function(m){
    ACH.push({id:"streak"+m[0],group:"s",title:m[1],badge:String(m[0]),
      desc:m[0]===1?"Stay clean for a full day.":"Reach a "+m[0]+"-day streak.",
      prog:function(A){return[A.best,m[0]];}});
  });
  ACH.push({id:"first",group:"m",title:"First check-in",badge:"\u2605",desc:"Log your first day."});
  ACH.push({id:"logged30",group:"m",title:"Showing up",badge:"\u2605",desc:"Log 30 days, clean or not.",prog:function(A){return[A.logged,30];}});
  [10,50,100,250].forEach(function(n){
    ACH.push({id:"total"+n,group:"m",title:n+" clean days",badge:String(n),desc:"Add up "+n+" clean days in total, streak or not.",
      prog:function(A){return[A.clean,n];}});
  });
  ACH.push({id:"bounce",group:"m",title:"Bounced back",badge:"\u2605",desc:"Log a clean day right after a slip."});
  ACH.push({id:"comeback",group:"m",title:"Comeback",badge:"\u2605",desc:"Get a 7-day streak that starts right after a slip."});
  ACH.push({id:"cleanmonth",group:"m",title:"Perfect month",badge:"\u2605",desc:"Finish a whole calendar month with every day clean."});
  /* Event-based ones (not from the log) are stored with the day they happened */
  ACH.push({id:"reasons",group:"m",ev:true,title:"Know your why",badge:"\u2605",desc:"Pick or write your reasons.",test:function(){return (state.reasons||"").trim().length>0||(state.picked||[]).length>0;}});
  ACH.push({id:"helped",group:"m",ev:true,title:"Asked for help",badge:"\u2605",desc:"Open the help panel when an urge hits.",test:function(){return (state.helped||0)>0;}});
  ACH.push({id:"rode",group:"m",ev:true,title:"Rode it out",badge:"\u2605",desc:"Finish the full 10-minute timer.",test:function(){return (state.rode||0)>0;}});
  [[1,"urge1","Urge beaten","Ride out an urge and log it."],[10,"urge10","Urge surfer","Ride out 10 urges."],[50,"urge50","Wave rider","Ride out 50 urges."]].forEach(function(u){
    ACH.push({id:u[1],group:"m",ev:true,title:u[2],badge:"\u2605",desc:u[3],
      test:function(){return totalUrges()>=u[0];},prog:function(){return[totalUrges(),u[0]];}});
  });
  ACH.push({id:"themed",group:"m",ev:true,title:"Made it yours",badge:"\u2605",desc:"Pick a different theme.",test:function(){return !!state.themed;}});

  /* In-app yes/no dialog: ask(message, yesLabel, danger, onYes) */
  var askYesFn=null,askBack=null;
  function ask(msg,yes,danger,fn){
    askYesFn=fn;askBack=document.activeElement;
    $("askMsg").textContent=msg;$("askYes").textContent=yes||"OK";$("askYes").className=danger?"slip":"";
    $("ask").hidden=false;$("askNo").focus();
  }
  function askDone(ok){
    var f=askYesFn;askYesFn=null;$("ask").hidden=true;
    try{if(askBack&&askBack.focus)askBack.focus({preventScroll:true});}catch(e){}
    if(ok&&f)f();
  }
  $("askYes").onclick=function(){askDone(true);};
  $("askNo").onclick=function(){askDone(false);};
  $("ask").addEventListener("click",function(e){if(e.target===$("ask"))askDone(false);});
  document.addEventListener("keydown",function(e){
    if($("ask").hidden)return;
    if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();askDone(false);}
    else if(e.key==="Tab"){e.preventDefault();(document.activeElement===$("askNo")?$("askYes"):$("askNo")).focus();}
  },true);

  function toast(t){var el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove("show");},4500);}

  /* Work out what is unlocked right now (log-based ones come straight from the log,
     so editing or clearing days adds or removes them), and announce new ones. */
  function sync(A){
    var U={},changed=false,fresh=[],i;
    ACH.forEach(function(a){
      var d=null;
      if(a.ev){
        if(a.test()&&!state.ach[a.id]){state.ach[a.id]=todayKey;changed=true;}
        d=state.ach[a.id]||null;   /* once earned, these stay */
      }else d=A.dates[a.id]||null;
      if(d)U[a.id]=d;
    });
    if(changed)save();
    var diff=false;
    if(prevU){
      ACH.forEach(function(a){if(U[a.id]&&!prevU[a.id])fresh.push(a);});
      diff=fresh.length>0||Object.keys(prevU).some(function(k){return !U[k];});
    }
    if(fresh.length&&announce){
      var pick=null;
      for(i=fresh.length-1;i>=0;i--){if(fresh[i].group==="s"){pick=fresh[i];break;}}   /* highest streak milestone */
      if(!pick){pick=fresh[0];fresh.forEach(function(a){if(U[a.id]>=U[pick.id])pick=a;});}
      toast("Award unlocked: "+pick.title+(fresh.length>1?" (+"+(fresh.length-1)+" more)":""));
      if(pick.group==="s")try{celebrateFor(pick.title);}catch(e){}
    }
    prevU=U;
    return{U:U,changed:diff};
  }
  function afterEvent(){var A=analyze(),r=sync(A);if(r.changed)renderAch(A,r.U);}
  function refresh(){var A=analyze(),r=sync(A);renderAch(A,r.U);renderNext(A);renderStats(A);renderTriggers();renderFade();}

  function badgeEl(a,A,date){
    var el=document.createElement("div"),med=document.createElement("div"),tx=document.createElement("div"),
        t=document.createElement("b"),d=document.createElement("small"),st=document.createElement("small");
    el.className="badge"+(date?"":" locked");med.className="medal";med.textContent=a.badge;
    t.textContent=a.title;d.textContent=a.desc;st.className="st";
    if(date)st.textContent="Unlocked "+parse(date).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
    else if(a.prog){var p=a.prog(A);st.textContent=Math.min(p[0],p[1])+" of "+p[1];}
    else st.textContent="Locked";
    tx.appendChild(t);tx.appendChild(d);tx.appendChild(st);el.appendChild(med);el.appendChild(tx);
    return el;
  }
  function renderAch(A,U){
    var n=Object.keys(U).length,box={s:$("achStreak"),m:$("achMore")};box.s.innerHTML="";box.m.innerHTML="";
    ACH.forEach(function(a){box[a.group].appendChild(badgeEl(a,A,U[a.id]));});
    $("achCount").textContent=n;$("achOf").textContent="of "+ACH.length+" unlocked";
    $("achBar").style.width=(n/ACH.length*100)+"%";
  }
  function renderNext(A){
    var cur=A.cur,next=null,prev=0,i;
    for(i=0;i<MS.length;i++){if(MS[i][0]>cur){next=MS[i][0];break;}prev=MS[i][0];}
    if(next){
      $("nextLbl").textContent="Next milestone: "+next+(next===1?" day":" days")+" ("+(next-cur)+" to go)";
      $("nextBar").style.width=((cur-prev)/(next-prev)*100)+"%";
    }else{
      $("nextLbl").textContent="You've reached every streak milestone. Keep going.";
      $("nextBar").style.width="100%";
    }
  }
  function fmtD(d){return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
  function renderTop(A){
    var box=$("topRuns"),runs=A.runs.map(function(r,idx){return{r:r,last:idx===A.runs.length-1};});
    box.innerHTML="";
    runs.sort(function(a,b){return b.r.len-a.r.len||(a.r.start<b.r.start?1:-1);});
    var top=runs.slice(0,5),max=top.length?top[0].r.len:1;
    top.forEach(function(x,i){
      var st=parse(x.r.start),en=parse(x.r.start);en.setDate(en.getDate()+x.r.len-1);
      var row=document.createElement("div");row.className="srow";
      row.innerHTML='<span class="sk"></span><div><div class="sd"><span class="sdt"></span></div><div class="bar"><i></i></div></div><span class="sn"></span>';
      row.querySelector(".sk").textContent="#"+(i+1);
      row.querySelector(".sdt").textContent=fmtD(st)+" to "+fmtD(en);
      row.querySelector("i").style.width=Math.max(4,x.r.len/max*100)+"%";
      row.querySelector(".sn").textContent=x.r.len+(x.r.len===1?" day":" days");
      if(x.last&&A.cur>0&&x.r.len===A.cur){var tg=document.createElement("span");tg.className="stag";tg.textContent="now";row.querySelector(".sd").appendChild(tg);}
      box.appendChild(row);
    });
    $("topNote").textContent=top.length?"Your five longest runs of clean days in a row.":"Your longest streaks will show up here once you log a few clean days.";
  }
  function renderStats(A){
    var i,t=$("tiles");renderTop(A);
    var tiles=[[A.clean,"clean days"],[A.slip,"slipped days"],[A.logged,"days logged"],[A.logged?Math.round(A.clean/A.logged*100)+"%":"-","clean rate"],
      [A.cur,"current streak"],[A.best,"best streak"],[A.runs.length?Math.round(A.avg*10)/10:"-","average streak"],[A.runs.length,"streaks so far"],[totalUrges(),"urges ridden out"]];
    t.innerHTML="";
    tiles.forEach(function(x){var d=document.createElement("div");d.className="tile";d.innerHTML="<b></b><span></span>";d.firstChild.textContent=x[0];d.lastChild.textContent=x[1];t.appendChild(d);});

    var c30=0,s30=0,dt=new Date();
    for(i=0;i<30;i++){var v=state.log[key(dt)];if(v==="clean")c30++;else if(v==="slip")s30++;dt.setDate(dt.getDate()-1);}
    var l30=c30+s30;
    $("l30").textContent=l30?Math.round(c30/l30*100)+"%":"-";
    $("l30t").textContent=l30?c30+" clean and "+s30+" slipped, out of "+l30+" days logged in the last 30.":"No days logged in the last 30 days yet.";
    $("l30bar").style.width=(l30?c30/l30*100:0)+"%";
    var u30=0,du=new Date();
    for(i=0;i<30;i++){u30+=state.urges[key(du)]||0;du.setDate(du.getDate()-1);}
    $("l30u").textContent=u30?"Urges ridden out in the last 30 days: "+u30+".":"No urges logged in the last 30 days yet.";

    var names=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],full=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],max=1,worst=-1,wv=0,wk=$("wk");
    A.byDow.forEach(function(x,j){var tt=x.c+x.s;if(tt>max)max=tt;if(x.s>wv){wv=x.s;worst=j;}});
    wk.innerHTML="";
    A.byDow.forEach(function(x,j){
      var tt=x.c+x.s,w=document.createElement("div");w.className="wd";
      w.innerHTML='<div class="n">'+tt+'</div><div class="stack" style="height:'+Math.round(tt/max*110)+'px"><div class="sc" style="flex:'+x.c+' 0 0"></div><div class="ss" style="flex:'+x.s+' 0 0"></div></div><div class="dl">'+names[j]+'</div>';
      wk.appendChild(w);
    });
    $("wkNote").textContent=A.logged===0?"Log a few days and your weekly pattern will show up here.":(worst>=0?"You slip most often on "+full[worst]+"s ("+wv+" so far). Plan something for that day.":"No slips logged. Nice.");

    var mo=$("months"),now=new Date();mo.innerHTML="";
    for(i=5;i>=0;i--){
      var dd=new Date(now.getFullYear(),now.getMonth()-i,1),ym=dd.getFullYear()+"-"+pad(dd.getMonth()+1),m=A.months[ym]||{clean:0,slip:0},tot=m.clean+m.slip;
      var r=document.createElement("div");r.className="mrow";
      r.innerHTML='<span class="ml"></span><div class="bar"><i></i></div><span class="mt"></span>';
      r.querySelector(".ml").textContent=dd.toLocaleDateString(undefined,{month:"short"});
      r.querySelector("i").style.width=(tot?m.clean/tot*100:0)+"%";
      r.querySelector(".mt").textContent=tot?m.clean+" clean, "+m.slip+" slipped":"no data";
      mo.appendChild(r);
    }

    var hm=$("hm"),ht=$("heat"),s0=new Date(),lastM=-1,w,dow;hm.innerHTML="";ht.innerHTML="";
    s0.setDate(s0.getDate()-s0.getDay()-52*7);
    for(w=0;w<53;w++){
      var first=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate()+w*7),sp=document.createElement("span");
      if(first.getMonth()!==lastM){sp.textContent=first.toLocaleDateString(undefined,{month:"short"});lastM=first.getMonth();}
      if(w<27)sp.className="old";hm.appendChild(sp);
      for(dow=0;dow<7;dow++){
        var cd=new Date(first.getFullYear(),first.getMonth(),first.getDate()+dow),k=key(cd),cell=document.createElement("i");
        if(k>todayKey)cell.className="x";
        else{
          if(state.log[k])cell.className=state.log[k];
          cell.title=cd.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})+(state.log[k]?" - "+(state.log[k]==="clean"?"clean":"slipped"):"");
        }
        if(w<27)cell.className+=" old";
        ht.appendChild(cell);
      }
    }
  }

  /* ---------- Urges ridden out ---------- */
  function nowKey(){return key(new Date());}
  function urgesOn(k){return state.urges[k]||0;}
  function totalUrges(){var n=0;Object.keys(state.urges).forEach(function(k){n+=state.urges[k];});return n;}
  function renderWeek(){
    var row=$("weekRow"),d=new Date(),days=[],c=0,sl=0,nl=0,u=0,i;
    for(i=0;i<7;i++){days.unshift(key(d));d.setDate(d.getDate()-1);}
    row.innerHTML="";
    days.forEach(function(k){
      var v=state.log[k];if(v==="clean")c++;else if(v==="slip")sl++;else nl++;u+=state.urges[k]||0;
      var b=document.createElement("button");b.type="button";
      b.className="w7"+(v?(v==="clean"?" ok":" sl"):"")+(k===todayKey?" now":"")+(k===sel?" sel":"");
      b.innerHTML="<span></span><b></b>";
      b.firstChild.textContent=parse(k).toLocaleDateString(undefined,{weekday:"short"});
      b.lastChild.textContent=parse(k).getDate();
      b.setAttribute("aria-label",parse(k).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})+(v?", "+(v==="clean"?"clean":"slipped"):", not logged"));
      b.onclick=function(){sel=k;render();};
      row.appendChild(b);
    });
    var t=c+" clean"+(sl?", "+sl+" slipped":"")+(nl?", "+nl+" not logged":"")+" this week.";
    if(u)t+=" "+u+(u===1?" urge":" urges")+" ridden out.";
    $("weekNote").textContent=t;
  }
  function renderUrges(){
    var n=urgesOn(nowKey());
    $("urgeMsg").textContent=n?n+(n===1?" urge":" urges")+" ridden out today.":"None logged today yet.";
    $("btnUrgeUndo").style.visibility=n?"visible":"hidden";
  }
  function logUrge(b,a){
    var k=nowKey();
    state.urges[k]=Math.min(urgesOn(k)+1,999);
    state.urgeLog.push({d:k,b:b||0,a:a||0});if(state.urgeLog.length>500)state.urgeLog.shift();
    save();render();
    return urgesOn(k);
  }

  /* ---------- Urge strength, recovery plan, fade stats ---------- */
  var panelBefore=0,recoverKey=null;
  function buildRate(boxId,pick){
    for(var n=1;n<=10;n++){(function(n){
      var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.n=n;b.textContent=n;
      b.onclick=function(){pick(n);};$(boxId).appendChild(b);
    })(n);}
  }
  function markBefore(){document.querySelectorAll("#rateBefore .chip").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.n===panelBefore);});}
  function resetRate(){panelBefore=0;markBefore();$("afterBox").hidden=true;$("rodeRow").hidden=false;}
  function finishRode(a){
    var b=panelBefore;closePanic();
    var n=logUrge(b,a);
    if(!$("toast").classList.contains("show"))toast((b&&a?"From "+b+" to "+a+". ":"")+"Urge ridden out. That's "+n+" today. Well done.");
  }
  buildRate("rateBefore",function(n){panelBefore=panelBefore===n?0:n;markBefore();});
  buildRate("rateAfter",function(n){finishRode(n);});
  $("rateSkip").onclick=function(){finishRode(0);};

  function yKey(){var d=new Date();d.setDate(d.getDate()-1);return key(d);}
  function renderRecover(){
    var ok=state.log[sel]==="slip"&&sel===nowKey(),open=recoverKey===sel&&ok;
    $("recover").hidden=!open;
    updateSheet();
  }
  function openRecover(){
    var r=state.recovery[sel]||{d:"",p:""},b=stats().best;
    $("recDo").value=r.d;$("recPlan").value=r.p;
    $("recMsg").textContent="One slip doesn't erase your progress. "+(b?"Your best streak of "+b+(b===1?" day":" days")+" is still saved, and checking in honestly is what counts.":"Checking in honestly is what counts.");
    recoverKey=sel;renderRecover();
  }
  $("recSkip").onclick=function(){recoverKey=null;renderRecover();};
  $("recSave").onclick=function(){
    if(!recoverKey)return;
    var d=$("recDo").value.trim().slice(0,200),p=$("recPlan").value.trim().slice(0,200);
    if(d||p)state.recovery[recoverKey]={d:d,p:p};else delete state.recovery[recoverKey];
    save();recoverKey=null;renderRecover();renderPlanCard();
    toast(p?"Saved. I'll show your plan tomorrow.":"Saved.");
  };
  function renderPlanCard(){
    var r=state.recovery[yKey()],box=$("planCard");box.innerHTML="";
    if(!r||!r.p||state.log[nowKey()]){box.hidden=true;return;}
    var h=document.createElement("b"),p=document.createElement("p");
    h.textContent="Your plan for today";p.textContent=r.p;box.appendChild(h);box.appendChild(p);
    if(r.d){var sp=document.createElement("span");sp.className="lbl";sp.style.display="block";sp.style.marginTop="8px";sp.textContent="You said you'd do differently: "+r.d;box.appendChild(sp);}
    box.hidden=false;
  }
  function renderFade(){
    var rated=state.urgeLog.filter(function(e){return e.b>0&&e.a>0;}),box=$("fadeBars"),ins=$("fadeInsight"),note=$("fadeNote");
    box.innerHTML="";ins.innerHTML="";
    if(!rated.length){note.textContent="In the help panel, rate how strong an urge is when it hits and again after you ride it out. Here you'll see how much urges fade.";return;}
    var sb=0,sa=0,weaker=0;
    rated.forEach(function(e){sb+=e.b;sa+=e.a;if(e.a<e.b)weaker++;});
    var n=rated.length,ab=Math.round(sb/n*10)/10,aa=Math.round(sa/n*10)/10;
    note.textContent="Based on "+n+" rated urge"+(n>1?"s":"")+(n<3?". Rate a few more to see a pattern.":".");
    if(n>=3){
      var d=document.createElement("div");d.className="insight";
      d.textContent=aa<ab?"On average your urges drop from "+ab+" to "+aa+" out of 10 after you ride them out. "+weaker+" of "+n+" got weaker.":"Your urges haven't dropped yet on average ("+ab+" to "+aa+"). Keep riding them out. They usually fade with time.";
      ins.appendChild(d);
    }
    [["Before",ab],["After",aa]].forEach(function(x){
      var r=document.createElement("div");r.className="trow";
      r.innerHTML='<span class="tl"></span><div class="bar"><i></i></div><span class="tn"></span>';
      r.querySelector(".tl").textContent=x[0];r.querySelector("i").style.width=(x[1]/10*100)+"%";r.querySelector(".tn").textContent=x[1]+" / 10";
      box.appendChild(r);
    });
  }

  /* ---------- Slip survey + trigger insights ---------- */
  var surveyKey=null;
  function buildSv(boxId,list,field){
    list.forEach(function(x){
      var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.id=x[0];b.dataset.f=field;b.textContent=x[1];
      b.onclick=function(){toggleSv(field,x[0]);};
      $(boxId).appendChild(b);
    });
  }
  buildSv("svTrig",TRIG,"t");buildSv("svCtx",CTX,"c");buildSv("svWhen",WHEN,"w");
  function toggleSv(field,id){
    if(state.log[sel]!=="slip")return;
    var r=state.slips[sel]||(state.slips[sel]={t:[],c:[],w:""});
    if(field==="w")r.w=r.w===id?"":id;
    else{var i=r[field].indexOf(id);if(i>=0)r[field].splice(i,1);else r[field].push(id);}
    if(!r.t.length&&!r.c.length&&!r.w)delete state.slips[sel];
    save();renderSurvey();renderTriggers();
  }
  function renderSurvey(){
    var isSlip=state.log[sel]==="slip",open=surveyKey===sel&&isSlip,det=$("btnDetails");
    $("survey").hidden=!open;
    det.disabled=!isSlip;
    updateSheet();
    if(!open)return;
    var r=state.slips[sel]||{t:[],c:[],w:""};
    document.querySelectorAll("#survey .chip").forEach(function(b){
      var f=b.dataset.f,on=f==="w"?r.w===b.dataset.id:r[f].indexOf(b.dataset.id)>=0;
      b.setAttribute("aria-pressed",on);
    });
  }
  /* ---------- Bottom sheet for the slip follow-ups (survey + recovery plan) ---------- */
  var sheetFrom=null;
  function updateSheet(){
    var open=!$("survey").hidden||!$("recover").hidden,was=$("sheet").classList.contains("open");
    if(open===was)return;
    $("sheet").classList.toggle("open",open);
    if(open){sheetFrom=document.activeElement;setTimeout(function(){$("sheetPanel").focus({preventScroll:true});},30);}
    else if(sheetFrom&&sheetFrom.focus){sheetFrom.focus({preventScroll:true});sheetFrom=null;}
  }
  function closeSheet(){surveyKey=null;recoverKey=null;renderSurvey();renderRecover();}
  $("sheet").addEventListener("click",function(e){if(e.target===$("sheet"))closeSheet();});
  $("sheet").addEventListener("keydown",function(e){
    if(e.key!=="Tab")return;
    var f=[].slice.call($("sheetPanel").querySelectorAll("button,textarea,input")).filter(function(x){return x.offsetParent!==null;});
    if(!f.length)return;
    var first=f[0],last=f[f.length-1],cur=document.activeElement;
    if(e.shiftKey&&(cur===first||cur===$("sheetPanel"))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&cur===last){e.preventDefault();first.focus();}
  });

  function renderTriggers(){
    var cats=[
      {f:"t",title:"Triggers",list:TRIG,counts:{},n:0,say:function(l,p){return"Top trigger: "+l+", in "+p+"% of slips where you tagged a trigger.";}},
      {f:"c",title:"Where",list:CTX,counts:{},n:0,say:function(l,p){return"Most common setting: "+l+" ("+p+"% of slips with a setting tagged).";}},
      {f:"w",title:"When",list:WHEN,counts:{},n:0,say:function(l,p){return"Most common time: "+l+" ("+p+"% of slips with a time tagged).";}}
    ],tagged=0,ins=$("trigInsights"),bars=$("trigBars"),note=$("trigNote");
    Object.keys(state.slips).forEach(function(k){
      if(state.log[k]!=="slip")return;
      var r=state.slips[k],any=false;
      cats.forEach(function(c){
        var v=c.f==="w"?(r.w?[r.w]:[]):r[c.f];
        if(v.length){c.n++;any=true;v.forEach(function(id){c.counts[id]=(c.counts[id]||0)+1;});}
      });
      if(any)tagged++;
    });
    ins.innerHTML="";bars.innerHTML="";
    if(!tagged){note.textContent="Next time you log a slip, tap what was going on. Your patterns will show up here. It stays on your device.";return;}
    note.textContent=tagged<3?"Based on "+tagged+" tagged slip"+(tagged>1?"s":"")+" so far. Tag a few more to see real patterns.":"Based on "+tagged+" tagged slips.";
    cats.forEach(function(c){
      var rows=c.list.map(function(x){return{id:x[0],label:x[1],n:c.counts[x[0]]||0};}).filter(function(x){return x.n>0;});
      if(!rows.length)return;
      rows.sort(function(a,b){return b.n-a.n;});
      if(c.n>=3){var d=document.createElement("div");d.className="insight";d.textContent=c.say(rows[0].label,Math.round(rows[0].n/c.n*100));ins.appendChild(d);}
      var h=document.createElement("p");h.className="tg";h.textContent=c.title;bars.appendChild(h);
      rows.forEach(function(x){
        var r=document.createElement("div");r.className="trow";
        r.innerHTML='<span class="tl"></span><div class="bar"><i></i></div><span class="tn"></span>';
        r.querySelector(".tl").textContent=x.label;
        r.querySelector("i").style.width=Math.round(x.n/c.n*100)+"%";
        r.querySelector(".tn").textContent=x.n+" ("+Math.round(x.n/c.n*100)+"%)";
        bars.appendChild(r);
      });
    });
  }

  /* ---------- Built-in reasons ---------- */
  var COMMON=[
    {id:"faith",name:"Faith",msg:"I want to live in line with my faith and values. I can choose that right now."},
    {id:"relationships",name:"Healthy relationships",msg:"I want real, healthy, honest relationships. This urge is not what I want for the people I love."},
    {id:"selfrespect",name:"Self-respect",msg:"Every time I wait it out, I trust and respect myself more."},
    {id:"health",name:"My health",msg:"My body and energy matter. Better sleep and more energy are waiting on the other side of this."},
    {id:"clarity",name:"Clear mind",msg:"I want less guilt and a clearer head. The urge passes, the clarity stays."},
    {id:"goals",name:"Goals and focus",msg:"I have goals worth my time and attention. Don't trade them for ten minutes."},
    {id:"family",name:"Family",msg:"The people who love me deserve the best version of me."},
    {id:"confidence",name:"Confidence",msg:"I build real confidence by keeping promises to myself."},
    {id:"freedom",name:"Freedom",msg:"I want to make my own choices instead of being run by an urge."},
    {id:"sleep",name:"Better sleep",msg:"Late nights cost me tomorrow. Choosing sleep now means a better morning."},
    {id:"time",name:"My time",msg:"That time is better spent on things I'll be proud of. Ten minutes from now I'll be glad I waited."},
    {id:"presence",name:"Being present",msg:"I want to be fully here for my life, not escaping from it."},
    {id:"integrity",name:"Integrity",msg:"I want my private choices to match the person I say I am."},
    {id:"mood",name:"Mood and motivation",msg:"I feel lighter and more driven when I stay clear. Don't trade tomorrow's mood for a short rush."},
    {id:"discipline",name:"Discipline",msg:"Self-control is a muscle. Every urge I ride out makes the next one weaker."},
    {id:"future",name:"My future",msg:"The person I'm becoming will thank me for what I do in the next ten minutes."},
    {id:"purpose",name:"Purpose",msg:"I want a life with direction. This urge has none."},
    {id:"strength",name:"Strength and fitness",msg:"I'm building my body and my habits. This urge is just noise next to that."}
  ];
  var TIPS_BASE=["Stand up and leave the room you're in.","Go outside or take a walk around the block.","Do 20 pushups or squats.","Take a shower or wash your face.","Message or call a friend. Say hi, you don't have to explain.","Put your phone in another room."];
  var FOCUS=[
    {id:"general",name:"Anything",tips:TIPS_BASE,note:"Changing a habit takes practice. Focus on one day at a time, and use the help button whenever an urge hits.",extra:[]},
    {id:"porn",name:"Porn",tips:TIPS_BASE.concat(["Leave your bedroom and sit somewhere other people are."]),note:"Blocking triggers and keeping devices out of the bedroom at night makes the first few weeks much easier.",extra:[
      {id:"respect",name:"Respect for others",msg:"I want to see people as people, not as images. Respect starts with what I choose to feed my mind."},
      {id:"intimacy",name:"Real intimacy",msg:"I want real closeness with someone, not a substitute that leaves me emptier."}]},
    {id:"nicotine",name:"Smoking / vaping",tips:["Drink a glass of cold water slowly. A craving passes in a few minutes.","Brush your teeth or chew gum.","Step outside, but away from where you usually smoke or vape.","Do 20 pushups or squats to burn off the restless energy.","Message or call a friend. You don't have to explain.","Put your pack or vape out of reach, or throw it away."],note:"Nicotine cravings peak within the first few days and each wave usually lasts only 3 to 5 minutes.",extra:[
      {id:"n_lungs",name:"My lungs",msg:"Every breath gets easier. I'm giving my body time to heal."},
      {id:"n_money",name:"My money",msg:"That money adds up fast. I'd rather spend it on something I actually enjoy."},
      {id:"n_craving",name:"Cravings pass",msg:"A craving lasts a few minutes. I've outlasted harder ones."},
      {id:"n_people",name:"The people around me",msg:"I want to be around the people I love without the smell, the cough and the guilt."}]},
    {id:"alcohol",name:"Alcohol",tips:["Pour a drink you like without alcohol: sparkling water, tea or juice.","Eat something and drink water. Hunger and thirst can feel like a craving.","Leave the place where you'd usually drink.","Go for a walk or a quick workout.","Call or message someone who supports you.","Keep alcohol out of the house tonight, or pour it out."],
      note:"If you drink heavily every day, talk to a doctor before stopping suddenly. Quitting cold turkey can be dangerous.",extra:[
      {id:"a_morning",name:"Better mornings",msg:"I want to wake up clear-headed and proud of last night."},
      {id:"a_control",name:"Staying in control",msg:"I decide what I do. A drink doesn't get to decide for me."},
      {id:"a_body",name:"My body is healing",msg:"Every sober day gives my body, my sleep and my skin a chance to recover."},
      {id:"a_people",name:"Being there for people",msg:"I want to be present and reliable for the people who count on me."}]},
    {id:"gambling",name:"Gambling",tips:["Close the betting app or site and put your phone in another room.","Move money out of reach: transfer it to savings or hand your card to someone you trust.","Go outside or take a walk around the block.","Call or message someone who knows. You don't have to explain.","Write down what your last bet cost you, then read it out loud.","Do something with your hands: a shower, 20 pushups or the dishes."],
      note:"Many betting sites and apps offer self-exclusion that blocks you for good. It's worth setting up while you're feeling calm.",extra:[
      {id:"g_money",name:"My money",msg:"Money lost never comes back. Every dollar I keep is a dollar I can use on something real."},
      {id:"g_chase",name:"No chasing",msg:"The next bet won't fix the last one. The odds don't care how I feel."},
      {id:"g_trust",name:"Trust",msg:"I'm rebuilding trust with the people I care about, one day at a time."},
      {id:"g_stress",name:"Less stress",msg:"I want a life without the constant stress of owing, hiding and hoping."}]},
    {id:"social",name:"Social media",tips:["Put your phone in another room, or hand it to someone.","Log out of the app, or turn on a screen time limit.","Stand up, stretch and get some fresh air.","Pick up a book, a pen or an instrument for ten minutes.","Message or call someone instead of scrolling.","Take a shower or wash your face."],note:"Turning off notifications or moving the apps off your home screen stops your thumb from opening them on autopilot.",extra:[
      {id:"s_hours",name:"Getting my hours back",msg:"Those hours add up to days. I want them back for things I care about."},
      {id:"s_focus",name:"My attention",msg:"I want to be able to focus deeply again."},
      {id:"s_compare",name:"Less comparison",msg:"Scrolling makes me compare and feel worse. I'd rather feel okay about my own life."},
      {id:"s_real",name:"Real life",msg:"The best moments are in front of me, not on a screen."}]},
    {id:"gaming",name:"Gaming",tips:["Turn off the console or PC and walk away from the screen.","Go outside or take a walk around the block.","Do 20 pushups or squats.","Message or call a friend. In person is even better.","Start one small real-world task: tidy a shelf or make a snack.","Put your controller or phone in another room."],note:"Unplugging the console or uninstalling the game adds just enough friction to stop you from starting a match without thinking.",extra:[
      {id:"gm_goals",name:"Real-life goals",msg:"I have things I want to build outside the game. Today counts toward them."},
      {id:"gm_people",name:"Time with people",msg:"I'd rather be with people I care about than one more match."},
      {id:"gm_sleep",name:"Sleep and energy",msg:"One more round costs me tomorrow. I want to feel rested and sharp."},
      {id:"gm_control",name:"My choice",msg:"I play when I choose to, not because I can't stop."}]}
  ];
  var ALLP=COMMON.concat.apply(COMMON,FOCUS.map(function(f){return f.extra;}));
  function focusObj(){return FOCUS.filter(function(f){return f.id===state.focus;})[0]||FOCUS[0];}
  var PRESETS=[];
  function setPresets(){PRESETS=focusObj().extra.concat(COMMON);}
  setPresets();
  function pickedReasons(){return PRESETS.filter(function(p){return (state.picked||[]).indexOf(p.id)>=0;});}
  function mkReason(title,text,cls){
    var d=document.createElement("div"),b=document.createElement("b"),sp=document.createElement("span");
    d.className="rsn"+(cls?" "+cls:"");b.textContent=title;sp.textContent=text;d.appendChild(b);d.appendChild(sp);return d;
  }
  function renderChips(){
    var picked=pickedReasons(),list=$("pickedList");
    document.querySelectorAll("#reasonChips button").forEach(function(b){b.setAttribute("aria-pressed",(state.picked||[]).indexOf(b.dataset.id)>=0);});
    list.innerHTML="";
    picked.forEach(function(p){list.appendChild(mkReason(p.name,p.msg));});
  }
  function fillReasons(){
    var box=$("myReasons"),rm=$("remind"),list=pickedReasons(),txt=(state.reasons||"").trim(),opts=[];
    box.innerHTML="";box.classList.remove("empty");rm.innerHTML="";rm.hidden=true;
    list.forEach(function(p){box.appendChild(mkReason(p.name,p.msg));opts.push({h:p.name,t:p.msg});});
    if(txt){box.appendChild(mkReason("In my own words",txt,"own"));opts.push({h:"In my own words",t:txt.length>220?txt.slice(0,220)+"...":txt});}
    if(!opts.length){box.classList.add("empty");box.textContent="You haven't picked or written any reasons yet. Add them on the Tracker tab while you're feeling calm.";return;}
    var o=opts[Math.floor(Math.random()*opts.length)],h=document.createElement("b"),p=document.createElement("p");
    h.textContent="Remember: "+o.h;p.textContent=o.t;rm.appendChild(h);rm.appendChild(p);rm.hidden=false;
  }
  function buildChips(){
    var box=$("reasonChips");box.innerHTML="";
    PRESETS.forEach(function(p){
      var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.id=p.id;b.textContent=p.name;
      b.onclick=function(){
        var i=state.picked.indexOf(p.id);
        if(i>=0)state.picked.splice(i,1);else state.picked.push(p.id);
        save();renderChips();afterEvent();
      };
      box.appendChild(b);
    });
  }
  function buildFocus(){
    var box=$("focusChips");box.innerHTML="";
    FOCUS.forEach(function(f){
      var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.id=f.id;b.textContent=f.name;
      b.setAttribute("aria-pressed",f.id===state.focus);
      b.onclick=function(){state.focus=f.id;save();setPresets();buildFocus();buildChips();renderChips();};
      box.appendChild(b);
    });
    var n=$("focusNote"),fo=focusObj();n.textContent=fo.note||"";n.hidden=!fo.note;
  }
  function fillTips(){
    var ul=$("actsList");ul.innerHTML="";
    focusObj().tips.forEach(function(t){var li=document.createElement("li");li.textContent=t;ul.appendChild(li);});
  }
  buildFocus();buildChips();

  function render(){
    try{remBanner();}catch(e){}
    var pr=false;
    Object.keys(state.slips).forEach(function(k){if(state.log[k]!=="slip"){delete state.slips[k];pr=true;}});
    Object.keys(state.recovery).forEach(function(k){if(state.log[k]!=="slip"){delete state.recovery[k];pr=true;}});
    if(pr)save();
    var s=stats();
    $("cur").textContent=s.cur;$("best").textContent=s.best;$("total").textContent=s.total;
    var st=state.log[sel];
    $("logTitle").textContent=sel===todayKey?"Today":"Editing a past day";
    $("btnToday").disabled=sel===todayKey;$("btnClear").disabled=!state.log[sel];
    $("todayLabel").textContent=parse(sel).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})+(st?" - logged as "+(st==="clean"?"clean":"slipped"):" - not logged yet");
    $("monthLabel").textContent=view.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    var cal=$("cal");cal.innerHTML="";
    var first=view.getDay(),days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    for(var i=0;i<first;i++)cal.appendChild(document.createElement("div"));
    for(var n=1;n<=days;n++){
      var k=view.getFullYear()+"-"+pad(view.getMonth()+1)+"-"+pad(n),c=document.createElement("div");
      c=document.createElement("button");c.type="button";
      c.className="d"+(state.log[k]?" "+state.log[k]:"")+(k===todayKey?" now":"")+(k===sel?" sel":"");
      c.textContent=n;c.disabled=k>todayKey;
      c.setAttribute("aria-label",parse(k).toLocaleDateString(undefined,{month:"long",day:"numeric"})+(state.log[k]?", "+state.log[k]:""));
      (function(kk){c.onclick=function(){sel=kk;render();};})(k);
      cal.appendChild(c);
    }
    $("reasons").value=state.reasons||"";renderChips();renderSurvey();renderUrges();renderWeek();renderRecover();renderPlanCard();refresh();renderAll();
  }

  var dows=$("dows");["S","M","T","W","T","F","S"].forEach(function(l){var d=document.createElement("div");d.className="dow";d.textContent=l;dows.appendChild(d);});

  $("btnClean").onclick=function(){state.log[sel]="clean";save();render();var c=stats().cur;toast(sel!==todayKey?"Day updated.":(c>1?"Day "+c+". Keep going.":"Day 1 is done. That's how every streak starts."));};
  $("btnSlip").onclick=function(){state.log[sel]="slip";save();surveyKey=sel;render();toast(sel!==todayKey?"Day updated.":"It happens. Your best streak is still saved.");};
  $("btnDetails").onclick=function(){surveyKey=sel;renderSurvey();};
  $("svDone").onclick=function(){
    surveyKey=null;
    if(state.log[sel]==="slip"&&sel===nowKey()){openRecover();renderSurvey();}
    else{renderSurvey();toast(state.slips[sel]?"Saved. Patterns show up in the Stats tab.":"No problem. You can add details any time.");}
  };
  $("btnUrge").onclick=function(){var n=logUrge();if(!$("toast").classList.contains("show"))toast("Logged. That's "+n+" today. You felt it and didn't act on it.");};
  $("btnUrgeUndo").onclick=function(){
    var k=nowKey(),n=urgesOn(k),i;
    if(n<=1)delete state.urges[k];else state.urges[k]=n-1;
    for(i=state.urgeLog.length-1;i>=0;i--)if(state.urgeLog[i].d===k){state.urgeLog.splice(i,1);break;}
    save();render();
  };
  $("btnRode").onclick=function(){
    $("rodeRow").hidden=true;$("afterBox").hidden=false;
    var f=$("rateAfter").firstChild;if(f)f.focus();
  };
  $("btnClear").onclick=function(){delete state.log[sel];save();render();};
  var rt=new Date();rt.setDate(rt.getDate()-6);
  $("rFrom").max=$("rTo").max=todayKey;$("rTo").value=todayKey;$("rFrom").value=key(rt);
  function applyRange(val){
    var f=$("rFrom").value,t=$("rTo").value;
    if(!f||!t){toast("Pick both a start and an end date.");return;}
    if(f>t){toast("The start date has to come before the end date.");return;}
    if(t>todayKey){toast("You can't log days in the future.");return;}
    var keys=[],d=parse(f),end=parse(t);
    while(d<=end&&keys.length<=1100){keys.push(key(d));d.setDate(d.getDate()+1);}
    if(keys.length>1100){toast("That range is too long. Try 3 years or less.");return;}
    var changes=keys.filter(function(k){return state.log[k]&&state.log[k]!==val;}).length;
    function go(){
      keys.forEach(function(k){if(val===null)delete state.log[k];else state.log[k]=val;});
      save();render();
      toast((val===null?"Cleared ":"Marked ")+keys.length+" day"+(keys.length>1?"s":"")+(val===null?"":" as "+(val==="clean"?"clean":"slipped"))+".");
    }
    if(val!==null&&changes>0)ask("This will change "+changes+" day"+(changes>1?"s":"")+" you already logged. Continue?","Change them",false,go);
    else go();
  }
  $("rClean").onclick=function(){applyRange("clean");};
  $("rSlip").onclick=function(){applyRange("slip");};
  $("rClear").onclick=function(){applyRange(null);};
  $("btnToday").onclick=function(){sel=todayKey;view=new Date();view.setDate(1);render();};
  $("prev").onclick=function(){view.setMonth(view.getMonth()-1);render();};
  $("next").onclick=function(){view.setMonth(view.getMonth()+1);render();};
  $("reasons").oninput=function(e){state.reasons=e.target.value;save();afterEvent();};

  $("export").onclick=function(){
    pushItem();var o=JSON.parse(JSON.stringify(state));IK.forEach(function(k){delete o[k];});delete o.lock;
    o.items=JSON.parse(JSON.stringify(ITEMS));o.sel=CI>=0?ITEMS[CI].id:"";o.v=4;
    var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:"application/json"}));a.download="unplugged-backup.json";a.click();
  };
  $("import").onclick=function(){$("file").click();};
  $("file").onchange=function(e){
    var f=e.target.files[0];if(!f)return;var r=new FileReader();
    r.onload=function(){try{
      var p=JSON.parse(r.result),g=Object.assign({},p);
      if(!p||typeof p!=="object")throw new Error("bad");
      delete g.lock;delete g.items;delete g.sel;IK.forEach(function(k){delete g[k];});
      if(Array.isArray(p.items)){adopt(g,p.items);toast("Backup imported.");}
      else if(p.log){adopt(g,[legacyItem(p,p.log)]);toast("Backup imported.");}
      else toast("That file couldn't be read.");
    }catch(x){toast("That file couldn't be read.");}};
    r.readAsText(f);e.target.value="";
  };
  $("reset").onclick=function(){ask("Erase all your data? This can't be undone.","Erase everything",true,function(){ITEMS=[];CI=-1;state=freshState();detail=false;tab="progress";save();render();showView();applyTheme();});};
  /* Themes: one main color each. Everything else is black or white depending on the mode. */
  var THEMES={
    sage:{name:"Sage",c:"#7DA487"},
    sky:{name:"Sky",c:"#7DB3DE"},
    lavender:{name:"Lavender",c:"#A99BE0"},
    blush:{name:"Blush",c:"#E597A8"},
    peach:{name:"Peach",c:"#F2A07A"},
    butter:{name:"Butter",c:"#E2BE5C"},
    mint:{name:"Mint",c:"#6CC2A8"},
    oat:{name:"Oat",c:"#C4AD8A"},
    mono:{name:"Monochrome",c:"#121413",cd:"#f3f4f2"}
  };
  var ORDER=["sage","sky","lavender","blush","peach","butter","mint","oat","mono","custom"];
  var BASE={
    light:{bg:"#f2f6f1",card:"#ffffff",ink:"#17201a",mute:"#65706a",line:"#dde6da",onslip:"#ffffff"},
    dark:{bg:"#0c0d0c",card:"#171918",ink:"#f3f4f2",mute:"#9ca09d",line:"#2b2d2c",onslip:"#0c0d0c"}
  };

  function hex2hsl(hx){
    var n=parseInt(hx.slice(1),16),r=((n>>16)&255)/255,g=((n>>8)&255)/255,b=(n&255)/255,
        mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0,s=0,l=(mx+mn)/2;
    if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}
    return[h,s*100,l*100];
  }
  function hsl2hex(h,s,l){
    s/=100;l/=100;var a=s*Math.min(l,1-l);
    function f(n){var k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,"0");}
    return"#"+f(0)+f(8)+f(4);
  }
  function lum(hx){
    var n=parseInt(hx.slice(1),16),w=[.2126,.7152,.0722],sum=0;
    [(n>>16)&255,(n>>8)&255,n&255].forEach(function(v,i){v/=255;sum+=w[i]*(v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));});
    return sum;
  }
  function ratio(a,b){var x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function onFor(a){return ratio(a,"#ffffff")>=ratio(a,"#111111")?"#ffffff":"#111111";}
  /* nudge a color lighter (dir 1) or darker (dir -1) until it stands out enough against a background */
  function fit(hx,against,min,dir){
    var x=hex2hsl(hx),l=x[2],out=hx;
    while(ratio(out,against)<min&&(dir>0?l<96:l>4)){l+=dir*2;out=hsl2hex(x[0],x[1],l);}
    return out;
  }
  /* mid-tone colors can't carry readable text in either black or white: shift them until one of the two works */
  function legible(hx,card,minCard){
    var x=hex2hsl(hx),i,j,c,l,dirs=[-1,1];
    function ok(v){return Math.max(ratio(v,"#ffffff"),ratio(v,"#111111"))>=4.5&&ratio(v,card)>=minCard;}
    if(ok(hx))return hx;
    for(i=1;i<=48;i++)for(j=0;j<2;j++){l=x[2]+dirs[j]*i*2;if(l<2||l>98)continue;c=hsl2hex(x[0],x[1],l);if(ok(c))return c;}
    return hx;
  }
  /* c = the color in light mode, cd = the color in dark mode (defaults to c) */
  function buildTheme(name,c,cd){
    var L=BASE.light,D=BASE.dark,
        lf=legible(fit(c,L.card,1.9,-1),L.card,1.9),lt=fit(c,L.card,4.5,-1),ll=fit(lf,L.bg,2.4,-1),
        df=legible(fit(cd||c,D.card,4.5,1),D.card,4.5);
    /* slips are black/white, unless the main color is itself near black/white: then they are gray so the two never look alike */
    function slipFor(fill,B,gray,ongray){return ratio(fill,B.ink)<2.2?{s:gray,o:ongray}:{s:B.ink,o:B.onslip};}
    var ls=slipFor(lf,L,"#9a9f9c","#111111"),ds=slipFor(df,D,"#6f7471","#ffffff");
    return{name:name,
      light:{accent:lf,atext:lt,logo:ll,slip:ls.s,bg:L.bg,card:L.card,ink:L.ink,mute:L.mute,line:L.line,on:onFor(lf),onslip:ls.o},
      dark:{accent:df,atext:df,logo:df,slip:ds.s,bg:D.bg,card:D.card,ink:D.ink,mute:D.mute,line:D.line,on:onFor(df),onslip:ds.o}};
  }
  function getTheme(k){return k==="custom"?buildTheme("Custom",state.custom.accent):buildTheme(THEMES[k].name,THEMES[k].c,THEMES[k].cd);}

  var mq=window.matchMedia("(prefers-color-scheme:dark)");
  function applyTheme(){
    var mode=state.mode||"system",dark=mode==="dark"||(mode==="system"&&mq.matches);
    if(state.accent!=="custom"&&!THEMES[state.accent])state.accent="sage";
    var th=getTheme(state.accent),p=dark?th.dark:th.light,root=document.documentElement;
    root.setAttribute("data-theme",dark?"dark":"light");
    ["accent","atext","logo","slip","bg","card","ink","mute","line","on","onslip"].forEach(function(k){root.style.setProperty("--"+k,p[k]);});
    root.style.setProperty("--clean",p.accent);
    var tc=document.querySelector('meta[name=theme-color]');if(tc)tc.setAttribute("content",p.bg);
    $("themeName").textContent=th.name;
    $("customBox").hidden=state.accent!=="custom";
    if($("cAcc").value.toLowerCase()!==state.custom.accent.toLowerCase())$("cAcc").value=state.custom.accent;
    document.querySelectorAll("#modeSeg button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.mode===mode);});
    document.querySelectorAll("#accSeg button").forEach(function(b){
      var t=getTheme(b.dataset.acc),q=dark?t.dark:t.light;
      b.querySelector(".dots").innerHTML='<i style="background:'+q.accent+'"></i>';
      b.setAttribute("aria-pressed",b.dataset.acc===state.accent);
    });
  }
  ORDER.forEach(function(k){
    var b=document.createElement("button");b.type="button";b.className="theme";b.dataset.acc=k;
    b.innerHTML='<span class="dots"></span><span class="nm"></span>';
    b.querySelector(".nm").textContent=k==="custom"?"Custom":THEMES[k].name;
    b.onclick=function(){state.accent=k;state.themed=true;save();applyTheme();afterEvent();};
    $("accSeg").appendChild(b);
  });
  $("cAcc").oninput=function(e){state.custom.accent=e.target.value;state.themed=true;save();applyTheme();};
  $("cReset").onclick=function(){state.custom={accent:"#7DA487"};save();applyTheme();};
  document.querySelectorAll("#modeSeg button").forEach(function(b){
    b.onclick=function(){state.mode=b.dataset.mode;save();applyTheme();};
  });
  if(mq.addEventListener)mq.addEventListener("change",applyTheme);
  document.querySelectorAll("[data-tab]").forEach(function(b){
    b.onclick=function(){
      var t=b.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.tab===t);});
      if(b.closest(".bnav")){var mn=document.querySelector("main");mn.scrollTop=0;window.scrollTo(0,0);}
      ["tracker","achievements","stats","settings"].forEach(function(n){$("view-"+n).hidden=n!==t;});
      var v=$("view-"+t);v.classList.remove("fade");void v.offsetWidth;v.classList.add("fade");
      if(t==="stats"){var hw=$("heatwrap");hw.scrollLeft=hw.scrollWidth;}
    };
  });
  applyTheme();

  /* Panic */
  var tInt=null,left=tSecs();
  function fmt(s){return pad(Math.floor(s/60))+":"+pad(s%60);}
  var BREATHS=[
    {id:"calm",name:"Calm",desc:"In for 4, out for 4. Repeat.",ph:[["Breathe in",4,1],["Breathe out",4,.6]]},
    {id:"box",name:"Box",desc:"In 4, hold 4, out 4, hold 4. Steady and grounding.",ph:[["Breathe in",4,1],["Hold",4,1],["Breathe out",4,.6],["Hold",4,.6]]},
    {id:"478",name:"4-7-8",desc:"In 4, hold 7, out 8. Slows a racing mind.",ph:[["Breathe in",4,1],["Hold",7,1],["Breathe out",8,.6]]},
    {id:"long",name:"Long exhale",desc:"In for 4, out for 6. A longer exhale calms the body.",ph:[["Breathe in",4,1],["Breathe out",6,.6]]},
    {id:"sigh",name:"Double inhale",desc:"Two quick breaths in through the nose, then a slow breath out. Fastest way to release tension.",ph:[["Breathe in",2,.85],["Sip in more",1,1],["Breathe out",6,.6]]}
  ];
  var breathTO=null,breathIV=null,curOsc=null,actx=null;
  /* Feedback: vibration + soft tones */
  function canVib(){return !!navigator.vibrate;}
  function buzz(pat){if(!state.breathVib)return;try{if(navigator.vibrate)navigator.vibrate(pat);else{var H=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics;if(H&&H.vibrate)H.vibrate({duration:Array.isArray(pat)?pat[0]:pat});}}catch(e){}}
  function audio(){try{if(!actx){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;actx=new C();}if(actx.state==="suspended")actx.resume();return actx;}catch(e){return null;}}
  function tone(f1,f2,dur,vol){
    if(!state.breathSnd)return;var c=audio();if(!c)return;
    try{
      var o=c.createOscillator(),g=c.createGain(),t=c.currentTime,v=vol||.12;
      o.type="sine";o.frequency.setValueAtTime(f1,t);o.frequency.linearRampToValueAtTime(f2,t+dur);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+Math.min(.3,dur/3));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.05);curOsc=o;
    }catch(e){}
  }
  function fx(label,secs){
    if(label.indexOf("out")>=0){buzz([160]);tone(390,260,secs);}
    else if(label==="Hold"){buzz([25,90,25]);tone(440,440,.35,.05);}
    else{buzz([30,40,50,40,70]);tone(260,390,secs);}
  }
  function doneCue(){buzz([200,80,200,80,300]);tone(523,523,1.2,.15);}
  function breathStop(){clearTimeout(breathTO);clearInterval(breathIV);try{if(curOsc)curOsc.stop();}catch(e){}curOsc=null;try{if(navigator.vibrate)navigator.vibrate(0);}catch(e){}}
  function breathMode(){var id=state.breathMode;return BREATHS.filter(function(x){return x.id===id;})[0]||BREATHS[0];}
  function breathe(){
    breathStop();
    var m=breathMode(),b=$("breath"),i=0;
    $("breathDesc").textContent=m.desc;
    document.querySelectorAll("#breathModes button").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.id===m.id);});
    function phase(){
      var p=m.ph[i%m.ph.length],left=p[1];
      fx(p[0],p[1]);
      b.style.transitionDuration=p[1]+"s";b.style.transform="scale("+p[2]+")";
      function paint(){b.innerHTML="";b.appendChild(document.createTextNode(p[0]));var c=document.createElement("small");c.textContent=left;b.appendChild(c);}
      paint();
      clearInterval(breathIV);
      breathIV=setInterval(function(){if(left>1){left--;paint();}},1000);
      i++;breathTO=setTimeout(phase,p[1]*1000);
    }
    b.style.transform="scale(.6)";
    phase();
  }
  BREATHS.forEach(function(m){
    var bt=document.createElement("button");bt.type="button";bt.className="chip";bt.dataset.id=m.id;bt.textContent=m.name;
    bt.onclick=function(){state.breathMode=m.id;save();breathe();};
    $("breathModes").appendChild(bt);
  });
  var helpPrev=null,helpActive=false;
  $("panic").onclick=function(){
    var first=!helpActive;
    if(first){state.helped=(state.helped||0)+1;save();var wasA=announce;announce=false;afterEvent();announce=wasA;}
    fillReasons();fillTips();
    if(first){resetRate();helpPrev={tab:tab,detail:detail,ci:CI};tab="help";showView(true);scrollTop();breathe();}
  };
  function stopTimer(){clearInterval(tInt);tInt=null;left=tSecs();$("timer").textContent=fmt(left);$("rodeHint").hidden=true;}
  $("tStart").onclick=function(){
    if(tInt)return;
    $("rodeHint").hidden=true;
    tInt=setInterval(function(){left--;$("timer").textContent=fmt(left);if(left<=0){clearInterval(tInt);tInt=null;$("timer").textContent="Done";$("rodeHint").hidden=false;try{doneCue();}catch(e){}left=tSecs();state.rode=(state.rode||0)+1;save();afterEvent();}},1000);
  };
  $("tStop").onclick=stopTimer;
  function closePanic(){
    var p=helpPrev||{tab:"progress",detail:false,ci:-1};
    tab=p.tab;detail=!!p.detail&&CI===p.ci;
    showView(true);scrollTop();
    try{(getComputedStyle($("panic")).display==="none"?$("navPanic"):$("panic")).focus({preventScroll:true});}catch(e){}
  }
  $("navPanic").onclick=function(){$("panic").click();};
  $("closePanic").onclick=closePanic;$("closeX").onclick=closePanic;
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape")return;
    if($("xover").classList.contains("open"))closeX();
    else if(helpActive)closePanic();
    else if($("sheet").classList.contains("open"))closeSheet();
  });
  $("xover").addEventListener("click",function(e){if(e.target===$("xover"))closeX();});
  $("xClose").onclick=function(){closeX();};

  /* ---------- Share, move to a new phone, QR ---------- */
  /* QR-START: minimal QR Code encoder (byte mode, levels L and M, versions 1-40) */
var QR=(function(){
  var ECC=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
           [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]];
  var BLK=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
           [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]];
  var FMT=[1,0]; /* format bits for L and M */
  function raw(v){var r=(16*v+128)*v+64;if(v>=2){var a=Math.floor(v/7)+2;r-=(25*a-10)*a-55;if(v>=7)r-=36;}return r;}
  function dataCw(v,l){return Math.floor(raw(v)/8)-ECC[l][v]*BLK[l][v];}
  function mul(x,y){var z=0,i;for(i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x;}return z;}
  function rsDiv(deg){var r=[],i,j,root=1;for(i=0;i<deg-1;i++)r.push(0);r.push(1);
    for(i=0;i<deg;i++){for(j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1];}root=mul(root,2);}return r;}
  function rsRem(data,div){var r=div.map(function(){return 0;});
    data.forEach(function(b){var f=b^r.shift();r.push(0);div.forEach(function(c,i){r[i]^=mul(c,f);});});return r;}
  function bit(x,i){return((x>>>i)&1)!==0;}
  function build(bytes,l){
    var ver,cc;
    for(ver=1;ver<=40;ver++){cc=ver<10?8:16;if(bytes.length<(1<<cc)&&4+cc+bytes.length*8<=dataCw(ver,l)*8)break;}
    if(ver>40)return null;
    var bits=[];function put(v,n){for(var i=n-1;i>=0;i--)bits.push((v>>>i)&1);}
    put(4,4);put(bytes.length,cc);bytes.forEach(function(b){put(b,8);});
    var cap=dataCw(ver,l)*8;put(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
    var data=[],i,j;for(i=0;i<bits.length;i+=8){var b=0;for(j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b);}
    for(i=0;data.length<dataCw(ver,l);i++)data.push(i%2?0x11:0xEC);
    /* ecc + interleave */
    var nb=BLK[l][ver],el=ECC[l][ver],rc=Math.floor(raw(ver)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb),div=rsDiv(el),blocks=[],off=0;
    for(i=0;i<nb;i++){var k=sl-el+(i<ns?0:1),dat=data.slice(off,off+k);off+=k;var ecc=rsRem(dat,div);if(i<ns)dat.push(0);blocks.push(dat.concat(ecc));}
    var out=[];for(i=0;i<blocks[0].length;i++)for(j=0;j<nb;j++)if(i!==sl-el||j>=ns)out.push(blocks[j][i]);
    /* matrix */
    var size=ver*4+17,m=[],fn=[],y,x;
    for(y=0;y<size;y++){m.push(new Array(size).fill(false));fn.push(new Array(size).fill(false));}
    function setFn(x,y,d){m[y][x]=d;fn[y][x]=true;}
    for(i=0;i<size;i++){setFn(6,i,i%2===0);setFn(i,6,i%2===0);}
    function finder(cx,cy){var dx,dy;for(dy=-4;dy<=4;dy++)for(dx=-4;dx<=4;dx++){var d=Math.max(Math.abs(dx),Math.abs(dy)),xx=cx+dx,yy=cy+dy;if(xx>=0&&xx<size&&yy>=0&&yy<size)setFn(xx,yy,d!==2&&d!==4);}}
    finder(3,3);finder(size-4,3);finder(3,size-4);
    var al=[];if(ver>1){var na=Math.floor(ver/7)+2,step=ver===32?26:Math.ceil((ver*4+4)/(na*2-2))*2;al=[6];for(var pos=size-7;al.length<na;pos-=step)al.splice(1,0,pos);}
    for(i=0;i<al.length;i++)for(j=0;j<al.length;j++){
      if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0))continue;
      for(var ay=-2;ay<=2;ay++)for(var ax=-2;ax<=2;ax++)setFn(al[i]+ax,al[j]+ay,Math.max(Math.abs(ax),Math.abs(ay))!==1);
    }
    function drawFormat(mask){
      var d=(FMT[l]<<3)|mask,r=d,n;for(n=0;n<10;n++)r=(r<<1)^((r>>>9)*0x537);
      var bs=((d<<10)|r)^0x5412;
      for(n=0;n<=5;n++)setFn(8,n,bit(bs,n));setFn(8,7,bit(bs,6));setFn(8,8,bit(bs,7));setFn(7,8,bit(bs,8));
      for(n=9;n<15;n++)setFn(14-n,8,bit(bs,n));
      for(n=0;n<8;n++)setFn(size-1-n,8,bit(bs,n));for(n=8;n<15;n++)setFn(8,size-15+n,bit(bs,n));
      setFn(8,size-8,true);
    }
    drawFormat(0);
    if(ver>=7){var vr=ver,n2;for(n2=0;n2<12;n2++)vr=(vr<<1)^((vr>>>11)*0x1F25);var vb=(ver<<12)|vr;
      for(n2=0;n2<18;n2++){var a=size-11+n2%3,b2=Math.floor(n2/3);setFn(a,b2,bit(vb,n2));setFn(b2,a,bit(vb,n2));}}
    /* codewords */
    var idx=0;
    for(var right=size-1;right>=1;right-=2){if(right===6)right=5;
      for(var vert=0;vert<size;vert++)for(j=0;j<2;j++){var xx2=right-j,up=((right+1)&2)===0,yy2=up?size-1-vert:vert;
        if(!fn[yy2][xx2]&&idx<out.length*8){m[yy2][xx2]=bit(out[idx>>>3],7-(idx&7));idx++;}}}
    function mask(mk){for(var yy=0;yy<size;yy++)for(var xx=0;xx<size;xx++){var inv;
      switch(mk){case 0:inv=(xx+yy)%2===0;break;case 1:inv=yy%2===0;break;case 2:inv=xx%3===0;break;case 3:inv=(xx+yy)%3===0;break;
        case 4:inv=(Math.floor(xx/3)+Math.floor(yy/2))%2===0;break;case 5:inv=xx*yy%2+xx*yy%3===0;break;
        case 6:inv=(xx*yy%2+xx*yy%3)%2===0;break;default:inv=((xx+yy)%2+xx*yy%3)%2===0;}
      if(!fn[yy][xx]&&inv)m[yy][xx]=!m[yy][xx];}}
    function penalty(){
      var p=0,yy,xx,run,line,i2,dark=0;
      function scan(get){
        var ln=[],k;for(k=0;k<size;k++)ln.push(get(k)?1:0);
        var r=1;for(k=1;k<=size;k++){if(k<size&&ln[k]===ln[k-1])r++;else{if(r>=5)p+=3+(r-5);r=1;}}
        for(k=0;k+11<=size;k++){var A=true,B=true,t;for(t=0;t<11;t++){if(ln[k+t]!==[1,0,1,1,1,0,1,0,0,0,0][t])A=false;if(ln[k+t]!==[0,0,0,0,1,0,1,1,1,0,1][t])B=false;}if(A||B)p+=40;}
      }
      for(yy=0;yy<size;yy++)scan(function(k){return m[yy][k];});
      for(xx=0;xx<size;xx++)scan(function(k){return m[k][xx];});
      for(yy=0;yy<size-1;yy++)for(xx=0;xx<size-1;xx++){var c=m[yy][xx];if(c===m[yy][xx+1]&&c===m[yy+1][xx]&&c===m[yy+1][xx+1])p+=3;}
      for(yy=0;yy<size;yy++)for(xx=0;xx<size;xx++)if(m[yy][xx])dark++;
      var tot=size*size;p+=(Math.ceil(Math.abs(dark*20-tot*10)/tot)-1)*10;
      return p;
    }
    var best=0,bp=1e9,mk;
    for(mk=0;mk<8;mk++){mask(mk);drawFormat(mk);var pe=penalty();if(pe<bp){bp=pe;best=mk;}mask(mk);}
    mask(best);drawFormat(best);
    return{size:size,version:ver,modules:m};
  }
  /* try level M first (sturdier), fall back to L for larger payloads */
  function encode(bytes){return build(bytes,1)||build(bytes,0);}
  return{encode:encode,build:build};
})();
/* QR-END */
  function b64enc(u8){var s2="",i;for(i=0;i<u8.length;i+=8192)s2+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s2).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
  function b64dec(t){t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";var s2=atob(t),u=new Uint8Array(s2.length),i;for(i=0;i<s2.length;i++)u[i]=s2.charCodeAt(i);return u;}
  function streamBytes(st){return new Response(st).arrayBuffer().then(function(b){return new Uint8Array(b);});}
  function pack(obj){
    var raw=new TextEncoder().encode(JSON.stringify(obj));
    if(typeof CompressionStream==="undefined")return Promise.resolve("0"+b64enc(raw));
    var cs=new CompressionStream("deflate-raw"),w=cs.writable.getWriter();
    w.write(raw).catch(function(){});w.close().catch(function(){});
    return streamBytes(cs.readable).then(function(z){return"1"+b64enc(z);});
  }
  function unpack(str){
    var mode=str.charAt(0),u8;
    try{u8=b64dec(str.slice(1));}catch(e){return Promise.reject(e);}
    if(mode==="0")return new Promise(function(res){res(JSON.parse(new TextDecoder().decode(u8)));});
    if(mode!=="1"||typeof DecompressionStream==="undefined")return Promise.reject(new Error("unsupported"));
    var ds=new DecompressionStream("deflate-raw"),w=ds.writable.getWriter();
    w.write(u8).catch(function(){});w.close().catch(function(){});
    return streamBytes(ds.readable).then(function(b){return JSON.parse(new TextDecoder().decode(b));});
  }
  /* the day log as one character per day: c = clean, s = slipped, . = not logged */
  function packLog(log){
    var keys=Object.keys(log).sort();if(!keys.length)return{s:"",l:""};
    var d=parse(keys[0]),end=parse(keys[keys.length-1]),out="",n=0;
    while(d<=end&&n<4000){var v=log[key(d)];out+=v==="clean"?"c":v==="slip"?"s":".";d.setDate(d.getDate()+1);n++;}
    return{s:keys[0],l:out};
  }
  function unpackLog(s0,l){
    var log={};
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s0||"")||typeof l!=="string")return log;
    var d=parse(s0),i;
    for(i=0;i<l.length&&i<4000;i++){var c=l.charAt(i);if(c==="c")log[key(d)]="clean";else if(c==="s")log[key(d)]="slip";d.setDate(d.getDate()+1);}
    return log;
  }
  function summ(log,asOf){
    var keys=Object.keys(log).sort(),clean=0,slip=0,best=0,run=0,prev=null,cur=0;
    keys.forEach(function(k){
      if(log[k]==="clean"){clean++;if(prev&&log[prev]==="clean"&&Math.round((parse(k)-parse(prev))/86400000)===1)run++;else run=1;if(run>best)best=run;}
      else{slip++;run=0;}
      prev=k;
    });
    var d=parse(asOf);
    if(log[key(d)]!=="clean"&&log[key(d)]!=="slip")d.setDate(d.getDate()-1);
    while(log[key(d)]==="clean"){cur++;d.setDate(d.getDate()-1);}
    return{clean:clean,slip:slip,logged:clean+slip,best:best,cur:cur};
  }
  function baseUrl(){return location.href.split("#")[0].split("?")[0];}
  function canLink(){if(/^https?:$/.test(location.protocol))return true;toast("Open Unplugged from its web address to make a link.");return false;}
  function buildLink(kind,obj){return pack(obj).then(function(p){return baseUrl()+"#"+kind+"="+p;});}
  function transferObj(){
    pushItem();var o=JSON.parse(JSON.stringify(state));IK.forEach(function(k){delete o[k];});delete o.lock;
    o.items=ITEMS.map(function(it){var c=JSON.parse(JSON.stringify(it)),pl=packLog(it.log);delete c.log;c.ls=pl.s;c.ll=pl.l;return c;});
    o.sel=CI>=0?ITEMS[CI].id:"";o.k="t";o.pv=2;return o;
  }
  function shareObj(){return{k:"s",pv:2,t:nowKey(),a:ITEMS.slice(0,12).map(function(it){var pl=packLog(it.log);return{n:it.name.slice(0,40),ls:pl.s,ll:pl.l,u:sumU(it)};})};}
  function copyText(t){
    function fb(){window.prompt("Copy this link:",t);}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast("Link copied.");},fb);else fb();
  }
  function btn(label,cls,fn){var b=document.createElement("button");b.type="button";if(cls)b.className=cls;b.textContent=label;b.onclick=fn;return b;}
  function noteEl(t){var d=document.createElement("div");d.className="note";d.textContent=t;return d;}
  function xrow(){var r=document.createElement("div");r.className="xrow";return r;}
  function tilesEl(list){
    var t=document.createElement("div");t.className="tiles";
    list.forEach(function(x){var d=document.createElement("div");d.className="tile";d.innerHTML="<b></b><span></span>";d.firstChild.textContent=x[0];d.lastChild.textContent=x[1];t.appendChild(d);});
    return t;
  }
  function openX(title,sub,fill){
    $("xTitle").textContent=title;$("xSub").textContent=sub||"";
    var b=$("xBody");b.innerHTML="";fill(b);
    $("xover").classList.add("open");$("xover").scrollTop=0;$("xClose").focus({preventScroll:true});
  }
  function closeX(){
    $("xover").classList.remove("open");
    if(location.hash){try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}}
  }
  function showQR(url,title,sub,warn){
    var q=QR.encode(Array.prototype.slice.call(new TextEncoder().encode(url)));
    openX(title,sub,function(b){
      if(!q)b.appendChild(noteEl("This is too much data for a QR code. Use the link instead."));
      else{
        var c=document.createElement("canvas");c.className="qr";c.setAttribute("role","img");c.setAttribute("aria-label","QR code");
        var sc=Math.max(3,Math.floor(360/(q.size+8))),n=(q.size+8)*sc,g,x,y;
        c.width=c.height=n;g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,n,n);g.fillStyle="#000";
        for(y=0;y<q.size;y++)for(x=0;x<q.size;x++)if(q.modules[y][x])g.fillRect((x+4)*sc,(y+4)*sc,sc,sc);
        b.appendChild(c);
      }
      b.appendChild(noteEl(warn));
      var r=xrow();r.appendChild(btn("Copy link","ghost",function(){copyText(url);}));r.appendChild(btn("Done","clean",closeX));b.appendChild(r);
    });
  }
  function linkFlow(kind,obj,then){
    if(!canLink())return;
    buildLink(kind,obj).then(then,function(){toast("Couldn't make the link in this browser.");});
  }
  $("mvQR").onclick=function(){linkFlow("t",transferObj(),function(url){showQR(url,"Move to a new phone","On the new phone: scan this with the camera, open the link, then tap Import and replace.","Anyone who scans this can read your whole log and your reasons. Keep it private and don't post a screenshot.");});};
  $("mvLink").onclick=function(){linkFlow("t",transferObj(),function(url){copyText(url);});};
  $("shQR").onclick=function(){linkFlow("s",shareObj(),function(url){showQR(url,"Share your progress","They scan this to see a read-only snapshot of your progress.","The snapshot shows which days you logged as clean or slipped. It doesn't include your reasons, triggers or notes.");});};
  $("shLink").onclick=function(){linkFlow("s",shareObj(),function(url){
    if(navigator.share)navigator.share({title:"My Unplugged progress",text:"My progress on Unplugged",url:url}).catch(function(){});
    else copyText(url);
  });};

  /* opening a link made by the buttons above */
  function cleanImported(){
    if(typeof state.reasons!=="string")state.reasons="";state.reasons=state.reasons.slice(0,5000);
    if(["system","light","dark"].indexOf(state.mode)<0)state.mode="system";
    if(typeof state.accent!=="string")state.accent="sage";
    ["helped","rode"].forEach(function(k){state[k]=Math.max(0,Math.floor(+state[k])||0);});
    state.themed=!!state.themed;
    state.picked=state.picked.filter(function(id){return ALLP.some(function(p){return p.id===id;});});setPresets();buildFocus();buildChips();
    Object.keys(state.ach).forEach(function(k){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(state.ach[k])))delete state.ach[k];});
    state.v=3;
  }
  function applyTransfer(o){
    var g={},its;
    ["mode","accent","custom","breathMode","timerMin","breathVib","breathSnd","celebrate","remind","themed"].forEach(function(k){if(k in o)g[k]=JSON.parse(JSON.stringify(o[k]));});
    if(Array.isArray(o.items))its=o.items.slice(0,50).map(function(c){var it=Object.assign({},c);it.log=unpackLog(c.ls,c.ll);delete it.ls;delete it.ll;return it;});
    else its=[legacyItem(o,unpackLog(o.ls,o.ll))];
    adopt(g,its);closeX();toast("Imported. Welcome to your new device.");
  }
  function offerImport(o){
    var S=o.items?(function(){var t={logged:0,clean:0,best:0};o.items.forEach(function(x){var q=summ(unpackLog(x.ls,x.ll),nowKey());t.logged+=q.logged;t.clean+=q.clean;if(q.best>t.best)t.best=q.best;});return t;})():summ(unpackLog(o.ls,o.ll),nowKey()),have=ITEMS.reduce(function(n,x){return n+Object.keys(x.log||{}).length;},0);
    openX("Import from another device","This link holds a backup. Importing replaces what is on this device.",function(b){
      b.appendChild(tilesEl([[S.logged,"days logged"],[S.clean,"clean days"],[S.best,"best streak"]]));
      if(have)b.appendChild(noteEl("This device already has "+have+" logged day"+(have>1?"s":"")+". They will be replaced. Back up this device first if you're not sure."));
      var r=xrow();
      r.appendChild(btn("Import and replace","clean",function(){applyTransfer(o);}));
      if(have)r.appendChild(btn("Back up this device first","ghost",function(){$("export").click();}));
      r.appendChild(btn("Cancel","ghost",closeX));
      b.appendChild(r);
    });
  }
  function showSharedMulti(o){
    var asOf=/^\d{4}-\d{2}-\d{2}$/.test(o.t||"")?o.t:nowKey(),pretty=parse(asOf).toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
    openX("Shared progress","A read-only snapshot as of "+pretty+". It doesn't change anything on your device.",function(b){
      o.a.slice(0,12).forEach(function(x){
        var S=summ(unpackLog(x.ls,x.ll),asOf),h=document.createElement("h2");h.textContent=String(x.n||"").slice(0,40);b.appendChild(h);
        b.appendChild(tilesEl([[S.cur,"day streak"],[S.best,"best streak"],[S.clean,"clean days"],[S.logged?Math.round(S.clean/S.logged*100)+"%":"-","clean rate"]]));
      });
      
    });
  }
  function showShared(o){
    if(Array.isArray(o.a))return showSharedMulti(o);
    var asOf=/^\d{4}-\d{2}-\d{2}$/.test(o.t||"")?o.t:nowKey(),log=unpackLog(o.ls,o.ll),S=summ(log,asOf),i;
    var pretty=parse(asOf).toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
    openX("Shared progress","A read-only snapshot as of "+pretty+". It doesn't change anything on your device.",function(b){
      var list=[[S.cur,"day streak"],[S.best,"best streak"],[S.clean,"clean days"],[S.logged?Math.round(S.clean/S.logged*100)+"%":"-","clean rate"]];
      var u=Math.floor(+o.u)||0;if(u>0)list.push([u,"urges ridden out"]);
      b.appendChild(tilesEl(list));
      var c30=0,s30=0,d=parse(asOf);
      for(i=0;i<30;i++){var v=log[key(d)];if(v==="clean")c30++;else if(v==="slip")s30++;d.setDate(d.getDate()-1);}
      var p=document.createElement("p");p.className="lbl";p.textContent="Last 30 days: "+c30+" clean and "+s30+" slipped.";b.appendChild(p);
      var wrap=document.createElement("div"),hm=document.createElement("div"),ht=document.createElement("div");
      wrap.className="heatwrap";hm.className="hm";ht.className="heat";
      var end=parse(asOf),s0=new Date(end.getFullYear(),end.getMonth(),end.getDate()-end.getDay()-25*7),lastM=-1,w,dow;
      for(w=0;w<26;w++){
        var first=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate()+w*7),sp=document.createElement("span");
        if(first.getMonth()!==lastM){sp.textContent=first.toLocaleDateString(undefined,{month:"short"});lastM=first.getMonth();}
        hm.appendChild(sp);
        for(dow=0;dow<7;dow++){
          var cd=new Date(first.getFullYear(),first.getMonth(),first.getDate()+dow),k=key(cd),cell=document.createElement("i");
          if(k>asOf)cell.className="x";else if(log[k])cell.className=log[k];
          ht.appendChild(cell);
        }
      }
      wrap.appendChild(hm);wrap.appendChild(ht);b.appendChild(wrap);
      var lg=document.createElement("div");lg.className="legend";
      lg.innerHTML='<span><i style="background:var(--clean)"></i>Clean</span><span><i style="background:var(--slip)"></i>Slipped</span><span><i style="background:var(--line)"></i>Not logged</span>';
      b.appendChild(lg);
      
    });
  }
  function handleHash(){
    var m=/^#([ts])=([A-Za-z0-9_-]+)$/.exec(location.hash);
    if(!m)return;
    unpack(m[2]).then(function(o){
      if(!o||typeof o!=="object")throw new Error("bad");
      if(m[1]==="t"&&o.k==="t")offerImport(o);
      else if(m[1]==="s"&&o.k==="s")showShared(o);
      else throw new Error("bad");
    }).catch(function(){
      openX("That link didn't work","It may be cut off, or made by a different version of the app. Ask for a fresh link.",function(b){
        
      });
    });
  }

  /* ---------- PWA: service worker + install ---------- */
  if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
    window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});
  }
  var deferred=null,standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
  var isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  $("installBox").hidden=standalone;
  $("installHint").textContent=isIOS?"On iPhone or iPad: open this page in Safari, tap the Share button, then Add to Home Screen.":"Or use your browser menu and choose Install app or Add to Home screen.";
  window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;$("install").hidden=false;$("installHint").hidden=true;});
  $("install").onclick=function(){
    if(!deferred)return;
    deferred.prompt();
    deferred.userChoice.then(function(){deferred=null;$("install").hidden=true;$("installHint").hidden=false;});
  };
  window.addEventListener("appinstalled",function(){$("installBox").hidden=true;toast("Installed. Find Unplugged on your home screen.");});


  /* ---------- Timer length ---------- */
  var TLEN=[5,10,15,20];
  function tSecs(){var m=Math.floor(+state.timerMin);return (m>=1&&m<=120?m:10)*60;}
  function refreshTimerUI(){
    var m=tSecs()/60;
    if(!tInt)$("timer").textContent=fmt(left);
    $("tStart").textContent="Start "+m+(m===1?" minute":" minutes");
    document.querySelectorAll("#timerLen .chip").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.m===m);});
    if(document.activeElement!==$("tCustom"))$("tCustom").value=TLEN.indexOf(m)<0?m:"";
  }
  function setTimerMin(m){
    m=Math.floor(+m);if(!(m>=1&&m<=120)){refreshTimerUI();return;}
    if(tInt){toast("Stop the timer first to change its length.");refreshTimerUI();return;}
    state.timerMin=m;save();stopTimer();refreshTimerUI();
  }
  TLEN.forEach(function(m){
    var b=document.createElement("button");b.type="button";b.className="chip";b.dataset.m=m;b.textContent=m+" min";
    b.onclick=function(){setTimerMin(m);};$("timerLen").appendChild(b);
  });
  $("tCustom").onchange=function(e){setTimerMin(e.target.value);};
  $("tStart").addEventListener("click",function(){refreshTimerUI();});
  refreshTimerUI();

  /* ---------- Breathing feedback toggles ---------- */
  function refreshFx(){$("fxVib").setAttribute("aria-pressed",!!state.breathVib);$("fxSnd").setAttribute("aria-pressed",!!state.breathSnd);}
  if(!canVib())$("fxVib").hidden=true;
  $("fxVib").onclick=function(){state.breathVib=!state.breathVib;save();refreshFx();if(state.breathVib)buzz([60]);else try{navigator.vibrate(0);}catch(e){}};
  $("fxSnd").onclick=function(){state.breathSnd=!state.breathSnd;save();refreshFx();if(state.breathSnd)tone(330,330,.5,.1);};
  refreshFx();

  /* ---------- Celebrations ---------- */
  var CM={1:"Day one is done. Every streak starts here.",3:"Three days in. You're proving you can do this.",7:"A full week. That's real momentum.",14:"Two weeks. You're building a new normal.",30:"A whole month. Be proud of that.",60:"Two months of choosing yourself.",90:"Three months. This is who you are now.",180:"Half a year. Look how far you've come.",365:"One full year. Incredible."};
  var confAnim=0;
  function confetti(){
    var cv=$("confetti"),cx=cv.getContext("2d");
    cancelAnimationFrame(confAnim);
    if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){cx.clearRect(0,0,cv.width,cv.height);return;}
    var W=cv.width=window.innerWidth,H=cv.height=window.innerHeight,cs=getComputedStyle(document.documentElement),
        cols=[cs.getPropertyValue("--accent"),cs.getPropertyValue("--slip"),cs.getPropertyValue("--on"),"#e8c24a","#ffffff"].map(function(c){return c.trim()||"#888";}),
        P=[],i;
    for(i=0;i<140;i++)P.push({x:Math.random()*W,y:-Math.random()*H*.6-10,vx:Math.random()*4-2,vy:Math.random()*3+2,s:Math.random()*7+5,r:Math.random()*6,vr:Math.random()*.3-.15,c:cols[i%cols.length]});
    var t0=performance.now();
    function frame(t){
      cx.clearRect(0,0,W,H);var alive=false;
      P.forEach(function(q){
        q.x+=q.vx;q.y+=q.vy;q.vy+=.04;q.r+=q.vr;
        if(q.y<H+20){alive=true;cx.save();cx.translate(q.x,q.y);cx.rotate(q.r);cx.fillStyle=q.c;cx.fillRect(-q.s/2,-q.s/4,q.s,q.s/2);cx.restore();}
      });
      if(alive&&t-t0<6000)confAnim=requestAnimationFrame(frame);else cx.clearRect(0,0,W,H);
    }
    confAnim=requestAnimationFrame(frame);
  }
  function celebrate(days,title){
    $("celeNum").textContent=days;$("celeUnit").textContent=days===1?"day in a row":"days in a row";
    $("celeTitle").textContent=title;$("celeMsg").textContent=CM[days]||"Keep going. You're doing it.";
    $("cele").hidden=false;buzz([100,60,100,60,200]);confetti();
    try{$("celeOk").focus({preventScroll:true});}catch(e){}
  }
  function celebrateFor(title){
    if(state.celebrate===false)return;
    var m=MS.filter(function(x){return x[1]===title;})[0];if(!m)return;
    celebrate(m[0],title);
  }
  function closeCele(){cancelAnimationFrame(confAnim);$("cele").hidden=true;}
  $("celeOk").onclick=closeCele;
  $("cele").addEventListener("click",function(e){if(e.target===$("cele"))closeCele();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("cele").hidden)closeCele();});
  $("celePrev").onclick=function(){celebrate(7,"One week");};
  function renderCeleSeg(){document.querySelectorAll("#celeSeg button").forEach(function(b){b.setAttribute("aria-pressed",(b.dataset.on==="1")===(state.celebrate!==false));});}
  document.querySelectorAll("#celeSeg button").forEach(function(b){b.onclick=function(){state.celebrate=b.dataset.on==="1";save();renderCeleSeg();};});
  renderCeleSeg();

  /* ---------- Daily reminder ---------- */
  var NATIVE=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
  function LN(){return (window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications)||null;}
  function remTime(){var p=((state.remind&&state.remind.t)||"20:00").split(":");return[+p[0],+p[1]];}
  function nativeSchedule(){
    var n=LN();if(!n||!NATIVE)return Promise.resolve(false);
    return Promise.resolve(n.cancel({notifications:[{id:1}]})).catch(function(){}).then(function(){
      if(!state.remind.on)return false;
      var t=remTime();
      return n.schedule({notifications:[{id:1,title:"Unplugged",body:"Time for today's check-in. How did it go?",schedule:{on:{hour:t[0],minute:t[1]},allowWhileIdle:true}}]}).then(function(){return true;});
    }).catch(function(){return false;});
  }
  function askPerm(){
    var n=LN();
    if(n&&NATIVE)return Promise.resolve(n.requestPermissions()).then(function(r){return !!(r&&r.display==="granted");}).catch(function(){return false;});
    if(!("Notification" in window))return Promise.resolve(false);
    if(Notification.permission==="granted")return Promise.resolve(true);
    if(Notification.permission==="denied")return Promise.resolve(false);
    try{return Promise.resolve(Notification.requestPermission()).then(function(r){return r==="granted";});}catch(e){return Promise.resolve(false);}
  }
  function notify(t,b){
    try{
      if(!("Notification" in window)||Notification.permission!=="granted")return;
      var fb=function(){try{new Notification(t,{body:b});}catch(e){}};
      if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){
        navigator.serviceWorker.getRegistration().then(function(r){if(r&&r.showNotification)r.showNotification(t,{body:b,icon:"assets/images/favicon.svg",tag:"unplugged-remind"});else fb();}).catch(fb);
      }else fb();
    }catch(e){}
  }
  function dueNow(){var R=state.remind;if(!R||!R.on)return false;var t=remTime(),d=new Date();return d.getHours()*60+d.getMinutes()>=t[0]*60+t[1];}
  function loggedToday(){var v=state.log[nowKey()];return v==="clean"||v==="slip";}
  function remBanner(){var el=$("remBanner");if(el)el.hidden=!(dueNow()&&!loggedToday());}
  function checkReminder(){
    remBanner();
    if(document.documentElement.classList.contains("locked"))return;
    if(dueNow()&&!loggedToday()&&state.remLast!==nowKey()){
      state.remLast=nowKey();save();
      if(!NATIVE)notify("Unplugged","Time for today's check-in. How did it go?");
      toast("Time for today's check-in.");
    }
  }
  function renderRemind(){
    document.querySelectorAll("#remSeg button").forEach(function(b){b.setAttribute("aria-pressed",(b.dataset.on==="1")===!!state.remind.on);});
    if($("remTime").value!==state.remind.t)$("remTime").value=state.remind.t;
    $("remNote").textContent=NATIVE?"Reminders arrive even when the app is closed.":"In the browser, reminders only show while Unplugged is open. The Android app can remind you in the background.";
    remBanner();
  }
  document.querySelectorAll("#remSeg button").forEach(function(b){
    b.onclick=function(){
      if(b.dataset.on!=="1"){state.remind.on=false;state.remLast="";save();nativeSchedule();renderRemind();return;}
      askPerm().then(function(ok){
        state.remind.on=true;save();nativeSchedule();renderRemind();
        toast(ok?"Daily reminder is on.":"Notifications are blocked, so you'll see the reminder inside the app only.");
      });
    };
  });
  $("remTime").onchange=function(e){if(/^\d\d:\d\d$/.test(e.target.value)){state.remind.t=e.target.value;state.remLast="";save();nativeSchedule();renderRemind();}};
  $("remTest").onclick=function(){askPerm().then(function(ok){notify("Unplugged","This is how your daily reminder will look.");toast(ok?"Test sent.":"Notifications are blocked. Allow them in your browser or phone settings.");});};
  renderRemind();
  setInterval(checkReminder,30000);

  /* ---------- App lock ---------- */
  var lockT=null,hiddenAt=0,pinMode="",lockBusy=false;
  function lockOn(){return !!(state.lock&&state.lock.h);}
  function kdf(pin,salt){
    try{
      if(window.crypto&&crypto.subtle&&window.TextEncoder){
        var enc=new TextEncoder();
        return crypto.subtle.importKey("raw",enc.encode(pin),"PBKDF2",false,["deriveBits"]).then(function(k){
          return crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:100000,hash:"SHA-256"},k,256);
        }).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return ("0"+x.toString(16)).slice(-2);}).join("");});
      }
    }catch(e){}
    var h=5381,t=salt+":"+pin;for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;
    return Promise.resolve("w"+h);
  }
  function newSalt(){var a=new Uint8Array(16);try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256);}return Array.from(a).map(function(x){return ("0"+x.toString(16)).slice(-2);}).join("");}
  function lockTick(){
    clearInterval(lockT);var L=state.lock,pin=$("lockPin"),go=$("lockGo");
    function free(){pin.disabled=false;go.disabled=false;}
    if(!L||!L.u||Date.now()>=L.u){free();return;}
    function up(){
      var sec=Math.ceil((L.u-Date.now())/1000);
      if(sec<=0){clearInterval(lockT);free();$("lockMsg").textContent="";try{pin.focus();}catch(e){}return;}
      pin.disabled=true;go.disabled=true;$("lockMsg").textContent="Too many tries. Try again in "+sec+" seconds.";
    }
    up();lockT=setInterval(up,1000);
  }
  function showLock(){
    document.documentElement.classList.add("locked");
    $("lockPin").value="";$("lockMsg").textContent="";lockTick();
    setTimeout(function(){try{$("lockPin").focus();}catch(e){}},60);
  }
  function hideLock(){document.documentElement.classList.remove("locked");}
  function tryUnlock(){
    var L=state.lock;if(!L)return;
    if(L.u&&Date.now()<L.u){lockTick();return;}
    var pin=$("lockPin").value;if(!pin||lockBusy)return;
    lockBusy=true;
    kdf(pin,L.s).then(function(h){
      lockBusy=false;
      if(h===L.h){L.f=0;L.u=0;save();$("lockPin").value="";$("lockMsg").textContent="";hideLock();checkReminder();}
      else{
        L.f=(L.f||0)+1;$("lockPin").value="";
        if(L.f>=5)L.u=Date.now()+Math.min(30*Math.pow(2,L.f-5),300)*1000;
        save();$("lockMsg").textContent="That PIN isn't right.";lockTick();
      }
    });
  }
  $("lockPin").oninput=function(e){
    e.target.value=e.target.value.replace(/\D/g,"").slice(0,8);
    if(state.lock&&e.target.value.length===state.lock.n)tryUnlock();
  };
  $("lockPin").onkeydown=function(e){if(e.key==="Enter")tryUnlock();};
  $("lockGo").onclick=tryUnlock;
  $("lockForgot").onclick=function(){
    ask("The only way back in without your PIN is to erase everything in this app: your log, reasons and settings. Erase everything and start over?","Erase everything",true,function(){
      try{localStorage.removeItem(KEY);}catch(e){}
      location.reload();
    });
  };
  document.addEventListener("visibilitychange",function(){
    if(document.hidden){hiddenAt=Date.now();if(lockOn()&&(state.lock.a|0)===0)showLock();}
    else{
      if(lockOn()&&hiddenAt&&Date.now()-hiddenAt>=(state.lock.a|0)*1000&&!document.documentElement.classList.contains("locked"))showLock();
      rollDay();checkReminder();
    }
  });
  /* settings UI */
  function renderLock(){
    var on=lockOn();
    $("lockSet").hidden=on||!!pinMode;$("lockChange").hidden=!on||!!pinMode;$("lockOff").hidden=!on||!!pinMode;
    $("lockAfterBox").hidden=!on;
    $("lockStatus").textContent=on?"App lock is on. Unplugged asks for your PIN when you open it.":"Protect Unplugged with a PIN. It asks for the PIN every time you open the app.";
    document.querySelectorAll("#lockAfter button").forEach(function(b){b.setAttribute("aria-pressed",on&&+b.dataset.a===(state.lock.a|0));});
    $("pinForm").hidden=!pinMode;
    $("pinCurW").hidden=!(pinMode==="change"||pinMode==="off");
    $("pinNewW").hidden=!(pinMode==="set"||pinMode==="change");
    $("pinNew2W").hidden=!(pinMode==="set"||pinMode==="change");
  }
  function openPin(m){pinMode=m;["pinCur","pinNew","pinNew2"].forEach(function(i){$(i).value="";});$("pinMsg").textContent="";renderLock();}
  function pinClose(){pinMode="";renderLock();}
  ["pinCur","pinNew","pinNew2"].forEach(function(i){$(i).oninput=function(e){e.target.value=e.target.value.replace(/\D/g,"").slice(0,8);};});
  $("lockSet").onclick=function(){openPin("set");};
  $("lockChange").onclick=function(){openPin("change");};
  $("lockOff").onclick=function(){openPin("off");};
  $("pinCancel").onclick=pinClose;
  $("pinSave").onclick=function(){
    var msg=$("pinMsg");msg.textContent="";
    function saveNew(){
      var a=$("pinNew").value,b=$("pinNew2").value;
      if(!/^\d{4,8}$/.test(a)){msg.textContent="Use 4 to 8 digits.";return;}
      if(a!==b){msg.textContent="The two PINs don't match.";return;}
      var salt=newSalt(),keep=state.lock?state.lock.a:0;
      kdf(a,salt).then(function(h){state.lock={h:h,s:salt,n:a.length,a:keep,f:0,u:0};save();pinClose();msg.textContent="";toast("App lock is on.");});
    }
    if(pinMode==="set"){saveNew();return;}
    var cur=$("pinCur").value;
    if(!cur){msg.textContent="Enter your current PIN.";return;}
    kdf(cur,state.lock.s).then(function(h){
      if(h!==state.lock.h){msg.textContent="That's not your current PIN.";return;}
      if(pinMode==="off"){delete state.lock;save();hideLock();pinClose();toast("App lock is off.");}
      else saveNew();
    });
  };
  document.querySelectorAll("#lockAfter button").forEach(function(b){b.onclick=function(){if(!lockOn())return;state.lock.a=+b.dataset.a;save();renderLock();};});
  renderLock();
  if(lockOn())showLock();else hideLock();

  /* ---------- Addictions: several habits, each tracked on its own ---------- */
  var tab="progress",detail=false,sub="tracker";
  var ALLV=["view-progress","detailBar","view-tracker","view-stats","view-achievements","view-today","view-allstats","view-settings","view-help"];
  function tk(){return key(new Date());}
  function mk(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function freshItem(name,type,start){return{id:"a"+Date.now().toString(36)+Math.floor(Math.random()*46656).toString(36),name:name||"",start:start||Date.now(),since:start||Date.now(),focus:type||"general",log:{},reasons:"",picked:[],slips:{},urges:{},urgeLog:[],recovery:{},ach:{},helped:0,rode:0};}
  function legacyItem(o,log){
    var NM={general:"My habit",porn:"Porn",nicotine:"Smoking / vaping",alcohol:"Alcohol",gambling:"Gambling",social:"Social media",gaming:"Gaming"},f=typeof o.focus==="string"&&NM[o.focus]?o.focus:"general",ks=Object.keys(log||{}).sort();
    var st=ks.length?new Date(+ks[0].slice(0,4),+ks[0].slice(5,7)-1,+ks[0].slice(8,10)).getTime():Date.now();
    var it=freshItem(NM[f],f,st);it.log=log||{};
    ["reasons","picked","slips","urges","urgeLog","recovery","ach","helped","rode"].forEach(function(k){if(o[k]!==undefined)it[k]=o[k];});
    return it;
  }
  function dayStart(ms){var d=new Date(ms);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();}
  function fillClean(it,fromMs){var d=new Date(dayStart(fromMs)),end=dayStart(Date.now()),n=0;while(d.getTime()<end&&n<3660){var k=key(d);if(!it.log[k])it.log[k]="clean";d.setDate(d.getDate()+1);n++;}}
  function recomputeSince(it){
    var L=null,now=Date.now(),s=+it.start>0?+it.start:now;
    Object.keys(it.log||{}).forEach(function(k){if(it.log[k]==="slip"&&(!L||k>L))L=k;});
    if(L){var base;
      if(L===tk()){if(!it.resetAt||key(new Date(it.resetAt))!==L)it.resetAt=now;base=it.resetAt;}
      else{var d=parse(L);d.setDate(d.getDate()+1);base=d.getTime();}
      s=Math.max(s,Math.min(base,now));}
    it.since=s;
  }
  function elapsed(since){
    var n=new Date(),a=new Date(Math.min(since,Date.now()));
    var y=n.getFullYear()-a.getFullYear(),m=n.getMonth()-a.getMonth(),d=n.getDate()-a.getDate(),h=n.getHours()-a.getHours(),mi=n.getMinutes()-a.getMinutes(),s=n.getSeconds()-a.getSeconds();
    if(s<0){s+=60;mi--;}if(mi<0){mi+=60;h--;}if(h<0){h+=24;d--;}
    if(d<0){d+=new Date(n.getFullYear(),n.getMonth(),0).getDate();m--;}if(m<0){m+=12;y--;}
    return{y:y,m:m,d:d,h:h,mi:mi,s:s,days:Math.floor((Date.now()-a.getTime())/86400000)};
  }
  function bigText(e){var p=[];if(e.y)p.push(e.y+(e.y>1?" years":" year"));if(e.m)p.push(e.m+(e.m>1?" months":" month"));p.push(e.d+(e.d===1?" day":" days"));return p.join(" ");}
  function tick(){document.querySelectorAll("[data-live]").forEach(function(el){var it=ITEMS[+el.dataset.i];if(!it)return;var e=elapsed(it.since);el.textContent=el.dataset.live==="big"?bigText(e):pad(e.h)+":"+pad(e.mi)+":"+pad(e.s);});}
  function sumU(it){var n=0;Object.keys(it.urges||{}).forEach(function(k){n+=+it.urges[k]||0;});return n;}
  function statusOf(it){var v=it.log[tk()];return v==="clean"?"Clean today":v==="slip"?"Slipped today":"Not logged today";}
  function peek(i,fn){pushItem();var it=ITEMS[i],l=state.log,u=state.urges;state.log=it.log;state.urges=it.urges;try{return fn();}finally{state.log=l;state.urges=u;}}
  function scrollTop(){var mn=document.querySelector("main");if(mn)mn.scrollTop=0;window.scrollTo(0,0);}

  function pullItem(){IK.forEach(function(k){state[k]=ITEMS[CI][k];});normalize();setPresets();buildFocus();buildChips();sel=tk();view=new Date();view.setDate(1);}
  function selectItem(i){if(i===CI||i<0||i>=ITEMS.length)return;pushItem();CI=i;pullItem();var w=announce;announce=false;render();announce=w;}
  function openDetail(i,s2){selectItem(i);detail=true;tab="progress";sub=s2||"tracker";renderAll();showView(true);scrollTop();}
  function adopt(g,its){
    announce=false;var lk=state.lock;state=Object.assign(freshState(),g);if(lk)state.lock=lk;
    ITEMS=its.map(function(c){var it=Object.assign(freshItem("","general",Date.now()),c);if(typeof it.id!=="string"||!it.id)it.id=freshItem().id;it.name=String(it.name||"My habit").slice(0,40);it.start=+it.start>0?+it.start:Date.now();return it;});
    CI=ITEMS.length?0:-1;if(CI>=0)IK.forEach(function(k){state[k]=ITEMS[CI][k];});
    normalize();cleanImported();ITEMS.forEach(recomputeSince);detail=false;tab="progress";save();render();showView();applyTheme();announce=true;
  }

  function startDrag(e,card,h){
    if(ITEMS.length<2||(e.button!==undefined&&e.button!==0))return;
    e.preventDefault();var box=$("progList");
    try{h.setPointerCapture(e.pointerId);}catch(x){}
    card.classList.add("drag");
    function move(ev){
      var els=document.elementsFromPoint(ev.clientX,ev.clientY),over=null;
      for(var k=0;k<els.length;k++){var c=els[k].closest&&els[k].closest(".acard");if(c&&c!==card&&c.parentNode===box){over=c;break;}}
      if(!over)return;
      /* move the neighbour, not the dragged card, so the pointer capture on the handle survives */
      if(card.compareDocumentPosition(over)&Node.DOCUMENT_POSITION_FOLLOWING)box.insertBefore(over,card);else box.insertBefore(over,card.nextSibling);
    }
    function up(){
      h.removeEventListener("pointermove",move);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up);
      try{h.releasePointerCapture(e.pointerId);}catch(x){}
      card.classList.remove("drag");
      var ids=Array.prototype.map.call(box.querySelectorAll(".acard"),function(c){return c.dataset.id;});
      pushItem();var curId=CI>=0?ITEMS[CI].id:null;
      ITEMS.sort(function(a,b){return ids.indexOf(a.id)-ids.indexOf(b.id);});
      ITEMS.forEach(function(x,n){if(x.id===curId)CI=n;});
      save();renderAll();
    }
    h.addEventListener("pointermove",move);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up);
  }
  function renderProgress(){
    var box=$("progList");box.innerHTML="";$("dragHint").hidden=ITEMS.length<2;
    if(!ITEMS.length){var s0=mk("section");s0.appendChild(mk("h2",null,"Start with one"));s0.appendChild(mk("p","lbl","Add something you want to stop. You can add as many as you like and each one is tracked on its own."));box.appendChild(s0);}
    ITEMS.forEach(function(it,i){
      var c=mk("div","acard");c.tabIndex=0;c.setAttribute("role","button");c.setAttribute("aria-label",it.name+", open");
      c.dataset.id=it.id;
      c.appendChild(mk("div","an",it.name));
      var b=mk("div","tbig");b.dataset.live="big";b.dataset.i=i;c.appendChild(b);
      var t=mk("div","tsmall");t.dataset.live="small";t.dataset.i=i;c.appendChild(t);
      var ar=mk("div","ast-row");ar.appendChild(mk("div","lbl ast",statusOf(it)));if(!it.log[tk()]){var qc=mk("button","clean qclean");qc.type="button";qc.title="Mark clean today";qc.setAttribute("aria-label","Mark "+it.name+" clean today");qc.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';qc.onclick=function(e){e.stopPropagation();todayAct(i,"clean");};ar.appendChild(qc);}c.appendChild(ar);
      if(ITEMS.length>1){
        var gr=mk("button","grip");gr.type="button";gr.setAttribute("aria-label","Reorder "+it.name+". Drag it, or use the arrow keys.");
        gr.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg>';
        gr.onclick=function(e){e.stopPropagation();};
        gr.onkeydown=function(e){e.stopPropagation();var d=(e.key==="ArrowUp"||e.key==="ArrowLeft")?-1:(e.key==="ArrowDown"||e.key==="ArrowRight")?1:0;if(d){e.preventDefault();var id=it.id;moveItem(i,d);var nb=document.querySelector('.acard[data-id="'+id+'"] .grip');if(nb)nb.focus();}};
        gr.onpointerdown=function(e){startDrag(e,c,gr);};
        c.appendChild(gr);
      }
      c.onclick=function(){openDetail(i);};
      c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(i);}};
      box.appendChild(c);
    });
  }
  function todayAct(i,what){
    selectItem(i);sel=tk();
    if(what==="clean")$("btnClean").click();
    else if(what==="slip"){ask("Log a slip for "+ITEMS[i].name+"? This resets its timer.","Log slip",true,function(){$("btnSlip").click();});}
    else $("btnUrge").click();
  }
  function icBtn(label,cls,fn,paths){var b=document.createElement("button");b.type="button";b.className=cls+" ic";b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg><span></span>';b.lastChild.textContent=label;b.onclick=fn;return b;}
  function renderToday(){
    var box=$("todayList");box.innerHTML="";
    var done=ITEMS.filter(function(it){return it.log[tk()];}).length;
    $("todayDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
    $("todaySub").textContent=ITEMS.length?done+" of "+ITEMS.length+" checked in today.":"Add an addiction to start checking in.";
    ITEMS.forEach(function(it,i){
      var s0=mk("section","trw"),h=mk("div","trh"),v=it.log[tk()];
      h.appendChild(mk("h2",null,it.name));h.appendChild(mk("span","pill"+(v==="clean"?" ok":v==="slip"?" sl":""),statusOf(it)));s0.appendChild(h);
      var line=mk("div","tline"),b=mk("div","tsmall");b.dataset.live="big";b.dataset.i=i;line.appendChild(b);
      var r=mk("div","tact"),u=(it.urges&&it.urges[tk()])||0;
      function ib(label,cls,fn,paths,badge){var x=icBtn(badge||"",cls+" tib",fn,paths);x.title=label;x.setAttribute("aria-label",label+" ("+it.name+")");return x;}
      r.appendChild(ib("I stayed clean","clean",function(){todayAct(i,"clean");},'<path d="M20 6L9 17l-5-5"></path>'));
      r.appendChild(ib("I slipped","slip",function(){todayAct(i,"slip");},'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>'));
      r.appendChild(ib("Rode out an urge"+(u?", "+u+" today":""),"ghost",function(){todayAct(i,"urge");},'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path>',u?String(u):""));
      line.appendChild(r);s0.appendChild(line);box.appendChild(s0);
    });
  }
  function renderAllStats(){
    var box=$("asList"),t=$("asTiles");box.innerHTML="";t.innerHTML="";
    $("asEmpty").hidden=ITEMS.length>0;$("asMain").hidden=!ITEMS.length;
    if(!ITEMS.length)return;
    var tc=0,ts=0,tu=0,best=0,run=0;
    ITEMS.forEach(function(it,i){
      var A=peek(i,analyze),days=elapsed(it.since).days,rate=A.logged?Math.round(A.clean/A.logged*100):null;
      tc+=A.clean;ts+=A.slip;tu+=sumU(it);if(A.best>best)best=A.best;if(days>run)run=days;
      var c=mk("div","asr");c.tabIndex=0;c.setAttribute("role","button");c.setAttribute("aria-label",it.name+", open stats");
      c.appendChild(mk("div","an",it.name));
      c.appendChild(tilesEl([[days,"days since last slip"],[A.best,"best streak"],[rate===null?"-":rate+"%","clean rate"],[sumU(it),"urges ridden out"]]));
      var bar=mk("div","bar"),fill=document.createElement("i");fill.style.width=(rate||0)+"%";bar.appendChild(fill);c.appendChild(bar);
      c.onclick=function(){openDetail(i,"stats");};
      c.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(i,"stats");}};
      box.appendChild(c);
    });
    var all=tc+ts;
    var tl=tilesEl([[ITEMS.length,"addictions"],[tc,"clean days"],[ts,"slipped days"],[all?Math.round(tc/all*100)+"%":"-","clean rate"],[best,"best streak"],[run,"longest run now (days)"],[tu,"urges ridden out"]]);
    t.innerHTML="";while(tl.firstChild)t.appendChild(tl.firstChild);
  }
  function renderDetail(){
    if(CI<0)return;var it=ITEMS[CI];
    $("dName").textContent=it.name;$("tcBig").dataset.i=CI;$("tcSmall").dataset.i=CI;
    $("tcSince").textContent="Since "+new Date(it.since).toLocaleString(undefined,{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"});
  }
  function moveItem(i,d){
    var j=i+d;if(j<0||j>=ITEMS.length)return;pushItem();var id=CI>=0?ITEMS[CI].id:null;
    var t=ITEMS[i];ITEMS[i]=ITEMS[j];ITEMS[j]=t;ITEMS.forEach(function(x,n){if(x.id===id)CI=n;});save();renderAll();
  }
  function renderManage(){
    var box=$("manageList");if(!box)return;box.innerHTML="";
    if(!ITEMS.length)box.appendChild(mk("p","lbl","Nothing added yet."));
    ITEMS.forEach(function(it,i){
      var r=mk("div","mrw"),g=mk("span","mb");
      r.appendChild(mk("span","mn",it.name));var eb=btn("","ghost ib",function(){openForm(i);});eb.setAttribute("aria-label","Edit "+it.name);eb.title="Edit";eb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.4 3.6l2 2-9.3 9.3-2.4-2.4z"/><path d="M8.6 12.6c-2.3-.2-4.1 1.5-4.1 3.6 0 1.1-.6 2-1.7 2.5 3.1 1.1 6.9.6 8-2 .6-1.4.3-2.6-.6-3.5"/></svg>';g.appendChild(eb);r.appendChild(g);box.appendChild(r);
    });
  }
  function renderAll(){
    var ch=false;ITEMS.forEach(function(it){var r=it.resetAt;recomputeSince(it);if(it.resetAt!==r)ch=true;});if(ch)save();
    renderProgress();renderToday();renderAllStats();renderDetail();tick();
  }
  function showView(anim){
    var on;
    if(tab==="progress")on=(detail&&CI>=0)?["detailBar","view-"+sub]:["view-progress"];
    else on={today:["view-today"],stats:["view-allstats"],settings:["view-settings"],help:["view-help"]}[tab]||["view-progress"];
    var wasHelp=helpActive;helpActive=(tab==="help");
    if(wasHelp&&!helpActive){breathStop();stopTimer();resetRate();}
    $("navPanic").setAttribute("aria-pressed",helpActive);
    ALLV.forEach(function(id){$(id).hidden=on.indexOf(id)<0;});
    document.querySelectorAll("[data-tab]").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.tab===tab);});
    document.querySelectorAll("#subtabs button").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.sub===sub);});
    if(anim){var v=$(on[on.length-1]);v.classList.remove("fade");void v.offsetWidth;v.classList.add("fade");}
    if(on.indexOf("view-stats")>=0){var hw=$("heatwrap");hw.scrollLeft=hw.scrollWidth;}
  }
  function toLocalInput(ms){var d=new Date(ms);return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());}
  function removeItem(i){
    pushItem();var id=ITEMS[i].id,curId=CI>=0?ITEMS[CI].id:null;ITEMS.splice(i,1);
    if(!ITEMS.length){CI=-1;Object.assign(state,{log:{},reasons:"",picked:[],slips:{},urges:{},urgeLog:[],recovery:{},ach:{},helped:0,rode:0,focus:"general"});detail=false;}
    else{var n=0;ITEMS.forEach(function(x,j){if(x.id===curId)n=j;});if(curId===id)n=Math.min(i,ITEMS.length-1);CI=n;pullItem();}
    save();var w=announce;announce=false;render();announce=w;if(!ITEMS.length||curId===id)detail=false;showView();
  }
  function openForm(i){
    var edit=i!=null&&i>=0,it=edit?ITEMS[i]:null,type=edit?(it.focus||"general"):"general";
    openX(edit?"Edit addiction":"Add an addiction",edit?"":"Pick one or name your own. Each one is tracked on its own.",function(b){
      var nm=document.createElement("input");nm.type="text";nm.maxLength=40;nm.value=edit?it.name:"";nm.id="fName";
      if(!edit){
        var chips=mk("div","chips");
        FOCUS.forEach(function(f){
          var c=mk("button","chip",f.id==="general"?"Something else":f.name);c.type="button";c.setAttribute("aria-pressed",f.id===type);
          c.onclick=function(){type=f.id;Array.prototype.forEach.call(chips.children,function(x){x.setAttribute("aria-pressed",x===c);});nm.value=f.id==="general"?"":f.name;nm.focus();};
          chips.appendChild(c);
        });
        b.appendChild(chips);
      }
      var l1=mk("label","fld","Name");l1.appendChild(nm);b.appendChild(l1);
      var dt=document.createElement("input");dt.type="datetime-local";dt.value=toLocalInput(edit?it.start:Date.now());dt.max=toLocalInput(Date.now());
      var l2=mk("label","fld","Sober since (date and time)");l2.appendChild(dt);b.appendChild(l2);
      b.appendChild(mk("p","lbl","Starting in the past counts the days since then as clean. You can fix any day later.")).style.marginTop="10px";
      var r=xrow();
      r.appendChild(btn(edit?"Save":"Add","clean",function(){
        var name=nm.value.trim().slice(0,40),ms=new Date(dt.value).getTime();
        if(!name){toast("Give it a name.");return;}
        if(!(ms>0)||ms>Date.now()+60000){toast("Pick a start that isn't in the future.");return;}
        if(edit){var old=+it.start;it.name=name;it.start=ms;if(ms<old)fillClean(it,ms);recomputeSince(it);save();closeX();renderAll();toast("Saved.");}
        else{var n=freshItem(name,type,ms);fillClean(n,ms);recomputeSince(n);pushItem();ITEMS.push(n);closeX();openDetail(ITEMS.length-1);save();toast("Added "+name+".");}
      }));
      if(edit)r.appendChild(btn("Remove","ghost",function(){ask("Remove "+it.name+" and everything tracked for it? This can't be undone.","Remove",true,function(){closeX();removeItem(i);});}));
      r.appendChild(btn("Cancel","ghost",closeX));b.appendChild(r);
      setTimeout(function(){nm.focus();},30);
    });
  }
  /* the help button asks which addiction the urge is about */
  var panicGo=$("panic").onclick;
  $("panic").onclick=function(){
    if(ITEMS.length<2){panicGo();return;}
    openX("Which one is this urge about?","Pick one and you'll see its reasons and tips.",function(b){
      ITEMS.forEach(function(it,i){var r=xrow();r.appendChild(btn(it.name,i===CI?"clean":"ghost",function(){closeX();selectItem(i);panicGo();}));b.appendChild(r);});
    });
  };
  function bootItems(){
    $("pAdd").onclick=function(){openForm();};
    $("dBack").onclick=function(){detail=false;showView(true);scrollTop();};
    $("dEdit").onclick=function(){openForm(CI);};
    document.querySelectorAll("#subtabs button").forEach(function(b){b.onclick=function(){sub=b.dataset.sub;showView(true);scrollTop();};});
    document.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){var t=b.dataset.tab;if(t==="progress"&&tab==="progress"&&detail)detail=false;tab=t;showView(true);scrollTop();};});
    setInterval(function(){rollDay();tick();},1000);
  }
  /* Keep "today" correct when the app stays open (or is resumed) past midnight */
  function rollDay(){
    var nk=tk();if(nk===todayKey)return;
    var old=todayKey;todayKey=nk;
    if(sel===old)sel=nk;
    var od=parse(old);if(view.getFullYear()===od.getFullYear()&&view.getMonth()===od.getMonth()){view=new Date();view.setDate(1);}
    $("rFrom").max=$("rTo").max=nk;if($("rTo").value===old)$("rTo").value=nk;
    render();
  }
  checkReminder();

  bootItems();render();showView();announce=true;
  handleHash();window.addEventListener("hashchange",handleHash);
})();
