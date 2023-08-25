// ==UserScript==
// @name         8591自動更新已下架商品
// @namespace    https://www.8591.com.tw/userPublish.html?type=down
// @version      1.0
// @description  用來避免8591自動刪除辛苦建立累積的賣場
// @author       Nicholas12313
// @match        https://www.8591.com.tw/userPublish.html?type=down
// @match        https://www.8591.com.tw/userPublish-index.html
// @match        https://www.8591.com.tw/userPublish.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @require  	 https://ajax.googleapis.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

//可全選當前頁面項目，並點擊與所輸入參數"action"文字相符的<input>按鈕，並按下確認按鈕
function update8591Item(action) {
    setTimeout(function (){
        console.log('action全選中');
        $('input[name="cBoxGame[]"]').trigger('click');
    }, 5000);
    setTimeout(function (){
        console.log('action執行' + action + '中');
        $('input[value=' + action + ']:first').trigger('click');
    }, 6000);
    setTimeout(function (){
        console.log('action確認中');
        $('span[class="j-p-ok"]:first').trigger('click');
    }, 7000);
}

//用於等待promise完成，沒有等待將只能讀取到未完成的promise物件
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
}

//第一次使用時觸發，給予冷卻中狀態，並將冷卻結束時間設為當前時間
function kickstart(){
    GM.setValue("8591renewScriptCooldown", Date.now());
    GM.setValue("8591renewScriptState", "cooldown");
    (async() => {
        var currStateTemp = await GM.getValue("8591renewScriptState");
        var coolDownTemp = await GM.getValue("8591renewScriptCooldown");
        console.log('測試狀態為：',currStateTemp);
        console.log('測試冷卻為：',coolDownTemp);
        console.log('現在時間為：',Date.now());
    })();
}

//主程式
(async function(){
    'use strict';
    console.log('開始執行腳本');

    var currDate = Date.now();
    const currDateVisual = new Date(currDate).toLocaleString('sv');
    var currUrl = $(location).attr('href');
    var currState;
    var coolDown;

    (async() => {
        currState = await GM.getValue("8591renewScriptState");
        coolDown = await GM.getValue("8591renewScriptCooldown");
    })();
    await delay(10);

    const coolDownVisual = new Date(coolDown).toLocaleString('sv');

    console.log('State:',currState);
    console.log('Cool down:',coolDown, '，又等於:',coolDownVisual);
    console.log('Current date:',currDate,'，又等於:',currDateVisual);
    console.log('Current Url:',currUrl);
    switch (currState) {
        case 'cooldown':
            console.log('開始執行cooldown');
            if(currDate >= coolDown){
                GM.setValue("8591renewScriptState", "ready");
                window.location.href = 'https://www.8591.com.tw/userPublish.html?type=down';
            } else {
                var cooldownRemainTemp = coolDown - currDate
                var cooldownRemain = new Date(cooldownRemainTemp).toISOString().slice(11, -1); // "23:59:59.999"
                console.log('還在CD啊烙格～\n剩餘時間為：',cooldownRemain,'。\n慢慢等齁');
            }
            break;
        case 'ready':
            console.log('開始執行ready');
            if(currUrl != 'https://www.8591.com.tw/userPublish.html?type=down'){
                window.location.href = 'https://www.8591.com.tw/userPublish.html?type=down';
            }
            GM.setValue("8591renewScriptState", "update");
            update8591Item('上架');
            break;
        case 'update':
            console.log('開始執行update');
            if(currUrl != 'https://www.8591.com.tw/userPublish-index.html'){
                window.location.href = 'https://www.8591.com.tw/userPublish-index.html';
            }
            GM.setValue("8591renewScriptState", "takedown");
            update8591Item('更新');
            break;
        case 'takedown':
            console.log('開始執行takedown');
            if(currUrl != 'https://www.8591.com.tw/userPublish-index.html'){
                window.location.href = 'https://www.8591.com.tw/userPublish-index.html';
            }
            var cooldownDate = currDate + 82800000;
            GM.setValue("8591renewScriptCooldown", cooldownDate);
            GM.setValue("8591renewScriptState", "cooldown");
            update8591Item('下架');
            break;
        default:
            console.log('invalid "State", kickstart now...');
            kickstart();
            delay(5);
            break;
    }
})();
