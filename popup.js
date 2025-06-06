// popup.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const debugCheckbox = document.getElementById('debug-mode');
    // 新增：获取禁用跳转的复选框
    const disableJumpCheckbox = document.getElementById('disable-jump');

    // 1. Popup 加载时，一次性读取所有设置并更新 UI
    //    我们将 'isJumpDisabled' 添加到要获取的键列表中
    chrome.storage.sync.get(['debugMode', 'isJumpDisabled'], (result) => {
        // 更新调试模式开关
        debugCheckbox.checked = !!result.debugMode;
        // 新增：更新禁用跳转开关
        disableJumpCheckbox.checked = !!result.isJumpDisabled;
    });

    // 2. 监听调试模式开关的变动
    debugCheckbox.addEventListener('change', () => {
        const isEnabled = debugCheckbox.checked;
        chrome.storage.sync.set({ debugMode: isEnabled });
    });

    // 3. 新增：监听禁用跳转开关的变动
    disableJumpCheckbox.addEventListener('change', () => {
        const isDisabled = disableJumpCheckbox.checked;
        chrome.storage.sync.set({ isJumpDisabled: isDisabled });
    });
});