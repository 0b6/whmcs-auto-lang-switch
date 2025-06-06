// injector.js

(function () {
    'use strict';

    function isWHMCS() {
        // 这个脚本在页面主世界运行，可以访问 whmcsBaseUrl
        if (typeof whmcsBaseUrl !== 'undefined') {
            return true;
        }
        
        const ps = document.querySelectorAll('p');
        for (const p of ps) {
            if (p.textContent.includes('Powered by')) {
                const a = p.querySelector('a[href*="whmcs.com"]');
                if (a) {
                    return true;
                }
            }
        }

        const scripts = document.querySelectorAll('script[src]');
        for (const script of scripts) {
            try {
                const srcUrl = new URL(script.src, window.location.href);
                const pathname = srcUrl.pathname;
                if (pathname.startsWith('/templates/') && pathname.endsWith('/whmcs.js')) {
                    return true;
                }
            } catch (e) {
                continue;
            }
        }
        return false;
    }

    // 将检测结果通过 postMessage 发送给 content.js
    const result = isWHMCS();
    window.postMessage({ type: 'WHMCS_DETECT_RESULT', isWHMCS: result }, '*');
})();