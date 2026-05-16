import { COLORS, TONES, BASES, GATE_TO_CENTER, CENTER_COLOR } from './syntia_state.js';

export function createUIBridge(state, runtime, cynthia){
  const els = {
    addrPill: document.getElementById('addr-pill'),
    statNodes: document.getElementById('stat-nodes'),
    statMorphs: document.getElementById('stat-morphs'),
    statTension: document.getElementById('stat-tension'),
    statGeo: document.getElementById('stat-geo'),
    tensionFill: document.getElementById('tension-fill'),
    tensionVal: document.getElementById('tension-val'),
    morphList: document.getElementById('morph-list'),
    fileList: document.getElementById('file-list'),
    structLog: document.getElementById('struct-log'),
    chatMsgs: document.getElementById('chat-msgs'),
    linesGrid: document.getElementById('lines-grid'),
    cdGate: document.getElementById('cd-gate'),
    cdName: document.getElementById('cd-name'),
    cdCenter: document.getElementById('cd-center'),
    cdCtr: document.getElementById('cd-ctr'),
    cdColor: document.getElementById('cd-color'),
    cdTone: document.getElementById('cd-tone'),
    cdBase: document.getElementById('cd-base'),
    cdMotivation: document.getElementById('cd-motivation'),
    cdBinary: document.getElementById('cd-binary'),
    aiDim: document.getElementById('ai-dim'),
    aiGate: document.getElementById('ai-gate'),
    aiLine: document.getElementById('ai-line'),
    aiColor: document.getElementById('ai-color'),
    aiTone: document.getElementById('ai-tone'),
    aiBase: document.getElementById('ai-base'),
    aiPlanet: document.getElementById('ai-planet'),
    aiCircuit: document.getElementById('ai-circuit'),
    aiPressure: document.getElementById('ai-pressure'),
    nodeList: document.getElementById('node-list'),
    lineageList: document.getElementById('lineage-list'),
    layerRows: document.getElementById('layer-rows'),
    graphCanvas: document.getElementById('graph-canvas'),
    ringCanvas: document.getElementById('ring-canvas'),
    intentTraits: document.getElementById('intent-traits'),
    intentAddr: document.getElementById('intent-addr'),
    intentBox: document.getElementById('intent-box')
  };

  const behaviorColor = {
    dormant:'#444', receiving:'#2a6a2a', active:'#2a7a7a', resonating:'#0066cc',
    transforming:'#9900cc', transmitting:'#ff6600', integrating:'#00cc44', dispersing:'#ff0000'
  };

  function renderAll(){
    updateHeader();
    renderSelectedGate();
    renderNodes();
    renderLineage();
    renderLayers();
    drawRing();
    drawGraph();
  }

  function updateHeader(){
    if(els.addrPill) els.addrPill.textContent = state.currentAddressString();
    if(els.statNodes) els.statNodes.textContent = state.nodes.length;
    if(els.statMorphs) els.statMorphs.textContent = state.morphCount;
    if(els.statTension) els.statTension.textContent = state.structuralTension.toFixed(2);
    if(els.statGeo) els.statGeo.textContent = state.geometry.toUpperCase();
    if(els.tensionFill) els.tensionFill.style.width = `${(state.structuralTension * 100).toFixed(0)}%`;
    if(els.tensionVal) els.tensionVal.textContent = state.structuralTension.toFixed(2);
  }

  function selectGate(index){
    state.selectedGate = index;
    const gate = index + 1;
    const node = state.matrix[index];
    const line = dominantLine(node.lines);
    const color = ((line - 1) % 6) + 1;
    const tone = ((color - 1) % 6) + 1;
    const base = ((tone - 1) % 5) + 1;
    state.address = {
      d: Math.ceil(gate / 13),
      gate,
      line,
      color,
      tone,
      base,
      planet: "Sun",
      circuit: inferCircuit(gate),
      pressure: Number((node.lines.reduce((a,v)=>a+v,0) / 6).toFixed(2))
    };
    renderSelectedGate();
    updateHeader();
  }

  function renderSelectedGate(){
    const gate = state.selectedGate + 1;
    const center = GATE_TO_CENTER[gate] || 'Unknown';
    const name = state.hexagrams[gate - 1];
    const line = state.address.line;
    const color = state.address.color;
    const tone = state.address.tone;
    const base = state.address.base;
    const binary = (gate - 1).toString(2).padStart(6,'0');

    if(els.cdGate) els.cdGate.textContent = gate;
    if(els.cdName) els.cdName.textContent = name;
    if(els.cdCenter) els.cdCenter.textContent = center.toUpperCase();
    if(els.cdCtr) els.cdCtr.textContent = center;
    if(els.cdColor) els.cdColor.textContent = `${color} — ${COLORS[color].name}`;
    if(els.cdTone) els.cdTone.textContent = `${tone} — ${TONES[tone].name}`;
    if(els.cdBase) els.cdBase.textContent = `${base} / ${BASES[base].gnn}`;
    if(els.cdMotivation) els.cdMotivation.textContent = COLORS[color].motivation;
    if(els.cdBinary) els.cdBinary.textContent = binary;

    if(els.aiDim) els.aiDim.textContent = state.address.d;
    if(els.aiGate) els.aiGate.textContent = `${gate} / ${name}`;
    if(els.aiLine) els.aiLine.textContent = line;
    if(els.aiColor) els.aiColor.textContent = `${color} — ${COLORS[color].name}`;
    if(els.aiTone) els.aiTone.textContent = `${tone} — ${TONES[tone].name}`;
    if(els.aiBase) els.aiBase.textContent = `${base} / ${BASES[base].gnn}`;
    if(els.aiPlanet) els.aiPlanet.textContent = state.address.planet;
    if(els.aiCircuit) els.aiCircuit.textContent = state.address.circuit;
    if(els.aiPressure) els.aiPressure.textContent = state.address.pressure;

    renderLineGrid(state.matrix[state.selectedGate]);
  }

  function renderLineGrid(node){
    if(!els.linesGrid) return;
    els.linesGrid.innerHTML = '';
    node.lines.forEach((v, idx)=>{
      const div = document.createElement('div');
      div.className = `line-box${v > 0.1 ? ' on' : ''}`;
      div.innerHTML = `<div class="line-num">L${idx+1}</div><div class="line-level"><div class="line-fill" style="width:${(v*100).toFixed(0)}%"></div></div>`;
      div.onclick = ()=>{
        node.lines[idx] = node.lines[idx] > 0.5 ? 0 : 1;
        runtime.runMorphCycle();
        renderAll();
      };
      els.linesGrid.appendChild(div);
    });
  }

  function renderNodes(){
    if(!els.nodeList) return;
    els.nodeList.innerHTML = '';
    state.nodes.forEach(n=>{
      const color = behaviorColor[n.behavior] || '#666';
      const div = document.createElement('div');
      div.className = 'node-item';
      div.innerHTML = `
        <div class="ni-gate" style="border-color:${color};color:${color};">${n.gate}</div>
        <div class="ni-info">
          <div class="ni-name">${state.hexagrams[n.gate - 1]}</div>
          <div class="ni-sub">${GATE_TO_CENTER[n.gate] || '?'} · ${n.address}</div>
        </div>
        <div class="ni-behavior" style="background:${color}22;color:${color};border:1px solid ${color};">
          ${n.behavior.slice(0,5).toUpperCase()}
        </div>`;
      div.onclick = ()=>{
        selectGate(n.gate - 1);
      };
      els.nodeList.appendChild(div);
    });
  }

  function renderLineage(){
    if(!els.lineageList) return;
    els.lineageList.innerHTML = '';
    state.nodes.forEach((n, i)=>{
      const div = document.createElement('div');
      div.className = 'lin-item';
      div.style.borderColor = behaviorColor[n.behavior] || '#666';
      div.style.marginLeft = `${Math.min(i, 5) * 8}px`;
      div.innerHTML = `
        <div class="lin-role" style="color:${behaviorColor[n.behavior] || '#666'}">${n.behavior.slice(0,6).toUpperCase()}</div>
        <div class="lin-name">${state.hexagrams[n.gate - 1]}</div>
        <div class="lin-beh">${n.address}</div>`;
      els.lineageList.appendChild(div);
    });
  }

  function renderLayers(){
    if(!els.layerRows) return;
    els.layerRows.innerHTML = '';
    const colors = {text:'#00ffb4',nav:'#00c4ff',temporal:'#ffcc00',celestial:'#a259ff',resonance:'#ff2d78'};
    Object.entries(state.layers).forEach(([k,v])=>{
      const div = document.createElement('div');
      div.className = 'layer-row';
      div.innerHTML = `
        <div class="layer-name">${k.toUpperCase()}</div>
        <div class="layer-bar"><div class="layer-fill" style="width:${(v*100).toFixed(0)}%;background:${colors[k]};"></div></div>
        <div class="layer-val" style="color:${colors[k]};">${v.toFixed(2)}</div>`;
      els.layerRows.appendChild(div);
    });
  }

  function addMorphEvent(type, text){
    state.morphCount += 1;
    state.morphHistory.unshift({type, text, time: new Date().toLocaleTimeString()});
    if(els.morphList){
      const div = document.createElement('div');
      div.className = 'morph-event';
      div.innerHTML = `<div class="me-type ${type}">${type.toUpperCase()}</div><div class="me-body">${text}</div><div class="me-time">${new Date().toLocaleTimeString()}</div>`;
      els.morphList.prepend(div);
      while(els.morphList.children.length > 30) els.morphList.removeChild(els.morphList.lastChild);
    }
    updateHeader();
  }

  function addFileItem(file){
    if(!els.fileList) return;
    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `<div class="fi-dot" style="background:${file.type==='code'?'#00ffb4':file.type==='data'?'#00c4ff':'#ffcc00'}"></div><div class="fi-name">${file.name}</div><div class="fi-addr">${file.address}</div>`;
    els.fileList.prepend(div);
  }

  function addLog(text){
    if(!els.structLog) return;
    const div = document.createElement('div');
    div.className = 'le';
    div.innerHTML = `<span class="lt">${new Date().toLocaleTimeString()}</span><span class="li">${text}</span>`;
    els.structLog.prepend(div);
    while(els.structLog.children.length > 20) els.structLog.removeChild(els.structLog.lastChild);
  }

  function appendChat(role, text){
    if(!els.chatMsgs) return;
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    els.chatMsgs.appendChild(div);
    els.chatMsgs.scrollTop = els.chatMsgs.scrollHeight;
  }

  function drawRing(){
    const c = els.ringCanvas;
    if(!c) return;
    const wrap = c.parentElement;
    const size = wrap.offsetWidth || 280;
    if(c.width !== size || c.height !== size){
      c.width = size;
      c.height = size;
    }
    const ctx = c.getContext('2d');
    const cx = size/2, cy = size/2, R = size*0.38;
    ctx.clearRect(0,0,size,size);

    ctx.strokeStyle = 'rgba(162,89,255,0.15)';
    ctx.beginPath();
    ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.stroke();

    state.matrix.forEach((node,i)=>{
      const angle = (i/64) * Math.PI * 2 - Math.PI/2;
      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;
      const active = node.lines.filter(v=>v>0.1).length;
      const center = GATE_TO_CENTER[node.gate] || 'Unknown';
      const color = CENTER_COLOR[center] || '#666';
      const r = 3 + active * 1.5;

      if(active > 0){
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x,y,r+5,0,Math.PI*2);
        ctx.fill();
      }

      ctx.globalAlpha = active > 0 ? 1 : 0.4;
      ctx.fillStyle = active > 0 ? color : '#4c5a82';
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();

      if(i === state.selectedGate){
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x,y,r+5,0,Math.PI*2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawGraph(){
    const c = els.graphCanvas;
    if(!c) return;
    const wrap = c.parentElement;
    const W = wrap.clientWidth || 400;
    const H = Math.max(200, Math.min(320, W * 0.65));
    if(c.width !== W || c.height !== H){
      c.width = W;
      c.height = H;
    }

    const ctx = c.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(3,2,10,0.8)';
    ctx.fillRect(0,0,W,H);

    const ids = state.nodes.map(n=>n.id);
    const layout = computeLayout(ids, state.geometry);

    state.edges.forEach(e=>{
      const from = layout[e.from];
      const to = layout[e.to];
      if(!from || !to) return;
      ctx.strokeStyle = e.active ? 'rgba(255,45,120,0.5)' : 'rgba(80,80,120,0.25)';
      ctx.lineWidth = e.active ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(from.x * W, from.y * H);
      ctx.lineTo(to.x * W, to.y * H);
      ctx.stroke();
    });

    state.nodes.forEach(n=>{
      const pos = layout[n.id];
      if(!pos) return;
      const color = behaviorColor[n.behavior] || '#666';
      const x = pos.x * W, y = pos.y * H;

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x,y,14,0,Math.PI*2);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#111';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x,y,9,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(n.gate), x, y + 3);
    });
  }

  function computeLayout(ids, geometry){
    const layout = {};
    const n = ids.length || 1;
    switch(geometry){
      case 'radial':
        ids.forEach((id,i)=>{
          const a = (i / Math.max(1,n)) * Math.PI * 2;
          layout[id] = {x:0.5 + Math.cos(a)*0.36, y:0.5 + Math.sin(a)*0.36};
        });
        break;
      case 'mesh':
      case 'lattice': {
        const cols = Math.ceil(Math.sqrt(n));
        ids.forEach((id,i)=>{
          layout[id] = {
            x: 0.1 + (i % cols) / Math.max(1, cols - 1) * 0.8,
            y: 0.1 + Math.floor(i / cols) / Math.max(1, Math.ceil(n / cols) - 1) * 0.8
          };
        });
        break;
      }
      case 'tree':
        ids.forEach((id,i)=>{
          const layer = Math.floor(Math.log2(i+1));
          const pos = i - (Math.pow(2, layer) - 1);
          const total = Math.pow(2, layer);
          layout[id] = {
            x: (pos + 0.5) / total,
            y: 0.12 + (layer / Math.max(1, Math.ceil(Math.log2(n+1)))) * 0.78
          };
        });
        break;
      case 'spiral':
        ids.forEach((id,i)=>{
          const a = i * 2.399963;
          const r = Math.sqrt(i / Math.max(1,n)) * 0.42;
          layout[id] = {x:0.5 + Math.cos(a)*r, y:0.5 + Math.sin(a)*r};
        });
        break;
      default:
        ids.forEach((id,i)=>{
          layout[id] = {x:0.1 + (i / Math.max(1,n-1)) * 0.8, y:0.5};
        });
        break;
    }
    return layout;
  }

  function inferCircuit(gate){
    if([20,10,57,34].includes(gate)) return 'Integration';
    if(gate % 3 === 0) return 'Collective';
    if(gate % 3 === 1) return 'Individual';
    return 'Tribal';
  }

  function dominantLine(lines){
    let idx = 0;
    let best = -1;
    lines.forEach((v,i)=>{ if(v > best){ best = v; idx = i; } });
    return idx + 1;
  }

  if(els.ringCanvas){
    els.ringCanvas.addEventListener('click', (e)=>{
      const rect = els.ringCanvas.getBoundingClientRect();
      const size = els.ringCanvas.width;
      const cx = size/2, cy = size/2, R = size*0.38;
      const x = (e.clientX - rect.left) * (size / rect.width);
      const y = (e.clientY - rect.top) * (size / rect.height);
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(Math.abs(dist - R) < 32){
        let angle = Math.atan2(dy, dx) + Math.PI/2;
        if(angle < 0) angle += Math.PI * 2;
        const idx = Math.floor((angle / (Math.PI * 2)) * 64) % 64;
        selectGate(idx);
        drawRing();
      }
    });
  }

  renderAll();

  return {
    renderAll,
    updateHeader,
    renderSelectedGate,
    renderNodes,
    renderLineage,
    renderLayers,
    drawRing,
    drawGraph,
    addMorphEvent,
    addFileItem,
    addLog,
    appendChat,
    selectGate
  };
}
