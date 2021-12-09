const popupInfo = document.querySelector(".popup-info");

function showPopInfo(txt){
    popupInfo.innerHTML=/*html*/`<p>${txt}</p>`
    popupInfo.classList.add("show");
    setTimeout(function(){
        popupInfo.classList.remove("show");
    },3000)
    return 
}

function showAlertInfo(txt){
    popupInfo.innerHTML=/*html*/
    `<p>${txt}</p>
    <button class="btn-confirm">是</button>
    <button class="btn-return">否</button>
    `
    popupInfo.classList.add("show",'alert');
}
export {showPopInfo,showAlertInfo}