import { useState } from "react";

const SCREENS = { HOME:"home", NEW_JOB:"new_job", JOB_TYPE:"job_type", ASSESSMENT:"assessment", SUMMARY:"summary", GALLERY:"gallery" };
const WALL_LABELS = ["A","B","C","D"];
const TAG_COLORS = { Kitchen:{bg:"rgba(29,78,216,0.2)",color:"#60a5fa"}, Bathroom:{bg:"rgba(20,184,166,0.2)",color:"#2dd4bf"}, Flooring:{bg:"rgba(168,85,247,0.2)",color:"#c084fc"}, Other:{bg:"rgba(245,158,11,0.2)",color:"#fbbf24"} };
const STATUS = { complete:{dot:"#22c55e",label:"Assessment complete"}, progress:{dot:"#f59e0b",label:"Estimate in progress"}, draft:{dot:"#475569",label:"Draft saved"} };
const JOBS = [
  {id:1,name:"Sarah Johnson",address:"142 Maple Drive, Princeton, NJ",date:"Today",types:["Kitchen","Flooring"],status:"complete"},
  {id:2,name:"Robert & Lisa Chen",address:"87 Oak Lane, Trenton, NJ",date:"Yesterday",types:["Kitchen","Bathroom"],status:"progress"},
  {id:3,name:"Michael Torres",address:"23 Pine Street, Hamilton, NJ",date:"Apr 18",types:["Bathroom"],status:"draft"},
];
const APPLIANCE_TYPES = ["Refrigerator","Range / Slide-in","Cooktop","Wall Oven","Dishwasher","Microwave (Over Range)","Microwave (Built-in)","Hood / Range Hood","Warming Drawer","Wine Fridge","Trash Compactor"];
const SPECIAL_NOTES = ["Pet in home","Access restrictions","Asbestos concern","Second floor job","Narrow doorways","HOA approval needed","Occupied during work","Fragile items present"];
const CABINET_STYLES = [
  {name:"Shaker",desc:"Clean lines, recessed center panel",swatch:"#e8ddd0",panel:"#d4c9bb",accent:"#60a5fa"},
  {name:"Raised Panel",desc:"Traditional elegance with raised detailing",swatch:"#ddd3c4",panel:"#c9bfb0",accent:"#2dd4bf"},
  {name:"Flat Panel / Slab",desc:"Modern, minimal, no frame or panel",swatch:"#d0ccc8",panel:"#bbb7b3",accent:"#c084fc"},
  {name:"Glass Front",desc:"Display-friendly, open and airy",swatch:"#c8dde8",panel:"rgba(180,215,235,0.5)",accent:"#34d399",glass:true},
];
const COLORS = [{name:"White",hex:"#f5f5f0"},{name:"Off-White",hex:"#ede8df"},{name:"Gray",hex:"#9ca3af"},{name:"Charcoal",hex:"#4b5563"},{name:"Navy",hex:"#1e3a5f"},{name:"Sage Green",hex:"#7d9b76"},{name:"Black",hex:"#1c1c1e"},{name:"Natural Wood",hex:"#c4956a"}];

// Brand colors from Maximus Construction LLC logo
const BRAND = {
  blue:"#1e3a8a",       // deep royal blue from logo
  blueMid:"#2952c4",    // mid blue
  blueBright:"#3b6cf0", // bright blue accents
  gold:"#f5c030",       // hard hat yellow/gold
  goldDark:"#d4a020",   // darker gold for hover
  dark:"#080f1e",       // near-black bg
  darkCard:"#0c1a35",   // card bg
  darkInput:"#060d1a",  // input bg
};

const S = {
  app:{background:BRAND.dark,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:"#e8eef8",display:"flex",flexDirection:"column"},
  card:{background:BRAND.darkCard,border:"1px solid rgba(59,100,246,0.22)",borderRadius:"12px"},
  input:{background:BRAND.darkInput,border:"1px solid rgba(59,130,246,0.22)",borderRadius:"8px",color:"#e8eef8",fontSize:"14px",padding:"9px 12px",width:"100%",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  // Brighter border for New Job customer info inputs
  inputBright:{background:BRAND.darkInput,border:`2px solid ${BRAND.blueBright}`,borderRadius:"8px",color:"#e8eef8",fontSize:"14px",padding:"9px 12px",width:"100%",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  label:{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:BRAND.blueBright,fontWeight:500},
  primaryBtn:{background:BRAND.blue,color:"white",border:"none",borderRadius:"12px",padding:"14px 20px",fontSize:"15px",fontWeight:500,width:"100%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif"},
  ghostBtn:{background:"transparent",color:BRAND.blueBright,border:`1px solid rgba(59,100,246,0.4)`,borderRadius:"12px",padding:"12px 20px",fontSize:"14px",fontWeight:500,width:"100%",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  smallBtn:{background:"rgba(59,100,246,0.14)",color:BRAND.blueBright,border:"1px solid rgba(59,100,246,0.3)",borderRadius:"20px",padding:"4px 12px",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  secHead:{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:BRAND.gold,fontWeight:600,marginTop:"20px",marginBottom:"12px",paddingBottom:"6px",borderBottom:`1px solid rgba(245,192,48,0.2)`},
};

// ── Shared primitives ──────────────────────────────────────────────────────────
function Toggle({on,onToggle}){
  return <div onClick={onToggle} style={{width:"44px",height:"24px",borderRadius:"12px",background:on?"#1d4ed8":"#1e2d4a",border:"1px solid rgba(59,130,246,0.3)",position:"relative",cursor:"pointer",flexShrink:0}}><div style={{width:"16px",height:"16px",borderRadius:"50%",background:"white",position:"absolute",top:"3px",left:on?"23px":"3px",transition:"left 0.2s"}}/></div>;
}
function SecHead({title}){return <div style={S.secHead}>{title}</div>;}

function CollapseSection({title,children,defaultOpen=true,accent=false}){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{marginBottom:"12px"}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:accent?"rgba(29,78,216,0.15)":"#0d1f3c",border:`1px solid ${accent?"rgba(59,130,246,0.4)":"rgba(59,130,246,0.18)"}`,borderRadius:open?"12px 12px 0 0":"12px",cursor:"pointer",userSelect:"none"}}>
        <span style={{fontSize:"14px",fontWeight:500,color:"#e8eef8"}}>{title}</span>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#60a5fa" style={{transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}><path d="M7 10l5 5 5-5z"/></svg>
        </div>
      </div>
      {open&&<div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.18)",borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px"}}>{children}</div>}
    </div>
  );
}
function MeasInput({label,value,onChange}){
  const [unit,setUnit]=useState('"');
  const handleBlur=(e)=>{
    if(!onChange)return;
    let v=e.target.value.trim();
    if(v==="")return;
    v=v.replace(/['"]/g,"").trim();
    if(v!=="")onChange(v+unit);
  };
  const handleUnitChange=(e)=>{
    setUnit(e.target.value);
    if(!onChange||!value)return;
    let v=value.replace(/['"]/g,"").trim();
    if(v!=="")onChange(v+e.target.value);
  };
  return(
    <div style={{marginBottom:"12px"}}>
      <div style={{fontSize:"11px",color:"#60829e",marginBottom:"2px"}}>{label}</div>
      <div style={{fontSize:"10px",color:"#4a6fa5",marginBottom:"5px",fontStyle:"italic"}}>Enter measurement — select unit on the right</div>
      <div style={{display:"flex",gap:"0",alignItems:"center"}}>
        <input style={{...S.input,fontSize:"13px",padding:"8px 10px",borderRadius:"8px 0 0 8px",borderRight:"none"}} placeholder="e.g. 96" value={(value||"").replace(/['"]/g,"")} onChange={e=>onChange&&onChange(e.target.value)} onBlur={handleBlur} inputMode="decimal"/>
        <select value={unit} onChange={handleUnitChange} style={{background:"#1a3050",border:"1px solid rgba(59,130,246,0.22)",borderLeft:"1px solid rgba(59,130,246,0.4)",borderRadius:"0 8px 8px 0",color:"#60a5fa",fontSize:"14px",fontWeight:600,padding:"8px 6px",cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif",minWidth:"42px"}}>
          <option value='"'>″</option>
          <option value={"'"}>′</option>
        </select>
      </div>
    </div>
  );
}
function CheckOpt({label,selected,onToggle,round=false}){
  return <div onClick={onToggle} style={{...S.card,padding:"11px 14px",marginBottom:"8px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",background:selected?"rgba(29,78,216,0.18)":"#0d1f3c",borderColor:selected?"#3b82f6":"rgba(59,130,246,0.18)"}}><div style={{width:"19px",height:"19px",borderRadius:round?"50%":"4px",border:`1.5px solid ${selected?"#3b82f6":"rgba(59,130,246,0.35)"}`,background:selected?"#1d4ed8":"rgba(59,130,246,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{selected&&<svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}</div><span style={{fontSize:"13px",color:selected?"#e8eef8":"#93b4d8"}}>{label}</span></div>;
}

// ── Photo item (standalone, not nested) ───────────────────────────────────────
function PhotoItem({label,note,hasPic,onToggle}){
  return (
    <div style={{...S.card,padding:"13px",marginBottom:"9px",display:"flex",alignItems:"center",gap:"12px"}}>
      <div onClick={onToggle} style={{width:"52px",height:"52px",borderRadius:"10px",background:hasPic?"rgba(34,197,94,0.15)":"rgba(59,130,246,0.08)",border:hasPic?"1px solid rgba(34,197,94,0.4)":"1px dashed rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
        {hasPic?<svg width="22" height="22" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>:<svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12z"/></svg>}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:"13px",color:hasPic?"#e8eef8":"#93b4d8",fontWeight:hasPic?500:400}}>{label}</div>
        {note&&<div style={{fontSize:"11px",color:"#4a6fa5",marginTop:"2px"}}>{note}</div>}
        {hasPic&&<div style={{fontSize:"11px",color:"#22c55e",marginTop:"2px"}}>✓ Photo captured</div>}
      </div>
      <button onClick={onToggle} style={{padding:"6px 12px",borderRadius:"20px",border:`1px solid ${hasPic?"rgba(34,197,94,0.35)":"rgba(59,130,246,0.25)"}`,background:hasPic?"rgba(34,197,94,0.12)":"rgba(59,130,246,0.1)",color:hasPic?"#22c55e":"#60a5fa",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
        {hasPic?"Retake":"📷 Take"}
      </button>
    </div>
  );
}

// ── Window card ───────────────────────────────────────────────────────────────
function WindowCard({win,index,onUpdate,onRemove}){
  const [open,setOpen]=useState(true);
  const u=(f,v)=>onUpdate({...win,[f]:v});
  return(
    <div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?"12px":0}}>
        <span style={{fontSize:"13px",color:"#93b4d8",fontWeight:500}}>Window {index+1}</span>
        <div style={{display:"flex",gap:"6px"}}>
          <button style={S.smallBtn} onClick={()=>setOpen(!open)}>{open?"▲":"▼"}</button>
          <button style={{...S.smallBtn,color:"#f87171",borderColor:"rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.08)"}} onClick={onRemove}>✕</button>
        </div>
      </div>
      {open&&<>
        <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",marginBottom:"8px"}}>INTERIOR</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {[["Width","width"],["Height","height"],["Left Corner","leftCorner"],["Right Corner","rightCorner"]].map(([l,k])=>(
            <div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={win[k]||""} onChange={e=>u(k,e.target.value)}/></div>
          ))}
        </div>
        <div style={{marginTop:"8px"}}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>Sill Ht. from Countertop</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={win.sillHeight||""} onChange={e=>u("sillHeight",e.target.value)}/></div>
        <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",margin:"10px 0 8px"}}>TRIM</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {[["Left","trimLeft"],["Right","trimRight"],["Top","trimTop"],["Bottom","trimBottom"]].map(([l,k])=>(
            <div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={win[k]||""} onChange={e=>u(k,e.target.value)}/></div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Door card ─────────────────────────────────────────────────────────────────
function DoorCard({door,index,onUpdate,onRemove}){
  const [open,setOpen]=useState(true);
  const u=(f,v)=>onUpdate({...door,[f]:v});
  return(
    <div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:open?"12px":0}}>
        <span style={{fontSize:"13px",color:"#93b4d8",fontWeight:500}}>Entry {index+1}</span>
        <div style={{display:"flex",gap:"6px"}}>
          <button style={S.smallBtn} onClick={()=>setOpen(!open)}>{open?"▲":"▼"}</button>
          <button style={{...S.smallBtn,color:"#f87171",borderColor:"rgba(248,113,113,0.3)",background:"rgba(248,113,113,0.08)"}} onClick={onRemove}>✕</button>
        </div>
      </div>
      {open&&<>
        <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>
          {["Door","Opening"].map(t=><button key={t} onClick={()=>u("type",t)} style={{flex:1,padding:"7px",borderRadius:"8px",border:`1px solid ${door.type===t?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:door.type===t?"rgba(29,78,216,0.25)":"#0a1628",color:door.type===t?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
          {[["Width","width"],["Height","height"],["Left Corner","leftCorner"],["Right Corner","rightCorner"]].map(([l,k])=>(
            <div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={door[k]||""} onChange={e=>u(k,e.target.value)}/></div>
          ))}
        </div>
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Swing Direction</div>
        <div style={{display:"flex",gap:"6px"}}>
          {["Left","Right","Both","N/A"].map(d=><button key={d} onClick={()=>u("swing",d)} style={{flex:1,padding:"6px 4px",borderRadius:"20px",border:`1px solid ${door.swing===d?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:door.swing===d?"rgba(29,78,216,0.25)":"#0a1628",color:door.swing===d?"#60a5fa":"#60829e",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{d}</button>)}
        </div>
      </>}
    </div>
  );
}

// ── Outlet row ────────────────────────────────────────────────────────────────
function OutletRow({outlet,onUpdate,onRemove}){
  const u=(f,v)=>onUpdate({...outlet,[f]:v});
  return(
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
      <div style={{display:"flex",gap:"4px"}}>
        {["Outlet","Switch"].map(t=><button key={t} onClick={()=>u("type",t)} style={{padding:"5px 9px",borderRadius:"20px",border:`1px solid ${outlet.type===t?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:outlet.type===t?"rgba(29,78,216,0.25)":"#071526",color:outlet.type===t?"#60a5fa":"#60829e",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{t}</button>)}
      </div>
      <input style={{...S.input,fontSize:"12px",padding:"7px 10px",flex:1}} placeholder='Distance from corner (")' value={outlet.location||""} onChange={e=>u("location",e.target.value)}/>
      <button onClick={onRemove} style={{color:"#f87171",fontSize:"18px",background:"none",border:"none",cursor:"pointer",padding:"0 2px",lineHeight:1}}>×</button>
    </div>
  );
}

// ── Wall section ──────────────────────────────────────────────────────────────
function WallSection({wall,data,onUpdate,globalHasSoffit,soffitSame}){
  const [open,setOpen]=useState(true);
  const [renaming,setRenaming]=useState(false);
  const u=(f,v)=>onUpdate({...data,[f]:v});
  const addWin=()=>onUpdate({...data,windows:[...(data.windows||[]),{}]});
  const addDoor=()=>onUpdate({...data,doors:[...(data.doors||[]),{type:"Door"}]});
  const addOutlet=()=>onUpdate({...data,outlets:[...(data.outlets||[]),{type:"Outlet"}]});
  const addAppliance=()=>onUpdate({...data,appliances:[...(data.appliances||[]),{name:""}]});
  const done=!!data.length;
  const appCount=(data.appliances||[]).filter(a=>a.name).length;
  const hasSink=data.hasSink;
  const displayName=data.name||`Wall ${wall}`;

  return(
    <div style={{marginBottom:"12px"}}>
      <div style={{...S.card,padding:"14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",flex:1,minWidth:0}}>
            <div style={{width:"32px",height:"32px",borderRadius:"8px",background:done?"rgba(34,197,94,0.12)":"rgba(59,100,246,0.1)",border:`1px solid ${done?"rgba(34,197,94,0.35)":"rgba(59,100,246,0.28)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {done?<svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>:<span style={{color:BRAND.blueBright,fontSize:"13px",fontWeight:600}}>{wall}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              {renaming
                ?<input autoFocus style={{...S.input,fontSize:"14px",padding:"5px 8px"}} value={data.name||""} placeholder={`e.g. Stove Wall, Sink Wall...`} onChange={e=>u("name",e.target.value)} onBlur={()=>setRenaming(false)} onKeyDown={e=>e.key==="Enter"&&setRenaming(false)}/>
                :<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                  <div style={{fontSize:"15px",fontWeight:500,color:"#e8eef8"}}>{displayName}</div>
                  <button onClick={e=>{e.stopPropagation();setRenaming(true);}} style={{background:"none",border:"none",cursor:"pointer",padding:"2px",color:"#4a6fa5",display:"flex",alignItems:"center"}} title="Rename wall">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </button>
                </div>
              }
              <div style={{fontSize:"11px",color:"#4a6fa5",marginTop:"1px"}}>{(data.windows||[]).length} win · {(data.doors||[]).length} door · {(data.outlets||[]).length} outlet · {appCount} appliance{hasSink?" · sink":""}</div>
            </div>
          </div>
          <button style={S.smallBtn} onClick={()=>setOpen(!open)}>{open?"▲":"▼"}</button>
        </div>
        {open&&<div style={{marginTop:"16px"}}>
          <MeasInput label="Wall Length" value={data.length} onChange={v=>u("length",v)}/>

          {/* Ceiling override */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:BRAND.dark,borderRadius:"8px",padding:"9px 12px",marginBottom:"8px"}}>
            <span style={{fontSize:"12px",color:"#60829e"}}>Override ceiling height?</span>
            <Toggle on={!!data.ceilOvr} onToggle={()=>u("ceilOvr",!data.ceilOvr)}/>
          </div>
          {data.ceilOvr&&<MeasInput label={`Ceiling Height — Wall ${wall}`} value={data.ceilH} onChange={v=>u("ceilH",v)}/>}

          {/* Soffit — show per-wall fields if soffit exists globally AND not same on all walls */}
          {globalHasSoffit&&!soffitSame&&(
            <div style={{background:"rgba(245,192,48,0.06)",border:"1px solid rgba(245,192,48,0.2)",borderRadius:"8px",padding:"10px 12px",marginBottom:"10px"}}>
              <div style={{fontSize:"11px",color:BRAND.gold,fontWeight:600,letterSpacing:"1px",marginBottom:"8px"}}>SOFFIT — WALL {wall}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                {[["Height","sH"],["Depth","sD"],["Width","sW"]].map(([l,k])=><div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={data[k]||""} onChange={e=>u(k,e.target.value)}/></div>)}
              </div>
            </div>
          )}

          {/* Windows */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px",marginTop:"4px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#60829e"}}>Windows</span>
              <button style={S.smallBtn} onClick={addWin}>+ Add Window</button>
            </div>
            {(data.windows||[]).map((w,i)=><WindowCard key={i} win={w} index={i} onUpdate={v=>{const a=[...(data.windows||[])];a[i]=v;onUpdate({...data,windows:a});}} onRemove={()=>onUpdate({...data,windows:(data.windows||[]).filter((_,x)=>x!==i)})}/>)}
          </div>

          {/* Doors */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#60829e"}}>Doors / Openings</span>
              <button style={S.smallBtn} onClick={addDoor}>+ Add Door</button>
            </div>
            {(data.doors||[]).map((d,i)=><DoorCard key={i} door={d} index={i} onUpdate={v=>{const a=[...(data.doors||[])];a[i]=v;onUpdate({...data,doors:a});}} onRemove={()=>onUpdate({...data,doors:(data.doors||[]).filter((_,x)=>x!==i)})}/>)}
          </div>

          {/* Outlets */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#60829e"}}>Outlets & Switches</span>
              <button style={S.smallBtn} onClick={addOutlet}>+ Add</button>
            </div>
            {(data.outlets||[]).map((o,i)=><OutletRow key={i} outlet={o} onUpdate={v=>{const a=[...(data.outlets||[])];a[i]=v;onUpdate({...data,outlets:a});}} onRemove={()=>onUpdate({...data,outlets:(data.outlets||[]).filter((_,x)=>x!==i)})}/>)}
          </div>

          {/* Appliances on this wall */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#60829e"}}>Appliances on this wall</span>
              <button style={S.smallBtn} onClick={addAppliance}>+ Add</button>
            </div>
            {(data.appliances||[]).map((app,i)=>(
              <div key={i} style={{background:BRAND.dark,border:"1px solid rgba(59,100,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                  <select value={app.name||""} onChange={e=>{const a=[...(data.appliances||[])];a[i]={...app,name:e.target.value};onUpdate({...data,appliances:a});}} style={{...S.input,fontSize:"12px",padding:"7px 10px",flex:1,marginRight:"8px"}}>
                    <option value="">Select appliance...</option>
                    {APPLIANCE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={()=>onUpdate({...data,appliances:(data.appliances||[]).filter((_,x)=>x!==i)})} style={{color:"#f87171",fontSize:"18px",background:"none",border:"none",cursor:"pointer",padding:"0 4px",lineHeight:1}}>×</button>
                </div>
                {app.name&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"8px"}}>
                  {[["Width","w"],["Height","h"],["Depth","d"]].map(([l,f])=><div key={f}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={app[f]||""} onChange={e=>{const a=[...(data.appliances||[])];a[i]={...app,[f]:e.target.value};onUpdate({...data,appliances:a});}}/></div>)}
                </div>}
                {app.name&&<div><div style={{fontSize:"10px",color:"#60829e",marginBottom:"4px"}}>Location from nearest corner</div><input style={{...S.input,fontSize:"12px",padding:"7px 10px"}} placeholder='0"' value={app.loc||""} onChange={e=>{const a=[...(data.appliances||[])];a[i]={...app,loc:e.target.value};onUpdate({...data,appliances:a});}}/></div>}
              </div>
            ))}
          </div>

          {/* Plumbing / Sink on this wall */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
              <span style={{fontSize:"12px",color:"#60829e"}}>Sink / Plumbing on this wall?</span>
              <Toggle on={!!data.hasSink} onToggle={()=>u("hasSink",!data.hasSink)}/>
            </div>
            {data.hasSink&&<div style={{background:"rgba(29,78,216,0.08)",border:"1px solid rgba(59,100,246,0.2)",borderRadius:"10px",padding:"12px"}}>
              {[["Sink Location from Corner","sinkLoc"],["Sink Width","sinkW"],["Sink Depth","sinkD"],["Faucet Location","faucetLoc"],["Dishwasher Water Line","dwLine"],["Ice Maker Line","imLine"]].map(([l,k])=><MeasInput key={k} label={l} value={data[k]} onChange={v=>u(k,v)}/>)}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:BRAND.dark,borderRadius:"8px",padding:"9px 12px"}}>
                <span style={{fontSize:"13px",color:"#93b4d8"}}>Garbage Disposal?</span>
                <Toggle on={data.disposal} onToggle={()=>u("disposal",!data.disposal)}/>
              </div>
            </div>}
          </div>

          {/* Cabinet layout notes */}
          <div style={{borderTop:"1px solid rgba(59,100,246,0.12)",paddingTop:"12px"}}>
            <div style={{fontSize:"12px",color:"#60829e",marginBottom:"6px"}}>Cabinet layout notes</div>
            <textarea style={{...S.input,minHeight:"50px",resize:"vertical",fontSize:"12px"}} placeholder="Describe cabinet layout on this wall..." value={data.cabinetNotes||""} onChange={e=>u("cabinetNotes",e.target.value)}/>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ── Measurements tab ──────────────────────────────────────────────────────────
function MeasurementsTab({kd,onUpdate}){
  const u=(f,v)=>onUpdate({...kd,[f]:v});
  const uw=(wall,val)=>onUpdate({...kd,walls:{...kd.walls,[wall]:val}});
  return(
    <div style={{padding:"16px 20px 28px"}}>
      <CollapseSection title="🌐 Room Globals" accent={true}>
        <MeasInput label="Overall Ceiling Height" value={kd.ceilingHeight} onChange={v=>u("ceilingHeight",v)}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a1628",borderRadius:"8px",padding:"10px 12px",marginBottom:"8px"}}>
          <span style={{fontSize:"14px",color:"#93b4d8"}}>Soffit Present?</span>
          <Toggle on={kd.hasSoffit} onToggle={()=>u("hasSoffit",!kd.hasSoffit)}/>
        </div>
        {kd.hasSoffit&&<div style={{background:"#0a1628",borderRadius:"10px",padding:"12px",marginTop:"4px"}}>
          <div style={{fontSize:"11px",color:"#60829e",marginBottom:"8px"}}>Global soffit dimensions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"10px"}}>
            {[["Height","soffitH"],["Depth","soffitD"],["Width","soffitW"]].map(([l,k])=><div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={kd[k]||""} onChange={e=>u(k,e.target.value)}/></div>)}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"12px",color:"#60829e"}}>Same on all walls?</span>
            <Toggle on={kd.soffitSame} onToggle={()=>u("soffitSame",!kd.soffitSame)}/>
          </div>
        </div>}
      </CollapseSection>

      <CollapseSection title="📏 Walls" accent={true}>
        <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"12px"}}>Tap the pencil icon to rename a wall. Tap ▲▼ to expand or collapse.</div>
        {WALL_LABELS.map(w=><WallSection key={w} wall={w} data={kd.walls?.[w]||{}} onUpdate={v=>uw(w,v)} globalHasSoffit={kd.hasSoffit} soffitSame={kd.soffitSame}/>)}
      </CollapseSection>

      <CollapseSection title="🍳 Appliances" defaultOpen={false}>
        <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"8px"}}>Appliances are added per wall. Expand a wall above and use the Appliances section inside it.</div>
      </CollapseSection>

      <CollapseSection title="🚰 Plumbing" defaultOpen={false}>
        <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"8px"}}>Plumbing is captured per wall. Expand a wall above and use the Sink / Plumbing section inside it.</div>
      </CollapseSection>

      <CollapseSection title="🏝️ Island" defaultOpen={false}>
      {kd.hasIsland?<div>
        <div style={{...S.secHead,marginTop:0,marginBottom:"12px"}}>Island Details</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"12px"}}>
          {[["Length","iLen"],["Width","iW"]].map(([l,k])=><div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"13px",padding:"8px 10px"}} placeholder='0"' value={kd[k]||""} onChange={e=>u(k,e.target.value)}/></div>)}
        </div>
        <MeasInput label="Cabinet Length" value={kd.iCabLen} onChange={v=>u("iCabLen",v)}/>
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Distance from walls (all 4 sides)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"12px"}}>
          {[["Front","iDF"],["Back","iDB"],["Left","iDL"],["Right","iDR"]].map(([l,k])=><div key={k}><div style={{fontSize:"10px",color:"#60829e",marginBottom:"3px"}}>{l}</div><input style={{...S.input,fontSize:"12px",padding:"7px 8px"}} placeholder='0"' value={kd[k]||""} onChange={e=>u(k,e.target.value)}/></div>)}
        </div>
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Countertop overhang — select sides and enter depth for each</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"12px"}}>
          {["Front","Back","Left","Right"].map(s=>{
            const sel=(kd.iOvhgSides||[]).includes(s);
            return(
              <div key={s} style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <button onClick={()=>u("iOvhgSides",sel?(kd.iOvhgSides||[]).filter(x=>x!==s):[...(kd.iOvhgSides||[]),s])} style={{width:"80px",padding:"6px 10px",borderRadius:"20px",border:`1px solid ${sel?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:sel?"rgba(29,78,216,0.25)":"#071526",color:sel?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0,textAlign:"center"}}>{sel?"✓ "+s:s}</button>
                {sel&&<div style={{display:"flex",gap:"0",alignItems:"center",flex:1}}>
                  <input style={{...S.input,fontSize:"12px",padding:"7px 10px",borderRadius:"8px 0 0 8px",borderRight:"none"}} placeholder="Depth" value={(kd[`iOvhg_${s}`]||"").replace(/['"]/g,"")} onChange={e=>u(`iOvhg_${s}`,e.target.value)} onBlur={e=>{let v=e.target.value.trim().replace(/['"]/g,"");if(v)u(`iOvhg_${s}`,v+'"');}} inputMode="decimal"/>
                  <span style={{background:"#1a3050",border:"1px solid rgba(59,130,246,0.22)",borderLeft:"1px solid rgba(59,130,246,0.4)",borderRadius:"0 8px 8px 0",color:"#60a5fa",fontSize:"13px",fontWeight:600,padding:"7px 8px",whiteSpace:"nowrap"}}>″</span>
                </div>}
              </div>
            );
          })}
        </div>
        {/* Island Sink */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8"}}>Has Sink?</span>
          <Toggle on={kd.iSink} onToggle={()=>u("iSink",!kd.iSink)}/>
        </div>
        {kd.iSink&&<div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
          <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",marginBottom:"10px"}}>SINK DETAILS</div>
          <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Sink Type</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
            {["Undermount","Apron Front","Other"].map(t=><button key={t} onClick={()=>u("iSinkType",t)} style={{padding:"6px 12px",borderRadius:"20px",border:`1px solid ${kd.iSinkType===t?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:kd.iSinkType===t?"rgba(29,78,216,0.25)":"#0a1628",color:kd.iSinkType===t?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>)}
          </div>
          {kd.iSinkType==="Other"&&<input style={{...S.input,fontSize:"12px",padding:"7px 10px",marginBottom:"10px"}} placeholder="Describe sink type..." value={kd.iSinkTypeOther||""} onChange={e=>u("iSinkTypeOther",e.target.value)}/>}
          <MeasInput label="Distance from Left Edge" value={kd.iSinkLeft} onChange={v=>u("iSinkLeft",v)}/>
          <MeasInput label="Distance from Right Edge" value={kd.iSinkRight} onChange={v=>u("iSinkRight",v)}/>
        </div>}

        {/* Island Cooktop */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8"}}>Has Cooktop?</span>
          <Toggle on={kd.iCooktop} onToggle={()=>u("iCooktop",!kd.iCooktop)}/>
        </div>
        {kd.iCooktop&&<div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
          <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",marginBottom:"10px"}}>COOKTOP DETAILS</div>
          <MeasInput label="Cooktop Length" value={kd.iCooktopLen} onChange={v=>u("iCooktopLen",v)}/>
          <MeasInput label="Cooktop Width" value={kd.iCooktopW} onChange={v=>u("iCooktopW",v)}/>
          <MeasInput label="Distance from Left Edge" value={kd.iCooktopLeft} onChange={v=>u("iCooktopLeft",v)}/>
          <MeasInput label="Distance from Right Edge" value={kd.iCooktopRight} onChange={v=>u("iCooktopRight",v)}/>
        </div>}

        {/* Island Outlets */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8"}}>Has Outlet(s)?</span>
          <Toggle on={kd.iOutlet} onToggle={()=>u("iOutlet",!kd.iOutlet)}/>
        </div>
        {kd.iOutlet&&<div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
          <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",marginBottom:"10px"}}>OUTLET DETAILS</div>
          <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Which side(s) of the island have outlets?</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px"}}>
            {["Front","Back","Left","Right"].map(s=>{const sel=(kd.iOutletSides||[]).includes(s);return <button key={s} onClick={()=>u("iOutletSides",sel?(kd.iOutletSides||[]).filter(x=>x!==s):[...(kd.iOutletSides||[]),s])} style={{padding:"6px 14px",borderRadius:"20px",border:`1px solid ${sel?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:sel?"rgba(29,78,216,0.25)":"#0a1628",color:sel?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{sel?"✓ "+s:s}</button>;})}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"13px",color:"#93b4d8"}}>Outlets in countertop?</span>
            <Toggle on={kd.iOutletCountertop} onToggle={()=>u("iOutletCountertop",!kd.iOutletCountertop)}/>
          </div>
          {kd.iOutletCountertop&&<input style={{...S.input,fontSize:"12px",padding:"7px 10px",marginTop:"8px"}} placeholder="Describe countertop outlet location..." value={kd.iOutletCountertopNotes||""} onChange={e=>u("iOutletCountertopNotes",e.target.value)}/>}
        </div>}
        {/* Island Levels */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px",marginTop:"4px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8"}}>Has Additional Level(s)?</span>
          <Toggle on={kd.iHasLevels} onToggle={()=>u("iHasLevels",!kd.iHasLevels)}/>
        </div>
        {kd.iHasLevels&&<div style={{background:"#071526",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
          <div style={{fontSize:"10px",color:"#3b82f6",fontWeight:500,letterSpacing:"1.5px",marginBottom:"10px"}}>LEVEL DETAILS</div>
          <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Level Type</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px"}}>
            {["Lower — Desk / Prep","Higher — Bar Stools","Both"].map(t=><button key={t} onClick={()=>u("iLevelType",t)} style={{padding:"6px 12px",borderRadius:"20px",border:`1px solid ${kd.iLevelType===t?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:kd.iLevelType===t?"rgba(29,78,216,0.25)":"#0a1628",color:kd.iLevelType===t?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>)}
          </div>
          {(kd.iLevelType==="Lower — Desk / Prep"||kd.iLevelType==="Both")&&<>
            <div style={{fontSize:"10px",color:"#60829e",fontWeight:500,marginBottom:"8px",marginTop:"4px"}}>Lower Level (Desk / Prep)</div>
            <MeasInput label="Height" value={kd.iLevelLowH} onChange={v=>u("iLevelLowH",v)}/>
            <MeasInput label="Length" value={kd.iLevelLowLen} onChange={v=>u("iLevelLowLen",v)}/>
            <MeasInput label="Width" value={kd.iLevelLowW} onChange={v=>u("iLevelLowW",v)}/>
          </>}
          {(kd.iLevelType==="Higher — Bar Stools"||kd.iLevelType==="Both")&&<>
            <div style={{fontSize:"10px",color:"#60829e",fontWeight:500,marginBottom:"8px",marginTop:"4px"}}>Higher Level (Bar Stools)</div>
            <MeasInput label="Height" value={kd.iLevelHighH} onChange={v=>u("iLevelHighH",v)}/>
            <MeasInput label="Length" value={kd.iLevelHighLen} onChange={v=>u("iLevelHighLen",v)}/>
            <MeasInput label="Width" value={kd.iLevelHighW} onChange={v=>u("iLevelHighW",v)}/>
          </>}
        </div>}

        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px",marginTop:"4px"}}>Existing or New?</div>
        <div style={{display:"flex",gap:"8px"}}>
          {["Existing","New"].map(o=><button key={o} onClick={()=>u("iStatus",o)} style={{flex:1,padding:"8px",borderRadius:"8px",border:`1px solid ${kd.iStatus===o?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:kd.iStatus===o?"rgba(29,78,216,0.25)":"#071526",color:kd.iStatus===o?"#60a5fa":"#60829e",fontSize:"13px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{o}</button>)}
        </div>
      </div>}
      </div>:<div style={{...S.card,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"14px",color:"#93b4d8"}}>Island not enabled</span>
        <button onClick={()=>onUpdate({...kd,hasIsland:true})} style={{...S.smallBtn}}>Enable Island</button>
      </div>}
      </CollapseSection>

      <CollapseSection title="🗄️ Existing Cabinets" defaultOpen={false}>
      {kd.hasCabinets?<div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{...S.secHead,marginTop:0,marginBottom:"12px"}}>Existing Cabinets</div>
        {[["Upper Height","ecUH"],["Upper Depth","ecUD"],["Tall/Pantry Height","ecTH"],["Tall/Pantry Depth","ecTD"]].map(([l,k])=><MeasInput key={k} label={l} value={kd[k]} onChange={v=>u(k,v)}/>)}
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Walls with upper cabinets</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"10px"}}>{WALL_LABELS.map(w=>{const sel=(kd.ecUpper||[]).includes(w);return <button key={w} onClick={()=>u("ecUpper",sel?(kd.ecUpper||[]).filter(x=>x!==w):[...(kd.ecUpper||[]),w])} style={{flex:1,padding:"7px",borderRadius:"6px",border:`1px solid ${sel?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:sel?"rgba(29,78,216,0.3)":"#071526",color:sel?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Wall {w}</button>;})}</div>
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Walls with base cabinets</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>{WALL_LABELS.map(w=>{const sel=(kd.ecBase||[]).includes(w);return <button key={w} onClick={()=>u("ecBase",sel?(kd.ecBase||[]).filter(x=>x!==w):[...(kd.ecBase||[]),w])} style={{flex:1,padding:"7px",borderRadius:"6px",border:`1px solid ${sel?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:sel?"rgba(29,78,216,0.3)":"#071526",color:sel?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Wall {w}</button>;})}</div>
        <textarea style={{...S.input,minHeight:"56px",resize:"vertical",fontSize:"12px"}} placeholder="General cabinet notes..." value={kd.ecNotes||""} onChange={e=>u("ecNotes",e.target.value)}/>
      </div>:<div style={{...S.card,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"14px",color:"#93b4d8"}}>Existing cabinets not enabled</span>
        <button onClick={()=>onUpdate({...kd,hasCabinets:true})} style={{...S.smallBtn}}>Enable</button>
      </div>}
      </CollapseSection>

      <CollapseSection title="🖥️ Desk" defaultOpen={false}>
      {kd.hasDesk?<div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{...S.secHead,marginTop:0,marginBottom:"12px"}}>Desk Details</div>
        {[["Desk Width","deskW"],["Desk Height","deskH"],["Location from Corner","deskLoc"]].map(([l,k])=><MeasInput key={k} label={l} value={kd[k]} onChange={v=>u(k,v)}/>)}
        <div style={{fontSize:"10px",color:"#60829e",marginBottom:"6px"}}>Which wall?</div>
        <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>{WALL_LABELS.map(w=><button key={w} onClick={()=>u("deskWall",w)} style={{flex:1,padding:"7px",borderRadius:"6px",border:`1px solid ${kd.deskWall===w?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:kd.deskWall===w?"rgba(29,78,216,0.3)":"#071526",color:kd.deskWall===w?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Wall {w}</button>)}</div>
        {[["Upper Cabinets Above?","deskUpper"],["Base Cabinets / Drawers Below?","deskBase"]].map(([l,k])=>(
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
            <span style={{fontSize:"13px",color:"#93b4d8"}}>{l}</span>
            <Toggle on={kd[k]} onToggle={()=>u(k,!kd[k])}/>
          </div>
        ))}
        <textarea style={{...S.input,minHeight:"50px",resize:"vertical",fontSize:"12px"}} placeholder="Desk notes..." value={kd.deskNotes||""} onChange={e=>u("deskNotes",e.target.value)}/>
      </div>:<div style={{...S.card,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:"14px",color:"#93b4d8"}}>Desk not enabled</span>
        <button onClick={()=>onUpdate({...kd,hasDesk:true})} style={{...S.smallBtn}}>Enable Desk</button>
      </div>}
      </CollapseSection>
    </div>
  );
}

// ── Questions tab ─────────────────────────────────────────────────────────────
function QuestionsTab({qd,onUpdate}){
  const [showGallery,setShowGallery]=useState(false);
  const u=(f,v)=>onUpdate({...qd,[f]:v});
  const toggle=(field,val)=>{const c=qd[field]||[];u(field,c.includes(val)?c.filter(x=>x!==val):[...c,val]);};
  const isSel=(field,val)=>(qd[field]||[]).includes(val);

  if(showGallery) return(
    <div style={{padding:"16px 20px 28px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
        <button onClick={()=>setShowGallery(false)} style={{...S.smallBtn,padding:"6px 14px"}}>← Back</button>
        <span style={{fontSize:"15px",fontWeight:500,color:"#e8eef8"}}>Cabinet Style Gallery</span>
      </div>
      {CABINET_STYLES.map(style=>{
        const sel=qd.cabinetStyle===style.name;
        return(
          <div key={style.name} style={{...S.card,marginBottom:"14px",overflow:"hidden",borderColor:sel?style.accent:"rgba(59,130,246,0.18)"}}>
            <div style={{height:"110px",background:style.swatch,display:"flex",alignItems:"center",justifyContent:"center",gap:"12px"}}>
              {[1,2,3].map(i=><div key={i} style={{width:"56px",height:"84px",background:"rgba(255,255,255,0.5)",borderRadius:"3px",border:"1.5px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:style.glass?"42px":"40px",height:style.glass?"68px":"66px",background:style.panel,borderRadius:"1px",border:"1px solid rgba(0,0,0,0.06)"}}>{!style.glass&&style.name!=="Flat Panel / Slab"&&<div style={{width:"26px",height:"44px",background:"rgba(0,0,0,0.06)",margin:"11px auto",borderRadius:"1px"}}/>}</div></div>)}
            </div>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:"15px",fontWeight:500,color:sel?style.accent:"#e8eef8",marginBottom:"3px"}}>{style.name}</div>
              <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"10px"}}>{style.desc}</div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>u("cabinetStyle",sel?null:style.name)} style={{flex:1,padding:"8px",borderRadius:"8px",border:`1px solid ${sel?style.accent:"rgba(59,130,246,0.25)"}`,background:sel?`rgba(59,130,246,0.15)`:"#071526",color:sel?style.accent:"#60a5fa",fontSize:"13px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{sel?"✓ Selected":"Select Style"}</button>
              </div>
              <input style={{...S.input,fontSize:"12px",padding:"8px 10px",marginTop:"8px"}} placeholder="Paste link to send customer..." value={qd[`${style.name}Link`]||""} onChange={e=>u(`${style.name}Link`,e.target.value)}/>
            </div>
          </div>
        );
      })}
    </div>
  );

  return(
    <div style={{padding:"16px 20px 28px"}}>
      <SecHead title="1 — Project Scope"/>
      <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"10px"}}>Select all that apply</div>
      {["Full gut renovation","Cabinet replacement only","Countertops only","Multiple items but not a full gut"].map(opt=><CheckOpt key={opt} label={opt} selected={isSel("scope",opt)} onToggle={()=>toggle("scope",opt)}/>)}

      <SecHead title="2 — Reason for Renovating"/>
      {["Outdated","Damaged","Full remodel","Preparing to sell","Other"].map(opt=><CheckOpt key={opt} label={opt} selected={isSel("reason",opt)} onToggle={()=>toggle("reason",opt)} round/>)}
      {isSel("reason","Other")&&<textarea style={{...S.input,minHeight:"50px",resize:"vertical",fontSize:"13px",marginBottom:"8px"}} placeholder="Describe reason..." value={qd.reasonOther||""} onChange={e=>u("reasonOther",e.target.value)}/>}

      <SecHead title="3 — Timeline"/>
      {["Under 3 months","3 to 6 months","6 to 12 months","No rush","Specific target date"].map(opt=><CheckOpt key={opt} label={opt} selected={qd.timeline===opt} onToggle={()=>u("timeline",opt)} round/>)}
      {qd.timeline==="Specific target date"&&<input type="date" style={{...S.input,fontSize:"13px",marginBottom:"8px"}} value={qd.targetDate||""} onChange={e=>u("targetDate",e.target.value)}/>}

      <SecHead title="4 — Cabinets"/>
      {["New cabinets","Partial replacement"].map(opt=><CheckOpt key={opt} label={opt} selected={isSel("cabinets",opt)} onToggle={()=>toggle("cabinets",opt)}/>)}

      <SecHead title="5 — Cabinet Style"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8",fontWeight:500}}>Style Preference</span>
          <button style={S.smallBtn} onClick={()=>setShowGallery(true)}>Open Gallery →</button>
        </div>
        {qd.cabinetStyle?<div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}><div style={{width:"32px",height:"32px",borderRadius:"6px",background:CABINET_STYLES.find(s=>s.name===qd.cabinetStyle)?.swatch||"#e8ddd0"}}/><div><div style={{fontSize:"14px",color:"#60a5fa",fontWeight:500}}>{qd.cabinetStyle}</div><div style={{fontSize:"11px",color:"#4a6fa5"}}>Tap gallery to change</div></div></div>:<div style={{fontSize:"13px",color:"#4a6fa5",marginBottom:"10px"}}>No style selected — open gallery to choose</div>}
        <textarea style={{...S.input,minHeight:"50px",resize:"vertical",fontSize:"12px"}} placeholder="Style notes, colors, finishes..." value={qd.cabinetNotes||""} onChange={e=>u("cabinetNotes",e.target.value)}/>
      </div>

      <SecHead title="6 — Countertops"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{fontSize:"12px",color:"#60829e",marginBottom:"8px"}}>We offer guidance only — customer sources and arranges fabrication</div>
        <textarea style={{...S.input,minHeight:"56px",resize:"vertical",fontSize:"13px"}} placeholder="Customer's material preference..." value={qd.countertopNotes||""} onChange={e=>u("countertopNotes",e.target.value)}/>
      </div>

      <SecHead title="7 — Backsplash"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{fontSize:"12px",color:"#60829e",marginBottom:"10px"}}>We do not sell materials but we install tile</div>
        <textarea style={{...S.input,minHeight:"50px",resize:"vertical",fontSize:"13px",marginBottom:"10px"}} placeholder="Customer's material preference..." value={qd.backsplashNotes||""} onChange={e=>u("backsplashNotes",e.target.value)}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:"13px",color:"#93b4d8"}}>Installation needed?</span>
          <Toggle on={qd.backsplashInstall} onToggle={()=>u("backsplashInstall",!qd.backsplashInstall)}/>
        </div>
      </div>

      <SecHead title="8 & 9 — Sink & Faucet"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{fontSize:"12px",color:"#60829e",marginBottom:"10px"}}>Customer provides their own sink and faucet</div>
        <div style={{fontSize:"11px",color:"#60829e",marginBottom:"4px"}}>Sink style preference</div>
        <textarea style={{...S.input,minHeight:"46px",resize:"vertical",fontSize:"13px",marginBottom:"10px"}} placeholder="Undermount, farmhouse, drop-in..." value={qd.sinkNotes||""} onChange={e=>u("sinkNotes",e.target.value)}/>
        <div style={{fontSize:"11px",color:"#60829e",marginBottom:"4px"}}>Faucet style preference</div>
        <textarea style={{...S.input,minHeight:"46px",resize:"vertical",fontSize:"13px"}} placeholder="Pull-down, single handle, bridge..." value={qd.faucetNotes||""} onChange={e=>u("faucetNotes",e.target.value)}/>
      </div>

      <SecHead title="10 & 11 — Appliances"/>
      {["Keeping all existing appliances","Replacing all appliances","Replacing some appliances","Customer purchasing appliances themselves","Install only — customer provides"].map(opt=><CheckOpt key={opt} label={opt} selected={isSel("applianceScope",opt)} onToggle={()=>toggle("applianceScope",opt)}/>)}
      {(isSel("applianceScope","Replacing some appliances")||isSel("applianceScope","Replacing all appliances")||isSel("applianceScope","Install only — customer provides"))&&(
        <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"#60829e",marginBottom:"10px"}}>Which appliances?</div>
          {APPLIANCE_TYPES.map(a=><CheckOpt key={a} label={a} selected={isSel("applianceList",a)} onToggle={()=>toggle("applianceList",a)}/>)}
        </div>
      )}

      <SecHead title="12 — Lighting"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"rgba(251,191,36,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:"18px"}}>💡</span></div>
        <div><div style={{fontSize:"14px",color:"#e8eef8",fontWeight:500}}>Customer handles lighting separately</div><div style={{fontSize:"12px",color:"#4a6fa5",marginTop:"2px"}}>Noted on report</div></div>
      </div>

      <SecHead title="13 — Cabinet Hardware"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"12px"}}>
        <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"rgba(148,163,184,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:"18px"}}>🔩</span></div>
        <div><div style={{fontSize:"14px",color:"#e8eef8",fontWeight:500}}>Customer provides their own hardware</div><div style={{fontSize:"12px",color:"#4a6fa5",marginTop:"2px"}}>Noted on report</div></div>
      </div>

      <SecHead title="14 & 15 — Trades"/>
      {[["Electrical","electrical"],["Plumbing","plumbing"]].map(([label,key])=>(
        <div key={key} style={{...S.card,padding:"14px",marginBottom:"12px"}}>
          <div style={{fontSize:"13px",color:"#93b4d8",fontWeight:500,marginBottom:"10px"}}>{label} — who will handle?</div>
          {["We will handle through our subcontractors","Customer will hire their own"].map(opt=><CheckOpt key={opt} label={opt} selected={qd[key]===opt} onToggle={()=>u(key,opt)} round/>)}
        </div>
      ))}

      <SecHead title="16 — Flooring"/>
      <div style={{...S.card,padding:"14px",marginBottom:"12px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:qd.flooringIncluded?"12px":"0"}}>
          <span style={{fontSize:"14px",color:"#e8eef8"}}>Flooring included in this job?</span>
          <Toggle on={qd.flooringIncluded} onToggle={()=>u("flooringIncluded",!qd.flooringIncluded)}/>
        </div>
        {qd.flooringIncluded&&<>
          <div style={{fontSize:"12px",color:"#60829e",marginBottom:"8px"}}>Flooring type</div>
          {["Hardwood","Engineered hardwood","LVP / Luxury vinyl plank","Tile","Carpet","Laminate","Concrete / Epoxy","Undecided"].map(opt=><CheckOpt key={opt} label={opt} selected={isSel("flooringType",opt)} onToggle={()=>toggle("flooringType",opt)}/>)}
        </>}
      </div>

      <SecHead title="17 — Permits"/>
      {["Yes","No","Unknown"].map(opt=><CheckOpt key={opt} label={opt} selected={qd.permits===opt} onToggle={()=>u("permits",opt)} round/>)}

      <SecHead title="18 — How Did You Hear About Us?"/>
      {["Referral","Google","Social media","Repeat customer","Other"].map(opt=><CheckOpt key={opt} label={opt} selected={qd.referral===opt} onToggle={()=>u("referral",opt)} round/>)}
      {qd.referral==="Referral"&&<input style={{...S.input,fontSize:"13px",marginBottom:"8px"}} placeholder="Who referred you?" value={qd.referralName||""} onChange={e=>u("referralName",e.target.value)}/>}
      {qd.referral==="Other"&&<input style={{...S.input,fontSize:"13px",marginBottom:"8px"}} placeholder="How did you hear about us?" value={qd.referralOther||""} onChange={e=>u("referralOther",e.target.value)}/>}

      <SecHead title="19 — Special Notes"/>
      <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"10px"}}>Tap to add common items</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"12px"}}>
        {SPECIAL_NOTES.map(item=>{const sel=isSel("specialNoteItems",item);return <button key={item} onClick={()=>toggle("specialNoteItems",item)} style={{padding:"6px 14px",borderRadius:"20px",border:`1px solid ${sel?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:sel?"rgba(29,78,216,0.25)":"#0d1f3c",color:sel?"#60a5fa":"#60829e",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{sel?"✓ ":""}{item}</button>;})}
      </div>
      <textarea style={{...S.input,minHeight:"80px",resize:"vertical",fontSize:"13px"}} placeholder="Additional notes, special requests, important details..." value={qd.specialNotes||""} onChange={e=>u("specialNotes",e.target.value)}/>
    </div>
  );
}

// ── Photos tab ────────────────────────────────────────────────────────────────
function PhotosTab({kd,pd,onUpdate}){
  const u=(key,val)=>onUpdate({...pd,[key]:val});
  const totalItems=3+WALL_LABELS.length+(kd.hasIsland?1:0)+(kd.hasDesk?1:0)+(kd.hasCabinets?3:0)+3;
  const captured=Object.values(pd).filter(v=>v===true).length;
  const pct=Math.round((captured/totalItems)*100);
  return(
    <div style={{padding:"16px 20px 28px"}}>
      <div style={{...S.card,padding:"14px",marginBottom:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <span style={{fontSize:"13px",color:"#93b4d8",fontWeight:500}}>Photo Progress</span>
          <span style={{fontSize:"13px",color:pct===100?"#22c55e":"#60a5fa",fontWeight:500}}>{captured} / {totalItems}</span>
        </div>
        <div style={{height:"6px",background:"#071526",borderRadius:"3px",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#22c55e":"#3b82f6",borderRadius:"3px",transition:"width 0.3s"}}/>
        </div>
        <div style={{fontSize:"11px",color:"#4a6fa5",marginTop:"6px"}}>All photos optional — tap to mark as captured</div>
      </div>
      <SecHead title="Room Overview"/>
      <PhotoItem label="Full room — from entrance" note="Wide angle from doorway" hasPic={pd.roomEntrance} onToggle={()=>u("roomEntrance",!pd.roomEntrance)}/>
      <PhotoItem label="Full room — opposite corner" note="Capture the whole space" hasPic={pd.roomCorner} onToggle={()=>u("roomCorner",!pd.roomCorner)}/>
      <PhotoItem label="Floor overview" note="Full floor condition and material" hasPic={pd.floor} onToggle={()=>u("floor",!pd.floor)}/>
      <SecHead title="Walls"/>
      {WALL_LABELS.map(wall=><PhotoItem key={wall} label={`Wall ${wall} — straight on`} note="Full wall shot captures everything" hasPic={pd[`wall${wall}`]} onToggle={()=>u(`wall${wall}`,!pd[`wall${wall}`])}/>)}
      {kd.hasIsland&&<><SecHead title="Island"/><PhotoItem label="Island — full view" note="All sides visible if possible" hasPic={pd.island} onToggle={()=>u("island",!pd.island)}/></>}
      {kd.hasDesk&&<><SecHead title="Desk"/><PhotoItem label="Desk — full view" note="Include surrounding area" hasPic={pd.desk} onToggle={()=>u("desk",!pd.desk)}/></>}
      {kd.hasCabinets&&<><SecHead title="Existing Cabinets"/>
        <PhotoItem label="Upper cabinets — full view" hasPic={pd.cabUppers} onToggle={()=>u("cabUppers",!pd.cabUppers)}/>
        <PhotoItem label="Base cabinets — full view" hasPic={pd.cabBase} onToggle={()=>u("cabBase",!pd.cabBase)}/>
        <PhotoItem label="Tall / pantry cabinet — full view" hasPic={pd.cabTall} onToggle={()=>u("cabTall",!pd.cabTall)}/>
      </>}
      <SecHead title="Problem Areas & Misc"/>
      <PhotoItem label="Any problem areas or damage" note="Cracks, water damage, uneven surfaces" hasPic={pd.problemAreas} onToggle={()=>u("problemAreas",!pd.problemAreas)}/>
      <PhotoItem label="Anything unusual or out of square" note="Document anything affecting install" hasPic={pd.unusual} onToggle={()=>u("unusual",!pd.unusual)}/>
      <PhotoItem label="Electrical panel" note="Only if relevant to this job" hasPic={pd.electricalPanel} onToggle={()=>u("electricalPanel",!pd.electricalPanel)}/>
      <div style={{...S.card,padding:"14px",marginTop:"4px"}}>
        <div style={{fontSize:"13px",color:"#93b4d8",fontWeight:500,marginBottom:"6px"}}>General catch-all</div>
        <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"10px"}}>Any additional photos not listed above</div>
        <button onClick={()=>u("catchAll",!pd.catchAll)} style={{...S.primaryBtn,marginBottom:pd.catchAll?"10px":"0",background:pd.catchAll?"rgba(34,197,94,0.15)":"rgba(59,130,246,0.12)",color:pd.catchAll?"#22c55e":"#60a5fa",border:`1px solid ${pd.catchAll?"rgba(34,197,94,0.3)":"rgba(59,130,246,0.25)"}`}}>
          {pd.catchAll?"✓ Photo Captured":"📷 Take Photo"}
        </button>
        {pd.catchAll&&<textarea style={{...S.input,minHeight:"56px",resize:"vertical",fontSize:"13px"}} placeholder="Describe what was photographed..." value={pd.catchAllNotes||""} onChange={e=>u("catchAllNotes",e.target.value)}/>}
      </div>
    </div>
  );
}

// ── Cabinet Gallery screen ────────────────────────────────────────────────────
function GalleryScreen({onBack}){
  const [selected,setSelected]=useState(null);
  const [viewing,setViewing]=useState(null);
  const [links,setLinks]=useState({});

  if(viewing){
    const style=CABINET_STYLES.find(s=>s.name===viewing);
    return(
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:"1px solid rgba(59,130,246,0.15)",flexShrink:0}}>
          <button onClick={()=>setViewing(null)} style={{width:"32px",height:"32px",borderRadius:"50%",background:"#0d1f3c",border:"1px solid rgba(59,130,246,0.25)",color:"#60a5fa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <span style={{fontSize:"16px",fontWeight:600,color:"#e8eef8"}}>{style.name}</span>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
          <div style={{height:"180px",background:style.swatch,borderRadius:"16px",marginBottom:"20px",display:"flex",alignItems:"center",justifyContent:"center",gap:"16px"}}>
            {[1,2,3].map(i=><div key={i} style={{width:"70px",height:"130px",background:"rgba(255,255,255,0.5)",borderRadius:"4px",border:"2px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:"52px",height:"100px",background:style.panel,borderRadius:"2px",border:"1px solid rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>{!style.glass&&style.name!=="Flat Panel / Slab"&&<div style={{width:"32px",height:"60px",background:"rgba(0,0,0,0.06)",borderRadius:"1px"}}/>}</div></div>)}
          </div>
          <div style={{fontSize:"15px",fontWeight:500,color:"#e8eef8",marginBottom:"6px"}}>{style.name}</div>
          <div style={{fontSize:"13px",color:"#60829e",marginBottom:"20px",lineHeight:1.6}}>{style.desc}</div>
          <SecHead title="Available Colors"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px"}}>
            {COLORS.map(col=><div key={col.name} style={{...S.card,padding:"10px 12px",display:"flex",alignItems:"center",gap:"10px"}}><div style={{width:"26px",height:"26px",borderRadius:"6px",background:col.hex,border:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}/><span style={{fontSize:"13px",color:"#93b4d8"}}>{col.name}</span></div>)}
          </div>
          <SecHead title="Customer Link"/>
          <div style={{...S.card,padding:"14px"}}>
            <div style={{fontSize:"12px",color:"#60829e",marginBottom:"8px"}}>Paste a URL to send this style to the customer</div>
            <input style={{...S.input,fontSize:"13px",padding:"9px 12px"}} placeholder="https://..." value={links[style.name]||""} onChange={e=>setLinks({...links,[style.name]:e.target.value})}/>
            <button style={{...S.primaryBtn,marginTop:"10px",fontSize:"13px",padding:"10px"}}>Send Link to Customer</button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:"1px solid rgba(59,130,246,0.15)",flexShrink:0}}>
        <button onClick={onBack} style={{width:"32px",height:"32px",borderRadius:"50%",background:"#0d1f3c",border:"1px solid rgba(59,130,246,0.25)",color:"#60a5fa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div>
          <div style={{fontSize:"16px",fontWeight:600,color:"#e8eef8"}}>Cabinet Style Gallery</div>
          <div style={{fontSize:"11px",color:"#4a6fa5"}}>Tap a style to view details and colors</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 28px"}}>
        <div style={{fontSize:"12px",color:"#4a6fa5",marginBottom:"16px"}}>Show customers styles on-site or send links for them to browse at home.</div>
        {CABINET_STYLES.map(style=>{
          const isSel=selected===style.name;
          return(
            <div key={style.name} style={{...S.card,marginBottom:"14px",overflow:"hidden",borderColor:isSel?style.accent:"rgba(59,130,246,0.18)"}}>
              <div onClick={()=>setViewing(style.name)} style={{height:"110px",background:style.swatch,display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",cursor:"pointer",position:"relative"}}>
                {[1,2,3,4].map(i=><div key={i} style={{width:"46px",height:"80px",background:"rgba(255,255,255,0.5)",borderRadius:"3px",border:"1.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:"34px",height:"62px",background:style.panel,borderRadius:"1px",border:"1px solid rgba(0,0,0,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}>{!style.glass&&style.name!=="Flat Panel / Slab"&&<div style={{width:"22px",height:"42px",background:"rgba(0,0,0,0.05)",borderRadius:"1px"}}/>}</div></div>)}
                {isSel&&<div style={{position:"absolute",top:"8px",right:"8px",background:style.accent,borderRadius:"50%",width:"22px",height:"22px",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>}
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                  <div>
                    <div style={{fontSize:"15px",fontWeight:500,color:"#e8eef8",marginBottom:"2px"}}>{style.name}</div>
                    <div style={{fontSize:"12px",color:"#4a6fa5"}}>{style.desc}</div>
                  </div>
                  <button onClick={()=>setSelected(isSel?null:style.name)} style={{padding:"6px 12px",borderRadius:"20px",border:`1px solid ${isSel?style.accent:"rgba(59,130,246,0.25)"}`,background:isSel?"rgba(59,130,246,0.15)":"rgba(59,130,246,0.08)",color:isSel?style.accent:"#60a5fa",fontSize:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{isSel?"✓ Selected":"Select"}</button>
                </div>
                <div style={{display:"flex",gap:"5px",marginTop:"8px"}}>
                  {COLORS.slice(0,6).map(col=><div key={col.name} title={col.name} style={{width:"18px",height:"18px",borderRadius:"4px",background:col.hex,border:"1px solid rgba(255,255,255,0.12)",cursor:"pointer"}}/>)}
                  <div style={{width:"18px",height:"18px",borderRadius:"4px",background:"#0d1f3c",border:"1px solid rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#60a5fa",fontSize:"9px",fontWeight:600}}>+2</span></div>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{...S.card,padding:"16px",border:"1px dashed rgba(59,130,246,0.3)",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer"}}>
          <div style={{width:"42px",height:"42px",borderRadius:"10px",background:"rgba(59,130,246,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <div>
            <div style={{fontSize:"14px",color:"#60a5fa",fontWeight:500}}>Add New Style</div>
            <div style={{fontSize:"12px",color:"#4a6fa5"}}>Upload image or paste URL — Admin only</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function MaximusEstimus(){
  const [screen,setScreen]=useState(SCREENS.HOME);
  const [activeTab,setActiveTab]=useState("measurements");
  const [selectedTypes,setSelectedTypes]=useState([]);
  const [activeType,setActiveType]=useState("Kitchen");
  const [activeNav,setActiveNav]=useState("home");
  const [customerInfo,setCustomerInfo]=useState({firstName:"",lastName:"",address:"",phone:"",email:"",notes:""});
  const [kd,setKd]=useState({ceilingHeight:"",hasSoffit:false,soffitSame:true,walls:{A:{},B:{},C:{},D:{}},appliances:{},hasIsland:false,hasDesk:false,hasCabinets:false,disposal:false});
  const [qd,setQd]=useState({});
  const [pd,setPd]=useState({});
  const [otherType,setOtherType]=useState("");

  const goBack=()=>{
    const map={[SCREENS.NEW_JOB]:SCREENS.HOME,[SCREENS.JOB_TYPE]:SCREENS.NEW_JOB,[SCREENS.ASSESSMENT]:SCREENS.JOB_TYPE,[SCREENS.SUMMARY]:SCREENS.ASSESSMENT};
    if(map[screen])setScreen(map[screen]);
  };

  if(screen===SCREENS.GALLERY)return <GalleryScreen onBack={()=>setScreen(SCREENS.HOME)}/>;

  const Header=({title})=>(
    <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"16px 20px",borderBottom:"1px solid rgba(59,130,246,0.15)",flexShrink:0}}>
      <button onClick={goBack} style={{width:"32px",height:"32px",borderRadius:"50%",background:"#0d1f3c",border:"1px solid rgba(59,130,246,0.25)",color:"#60a5fa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <span style={{fontSize:"16px",fontWeight:600,color:"#e8eef8"}}>{title}</span>
    </div>
  );

  const Logo=()=>(
    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
      <img
        src="https://drive.google.com/thumbnail?id=1gLgGodq4lqkO13REoM6dleCx1MH5zklP&sz=w200"
        alt="Maximus Construction NJ LLC"
        style={{width:"52px",height:"52px",objectFit:"contain",borderRadius:"8px",flexShrink:0}}
      />
      <div>
        <div style={{fontFamily:"'Bebas Neue',cursive",letterSpacing:"2px",fontSize:"20px",color:"white",lineHeight:1}}>MAXIMUS ESTIMUS</div>
        <div style={{fontSize:"10px",color:"#60a5fa",letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:400,marginTop:"3px"}}>Maximus Construction NJ LLC</div>
      </div>
    </div>
  );

  const BottomNav=()=>(
    <div style={{display:"flex",borderTop:"1px solid rgba(59,130,246,0.15)",flexShrink:0}}>
      {[{id:"home",label:"Home",p:"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"},{id:"jobs",label:"Jobs",p:"M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"},{id:"profile",label:"Profile",p:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"}].map(item=>(
        <button key={item.id} onClick={()=>setActiveNav(item.id)} style={{flex:1,padding:"12px 0 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",color:activeNav===item.id?"#3b82f6":"#475569",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={item.p}/></svg>
          <span style={{fontSize:"10px",letterSpacing:"0.5px"}}>{item.label}</span>
        </button>
      ))}
    </div>
  );

  if(screen===SCREENS.HOME)return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{padding:"32px 20px 20px",borderBottom:"1px solid rgba(59,130,246,0.15)"}}><Logo/></div>
      <button onClick={()=>setScreen(SCREENS.NEW_JOB)} style={{...S.primaryBtn,margin:"20px 20px 0"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        New Job
      </button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",padding:"12px 20px 0"}}>
        {[
          {label:"Cabinet Gallery",icon:"M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1-.9-2-2-2zm0 16H3V5h18v14z",action:()=>setScreen(SCREENS.GALLERY)},
          {label:"Price Guide",icon:"M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",action:()=>{}},
          {label:"Admin Panel",icon:"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",action:()=>{}},
          {label:"Team Jobs",icon:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",action:()=>{}},
        ].map(btn=>(
          <button key={btn.label} onClick={btn.action} style={{...S.card,display:"flex",alignItems:"center",gap:"8px",padding:"12px",fontSize:"13px",color:"#93b4d8",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6"><path d={btn.icon}/></svg>
            {btn.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#3b82f6",fontWeight:500,padding:"20px 20px 10px"}}>Recent Jobs</div>
      <div style={{padding:"0 20px",flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:"10px",paddingBottom:"16px"}}>
        {JOBS.map(job=>(
          <div key={job.id} style={{...S.card,padding:"14px",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
              <span style={{fontSize:"15px",fontWeight:500,color:"#e8eef8"}}>{job.name}</span>
              <span style={{fontSize:"11px",color:"#4a6fa5"}}>{job.date}</span>
            </div>
            <div style={{fontSize:"12px",color:"#60829e",marginBottom:"8px"}}>{job.address}</div>
            <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
              {job.types.map(t=><span key={t} style={{fontSize:"10px",padding:"3px 8px",borderRadius:"20px",fontWeight:500,background:TAG_COLORS[t]?.bg,color:TAG_COLORS[t]?.color}}>{t}</span>)}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <div style={{width:"6px",height:"6px",borderRadius:"50%",background:STATUS[job.status].dot}}/>
              <span style={{fontSize:"11px",color:"#4a6fa5"}}>{STATUS[job.status].label}</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav/>
    </div>
  );

  if(screen===SCREENS.NEW_JOB)return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <Header title="New Job — Customer Info"/>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>
        {[["First Name","firstName","Jane"],["Last Name","lastName","Smith"],["Address","address","123 Main St, City, NJ"],["Phone Number","phone","(609) 555-0100"],["Email Address","email","jane@email.com"]].map(([label,key,ph])=>(
          <div key={key}>
            <div style={{...S.label,display:"block",marginBottom:"6px"}}>{label}</div>
            <input style={S.inputBright} placeholder={ph} value={customerInfo[key]} onChange={e=>setCustomerInfo(p=>({...p,[key]:e.target.value}))}/>
          </div>
        ))}
        <div>
          <div style={{...S.label,display:"block",marginBottom:"6px"}}>General Notes</div>
          <textarea style={{...S.inputBright,minHeight:"80px",resize:"vertical"}} placeholder="Any notes about this job..." value={customerInfo.notes} onChange={e=>setCustomerInfo(p=>({...p,notes:e.target.value}))}/>
        </div>
      </div>
      <div style={{padding:"12px 20px 24px"}}>
        <button style={S.primaryBtn} onClick={()=>setScreen(SCREENS.JOB_TYPE)}>
          Next — Select Job Type
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        </button>
      </div>
    </div>
  );

  if(screen===SCREENS.JOB_TYPE)return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <Header title="Select Job Type(s)"/>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"12px"}}>
        <p style={{fontSize:"13px",color:"#60829e",margin:"0 0 6px"}}>Select all that apply for this job site.</p>
        {["Kitchen","Bathroom","Flooring","Other"].map(type=>{
          const sel=selectedTypes.includes(type);
          const descs={Kitchen:"Full kitchen measurement & assessment",Bathroom:"Full bathroom measurement & assessment",Flooring:"Room-by-room flooring measurement",Other:"Custom job type — name it below"};
          return(
            <button key={type} onClick={()=>setSelectedTypes(p=>p.includes(type)?p.filter(t=>t!==type):[...p,type])} style={{...S.card,padding:"16px",display:"flex",alignItems:"center",gap:"14px",cursor:"pointer",background:sel?"rgba(29,78,216,0.18)":"#0d1f3c",borderColor:sel?"#3b82f6":"rgba(59,130,246,0.18)",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{width:"24px",height:"24px",borderRadius:"6px",background:sel?"#1d4ed8":"rgba(59,130,246,0.1)",border:sel?"none":"1px solid rgba(59,130,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {sel&&<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:"16px",fontWeight:500,color:sel?"#e8eef8":"#93b4d8"}}>{type}</div>
                <div style={{fontSize:"12px",color:"#4a6fa5",marginTop:"2px"}}>{descs[type]}</div>
              </div>
            </button>
          );
        })}
        {selectedTypes.includes("Other")&&<input style={{...S.input,marginTop:"4px"}} placeholder="Describe the job type..." value={otherType} onChange={e=>setOtherType(e.target.value)}/>}
      </div>
      <div style={{padding:"12px 20px 24px"}}>
        <button style={{...S.primaryBtn,background:selectedTypes.length>0?"#1d4ed8":"#1e2d4a",color:selectedTypes.length>0?"white":"#4a6fa5"}} onClick={()=>{if(selectedTypes.length>0){setActiveType(selectedTypes[0]);setScreen(SCREENS.ASSESSMENT);}}}>
          Begin Field Assessment
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        </button>
      </div>
    </div>
  );

  if(screen===SCREENS.ASSESSMENT)return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <Header title={`${activeType==="Other"&&otherType?otherType:activeType} Assessment`}/>
      {selectedTypes.length>1&&(
        <div style={{display:"flex",gap:"8px",padding:"10px 20px",overflowX:"auto",flexShrink:0,borderBottom:"1px solid rgba(59,130,246,0.1)"}}>
          {selectedTypes.map(type=><button key={type} onClick={()=>setActiveType(type)} style={{padding:"6px 16px",borderRadius:"20px",border:`1px solid ${activeType===type?"#3b82f6":"rgba(59,130,246,0.2)"}`,background:activeType===type?"#1d4ed8":"#0d1f3c",color:activeType===type?"white":"#93b4d8",fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>{type==="Other"&&otherType?otherType:type}</button>)}
        </div>
      )}
      <div style={{display:"flex",borderBottom:"1px solid rgba(59,130,246,0.15)",flexShrink:0}}>
        {[["measurements","📏 Measure"],["questions","❓ Questions"],["photos","📷 Photos"]].map(([tab,label])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1,padding:"12px 4px",fontSize:"13px",fontWeight:500,color:activeTab===tab?"#60a5fa":"#4a6fa5",background:"none",border:"none",borderBottom:activeTab===tab?"2px solid #3b82f6":"2px solid transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {activeTab==="measurements"&&<MeasurementsTab kd={kd} onUpdate={setKd}/>}
        {activeTab==="questions"&&<QuestionsTab qd={qd} onUpdate={setQd}/>}
        {activeTab==="photos"&&<PhotosTab kd={kd} pd={pd} onUpdate={setPd}/>}
      </div>
      <div style={{padding:"12px 20px 24px",flexShrink:0}}>
        <button style={S.primaryBtn} onClick={()=>setScreen(SCREENS.SUMMARY)}>
          Complete Assessment
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </button>
      </div>
    </div>
  );

  if(screen===SCREENS.SUMMARY)return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <Header title="Job Summary"/>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{...S.card,padding:"16px"}}>
          <div style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#3b82f6",fontWeight:500,marginBottom:"10px"}}>Customer</div>
          <div style={{fontSize:"16px",fontWeight:500,color:"#e8eef8",marginBottom:"4px"}}>{customerInfo.firstName||"Jane"} {customerInfo.lastName||"Smith"}</div>
          <div style={{fontSize:"13px",color:"#60829e"}}>{customerInfo.address||"123 Main St, City, NJ"}</div>
          <div style={{fontSize:"13px",color:"#60829e"}}>{customerInfo.phone||"(609) 555-0100"}</div>
        </div>
        <div style={{...S.card,padding:"16px"}}>
          <div style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#3b82f6",fontWeight:500,marginBottom:"10px"}}>Assessment</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
            {(selectedTypes.length>0?selectedTypes:["Kitchen"]).map(t=><span key={t} style={{fontSize:"11px",padding:"3px 10px",borderRadius:"20px",fontWeight:500,background:TAG_COLORS[t]?.bg||TAG_COLORS.Other.bg,color:TAG_COLORS[t]?.color||TAG_COLORS.Other.color}}>{t==="Other"&&otherType?otherType:t}</span>)}
          </div>
          <div style={{display:"flex",gap:"16px"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:600,color:"#60a5fa"}}>{Object.values(pd).filter(v=>v===true).length}</div>
              <div style={{fontSize:"11px",color:"#4a6fa5"}}>Photos</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:600,color:"#60a5fa"}}>{(qd.scope||[]).length+(qd.applianceList||[]).length}</div>
              <div style={{fontSize:"11px",color:"#4a6fa5"}}>Items noted</div>
            </div>
          </div>
        </div>
        <div style={{...S.card,padding:"16px"}}>
          <div style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#3b82f6",fontWeight:500,marginBottom:"12px"}}>Estimate Preview</div>
          {[{label:"Labor Quote",value:"$4,200",note:"firm"},{label:"Materials Range",value:"$3,800 – $7,600",note:"low – high"},{label:"Combined Total",value:"$8,000 – $11,800",note:"estimated range"}].map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(59,130,246,0.1)"}}>
              <div><div style={{fontSize:"14px",color:"#93b4d8"}}>{row.label}</div><div style={{fontSize:"11px",color:"#4a6fa5"}}>{row.note}</div></div>
              <div style={{fontSize:"15px",fontWeight:500,color:"#e8eef8"}}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 20px 24px",display:"flex",flexDirection:"column",gap:"10px"}}>
        <button style={S.primaryBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Export / Email Report
        </button>
        <button style={S.ghostBtn} onClick={()=>setScreen(SCREENS.HOME)}>Back to Home</button>
      </div>
    </div>
  );
}
