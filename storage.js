(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'));else root.ViRoStore=factory(root.ViRo);})(typeof globalThis!=='undefined'?globalThis:this,function(C){
  'use strict';
  class Store {
    constructor(storage,path,locks){this.storage=storage;this.key='viro:v1:'+path.replace(/index\.html$/,'');this.previous=this.key+':previous';this.legacy=this.key+':before-v2';this.exportKey=this.key+':last-export';this.locks=locks;this.raw=null;this.problem='';this.state=C.empty();}
    load(){try{this.raw=this.storage.getItem(this.key);this.state=this.raw?C.migrate(JSON.parse(this.raw)):C.empty();this.problem='';}catch(e){this.problem=e.message;this.state=C.empty();}return this.state;}
    async save(next,recovery=false){
      if(this.problem&&!recovery)throw new Error('Hãy phục hồi dữ liệu hiện tại trước khi ghi mới.');C.validate(next);
      const expected=this.raw, draft=C.copy(next);
      const write=()=>{
        const existing=this.storage.getItem(this.key);
        if(existing!==expected||this.raw!==expected)throw new Error('Sổ đã thay đổi. Hãy tải lại trang trước khi lưu để tránh ghi đè.');
        const n=draft;n.revision=this.state.revision+1;n.updatedAt=new Date().toISOString();
        try{
          if(existing&&!this.problem){
            if(JSON.parse(existing).schema===1&&!this.storage.getItem(this.legacy))this.storage.setItem(this.legacy,existing);
            this.storage.setItem(this.previous,existing);
          }
          this.storage.setItem(this.key,JSON.stringify(n));
        }catch{throw new Error('Không lưu được. Trình duyệt có thể đã hết dung lượng hoặc chặn lưu trữ. Xuất JSON trước khi xử lý.');}
        this.raw=JSON.stringify(n);this.state=n;this.problem='';return n;
      };
      return this.locks?.request?this.locks.request(this.key,write):write();
    }
    readPrevious(){const raw=this.storage.getItem(this.previous);if(!raw)throw new Error('Chưa có bản phục hồi.');return C.migrate(JSON.parse(raw));}
  }
  return Store;
});
