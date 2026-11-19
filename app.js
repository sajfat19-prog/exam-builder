(() => {
  const $ = id => document.getElementById(id);
  const defaults = {
    language:"ar", examTitle:"الامتحان الشهري", grade:"الخامس الإعدادي",
    subject:"اللغة الإنجليزية", duration:"ساعة ونصف", total:100,
    paperSize:"A4", fontFamily:"Tahoma, Arial, sans-serif", fontSize:14,
    theme:"blue", questions:[
      {id:1,text:"Answer the following questions:",branches:["","",""]}
    ]
  };
  let state = load() || structuredClone(defaults), undoStack=[], redoStack=[];
  let nextId = Math.max(0,...state.questions.map(q=>q.id))+1;
  const fields=["language","examTitle","grade","subject","duration","total","paperSize","fontFamily","fontSize","theme"];
  function load(){try{return JSON.parse(localStorage.getItem("warqati-project-state"))}catch{return null}}
  function snapshot(){undoStack.push(JSON.stringify(state));if(undoStack.length>60)undoStack.shift();redoStack=[]}
  function save(){localStorage.setItem("warqati-project-state",JSON.stringify(state));$("saveStatus").textContent="تم الحفظ تلقائياً"}
  function branchLetters(){return state.language==="ar"?["أ","ب","ج","د","هـ","و"]:["A","B","C","D","E","F"]}
  function render(){
    fields.forEach(k=>{const el=$(k);if(el)el.value=state[k]});
    const rtl=state.language==="ar", paper=$("paper");
    document.documentElement.lang=state.language;document.documentElement.dir=rtl?"rtl":"ltr";
    paper.dir=rtl?"rtl":"ltr";paper.style.fontFamily=state.fontFamily;paper.style.fontSize=Number(state.fontSize)+"px";
    paper.className="paper theme-"+state.theme;
    const sizes={A4:"210mm",A3:"297mm",Letter:"216mm"};paper.style.setProperty("--paper-width",sizes[state.paperSize]||"210mm");
    $("previewTitle").textContent=state.examTitle;$("examLabel").textContent=state.examTitle;
    $("previewGrade").textContent=state.grade;$("previewSubject").textContent=state.subject;
    $("previewDuration").textContent=state.duration;$("previewTotal").textContent=state.total;
    $("questions").innerHTML="";
    state.questions.forEach((q,index)=>{
      const section=document.createElement("section");section.className="question";
      const head=document.createElement("div");head.className="q-head";
      const num=document.createElement("span");num.className="q-number";num.textContent=(index+1)+".";
      const text=document.createElement("span");text.className="q-text";text.textContent=q.text;
      head.append(num,text);section.append(head);
      const actions=document.createElement("div");actions.className="q-actions";
      [["تعديل السؤال","edit"],["إضافة فرع","branch"],["حذف","delete"]].forEach(([label,action])=>{const b=document.createElement("button");b.textContent=label;b.onclick=()=>actQuestion(q.id,action);actions.append(b)});
      section.append(actions);
      if(q.branches.length){const ul=document.createElement("ul");ul.className="branch-list";q.branches.forEach((branch,i)=>{const li=document.createElement("li"),lab=document.createElement("span"),val=document.createElement("span");lab.className="branch-label";lab.textContent=branchLetters()[i]||String(i+1);val.className="branch-text";val.textContent=branch||"........................................................";li.append(lab,val);ul.append(li)});section.append(ul)}
      $("questions").append(section);
    });
  }
  function actQuestion(id,action){
    const q=state.questions.find(x=>x.id===id);if(!q)return;
    if(action==="delete"){snapshot();state.questions=state.questions.filter(x=>x.id!==id)}
    if(action==="edit"){const v=prompt("اكتب نص السؤال:",q.text);if(v===null)return;snapshot();q.text=v}
    if(action==="branch"){const v=prompt("اكتب نص الفرع:");if(v===null)return;snapshot();q.branches.push(v)}
    render();save();
  }
  fields.forEach(k=>$(k).addEventListener("change",e=>{snapshot();state[k]=e.target.value;render();save()}));
  $("addQuestion").onclick=()=>{snapshot();state.questions.push({id:nextId++,text:"اكتب نص السؤال هنا",branches:[]});render();save()};
  $("resetBtn").onclick=()=>{if(!confirm("هل تريد مسح جميع الأسئلة وإعادة الإعدادات؟"))return;snapshot();state=structuredClone(defaults);nextId=2;render();save()};
  $("undoBtn").onclick=()=>{if(!undoStack.length)return;redoStack.push(JSON.stringify(state));state=JSON.parse(undoStack.pop());render();save()};
  $("redoBtn").onclick=()=>{if(!redoStack.length)return;undoStack.push(JSON.stringify(state));state=JSON.parse(redoStack.pop());render();save()};
  $("printBtn").onclick=()=>window.print();
  render();
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
})();