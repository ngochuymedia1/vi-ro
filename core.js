(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./legacy-v1.js'));
  else root.ViRo=factory(root.ViRoV1);
})(typeof globalThis!=='undefined'?globalThis:this,function(V1){
  'use strict';
  const {MAX,today,integer,moneyInput,types,labels}=V1;
  const copy=x=>JSON.parse(JSON.stringify(x));
  const fail=s=>{throw new Error(s);};
  function str(v,max=200){if(typeof v!=='string'||v.length>max)fail('Nội dung không hợp lệ hoặc quá dài.');return v;}
  function id(v){if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(v)||['__proto__','constructor','prototype','debt'].includes(v))fail('Mã không hợp lệ.');return v;}
  function date(v){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||v<'1900-01-01'||v>'2199-12-31'||!Number.isFinite(Date.parse(v))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)fail('Ngày không hợp lệ.');return v;}
  function rate(v,optional=false){if(!Number.isSafeInteger(v)||v<(optional?0:1)||v>1000000)fail('Tỷ giá phải là số nguyên từ 1 đến 1.000.000 VNĐ cho 1 USD.');return v;}
  function usdInput(s){s=String(s).trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(s))fail('Nhập USD như 100 hoặc 100.50; không dùng dấu phân cách hàng nghìn.');const [a,b='']=s.replace(',','.').split('.');const cents=Number(a)*100+Number(b.padEnd(2,'0'));integer(cents,'Số cent USD');return cents;}
  function convert(cents,fxRate){integer(cents,'Số cent USD');rate(fxRate);return integer(Number((BigInt(cents)*BigInt(fxRate)+50n)/100n),'Tiền quy đổi');}
  function amountInput(value,currency,fxRate){if(currency==='VND')return {amount:moneyInput(value),units:null};if(currency!=='USD')fail('Đơn vị tiền không hỗ trợ.');const units=usdInput(value);return {amount:convert(units,fxRate),units};}
  function fund(id,name,kind){return {id,name,kind,opening:0,budget:0,goal:0,archived:false};}
  function empty(){return {schema:2,currency:'VND',revision:0,updatedAt:null,initialized:false,openingDebt:0,funds:[fund('spend','Chi tiêu chung','spend'),fund('save','Tiết kiệm','save'),fund('borrow','Tiền vay','borrow')],settings:{budget:0,fxRate:0,display:'VND',dueDate:'',dueAmount:0},transactions:[]};}
  function getFund(s,k){return s.funds.find(f=>f.id===k)||fail('Không tìm thấy quỹ tiền.');}
  function transaction(s,t){
    if(!t||typeof t!=='object')fail('Giao dịch không hợp lệ.');id(t.id);
    if(!types.includes(t.type))fail('Loại giao dịch không hợp lệ.');date(t.date);if(t.date>today())fail('Không ghi giao dịch ở ngày tương lai.');
    integer(t.amount,'Số tiền');integer(t.interest,'Lãi / phí');
    if((t.type!=='repay'&&t.amount===0)||(t.type==='repay'&&t.amount+t.interest===0))fail('Số tiền phải lớn hơn 0.');
    str(t.note);str(t.category,60);const a=getFund(s,t.account);
    if(t.type!=='repay'&&t.interest!==0)fail('Lãi / phí chỉ dùng khi trả nợ.');
    if(t.type==='income'&&a.kind==='borrow')fail('Ghi tiền vay bằng Nhận tiền vay, không dùng Thêm tiền.');
    if(t.type==='loan'&&a.kind!=='borrow')fail('Tiền vay được giữ trong quỹ Tiền vay.');
    if(t.type==='transfer'){
      const to=getFund(s,t.to);
      if(t.account===t.to)fail('Quỹ nhận phải khác quỹ nguồn.');
      if(a.kind==='borrow'||to.kind==='borrow')fail('Tiền vay luôn được tách riêng. Dùng Chi tiêu, Nhận tiền vay hoặc Trả nợ cho quỹ này.');
    }else if(t.to!=='')fail('Giao dịch này không có quỹ đích.');
    if(t.fx!==null){const f=t.fx;if(!f||f.currency!=='USD')fail('Dữ liệu ngoại tệ không hợp lệ.');rate(f.rate);integer(f.units);integer(f.interestUnits);if(convert(f.units,f.rate)!==t.amount||convert(f.interestUnits,f.rate)!==t.interest)fail('Số tiền VNĐ không khớp số USD và tỷ giá đã lưu.');}
    return t;
  }
  function ledger(s){
    const balances=Object.create(null);for(const f of s.funds)balances[f.id]=f.opening;
    let debt=s.openingDebt,volume=0;
    if(balances.borrow>debt)fail('Tiền vay ban đầu còn lại không thể lớn hơn dư nợ.');
    s.transactions.forEach(t=>transaction(s,t));
    const ordered=s.transactions.map((t,i)=>({t,i})).sort((a,b)=>a.t.date.localeCompare(b.t.date)||a.i-b.i);
    for(const {t} of ordered){
      volume+=t.amount+t.interest;if(!Number.isSafeInteger(volume))fail('Lịch sử vượt giới hạn tính toán chính xác.');
      if(['expense','transfer','repay'].includes(t.type)&&balances[t.account]<t.amount+t.interest)fail(`${t.date}: Quỹ ${getFund(s,t.account).name} không đủ tiền. App không tự lấy từ quỹ khác.`);
      if(t.type==='income')balances[t.account]+=t.amount;
      if(t.type==='expense')balances[t.account]-=t.amount;
      if(t.type==='transfer'){balances[t.account]-=t.amount;balances[t.to]+=t.amount;}
      if(t.type==='loan'){balances.borrow+=t.amount;debt+=t.amount;}
      if(t.type==='repay'){
        if(t.amount>debt)fail('Số tiền trả gốc vượt dư nợ tại ngày giao dịch.');
        balances[t.account]-=t.amount+t.interest;debt-=t.amount;
        if(balances.borrow>debt){balances.spend+=balances.borrow-debt;balances.borrow=debt;}
      }
      for(const v of Object.values(balances))integer(v,'Số dư');integer(debt,'Dư nợ');
    }
    const spend=s.funds.filter(f=>f.kind==='spend').reduce((n,f)=>n+balances[f.id],0);
    const save=s.funds.filter(f=>f.kind==='save').reduce((n,f)=>n+balances[f.id],0);
    const borrow=balances.borrow,total=spend+save+borrow;
    if(!Number.isSafeInteger(total))fail('Tổng tiền vượt giới hạn chính xác.');
    for(const f of s.funds)if(f.archived&&balances[f.id]!==0)fail('Quỹ đang lưu trữ phải có số dư bằng 0. Khôi phục quỹ trước khi sửa giao dịch liên quan.');
    return {funds:balances,spend,save,borrow,debt,total,net:total-debt};
  }
  function validate(s){
    if(!s||s.schema!==2||s.currency!=='VND'||typeof s.initialized!=='boolean'||!s.settings||!Array.isArray(s.funds)||s.funds.length<3||s.funds.length>100||!Array.isArray(s.transactions)||s.transactions.length>10000)fail('Dữ liệu không hợp lệ hoặc phiên bản chưa hỗ trợ.');
    integer(s.revision,'Phiên bản');integer(s.openingDebt,'Dư nợ đầu kỳ');
    if(s.updatedAt!==null&&(typeof s.updatedAt!=='string'||!Number.isFinite(Date.parse(s.updatedAt))))fail('Thời điểm lưu không hợp lệ.');
    const ids=new Set(),names=new Set();
    for(const f of s.funds){id(f.id);str(f.name,80);if(!f.name.trim()||ids.has(f.id)||names.has(f.name.trim().toLocaleLowerCase('vi')))fail('Tên hoặc mã quỹ bị trùng / để trống.');ids.add(f.id);names.add(f.name.trim().toLocaleLowerCase('vi'));if(!['spend','save','borrow'].includes(f.kind)||typeof f.archived!=='boolean')fail('Loại quỹ không hợp lệ.');for(const k of ['opening','budget','goal'])integer(f[k]);if(f.kind==='borrow'&&f.id!=='borrow')fail('Chỉ dùng một quỹ tiền vay tổng.');}
    for(const k of ['spend','save','borrow']){const f=getFund(s,k);if(f.kind!==k||f.archived)fail('Ba quỹ mặc định cần được giữ nguyên loại và hoạt động.');}
    const p=s.settings;integer(p.budget);integer(p.dueAmount);rate(p.fxRate,true);if(!['USD','VND'].includes(p.display)||p.display==='USD'&&!p.fxRate)fail('Cần tỷ giá trước khi xem theo USD.');str(p.dueDate,10);if(p.dueDate)date(p.dueDate);if(Boolean(p.dueDate)!==Boolean(p.dueAmount))fail('Lịch nhắc cần đủ ngày và số tiền.');
    if(new Set(s.transactions.map(t=>t?.id)).size!==s.transactions.length)fail('Mã giao dịch bị trùng.');ledger(s);return s;
  }
  function migrate(old){
    if(old?.schema===2)return validate(copy(old));
    V1.validate(old);const s=empty();
    for(const k of ['revision','updatedAt','initialized'])s[k]=old[k];
    s.openingDebt=old.opening.debt;for(const f of s.funds)f.opening=old.opening[f.id];
    getFund(s,'save').goal=old.settings.goal;
    if(old.settings.goalName.trim()&&!s.funds.some(f=>f.name.toLocaleLowerCase('vi')===old.settings.goalName.trim().toLocaleLowerCase('vi')))getFund(s,'save').name=old.settings.goalName.trim();
    for(const k of ['budget','dueDate','dueAmount'])s.settings[k]=old.settings[k];
    s.transactions=old.transactions.map(t=>({...t,fx:null}));
    validate(s);const a=V1.ledger(old),b=ledger(s);for(const k of ['spend','save','borrow','debt','total','net'])if(a[k]!==b[k])fail('Không thể chuyển dữ liệu cũ vì số dư thay đổi.');return s;
  }
  function add(s,t){if(getFund(s,t.account).archived||t.type==='transfer'&&getFund(s,t.to).archived)fail('Hãy khôi phục quỹ trước khi ghi giao dịch.');const n=copy(s);n.transactions.push(t);return validate(n);}
  function edit(s,t){const n=copy(s),i=n.transactions.findIndex(x=>x.id===t.id);if(i<0)fail('Không tìm thấy giao dịch.');if(getFund(s,t.account).archived||t.type==='transfer'&&getFund(s,t.to).archived)fail('Hãy khôi phục quỹ trước khi sửa giao dịch.');n.transactions[i]=t;return validate(n);}
  function remove(s,key){const n=copy(s);n.transactions=n.transactions.filter(t=>t.id!==key);return validate(n);}
  function saveFund(s,f){const n=copy(s),i=n.funds.findIndex(x=>x.id===f.id);if(i<0){if(f.opening!==0)fail('Quỹ mới bắt đầu từ 0. Hãy chuyển tiền hoặc ghi thu để cấp tiền.');n.funds.push(f);}else{if(n.funds[i].kind!==f.kind)fail('Không đổi loại quỹ sau khi tạo; hãy tạo quỹ mới và chuyển tiền.');if(n.funds[i].opening!==f.opening)fail('Sửa số dư đầu kỳ trong Thiết lập.');n.funds[i]=f;}return validate(n);}
  function archive(s,key){if(['spend','save','borrow'].includes(key))fail('Không lưu trữ quỹ mặc định.');const f=getFund(s,key);if(!f.archived&&ledger(s).funds[key]!==0)fail('Chuyển hết tiền ra trước khi lưu trữ quỹ.');return saveFund(s,{...f,archived:!f.archived});}
  function stats(s,month,fundId=''){
    const ts=s.transactions.filter(t=>t.date.startsWith(month)&&(!fundId||t.account===fundId||t.to===fundId));
    let income=0,expense=0,principal=0,loan=0,transferIn=0,transferOut=0;const categories=Object.create(null);
    for(const t of ts){if(t.type==='income')income+=t.amount;if(t.type==='loan')loan+=t.amount;if(t.type==='repay'){principal+=t.amount;expense+=t.interest;if(t.interest)categories['Lãi / phí vay']=(categories['Lãi / phí vay']||0)+t.interest;}if(t.type==='expense'){expense+=t.amount;categories[t.category]=(categories[t.category]||0)+t.amount;}if(t.type==='transfer'&&fundId){if(t.to===fundId)transferIn+=t.amount;if(t.account===fundId)transferOut+=t.amount;}}
    return {income,expense,principal,loan,transferIn,transferOut,categories,cashflow:income+loan-expense-principal+transferIn-transferOut};
  }
  function warning(s,t,existingId=''){
    transaction(s,t);const a=getFund(s,t.account),w=[];
    if(t.type==='expense'&&a.kind==='borrow')w.push('Bạn đang tiêu tiền vay. Tiền trong tay giảm nhưng khoản nợ không giảm.');
    if(['expense','repay','transfer'].includes(t.type)&&a.kind==='save')w.push('Khoản này lấy tiền từ quỹ tiết kiệm '+a.name+'.');
    if(t.type==='expense'||t.type==='repay'){
      const clean={...s,transactions:s.transactions.filter(x=>x.id!==existingId)},v=t.type==='repay'?t.interest:t.amount;
      if(s.settings.budget&&stats(clean,t.date.slice(0,7)).expense+v>s.settings.budget)w.push('Khoản này làm chi tiêu tháng vượt ngân sách chung.');
      if(a.budget&&stats(clean,t.date.slice(0,7),a.id).expense+v>a.budget)w.push('Khoản này làm quỹ vượt ngân sách tháng đã đặt.');
    }
    return w;
  }
  function parseBackup(raw){if(typeof raw!=='string'||raw.length>8000000)fail('Tệp tối đa 8 MB.');let p;try{p=JSON.parse(raw);}catch{fail('Không đọc được JSON.');}if(p?.app!=='ViRo'||![1,2].includes(p.version)||p.data?.schema!==p.version)fail('Hãy chọn bản sao lưu JSON của Ví Rõ.');if(p.version===1)return migrate(V1.parseBackup(raw));validate(p.data);const d=p.data,s=empty();for(const k of ['revision','updatedAt','initialized','openingDebt'])s[k]=d[k];for(const k of Object.keys(s.settings))s.settings[k]=d.settings[k];s.funds=d.funds.map(f=>Object.fromEntries(['id','name','kind','opening','budget','goal','archived'].map(k=>[k,f[k]])));s.transactions=d.transactions.map(t=>({...Object.fromEntries(['id','type','date','amount','interest','account','to','category','note'].map(k=>[k,t[k]])),fx:t.fx===null?null:Object.fromEntries(['currency','units','interestUnits','rate'].map(k=>[k,t.fx[k]]))}));return validate(s);}
  function backup(s){validate(s);return JSON.stringify({app:'ViRo',version:2,exportedAt:new Date().toISOString(),data:s},null,2);}
  return {MAX,today,integer,moneyInput,usdInput,rate,convert,amountInput,types,labels,copy,empty,validate,migrate,ledger,add,edit,remove,getFund,saveFund,archive,stats,warning,backup,parseBackup};
});
