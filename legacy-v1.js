(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ViRoV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MAX = 1000000000000;
  const accounts = ['spend', 'save', 'borrow'];
  const types = ['income', 'expense', 'transfer', 'loan', 'repay'];
  const names = {spend:'Tiền chi tiêu', save:'Tiền tiết kiệm', borrow:'Tiền vay còn lại'};
  const labels = {income:'Thêm tiền', expense:'Chi tiêu', transfer:'Chuyển quỹ', loan:'Nhận tiền vay', repay:'Trả nợ'};
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  function integer(n, label='Số tiền', positive=false) {
    if (!Number.isSafeInteger(n) || n < (positive?1:0) || n>MAX) throw new Error(`${label} phải là số nguyên từ ${positive?1:0} đến 1.000 tỷ đồng.`);
    return n;
  }
  function moneyInput(value, positive=false) {
    const s=String(value).trim();
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(s)) throw new Error('Nhập số tiền nguyên VNĐ, ví dụ 150000 hoặc 150.000.');
    return integer(Number(s.replaceAll('.','')), 'Số tiền', positive);
  }
  function date(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s) || s<'1900-01-01' || s>'2199-12-31' || new Date(s+'T12:00:00Z').toISOString().slice(0,10)!==s) throw new Error('Ngày không hợp lệ.');
    return s;
  }
  function text(s, max=200) { if(typeof s!=='string'||s.length>max) throw new Error('Nội dung quá dài hoặc sai định dạng.'); return s; }
  function empty() {return {schema:1,currency:'VND',revision:0,updatedAt:null,initialized:false,opening:{spend:0,save:0,borrow:0,debt:0},settings:{budget:0,goal:0,goalName:'Quỹ dự phòng',dueDate:'',dueAmount:0},transactions:[]};}
  function transaction(t) {
    if(!t || typeof t!=='object' || typeof t.id!=='string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(t.id)) throw new Error('Mã giao dịch không hợp lệ.');
    if(!types.includes(t.type)) throw new Error('Loại giao dịch không hợp lệ.');
    date(t.date); if(t.date>today()) throw new Error('Chỉ ghi nhận giao dịch đã xảy ra, không dùng ngày tương lai.');
    integer(t.amount,'Số tiền',true); integer(t.interest,'Lãi / phí'); text(t.note); text(t.category,60);
    if(!accounts.includes(t.account)) throw new Error('Quỹ tiền không hợp lệ.');
    if(t.type==='income' && t.account==='borrow') throw new Error('Tiền vay phải ghi bằng Nhận tiền vay.');
    if(t.type==='loan' && t.account!=='borrow') throw new Error('Khoản vay phải vào quỹ tiền vay.');
    if(t.type!=='repay' && t.interest!==0) throw new Error('Lãi / phí chỉ có ở giao dịch trả nợ.');
    if(t.type==='transfer' && (!['spend','save'].includes(t.account)|| !['spend','save'].includes(t.to)||t.to===t.account)) throw new Error('Chỉ chuyển giữa tiền chi tiêu và tiết kiệm; tiền vay luôn được tách riêng.');
    return t;
  }
  function ledger(state) {
    const b={...state.opening};
    for(const k of [...accounts,'debt']) integer(b[k],names[k]||'Dư nợ');
    if(b.borrow>b.debt) throw new Error('Tiền vay ban đầu còn lại không thể lớn hơn dư nợ ban đầu.');
    const ordered=state.transactions.map((t,i)=>({t,i})).sort((a,c)=>a.t.date.localeCompare(c.t.date)||a.i-c.i);
    let volume=0;
    for(const {t} of ordered) {
      transaction(t);
      volume+=t.amount+t.interest;
      if(!Number.isSafeInteger(volume))throw new Error('Tổng giá trị lịch sử vượt giới hạn tính toán chính xác.');
      switch(t.type) {
        case 'income': b[t.account]+=t.amount; break;
        case 'expense': b[t.account]-=t.amount; break;
        case 'transfer': b[t.account]-=t.amount; b[t.to]+=t.amount; break;
        case 'loan': b.borrow+=t.amount; b.debt+=t.amount; break;
        case 'repay': {
          if(t.amount>b.debt) throw new Error('Tiền trả gốc vượt dư nợ tại ngày giao dịch.');
          if(t.amount+t.interest>b[t.account]) throw new Error('Quỹ đã chọn không đủ tiền trả cả gốc và lãi / phí.');
          b[t.account]-=t.amount+t.interest; b.debt-=t.amount;
          // Borrowed cash becomes own cash as liability is paid from other funds.
          if(b.borrow>b.debt){b.spend+=b.borrow-b.debt;b.borrow=b.debt;}
          break;
        }
      }
      for(const k of [...accounts,'debt']) {
        if(b[k]<0) throw new Error(`${t.date}: ${names[k]||'Dư nợ'} không đủ. Kiểm tra số tiền, ngày và các giao dịch phụ thuộc.`);
        integer(b[k],names[k]||'Dư nợ');
      }
    }
    const total=b.spend+b.save+b.borrow;
    if(!Number.isSafeInteger(total)) throw new Error('Tổng tiền vượt giới hạn tính toán.');
    return {...b,total,net:total-b.debt};
  }
  function validate(s) {
    if(!s||s.schema!==1||s.currency!=='VND'||typeof s.initialized!=='boolean'||!s.opening||!s.settings||!Array.isArray(s.transactions)||s.transactions.length>10000) throw new Error('Bản sao lưu không hợp lệ hoặc phiên bản chưa hỗ trợ.');
    integer(s.revision,'Phiên bản');
    if(s.updatedAt!==null&&(typeof s.updatedAt!=='string'||!Number.isFinite(Date.parse(s.updatedAt)))) throw new Error('Thời điểm lưu không hợp lệ.');
    for(const k of ['budget','goal','dueAmount']) integer(s.settings[k]);
    text(s.settings.goalName,80); text(s.settings.dueDate,10); if(s.settings.dueDate)date(s.settings.dueDate);
    if(Boolean(s.settings.dueDate)!==Boolean(s.settings.dueAmount))throw new Error('Lịch nhắc cần đủ ngày và số tiền.');
    if(new Set(s.transactions.map(t=>t.id)).size!==s.transactions.length)throw new Error('Bản sao lưu có mã giao dịch bị trùng.');
    ledger(s); return s;
  }
  function add(s,t) {const n=JSON.parse(JSON.stringify(s)); n.transactions.push(transaction(t));validate(n);return n;}
  function remove(s,id) {const n=JSON.parse(JSON.stringify(s));n.transactions=n.transactions.filter(t=>t.id!==id);validate(n);return n;}
  function stats(s,month) {
    const ts=s.transactions.filter(t=>t.date.startsWith(month));
    let income=0,expense=0,principal=0,loan=0; const categories=Object.create(null);
    for(const t of ts) {
      if(t.type==='income')income+=t.amount;
      if(t.type==='loan')loan+=t.amount;
      if(t.type==='repay'){principal+=t.amount;expense+=t.interest;if(t.interest)categories['Lãi / phí vay']=(categories['Lãi / phí vay']||0)+t.interest;}
      if(t.type==='expense'){expense+=t.amount;categories[t.category]=(categories[t.category]||0)+t.amount;}
    }
    return {income,expense,principal,loan,categories,cashflow:income+loan-expense-principal};
  }
  function parseBackup(raw) {
    if(typeof raw!=='string'||raw.length>8000000)throw new Error('Tệp quá lớn (tối đa 8 MB).');
    let p;try{p=JSON.parse(raw);}catch{throw new Error('Không đọc được JSON trong tệp.');}
    if(p.app!=='ViRo'||p.version!==1||!p.data)throw new Error('Hãy chọn bản sao lưu JSON xuất từ Ví Rõ.');
    validate(p.data);
    // Whitelist known fields; discard arbitrary imported properties.
    const s=empty(),d=p.data;
    Object.assign(s,{revision:d.revision,updatedAt:d.updatedAt,initialized:d.initialized});
    for(const k of Object.keys(s.opening))s.opening[k]=d.opening[k];
    for(const k of Object.keys(s.settings))s.settings[k]=d.settings[k];
    s.transactions=d.transactions.map(t=>Object.fromEntries(['id','date','type','amount','interest','account','to','category','note'].map(k=>[k,t[k]??''])));
    return validate(s);
  }
  function backup(s){validate(s);return JSON.stringify({app:'ViRo',version:1,exportedAt:new Date().toISOString(),data:s},null,2);}
  return {MAX,accounts,types,names,labels,today,empty,integer,moneyInput,validate,ledger,add,remove,stats,parseBackup,backup};
});
