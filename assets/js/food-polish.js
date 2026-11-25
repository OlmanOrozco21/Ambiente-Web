/* v154-food-categories-polish-js */
(function(){
  const modal=document.getElementById('foodModal');
  if(!modal)return;
  const box=modal.querySelector('.v143-box');
  if(!box)return;
  const home=box.querySelector('#v143Home');
  const results=box.querySelector('#v143Results');
  const sync=()=>{
    const detail=results && !results.hidden;
    box.classList.toggle('v154-detail',!!detail);
  };
  box.addEventListener('click',()=>setTimeout(sync,0));
  const close=box.querySelector('#v143Close');
  if(close) close.addEventListener('click',()=>box.classList.remove('v154-detail'));
  sync();
})();
