(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', {maximumFractionDigits:0});
  const today = new Date().toISOString().slice(0,10);
  const initialTransactions = [
    {id:1,title:'Monthly Salary',category:'Salary',date:today,payment:'Bank transfer',amount:30000,type:'income'},
    {id:2,title:'Freelance Project',category:'Freelance',date:today,payment:'UPI',amount:5000,type:'income'},
    {id:3,title:'Grocery Shopping',category:'Food',date:today,payment:'UPI',amount:1850,type:'expense'},
    {id:4,title:'Monthly Bus Pass',category:'Transport',date:today,payment:'Card',amount:1200,type:'expense'},
    {id:5,title:'Electricity Bill',category:'Bills',date:today,payment:'UPI',amount:1600,type:'expense'},
    {id:6,title:'College Books',category:'Education',date:today,payment:'Cash',amount:950,type:'expense'},
    {id:7,title:'Shopping Mall',category:'Shopping',date:today,payment:'Card',amount:3500,type:'expense'},
    {id:8,title:'Movie Night',category:'Entertainment',date:today,payment:'UPI',amount:800,type:'expense'},
    {id:9,title:'Coffee & Snacks',category:'Food',date:today,payment:'Cash',amount:650,type:'expense'},
    {id:10,title:'Internet Bill',category:'Bills',date:today,payment:'UPI',amount:900,type:'expense'},
    {id:11,title:'Online Course',category:'Education',date:today,payment:'Card',amount:1200,type:'expense'},
    {id:12,title:'Weekend Market',category:'Shopping',date:today,payment:'UPI',amount:1600,type:'expense'}
  ];
  const initialBudgets = [
    {id:1,category:'Food',icon:'🥑',limit:5000,spent:3000,color:'#a8c9a0'},
    {id:2,category:'Transport',icon:'🚌',limit:2000,spent:1200,color:'#9db8dc'},
    {id:3,category:'Shopping',icon:'🛍️',limit:4000,spent:3500,color:'#e9b8a5'},
    {id:4,category:'Entertainment',icon:'🎬',limit:1500,spent:800,color:'#c0b1df'}
  ];
  const initialGoals = [
    {id:1,title:'New Laptop',icon:'💻',saved:25000,target:40000,date:'2027-03-01'},
    {id:2,title:'Emergency Fund',icon:'🌱',saved:30000,target:50000,date:'2027-06-01'}
  ];
  const read = (key, fallback) => { try { const x=localStorage.getItem(key); return x ? JSON.parse(x) : structuredClone(fallback); } catch { return fallback; } };
  let transactions = read('sm_transactions', initialTransactions);
  let budgets = read('sm_budgets', initialBudgets);
  let goals = read('sm_goals', initialGoals);
  let toastTimer;
  const save = () => { localStorage.setItem('sm_transactions',JSON.stringify(transactions));localStorage.setItem('sm_budgets',JSON.stringify(budgets));localStorage.setItem('sm_goals',JSON.stringify(goals)); };
  function toast(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
  const total = type => transactions.filter(t=>t.type===type).reduce((a,t)=>a+Number(t.amount),0);
  const expenseCategories = ['Food','Transport','Shopping','Bills','Education','Entertainment','Other'];
  const colors=['#a8c9a0','#9db8dc','#e9b8a5','#e9d28f','#c0b1df','#edb7bd','#c9d3c2'];
  const iconFor = cat => ({Food:'🥑',Transport:'🚌',Shopping:'🛍️',Bills:'💡',Education:'📚',Entertainment:'🎬',Salary:'💼',Freelance:'✦',Scholarship:'🎓',Other:'✧'})[cat] || '✧';
  function updateSummary(){
    $$('[data-total-income]').forEach(el=>el.textContent=money(total('income')));
    $$('[data-total-expenses]').forEach(el=>el.textContent=money(total('expense')));
    $$('[data-total-savings]').forEach(el=>el.textContent=money(total('income')-total('expense')));
    $$('[data-total-balance]').forEach(el=>el.textContent=money(45250 + total('income')-35000 - (total('expense')-18750)));
    const count=$('#transactionCount');if(count)count.textContent=transactions.length;
    const rate=$('#savingsRate');if(rate)rate.textContent=(total('income')?((total('income')-total('expense'))/total('income')*100):0).toFixed(1)+'%';
    const highest=$('#highestCategory');if(highest){const totals={};transactions.filter(t=>t.type==='expense').forEach(t=>totals[t.category]=(totals[t.category]||0)+Number(t.amount));highest.textContent=Object.keys(totals).sort((a,b)=>totals[b]-totals[a])[0]||'—';}
  }
  function transactionRow(t,actions=false){
    return `<tr><td><div class="transaction-cell"><span class="transaction-icon">${iconFor(t.category)}</span><span><strong>${escapeHtml(t.title)}</strong><small>${t.type==='income'?'Income received':'Expense paid'}</small></span></div></td><td>${escapeHtml(t.category)}</td><td>${formatDate(t.date)}</td><td>${escapeHtml(t.payment||'—')}</td><td class="align-right amount ${t.type}">${t.type==='income'?'+':'−'}${money(t.amount)}</td>${actions?`<td><button class="action-btn" data-edit="${t.id}">Edit</button><button class="action-btn delete-btn" data-delete="${t.id}">Delete</button></td>`:''}</tr>`;
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatDate(d){if(!d)return '—';const dt=new Date(d+'T00:00:00');return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
  function filteredTransactions(onlyType=null){
    const q=($('#transactionSearch')?.value||'').toLowerCase(),type=$('#typeFilter')?.value||'all',cat=$('#categoryFilter')?.value||'all',month=$('#dateFilter')?.value||'';
    return [...transactions].filter(t=>(!onlyType||t.type===onlyType)&&(type==='all'||t.type===type)&&(cat==='all'||t.category===cat)&&(!month||t.date.startsWith(month))&&(`${t.title} ${t.category} ${t.payment}`.toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  }
  function renderTransactions(){
    const table=$('#transactionsTable');
    if(table){const only=table.dataset.onlyType||null;const list=filteredTransactions(only);table.innerHTML=list.map(t=>transactionRow(t,true)).join('');const empty=$('#emptyTransactions');if(empty)empty.classList.toggle('hidden',list.length!==0);}
    const recent=$('#recentTransactions');if(recent)recent.innerHTML=[...transactions].sort((a,b)=>b.id-a.id).slice(0,6).map(t=>transactionRow(t,false)).join('');
  }
  function renderBudgets(){
    const preview=$('#budgetPreview'),grid=$('#budgetGrid');
    const markup=b=>{const pct=Math.round(b.spent/Math.max(1,b.limit)*100),cls=pct>=100?'over':pct>=80?'warn':'';return `<div class="budget-item"><div class="budget-item-top"><span class="category-name"><span class="category-emoji">${b.icon||iconFor(b.category)}</span>${escapeHtml(b.category)}</span><span class="budget-amount"><strong>${money(b.spent)}</strong> / ${money(b.limit)}</span></div><div class="progress-track"><div class="progress-fill ${cls}" style="width:${Math.min(pct,100)}%;background:${cls?'':b.color||''}"></div></div><div class="progress-foot"><span>${pct>=100?'Budget reached':pct>=80?'Almost at limit':money(Math.max(0,b.limit-b.spent))+' remaining'}</span><span>${pct}%</span></div></div>`};
    if(preview)preview.innerHTML=budgets.slice(0,4).map(markup).join('');
    if(grid){grid.innerHTML=budgets.map(b=>{const pct=Math.round(b.spent/Math.max(1,b.limit)*100),cls=pct>=100?'over':pct>=80?'warn':'';return `<article class="budget-card"><div class="budget-item-top"><span class="category-name"><span class="category-emoji">${b.icon||iconFor(b.category)}</span>${escapeHtml(b.category)}</span><button class="action-btn delete-btn" data-delete-budget="${b.id}">Delete</button></div><div class="budget-big">${money(b.spent)} <small>of ${money(b.limit)}</small></div><div class="progress-track"><div class="progress-fill ${cls}" style="width:${Math.min(100,pct)}%"></div></div><div class="budget-foot"><span>${pct>=80?'Close to your limit':money(Math.max(0,b.limit-b.spent))+' left to spend'}</span><strong>${pct}%</strong></div></article>`}).join('');}
    const planned=$('#budgetTotal'),spent=$('#budgetSpent'),left=$('#budgetLeft');if(planned)planned.textContent=money(budgets.reduce((a,b)=>a+b.limit,0));if(spent)spent.textContent=money(budgets.reduce((a,b)=>a+b.spent,0));if(left)left.textContent=money(budgets.reduce((a,b)=>a+b.limit-b.spent,0));
  }
  function renderGoals(){
    const preview=$('#goalPreview'),grid=$('#goalsGrid');
    const small=g=>{const pct=Math.round(g.saved/Math.max(1,g.target)*100);return `<div class="goal-item"><div class="goal-item-top"><span class="goal-name"><span class="goal-symbol">${g.icon||'✧'}</span>${escapeHtml(g.title)}</span><span class="goal-right"><strong>${pct}%</strong>${money(g.saved)} saved</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(pct,100)}%"></div></div></div>`};
    if(preview)preview.innerHTML=goals.slice(0,3).map(small).join('');
    if(grid)grid.innerHTML=goals.map(g=>{const pct=Math.round(g.saved/Math.max(1,g.target)*100);return `<article class="goal-card"><div class="goal-card-head"><span class="goal-icon">${g.icon||'✧'}</span><button class="action-btn delete-btn" data-delete-goal="${g.id}">Delete</button></div><h3>${escapeHtml(g.title)}</h3><p class="goal-sub">A little saved is a step closer.</p><div class="goal-numbers"><strong>${money(g.saved)}</strong><span>of ${money(g.target)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(pct,100)}%"></div></div><div class="goal-progress-meta"><span>${money(Math.max(0,g.target-g.saved))} to go</span><strong>${pct}%</strong></div><div class="goal-date">Target date: ${formatDate(g.date)}</div><div class="modal-actions"><button class="action-btn" data-add-saving="${g.id}">＋ Add savings</button><button class="action-btn" data-edit-goal="${g.id}">Edit goal</button></div></article>`}).join('');
  }
  let incomeChart,categoryChart,savingsChart;
  function chartDefaults(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#304d37',padding:10,cornerRadius:8,displayColors:true}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:'#98a295',font:{family:'DM Sans',size:10}}},y:{beginAtZero:true,grid:{color:'#eef1eb'},border:{display:false},ticks:{color:'#98a295',font:{family:'DM Sans',size:10},callback:v=>'₹'+(v/1000)+'k'}}}}}
  function renderCharts(){
    if(typeof Chart==='undefined')return;
    const bar=$('#incomeExpenseChart');
    if(bar){incomeChart?.destroy();incomeChart=new Chart(bar,{type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Income',data:[28000,32000,30000,34000,31000,35000],backgroundColor:'#a8c9a0',borderRadius:6,barPercentage:.55},{label:'Expenses',data:[19000,21000,17000,22000,20000,18750],backgroundColor:'#edb2a6',borderRadius:6,barPercentage:.55}]},options:{...chartDefaults(),scales:{...chartDefaults().scales,x:{...chartDefaults().scales.x,grid:{display:false}},y:chartDefaults().scales.y}}});}
    const donut=$('#expenseCategoryChart');
    if(donut){categoryChart?.destroy();const sums=expenseCategories.map(c=>transactions.filter(t=>t.type==='expense'&&(t.category===c||(c==='Other'&&!expenseCategories.includes(t.category)))).reduce((a,t)=>a+Number(t.amount),0));const labels=expenseCategories;categoryChart=new Chart(donut,{type:'doughnut',data:{labels,datasets:[{data:sums,backgroundColor:colors,borderWidth:3,borderColor:'#fff',hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${money(ctx.raw)}`}}}}});const legend=$('#categoryLegend');if(legend)legend.innerHTML=labels.map((l,i)=>`<div class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span><span>${l}</span><strong class="legend-value">${sums.reduce((a,b)=>a+b,0)?Math.round(sums[i]/sums.reduce((a,b)=>a+b,0)*100):0}%</strong></div>`).join('');}
    const trend=$('#savingsTrendChart');if(trend){savingsChart?.destroy();savingsChart=new Chart(trend,{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Savings',data:[9000,11000,13000,12000,11000,16250],borderColor:'#6d9a67',backgroundColor:'#e9f2e5',fill:true,tension:.35,pointBackgroundColor:'#6d9a67',pointRadius:4}]},options:{...chartDefaults(),scales:{...chartDefaults().scales,y:{...chartDefaults().scales.y}}}});}
  }
  function openModal(title,fields,submitText,onSubmit){
    const root=$('#modalRoot');if(!root)return;
    root.innerHTML=`<div class="modal-backdrop"><form class="modal" id="activeModal"><div class="modal-head"><h3>${title}</h3><button type="button" class="modal-close" data-close-modal>×</button></div><div class="form-grid">${fields.map(f=>`<label class="field-label ${f.full?'full-field':''}">${f.label}${f.type==='select'?`<select class="form-control" name="${f.name}" ${f.required===false?'':'required'}>${f.options.map(o=>`<option value="${escapeHtml(o.value??o)}" ${String(o.value??o)===String(f.value??'')?'selected':''}>${escapeHtml(o.label??o)}</option>`).join('')}</select>`:`<input class="form-control" name="${f.name}" type="${f.type||'text'}" value="${escapeHtml(f.value??'')}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.step?`step="${f.step}"`:''} ${f.required===false?'':'required'} placeholder="${escapeHtml(f.placeholder||'')}">`}</label>`).join('')}</div><div class="modal-actions"><button type="button" class="cancel-btn" data-close-modal>Cancel</button><button class="primary-btn" type="submit">${submitText}</button></div></form></div>`;
    $('[data-close-modal]',root).addEventListener('click',()=>root.innerHTML='');$('.modal-backdrop',root).addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))root.innerHTML='';});
    $('#activeModal').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());onSubmit(data);root.innerHTML='';});
  }
  function transactionForm(existing=null,forcedType=null){
    const t=existing||{title:'',amount:'',type:forcedType||'expense',category:forcedType==='income'?'Salary':'Food',date:today,payment:'UPI'};
    openModal(existing?'Edit transaction':'Add transaction',[{label:'Transaction title',name:'title',value:t.title,full:true,placeholder:'e.g. Grocery shopping'},{label:'Amount (₹)',name:'amount',type:'number',value:t.amount,min:'1',step:'1'},{label:'Type',name:'type',type:'select',value:t.type,options:[{value:'expense',label:'Expense'},{value:'income',label:'Income'}]},{label:'Category',name:'category',type:'select',value:t.category,options:['Food','Transport','Shopping','Bills','Education','Entertainment','Salary','Freelance','Scholarship','Other']},{label:'Date',name:'date',type:'date',value:t.date},{label:'Payment method',name:'payment',type:'select',value:t.payment,options:['UPI','Cash','Card','Bank transfer','Other']}],'Save transaction',d=>{if(!d.title.trim()||Number(d.amount)<=0){toast('Enter a title and amount greater than zero.');return;}const item={...d,amount:Number(d.amount),id:existing?existing.id:Date.now()};if(existing)transactions=transactions.map(x=>x.id===existing.id?item:x);else transactions.push(item);save();refresh();toast(existing?'Transaction updated':'Transaction added');});
  }
  function refresh(){updateSummary();renderTransactions();renderBudgets();renderGoals();renderCharts();}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-add-transaction]'))transactionForm();
    const addType=e.target.closest('[data-add-type]');if(addType)transactionForm(null,addType.dataset.addType);
    const edit=e.target.closest('[data-edit]');if(edit){const t=transactions.find(x=>x.id===Number(edit.dataset.edit));if(t)transactionForm(t);}
    const del=e.target.closest('[data-delete]');if(del){if(confirm('Delete this demo transaction?')){transactions=transactions.filter(t=>t.id!==Number(del.dataset.delete));save();refresh();toast('Transaction deleted');}}
    const db=e.target.closest('[data-delete-budget]');if(db&&confirm('Delete this budget?')){budgets=budgets.filter(b=>b.id!==Number(db.dataset.deleteBudget));save();refresh();toast('Budget deleted');}
    const dg=e.target.closest('[data-delete-goal]');if(dg&&confirm('Delete this savings goal?')){goals=goals.filter(g=>g.id!==Number(dg.dataset.deleteGoal));save();refresh();toast('Goal deleted');}
    const editGoal=e.target.closest('[data-edit-goal]');if(editGoal){const g=goals.find(x=>x.id===Number(editGoal.dataset.editGoal));if(g)goalForm(g);}
    const addSaving=e.target.closest('[data-add-saving]');if(addSaving){const g=goals.find(x=>x.id===Number(addSaving.dataset.addSaving));if(g)openModal('Add to savings',[{label:'Amount to add (₹)',name:'amount',type:'number',min:1,step:1,full:true}],'Add savings',d=>{g.saved+=Number(d.amount);save();refresh();toast('Savings goal updated');});}
  });
  function budgetForm(){openModal('Add budget',[{label:'Category',name:'category',type:'select',options:['Food','Transport','Shopping','Bills','Education','Entertainment','Other']},{label:'Budget limit (₹)',name:'limit',type:'number',min:1,step:1},{label:'Already spent (₹)',name:'spent',type:'number',min:0,step:1,value:0}],'Create budget',d=>{budgets.push({id:Date.now(),category:d.category,icon:iconFor(d.category),limit:Number(d.limit),spent:Number(d.spent||0)});save();refresh();toast('Budget created');});}
  function goalForm(existing=null){const g=existing||{title:'',icon:'🌱',saved:0,target:'',date:''};openModal(existing?'Edit savings goal':'Create savings goal',[{label:'Goal name',name:'title',value:g.title,full:true},{label:'Icon (emoji)',name:'icon',value:g.icon},{label:'Target amount (₹)',name:'target',type:'number',min:1,step:1,value:g.target},{label:'Already saved (₹)',name:'saved',type:'number',min:0,step:1,value:g.saved},{label:'Target date',name:'date',type:'date',value:g.date,full:true}],'Save goal',d=>{const item={...d,id:existing?existing.id:Date.now(),target:Number(d.target),saved:Number(d.saved||0)};if(existing)goals=goals.map(x=>x.id===existing.id?item:x);else goals.push(item);save();refresh();toast(existing?'Goal updated':'Savings goal created');});}
  $('#addBudget')?.addEventListener('click',budgetForm);$('#addGoal')?.addEventListener('click',()=>goalForm());
  ['transactionSearch','typeFilter','categoryFilter','dateFilter'].forEach(id=>$('#'+id)?.addEventListener('input',renderTransactions));
  $('#chartPeriod')?.addEventListener('change',()=>{toast('Chart period updated for demonstration');});
  $('#mobileMenu')?.addEventListener('click',()=>$('#sidebar')?.classList.toggle('open'));
  document.addEventListener('click',e=>{if(window.innerWidth<=850&&!e.target.closest('#sidebar')&&!e.target.closest('#mobileMenu'))$('#sidebar')?.classList.remove('open');});
  $('#notifications')?.addEventListener('click',()=>toast('You are all caught up!'));
  $('#exportCsv')?.addEventListener('click',()=>{const rows=[['Title','Type','Category','Date','Payment','Amount'],...transactions.map(t=>[t.title,t.type,t.category,t.date,t.payment,t.amount])];const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='smart-expense-report.csv';a.click();URL.revokeObjectURL(a.href);toast('CSV report downloaded');});
  $('#saveProfile')?.addEventListener('click',()=>{const name=$('#displayName')?.value.trim();if(name){$$('.sidebar-bottom strong').forEach(x=>x.textContent=name);toast('Profile updated for this page');}else toast('Please enter a display name');});
  $('#themeToggle')?.addEventListener('change',e=>{document.body.classList.toggle('dark-mode',e.target.checked);localStorage.setItem('sm_dark',e.target.checked?'1':'0');});
  if(localStorage.getItem('sm_dark')==='1'){document.body.classList.add('dark-mode');if($('#themeToggle'))$('#themeToggle').checked=true;}
  $('#resetData')?.addEventListener('click',()=>{if(confirm('Reset all demo transactions, budgets, and savings goals?')){transactions=structuredClone(initialTransactions);budgets=structuredClone(initialBudgets);goals=structuredClone(initialGoals);save();refresh();toast('Demo data reset');}});
  refresh();
})();