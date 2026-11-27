/* 多 AI 工作台 V1 — 纯本地，localStorage，无网络请求（除打开 AI 官网） */
'use strict';
var PLATFORMS = [
{id:'chatgpt', name:'ChatGPT', url:'https://chatgpt.com', note:'OpenAI 对话助手，写作 / 长文 / 改稿常用。'},
{id:'workbuddy', name:'WorkBuddy', url:'https://www.workbuddy.cn/', note:'腾讯 AI 智能体桌面工作台，执行型任务、文档表格 PPT 常用。'},
{id:'grok', name:'Grok', url:'https://grok.com', note:'xAI 对话助手。'},
{id:'claude', name:'Muse', url:'https://claude.ai', note:'Anthropic 对话助手，长文写作与代码处理常用。'},
{id:'doubao', name:'豆包', url:'https://www.doubao.com', note:'字节跳动 AI 助手，写作 / 生图 / 视频常用。'},
{id:'dumate', name:'百度搭子 DuMate', url:'https://dumate.baidu.com', note:'百度搭子，网页版为主。'}
];
function platformName(id){ var p = PLATFORMS.find(function(x){return x.id===id;}); return p? p.name: id;}

/* 提示词：与 data/prompts.json 内容一致。内嵌一份是为了双击 index.html（file://）也能用，
file:// 下 fetch 本地 JSON 会被浏览器拦截，所以不依赖 fetch。改提示词时请两处同步。 */
var PROMPTS = [
{id:'p1',title:'产品文案改写',category:'文案',platforms:['chatgpt','claude','doubao','workbuddy','grok','dumate'],example:'示例：产品名=示例产品',body:'请把下面这段文案改写一版，产品是{产品名}，改写方向是{改写方向，如更口语、更简洁、更适合小红书}，约{字数}字。\n原文：{原文}\n要求：只写已确认的产品事实，不编造参数和功效；保留原文里正确的卖点，不确定的写「待确认」；语气{语气}。'},
{id:'p2',title:'配图生成',category:'图片',platforms:['chatgpt','doubao','grok','dumate'],example:'示例：产品名=示例产品',body:'为产品{产品名}生成一张{用途，如电商主图/社交配图}：画面主体是{产品形态描述}，突出{核心卖点}，风格{风格，如干净明亮}，无文字、无水印、无多余杂物，比例{比例}。\n参考资源：{引用说明}'},
{id:'p3',title:'跨 AI 续作交接',category:'通用',platforms:['chatgpt','claude','doubao','workbuddy','grok','dumate'],example:'示例：把原稿粘贴到 {原文} 处',body:'下面是上一个 AI 写的稿子，请接着改，不要从头重写。\n原稿：{原文}\n修改要求：{修改要求}\n要求：只改要求里提到的地方，其他内容保持原样；只写已确认的事实，不编造参数；改完后在文末用一句话说明改了哪里。'},
{id:'p4',title:'种草文案（小红书 / 社交平台）',category:'文案',platforms:['chatgpt','claude','doubao','dumate'],example:'示例：产品名=示例产品；渠道=小红书',body:'请为产品 {产品名} 写一篇 {渠道} 种草文案，约 {字数} 字。\n核心卖点（按顺序）：{核心卖点}。\n目标人群：{目标人群}；语气：{语气，如真实体验感、不夸张}。\n要求：只写已确认的产品参数，不编造数据和功效；不出现 {禁用词}；结尾一句自然的购买提示，不堆砌标签。'},
{id:'p5',title:'电商详情 / 卖点提炼',category:'文案',platforms:['chatgpt','claude','workbuddy','doubao'],example:'示例：产品名=示例产品',body:'请把下面这段产品资料提炼成电商详情页文案，分 {段数} 段：先一句话卖点，再逐条讲功能，最后一段讲适用人群与注意事项。\n产品：{产品名}；核心卖点：{核心卖点}；已确认参数：{参数}。\n要求：每条卖点只写资料里有的内容，不确定的写「待确认」；语言简洁，适合直接上架。\n资料：{原文}'},
{id:'p6',title:'GEO 长文任务简报',category:'文案',platforms:['chatgpt','claude','workbuddy','grok'],example:'示例：产品名=示例产品',body:'请按下面要求起草一篇 {字数} 字以上的产品文章：主题 {主题}，产品 {产品名}，核心卖点 {核心卖点}。\n结构：{结构要求，如痛点引入—产品解析—使用场景—选购建议}。\n要求：分多节写，每节有小标题；只写已确认的事实，不编造参数与排名；文章里提到的图片位置留占位符 {图片占位}，不写图注以外的虚构描述。'},
{id:'p7',title:'产品图生成（示例产品场景图）',category:'图片',platforms:['chatgpt','doubao','grok','dumate'],example:'示例：产品名=示例产品',body:'为产品 {产品名} 生成一张 {场景，如日常使用场景} 图：主体是 {产品形态描述}，突出 {核心卖点}，画面干净、光线自然、无文字、无水印、无多余杂物，比例 {比例}。\n参考资源：{引用说明}'},
{id:'p8',title:'表格对比（选购对比表）',category:'表格',platforms:['chatgpt','claude','workbuddy','doubao'],example:'示例：对比维度以资料里有的为准，不要编造',body:'请把下面几款产品做成一张对比表，列是 {对比维度，如价格、续航、核心功能、适用人群}，行是各产品。\n产品资料：{原文}。\n要求：只填资料里明确写出的信息，缺失的格子写「—」不猜；表后加两行结论：分别适合谁、不适合谁。'},
{id:'p9',title:'视频口播脚本（短视频）',category:'视频',platforms:['chatgpt','claude','doubao','dumate'],example:'示例：产品名=示例产品',body:'请为产品 {产品名} 写一段 {时长} 的短视频口播脚本，结构：开头 3 秒钩子—痛点—产品演示—卖点—结尾引导。\n核心卖点：{核心卖点}；目标人群：{目标人群}。\n要求：口语化、每句能直接念；不夸大功效，不出现 {禁用词}；画面提示用方括号标在对应台词后面。'},
{id:'p10',title:'跨 AI 背景交接 · 导出提示词',category:'通用',platforms:['chatgpt','claude','doubao','workbuddy','grok','dumate'],example:'用法：粘贴到 A 平台，复制它输出的背景块',body:'请把我们在这次对话里已经确认的、关于我的背景整理成一段可以直接粘贴给另一个 AI 的说明，500 字以内，按下面 5 节写，每节一两句话，只写已经确认的事实，不确定的写「待确认」，不要推测：\n\n1. 我是谁：在做什么工作、用什么产品或项目（比如品牌、品类）。\n2. 在做的事：正在进行的项目和当前状态。\n3. 关键规则与决定：已经定下来的数字、措辞、做法（比如计费规则、必须遵守的格式要求）。\n4. 我的偏好与边界：回复语言、回答方式、内容使用的限制。\n5. 待定事项：还没拍板、等我确认的问题。\n\n安全要求：不要包含密码、API Key、邀请码原文、支付信息等敏感内容；只输出这段说明本身，不要加开场白和解释。'},
{id:'p11',title:'跨 AI 背景交接 · 导入提示词',category:'通用',platforms:['chatgpt','claude','doubao','workbuddy','grok','dumate'],example:'用法：先粘贴本提示词，再粘贴背景块',body:'下面是我从另一个 AI 那里带回来的背景说明，请在本次对话里按它来理解我的情况：\n\n（在这里粘贴背景块）\n\n使用规则：\n1. 只把这段说明当作本次任务的背景，不用存成长期记忆，除非我明确让你记住。\n2. 回答用中文，先给重要结论再解释，结论要有真实依据，不能拿猜想当结论。\n3. 如果这段背景和你已知的事实有冲突，以我这次给的为准，并直接指出冲突点。\n4. 涉及花钱、删改数据、对外发送的操作，先问我再做。'}
];

var KEY = 'maw_v1';
function todayStr(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');}
function sampleData(){
return {
tasks:[
{id:'t1', title:'示例产品小红书种草文案', product:'示例产品（示例）', platforms:['chatgpt','doubao'], status:'doing', prompt:'模板 4 · 种草文案', notes:'只写已确认的参数，不编造。示例任务，可删除。', createdAt: todayStr()},
{id:'t2', title:'GEO 长文：示例产品选购指南', product:'示例产品（示例）', platforms:['claude','workbuddy'], status:'todo', prompt:'模板 6 · GEO 长文任务简报', notes:'900 字以上，分多节，每节有小标题。示例任务，可删除。', createdAt: todayStr()}
],
resources:[
{id:'r1', name:'示例产品种草文案初稿', type:'文案', source:'chatgpt', tags:'示例产品, 种草, 小红书', path:'D:\\示例产品\\文案\\种草初稿.docx（示例路径）', date: todayStr()},
{id:'r2', name:'示例场景图', type:'图片', source:'doubao', tags:'示例产品, 场景图', path:'D:\\示例产品\\图片\\场景图.png（示例路径）', date: todayStr()},
{id:'r3', name:'示例产品选购对比表', type:'表格', source:'workbuddy', tags:'示例产品, 对比', path:'D:\\示例产品\\表格\\选购对比.xlsx（示例路径）', date: todayStr()}
],
quota:{},
settings:{ workbuddyPath:'%LOCALAPPDATA%\\Programs\\WorkBuddy\\WorkBuddy.exe', doubaoPath:''}
};
}
function load(){
try { var raw = localStorage.getItem(KEY); if (raw) { var d = JSON.parse(raw); if (d.tasks && d.resources) return d;}} catch(e){}
var s = sampleData(); save(s); return s;
}
function save(d){ localStorage.setItem(KEY, JSON.stringify(d));}
var state = load();
var editingTaskId = null;
var selectedPromptId = null;

function $(id){ return document.getElementById(id);}
function esc(s){ return String(s == null? '': s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(msg){ var t = $('toast'); t.textContent = msg; t.style.display = 'block'; setTimeout(function(){ t.style.display = 'none';}, 2200);}
function copyText(text, okMsg){
function done(){ toast(okMsg || '已复制');}
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done();});
} else { fallbackCopy(text); done();}
}
function fallbackCopy(text){
var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
document.body.appendChild(ta); ta.select();
try { document.execCommand('copy');} catch(e){}
document.body.removeChild(ta);
}
function uid(prefix){ return prefix + Date.now().toString(36) + Math.floor(Math.random()*1000);}
function statusLabel(s){ return s==='done'? '已完成': (s==='doing'? '进行中': '待办');}
function statusClass(s){ return s==='done'? 'done': (s==='doing'? 'doing': 'todo');}

/* ---- Tabs ---- */
document.querySelectorAll('nav.tabs button').forEach(function(btn){
btn.addEventListener('click', function(){
document.querySelectorAll('nav.tabs button').forEach(function(b){ b.classList.remove('active');});
btn.classList.add('active');
document.querySelectorAll('section.panel').forEach(function(p){ p.classList.remove('active');});
$('tab-' + btn.dataset.tab).classList.add('active');
});
});

/* ---- Tasks ---- */
function renderTaskPlatformChecks(){
$('taskPlatforms').innerHTML = PLATFORMS.map(function(p){
return '<label><input type="checkbox" value="' + p.id + '"> ' + esc(p.name) + '</label>';
}).join('');
var fp = $('filterPlatform');
fp.innerHTML = '<option value="">全部平台</option>' + PLATFORMS.map(function(p){ return '<option value="' + p.id + '">' + esc(p.name) + '</option>';}).join('');
var rs = $('resSource');
rs.innerHTML = PLATFORMS.map(function(p){ return '<option value="' + p.id + '">' + esc(p.name) + '</option>';}).join('');
}
function checkedPlatforms(){
return Array.prototype.slice.call(document.querySelectorAll('#taskPlatforms input:checked')).map(function(c){ return c.value;});
}
function renderTasks(){
var total = state.tasks.length;
var done = state.tasks.filter(function(t){ return t.status==='done';}).length;
var doing = state.tasks.filter(function(t){ return t.status==='doing';}).length;
$('taskStats').innerHTML =
'<div class="stat"><b>' + total + '</b><span>全部任务</span></div>' +
'<div class="stat"><b>' + doing + '</b><span>进行中</span></div>' +
'<div class="stat"><b>' + done + '</b><span>已完成</span></div>' +
'<div class="stat"><b>' + state.resources.length + '</b><span>资源总数</span></div>';
var fs = $('filterStatus').value, fp = $('filterPlatform').value, q = ($('searchTask').value || '').trim();
var list = state.tasks.filter(function(t){
if (fs && t.status!== fs) return false;
if (fp && t.platforms.indexOf(fp) === -1) return false;
if (q && (t.title + ' ' + (t.product||'') + ' ' + (t.notes||'')).indexOf(q) === -1) return false;
return true;
});
$('taskList').innerHTML = list.length? list.map(function(t){
return '<div class="card"><h4>' + esc(t.title) + ' <span class="pill ' + statusClass(t.status) + '">' + statusLabel(t.status) + '</span></h4>' +
'<div class="muted">产品：' + esc(t.product || '—') + ' · 平台：' + t.platforms.map(platformName).map(esc).join('、') + ' · ' + esc(t.createdAt || '') + '</div>' +
(t.prompt? '<div>提示词快照：' + esc(t.prompt) + '</div>': '') +
(t.notes? '<div>' + esc(t.notes) + '</div>': '') +
'<div class="btnrow"><button class="btn small" data-act="brief" data-id="' + t.id + '">复制简报</button>' +
'<button class="btn small secondary" data-act="edit" data-id="' + t.id + '">编辑</button>' +
'<button class="btn small secondary" data-act="toggle" data-id="' + t.id + '">' + (t.status==='done'? '改回进行中': '标记完成') + '</button>' +
'<button class="btn small danger" data-act="del" data-id="' + t.id + '">删除</button></div></div>';
}).join(''): '<p class="muted">没有符合条件的任务，先新建一个。</p>';
// brief task selector
var sel = $('briefTask');
var cur = sel.value;
sel.innerHTML = state.tasks.map(function(t){ return '<option value="' + t.id + '">' + esc(t.title) + '</option>';}).join('') || '<option value="">（暂无任务）</option>';
if (cur && state.tasks.some(function(t){ return t.id===cur;})) sel.value = cur;
else { var doingTask = state.tasks.find(function(t){ return t.status==='doing';}); if (doingTask) sel.value = doingTask.id;}
}
function taskBrief(t){
return '' + t.title + '\n产品：' + (t.product || '待确认') + '\n平台：' + t.platforms.map(platformName).join('、') + '\n状态：' + statusLabel(t.status) +
(t.prompt? '\n提示词：' + t.prompt: '') + (t.notes? '\n备注：' + t.notes: '') +
'\n要求：回答用中文，先给重要结论再解释；只写已确认的事实，不编造参数，不确定的写「待确认」。';
}
$('taskForm').addEventListener('submit', function(e){
e.preventDefault();
var title = $('taskTitle').value.trim();
if (!title) { toast('请先填任务标题'); return;}
var data = { title:title, product:$('taskProduct').value.trim(), platforms:checkedPlatforms(), status:$('taskStatus').value, prompt:$('taskPrompt').value.trim(), notes:$('taskNotes').value.trim()};
if (editingTaskId) {
var t = state.tasks.find(function(x){ return x.id===editingTaskId;});
if (t) Object.assign(t, data);
toast('任务已更新'); editingTaskId = null; $('taskSubmit').textContent = '新建任务'; $('taskCancelEdit').hidden = true;
} else {
data.id = uid('t'); data.createdAt = todayStr(); state.tasks.unshift(data); toast('任务已新建');
}
save(state); e.target.reset(); renderTasks();
});
$('taskCancelEdit').addEventListener('click', function(){
editingTaskId = null; $('taskForm').reset(); $('taskSubmit').textContent = '新建任务'; this.hidden = true;
});
$('taskList').addEventListener('click', function(e){
var btn = e.target.closest('button[data-act]'); if (!btn) return;
var t = state.tasks.find(function(x){ return x.id===btn.dataset.id;}); if (!t) return;
if (btn.dataset.act === 'brief') copyText(taskBrief(t), '任务简报已复制，去 AI 里粘贴即可');
if (btn.dataset.act === 'edit') {
editingTaskId = t.id;
$('taskTitle').value = t.title; $('taskProduct').value = t.product || ''; $('taskStatus').value = t.status;
$('taskPrompt').value = t.prompt || ''; $('taskNotes').value = t.notes || '';
document.querySelectorAll('#taskPlatforms input').forEach(function(c){ c.checked = t.platforms.indexOf(c.value)!== -1;});
$('taskSubmit').textContent = '保存修改'; $('taskCancelEdit').hidden = false;
$('tab-tasks').scrollIntoView();
}
if (btn.dataset.act === 'toggle') { t.status = t.status==='done'? 'doing': 'done'; save(state); renderTasks(); toast('状态已更新');}
if (btn.dataset.act === 'del') { if (confirm('确认删除任务「' + t.title + '」吗？')) { state.tasks = state.tasks.filter(function(x){ return x.id!==t.id;}); save(state); renderTasks(); toast('已删除');}}
});
['filterStatus','filterPlatform'].forEach(function(id){ $(id).addEventListener('change', renderTasks);});
$('searchTask').addEventListener('input', renderTasks);

/* ---- Launcher ---- */
function renderLauncher(){
$('platformList').innerHTML = PLATFORMS.map(function(p){
var pathNote = '';
if (p.id==='workbuddy') pathNote = '<div class="muted">桌面路径（可改）：' + esc(state.settings.workbuddyPath || '未填写') + '</div>';
if (p.id==='doubao') pathNote = '<div class="muted">桌面路径（可改）：' + esc(state.settings.doubaoPath || '未填写，请按本机实际填写') + '</div>';
if (p.id==='dumate') pathNote = '<div class="muted">以网页版为主，无桌面客户端路径。</div>';
return '<div class="platform"><h4>' + esc(p.name) + '</h4><div class="url">' + esc(p.url) + '</div><p class="muted">' + esc(p.note) + '</p>' + pathNote +
'<div class="btnrow"><a class="btn" href="' + p.url + '" target="_blank" rel="noopener">打开官网</a>' +
'<button class="btn secondary" data-copy-url="' + p.url + '">复制网址</button></div></div>';
}).join('');
}
$('platformList').addEventListener('click', function(e){
var btn = e.target.closest('button[data-copy-url]'); if (!btn) return;
copyText(btn.dataset.copyUrl, '网址已复制');
});
$('copyBrief').addEventListener('click', function(){
var t = state.tasks.find(function(x){ return x.id===$('briefTask').value;});
if (!t) { toast('暂无任务，先在任务板新建一个'); return;}
copyText(taskBrief(t), '任务简报已复制，去 AI 里粘贴即可');
});

/* ---- Prompts ---- */
function promptVars(body){
var seen = [], m, re = /\{([^}]+)\}/g;
while ((m = re.exec(body))!== null) { if (seen.indexOf(m[1]) === -1) seen.push(m[1]);}
return seen;
}
function renderPrompts(){
var cat = $('promptCategory').value, q = ($('searchPrompt').value || '').trim();
var list = PROMPTS.filter(function(p){
if (cat && p.category!== cat) return false;
if (q && (p.title + ' ' + p.body).indexOf(q) === -1) return false;
return true;
});
$('promptList').innerHTML = list.length? list.map(function(p){
return '<div class="card"><h4>' + esc(p.title) + ' <span class="pill">' + esc(p.category) + '</span></h4>' +
'<div class="muted">适用：' + p.platforms.map(platformName).map(esc).join('、') + ' · ' + esc(p.example || '') + '</div>' +
'<div class="btnrow"><button class="btn small" data-prompt="' + p.id + '">打开填变量</button>' +
'<button class="btn small secondary" data-copy-prompt="' + p.id + '">复制原文</button></div></div>';
}).join(''): '<p class="muted">没有符合条件的提示词。</p>';
}
function fillPrompt(body, values){
var out = body;
Object.keys(values).forEach(function(k){ out = out.split('{' + k + '}').join(values[k] || '{' + k + '}');});
return out;
}
function showPromptDetail(id){
var p = PROMPTS.find(function(x){ return x.id===id;}); if (!p) return;
selectedPromptId = id;
var vars = promptVars(p.body);
var inputs = vars.map(function(v){
return '<div><label>{' + esc(v) + '}</label><input data-var="' + esc(v) + '" placeholder="填 ' + esc(v) + '"></div>';
}).join('');
$('promptDetail').innerHTML = '<div class="card"><h3>' + esc(p.title) + '</h3><p class="muted">' + esc(p.example || '') + '</p>' +
'<div class="grid2">' + inputs + '</div>' +
'<h3>预览（填好后）</h3><pre id="promptPreview">' + esc(p.body) + '</pre>' +
'<div class="btnrow"><button class="btn" id="copyFilled">复制填好后的提示词</button><button class="btn secondary" id="copyRaw">复制原文</button>' +
'<button class="btn secondary" id="useInTask">把标题存为任务快照</button></div></div>';
$('promptDetail').querySelectorAll('input[data-var]').forEach(function(inp){
inp.addEventListener('input', updatePreview);
});
function updatePreview(){
var values = {};
$('promptDetail').querySelectorAll('input[data-var]').forEach(function(inp){ values[inp.dataset.var] = inp.value.trim();});
$('promptPreview').textContent = fillPrompt(p.body, values);
}
$('copyFilled').addEventListener('click', function(){ copyText($('promptPreview').textContent, '已复制填好后的提示词');});
$('copyRaw').addEventListener('click', function(){ copyText(p.body, '提示词原文已复制');});
$('useInTask').addEventListener('click', function(){
$('taskPrompt').value = p.title;
document.querySelector('nav.tabs button[data-tab="tasks"]').click();
toast('已填入任务表单的“提示词快照”，建任务时一起保存');
});
}
$('promptList').addEventListener('click', function(e){
var openBtn = e.target.closest('button[data-prompt]');
if (openBtn) { showPromptDetail(openBtn.dataset.prompt); $('promptDetail').scrollIntoView(); return;}
var copyBtn = e.target.closest('button[data-copy-prompt]');
if (copyBtn) { var p = PROMPTS.find(function(x){ return x.id===copyBtn.dataset.copyPrompt;}); if (p) copyText(p.body, '提示词原文已复制');}
});
$('promptCategory').addEventListener('change', renderPrompts);
$('searchPrompt').addEventListener('input', renderPrompts);

/* ---- Resources ---- */
function renderResources(){
var type = $('filterResType').value, q = ($('searchRes').value || '').trim();
var list = state.resources.filter(function(r){
if (type && r.type!== type) return false;
if (q && (r.name + ' ' + (r.tags||'') + ' ' + platformName(r.source)).indexOf(q) === -1) return false;
return true;
});
$('resList').innerHTML = list.length? list.map(function(r){
return '<div class="card"><h4>' + esc(r.name) + ' <span class="pill">' + esc(r.type) + '</span></h4>' +
'<div class="muted">来源：' + esc(platformName(r.source)) + ' · 标签：' + esc(r.tags || '—') + ' · ' + esc(r.date || '') + '</div>' +
'<div>本地位置：' + esc(r.path || '—') + '</div>' +
'<div class="btnrow"><button class="btn small secondary" data-copy-path="' + esc(r.path || '') + '">复制路径</button>' +
'<button class="btn small danger" data-del-res="' + r.id + '">删除</button></div></div>';
}).join(''): '<p class="muted">没有符合条件的资源，先加入一个。</p>';
}
$('resForm').addEventListener('submit', function(e){
e.preventDefault();
var name = $('resName').value.trim(); if (!name) { toast('请先填资源名称'); return;}
state.resources.unshift({ id: uid('r'), name:name, type:$('resType').value, source:$('resSource').value, tags:$('resTags').value.trim(), path:$('resPath').value.trim(), date: todayStr()});
save(state); e.target.reset(); renderResources(); renderTasks(); toast('资源已加入');
});
$('resList').addEventListener('click', function(e){
var cp = e.target.closest('button[data-copy-path]');
if (cp) { if (cp.dataset.copyPath) copyText(cp.dataset.copyPath, '路径已复制'); else toast('这条资源没有填路径'); return;}
var del = e.target.closest('button[data-del-res]');
if (del) { if (confirm('确认删除这条资源吗？只删工作台里的记录，不删本地文件。')) { state.resources = state.resources.filter(function(x){ return x.id!==del.dataset.delRes;}); save(state); renderResources(); renderTasks(); toast('已删除');}}
});
$('filterResType').addEventListener('change', renderResources);
$('searchRes').addEventListener('input', renderResources);

/* ---- Quota + Settings ---- */
function renderQuota(){
var date = $('quotaDate').value || todayStr();
var day = state.quota[date] || {};
$('quotaGrid').innerHTML = PLATFORMS.map(function(p){
return '<div><label>' + esc(p.name) + '（今日用量，手动填）</label><input type="number" min="0" step="1" data-quota="' + p.id + '" value="' + (day[p.id] || 0) + '"></div>';
}).join('');
var total = PLATFORMS.reduce(function(s,p){ return s + (Number(day[p.id]) || 0);}, 0);
$('quotaSummary').textContent = date + ' 合计用量：' + total + ' 次（手动记录，仅供参考）。';
}
$('quotaSave').addEventListener('click', function(){
var date = $('quotaDate').value || todayStr();
var day = {};
document.querySelectorAll('input[data-quota]').forEach(function(inp){ day[inp.dataset.quota] = Math.max(0, Number(inp.value) || 0);});
state.quota[date] = day; save(state); renderQuota(); toast('额度记录已保存');
});
$('quotaClearDay').addEventListener('click', function(){
var date = $('quotaDate').value || todayStr();
if (confirm('确认清空 ' + date + ' 的额度记录吗？')) { delete state.quota[date]; save(state); renderQuota(); toast('已清空这一天');}
});
$('quotaToday').addEventListener('click', function(){ $('quotaDate').value = todayStr(); renderQuota();});
$('quotaDate').addEventListener('change', renderQuota);
function renderSettings(){
$('pathWorkbuddy').value = state.settings.workbuddyPath || '';
$('pathDoubao').value = state.settings.doubaoPath || '';
}
$('settingsForm').addEventListener('submit', function(e){
e.preventDefault();
state.settings.workbuddyPath = $('pathWorkbuddy').value.trim();
state.settings.doubaoPath = $('pathDoubao').value.trim();
save(state); renderLauncher(); toast('路径设置已保存（仅本机）');
});
$('copyWorkbuddyPath').addEventListener('click', function(){
if ($('pathWorkbuddy').value.trim()) copyText($('pathWorkbuddy').value.trim(), 'WorkBuddy 路径已复制');
else toast('WorkBuddy 路径是空的');
});
$('copyDoubaoPath').addEventListener('click', function(){
if ($('pathDoubao').value.trim()) copyText($('pathDoubao').value.trim(), '豆包路径已复制');
else toast('豆包路径是空的，请先填写');
});

/* ---- Export / Import ---- */
$('exportData').addEventListener('click', function(){
var blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
var a = document.createElement('a');
a.href = URL.createObjectURL(blob); a.download = 'multi-ai-workbench-backup-' + todayStr() + '.json';
document.body.appendChild(a); a.click(); a.remove();
setTimeout(function(){ URL.revokeObjectURL(a.href);}, 1000);
toast('已导出 JSON 备份');
});
$('importDataBtn').addEventListener('click', function(){ $('importFile').click();});
$('importFile').addEventListener('change', function(e){
var file = e.target.files[0]; if (!file) return;
var reader = new FileReader();
reader.onload = function(){
try {
var d = JSON.parse(reader.result);
if (!d.tasks ||!d.resources) throw new Error('bad file');
state = d; if (!state.quota) state.quota = {}; if (!state.settings) state.settings = {workbuddyPath:'', doubaoPath:''};
save(state); renderAll(); toast('导入成功');
} catch(err) { toast('导入失败：不是有效的备份 JSON');}
};
reader.readAsText(file); e.target.value = '';
});
$('resetSample').addEventListener('click', function(){
if (confirm('确认恢复示例数据吗？当前任务和资源会被示例覆盖。')) { state = sampleData(); save(state); renderAll(); toast('已恢复示例数据');}
});
$('clearAll').addEventListener('click', function(){
if (confirm('确认清空全部数据吗？任务、资源、额度、设置都会删除，且无法恢复。建议先导出备份。')) {
state = { tasks:[], resources:[], quota:{}, settings:{workbuddyPath:'', doubaoPath:''}};
save(state); renderAll(); toast('已清空');
}
});

/* ---- Init ---- */
function renderAll(){ renderTaskPlatformChecks(); renderTasks(); renderLauncher(); renderPrompts(); renderResources(); renderQuota(); renderSettings();}
$('quotaDate').value = todayStr();
renderAll();
