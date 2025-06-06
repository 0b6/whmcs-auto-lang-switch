// content.js

(function () {
    'use strict';

    chrome.storage.sync.get(['debugMode', 'isJumpDisabled'], (result) => {

        // 使用存储的值来初始化 DEBUG 常量，如果未定义则默认为 false
        const DEBUG = !!result.debugMode;
        const isJumpDisabled = !!result.isJumpDisabled;
        const STORAGE_KEY = 'whmcs_auto_lang_switch';
        const SWITCH_INTERVAL = 10 * 60 * 1000; // 10分钟有效期

        function log(...args) {
            if (DEBUG) {
                console.log('[WHMCS-语言切换]', ...args);
            }
        }
        if (isJumpDisabled) {
            log('自动跳转功能已禁用，脚本终止。');
            return; // 终止后续所有操作
        }

        // 辅助函数：检查最近是否有过切换
        function hasRecentSwitch() {
            const record = localStorage.getItem(STORAGE_KEY);
            if (!record) return false;
            try {
                const data = JSON.parse(record);
                if (!data.timestamp) return false;
                return (Date.now() - data.timestamp) < SWITCH_INTERVAL;
            } catch {
                return false;
            }
        }

        // 辅助函数：标记已切换
        function markSwitched() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
            log('标记自动跳转时间');
        }

        // 辅助函数：清除切换标记
        function clearSwitchMark() {
            localStorage.removeItem(STORAGE_KEY);
            log('清除自动跳转标记');
        }

        // 辅助函数：检查文本是否包含中文
        function containsChinese(text) {
            if (!text) return false;
            const chineseRegex = /[\u4e00-\u9fa5]/;
            return chineseRegex.test(text);
        }

        // --- 以下是判断页面是否已经是中文的函数 ---

        function isChineseByContent() {
            const htmlLang = document.documentElement.lang;
            if (htmlLang && htmlLang.toLowerCase().startsWith('zh')) {
                log('通过 <html lang="zh..."> 属性检测到中文');
                return true;
            }
            const titleText = document.title;
            if (containsChinese(titleText)) {
                log('通过 <title> 内容检测到中文:', titleText);
                return true;
            }
            const h1 = document.querySelector('h1');
            if (h1 && containsChinese(h1.textContent)) {
                log('通过 <h1> 内容检测到中文:', h1.textContent);
                return true;
            }
            log('通过页面内容未检测到中文');
            return false;
        }

        function isChineseByButton() {
            const langButton = document.querySelector('button[data-target="#modalChooseLanguage"]');
            if (!langButton) {
                log('未找到语言按钮（button）');
                return false;
            }
            const text = langButton.textContent.trim().toLowerCase();
            const isZh = text.includes('中文') || text.includes('chinese');
            log('语言按钮文本:', text, ' 是否中文:', isZh);
            return isZh;
        }

        function isChineseByLink() {
            const langLink = document.querySelector('a.choose-language#languageChooser');
            if (!langLink) {
                log('未找到语言链接（a.choose-language）');
                return false;
            }
            const text = langLink.textContent.trim().toLowerCase();
            const isZh = text.includes('中文') || text.includes('chinese');
            log('语言链接文本:', text, ' 是否中文:', isZh);
            return isZh;
        }

        function isAlreadyChinese() {
            const byContent = isChineseByContent();
            const byButton = isChineseByButton();
            const byLink = isChineseByLink();
            const result = byContent || byButton || byLink;
            log('综合判断是否已是中文:', result);
            return result;
        }

        // --- 语言切换的核心逻辑 ---

        function switchToChinese() {
            if (hasRecentSwitch()) {
                log(`检测到最近${SWITCH_INTERVAL / 60000}分钟内已自动跳转，跳过切换`);
                return;
            }
            const url = new URL(window.location.href);
            if (url.searchParams.get('language') === 'chinese') {
                log('URL中已有 language=chinese，跳过切换');
                return;
            }
            url.searchParams.set('language', 'chinese');
            log('当前非中文，准备跳转到:', url.toString());
            markSwitched();
            window.location.replace(url.toString());
        }

        // --- 主函数和事件监听 ---

        function main() {
            log('页面加载完成，开始注入检测脚本 (injector.js)');

            // 步骤 1: 创建一个 <script> 标签来注入我们的脚本
            const s = document.createElement('script');
            // 通过 chrome.runtime.getURL 获取插件内部文件的可访问 URL
            s.src = chrome.runtime.getURL('injector.js');
            s.onload = function () {
                // 脚本加载并执行后，就可以从 DOM 中移除这个标签了
                this.remove();
            };
            // 将脚本标签添加到页面的 <head> 或 <html> 元素中，使其执行
            (document.head || document.documentElement).appendChild(s);
        }

        // 步骤 2: 设置一个监听器，等待来自 injector.js 的消息
        window.addEventListener('message', (event) => {
            // 安全检查：确保消息来源是我们期望的注入脚本
            if (event.source === window && event.data && event.data.type === 'WHMCS_DETECT_RESULT') {

                log('收到来自注入脚本的检测结果:', event.data);

                if (event.data.isWHMCS) {
                    // 如果注入脚本确认这是 WHMCS 页面，则执行后续逻辑
                    if (!isAlreadyChinese()) {
                        switchToChinese();
                    } else {
                        log('已是中文页面，无需切换');
                        clearSwitchMark();
                    }
                } else {
                    log('注入脚本判定为非 WHMCS 页面，不处理');
                }
            }
        }, false);

        // 监听键盘事件，用于手动清除标记
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F9') {
                clearSwitchMark();
                alert('已清除自动跳转标记，下一次检测将允许自动切换语言。');
            }
        });

        // 插件入口：直接调用 main 函数开始执行流程
        main();
    }); // 异步操作的回调函数结束
})();