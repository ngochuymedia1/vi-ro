// DOM integration tests (jsdom), not a browser visual-layout test.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
function app(seed){const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://example.test/vi-ro/',runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 if(seed)w.localStorage.setItem('viro:v1:/vi-ro/',JSON.stringify(seed));
 for(const file of ['legacy-v1.js','core.js','storage.js','app.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 return {dom,w,d:w.document,close:()=>w.close(),state:()=>JSON.parse(w.localStorage.getItem('viro:v1:/vi-ro/'))};}
const tick=()=>new Promise(r=>setImmediate(r));
function value(a,selector,v,event='input'){const x=a.d.querySelector(selector);assert.ok(x,selector);x.value=v;x.dispatchEvent(new a.w.Event(event,{bubbles:true}));}
async function send(a,selector){const f=a.d.querySelector(selector);assert.ok(f,selector);f.requestSubmit(f.querySelector('button[type=submit]'));await tick();}
async function start(a){a.d.querySelector('[data-action=setup]').click();for(const [k,v] of Object.entries({total:'22000000',split_save:'2000000',split_borrow:'15000000',debt:'20000000'}))value(a,`#setup-form [name=${k}]`,v);await send(a,'#setup-form');assert.equal(a.state().initialized,true);}

test('all views render, opening setup persists and survives reload',async()=>{const a=app();try{await start(a);for(const view of ['funds','transactions','planning','backup','overview']){a.d.querySelector(`nav [data-view=${view}]`).click();assert.ok(a.d.querySelector('#view').textContent.trim().length>100);}const b=app(a.state());try{assert.match(b.d.querySelector('.total-value').textContent,/22\.000\.000/);}finally{b.close();}}finally{a.close();}});
test('create, allocate, USD spend, edit and display conversion work through forms',async()=>{const a=app();try{await start(a);a.d.querySelector('nav [data-view=funds]').click();a.d.querySelector('[data-action=new-fund]').click();value(a,'#fund-form [name=name]','Quỹ ăn uống');await send(a,'#fund-form');const fund=a.state().funds.find(x=>x.name==='Quỹ ăn uống');assert.ok(fund);
 a.d.querySelector('#add-button').click();a.d.querySelector('[data-type=transfer]').click();value(a,'#tx-form [name=amount]','500000');value(a,'#tx-form [name=to]',fund.id,'change');await send(a,'#tx-form');assert.equal(a.state().transactions.length,1);
 a.d.querySelector('#add-button').click();value(a,'#tx-form [name=account]',fund.id,'change');value(a,'#tx-form [name=currency]','USD','change');value(a,'#tx-form [name=rate]','25000');value(a,'#tx-form [name=amount]','10.50');assert.match(a.d.querySelector('#amount-preview').textContent,/262\.500/);await send(a,'#tx-form');assert.equal(a.state().transactions[1].amount,262500);assert.equal(a.state().transactions[1].fx.units,1050);
 a.d.querySelector('nav [data-view=transactions]').click();const id=a.state().transactions[1].id;a.d.querySelector(`[data-edit="${id}"]`).click();assert.equal(a.d.querySelector('#tx-form [name=amount]').value,'10.50');value(a,'#tx-form [name=amount]','9.25');await send(a,'#tx-form');assert.equal(a.state().transactions[1].amount,231250);
 a.d.querySelector('[data-display=USD]').click();await tick();assert.equal(a.state().settings.display,'USD');assert.match(a.d.querySelector('#view').textContent,/≈ \$/);assert.equal(a.state().transactions[1].fx.rate,25000);
 }finally{a.close();}});
test('borrowed spending requires explicit acknowledgment and never reduces debt',async()=>{const a=app();try{await start(a);a.d.querySelector('#add-button').click();value(a,'#tx-form [name=account]','borrow','change');value(a,'#tx-form [name=amount]','100000');assert.match(a.d.querySelector('#tx-warning').textContent,/tiền vay/);await send(a,'#tx-form');assert.equal(a.state().transactions.length,0);a.d.querySelector('#tx-form [name=ack]').checked=true;await send(a,'#tx-form');assert.equal(a.state().transactions.length,1);assert.equal(a.w.ViRo.ledger(a.state()).debt,20000000);}finally{a.close();}});
test('switching input currency clears amount; invalid USD blocks saving',async()=>{const a=app();try{await start(a);a.d.querySelector('#add-button').click();value(a,'#tx-form [name=amount]','100000');value(a,'#tx-form [name=currency]','USD','change');assert.equal(a.d.querySelector('#tx-form [name=amount]').value,'');value(a,'#tx-form [name=amount]','10.123');value(a,'#tx-form [name=rate]','25000');await send(a,'#tx-form');assert.equal(a.state().transactions.length,0);assert.match(a.d.querySelector('.form-error').textContent,/USD/);}finally{a.close();}});
test('old data is usable in UI and first setting save retains v1 backup',async()=>{const V1=require('../legacy-v1.js'),old=V1.empty();old.initialized=true;old.opening.spend=1000000;const a=app(old);try{assert.match(a.d.querySelector('.total-value').textContent,/1\.000\.000/);a.d.querySelector('#rate-button').click();value(a,'#rate-form [name=rate]','26000');await send(a,'#rate-form');assert.equal(a.state().schema,2);assert.equal(JSON.parse(a.w.localStorage.getItem('viro:v1:/vi-ro/:before-v2')).schema,1);assert.equal(a.state().funds[0].opening,1000000);}finally{a.close();}});
test('fund budget and savings warnings work, plans save without losing values',async()=>{const a=app();try{await start(a);a.d.querySelector('nav [data-view=planning]').click();value(a,'#budget-form [name=budget]','1000');await send(a,'#budget-form');assert.equal(a.state().settings.budget,1000);a.d.querySelector('#add-button').click();value(a,'#tx-form [name=account]','save','change');value(a,'#tx-form [name=amount]','2000');assert.match(a.d.querySelector('#tx-warning').textContent,/tiết kiệm/);assert.match(a.d.querySelector('#tx-warning').textContent,/ngân sách/);}finally{a.close();}});

test('simple opening uses total once, keeps debt separate and validates allocation',async()=>{const a=app();try{
 a.d.querySelector('[data-action=setup]').click();assert.equal(a.d.querySelector('.setup-details').open,false);
 value(a,'#setup-form [name=total]','10000000');value(a,'#setup-form [name=debt]','3000000');
 value(a,'#setup-form [name=split_save]','2000000');assert.match(a.d.querySelector('#setup-result').textContent,/8\.000\.000/);
 await send(a,'#setup-form');const b=a.w.ViRo.ledger(a.state());assert.equal(b.total,10000000);assert.equal(b.spend,8000000);assert.equal(b.save,2000000);assert.equal(b.debt,3000000);
 a.d.querySelector('nav [data-view=backup]').click();a.d.querySelector('[data-action=setup]').click();value(a,'#setup-form [name=split_save]','11000000');await send(a,'#setup-form');assert.match(a.d.querySelector('#setup-form .form-error').textContent,/vượt tổng tiền/);assert.equal(a.w.ViRo.ledger(a.state()).total,10000000);
 value(a,'#setup-form [name=split_save]','2000000');value(a,'#setup-form [name=split_borrow]','4000000');await send(a,'#setup-form');assert.match(a.d.querySelector('#setup-form .form-error').textContent,/lớn hơn nợ/);
 }finally{a.close();}});

test('live formatted hints cover setup, rates, funds, planning, transaction and interest inputs',async()=>{const a=app();try{
 const check=(root)=>{const inputs=[...a.d.querySelectorAll(root+' input[inputmode]')];assert.ok(inputs.length);for(const input of inputs){value(a,root+` [name="${input.name}"]`,'1000000');assert.equal(input.nextElementSibling.textContent,'1.000.000 ₫');assert.equal(a.d.getElementById(input.getAttribute('aria-describedby')),input.nextElementSibling);assert.equal(input.value,'1000000');}};
 a.d.querySelector('[data-action=setup]').click();check('#setup-form');a.d.querySelector('.close').click();await start(a);
 a.d.querySelector('#rate-button').click();check('#rate-form');a.d.querySelector('.close').click();
 a.d.querySelector('nav [data-view=funds]').click();a.d.querySelector('[data-action=new-fund]').click();check('#fund-form');a.d.querySelector('.close').click();
 a.d.querySelector('nav [data-view=planning]').click();check('#budget-form');check('#due-form');
 a.d.querySelector('#add-button').click();check('#tx-form');a.d.querySelector('[data-type=repay]').click();check('#tx-form');
 value(a,'#tx-form [name=currency]','USD','change');value(a,'#tx-form [name=amount]','1000.50');value(a,'#tx-form [name=interest]','12.25');value(a,'#tx-form [name=rate]','25000');
 assert.equal(a.d.querySelector('[name=amount]').nextElementSibling.textContent,'1.000,50 USD');assert.equal(a.d.querySelector('[name=interest]').nextElementSibling.textContent,'12,25 USD');assert.match(a.d.querySelector('#amount-preview').textContent,/25\.318\.750/);
 value(a,'#tx-form [name=amount]','10.123');assert.ok(a.d.querySelector('[name=amount]').nextElementSibling.classList.contains('invalid'));
 value(a,'#tx-form [name=currency]','VND','change');assert.match(a.d.querySelector('[name=amount]').nextElementSibling.textContent,/₫/);
 }finally{a.close();}});

test('income categories persist through save, edit, backup and total increases; expense subtracts',async()=>{const a=app();try{await start(a);
 a.d.querySelector('[data-action=income]').click();assert.equal(a.d.querySelector('#tx-form [name=category]').value,'Lương');value(a,'#tx-form [name=category]','Thưởng','change');value(a,'#tx-form [name=amount]','1000000');await send(a,'#tx-form');assert.equal(a.state().transactions[0].category,'Thưởng');assert.equal(a.w.ViRo.ledger(a.state()).total,23000000);assert.match(a.d.querySelector('.total-value').textContent,/23\.000\.000/);
 a.d.querySelector('nav [data-view=transactions]').click();a.d.querySelector('[data-edit]').click();assert.equal(a.d.querySelector('[name=category]').value,'Thưởng');value(a,'#tx-form [name=category]','Làm thêm','change');await send(a,'#tx-form');assert.equal(a.state().transactions[0].category,'Làm thêm');assert.equal(a.w.ViRo.parseBackup(a.w.ViRo.backup(a.state())).transactions[0].category,'Làm thêm');
 a.d.querySelector('nav [data-view=overview]').click();a.d.querySelector('[data-action=expense]').click();value(a,'#tx-form [name=amount]','250000');await send(a,'#tx-form');assert.equal(a.w.ViRo.ledger(a.state()).total,22750000);assert.equal(a.w.ViRo.ledger(a.state()).debt,20000000);
 }finally{a.close();}});

test('opening edit preserves existing custom fund allocations and transaction history',async()=>{const C=require('../core.js');let seed=C.empty();seed.initialized=true;seed.funds[0].opening=5000000;seed=C.saveFund(seed,{id:'trip',name:'Du lịch',kind:'save',opening:0,budget:0,goal:0,archived:false});seed.funds.find(f=>f.id==='trip').opening=2000000;seed=C.add(seed,{id:'salary',date:C.today(),type:'income',account:'spend',to:'',amount:1000000,interest:0,category:'Thu nhập cũ',note:'',fx:null});const a=app(seed);try{
 a.d.querySelector('nav [data-view=backup]').click();a.d.querySelector('[data-action=setup]').click();assert.equal(a.d.querySelector('[name=total]').value,'7.000.000');assert.equal(a.d.querySelector('[name=split_trip]').value,'2.000.000');await send(a,'#setup-form');assert.equal(a.w.ViRo.ledger(a.state()).total,8000000);assert.equal(a.state().transactions.length,1);
 a.d.querySelector('nav [data-view=transactions]').click();a.d.querySelector('[data-edit]').click();assert.equal(a.d.querySelector('[name=category]').value,'Thu nhập cũ');await send(a,'#tx-form');assert.equal(a.state().transactions[0].category,'Thu nhập cũ');
 }finally{a.close();}});
