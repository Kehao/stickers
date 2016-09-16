/**
 * IN APP 活动页面公用代码
 * 依赖于Zepto/jQuery
 *
 * @author He
 * @date 2015/3/20
 *
 * 测试页：/in_promo/example/index.html
 * 
 */

;
(function() {

    "use strict";

    var utils = {};

    /**
     * 从URL获取参数值
     */
    utils.getQueryString = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        return r && decodeURIComponent(r[2]);
    };

    /**
     * 从Cookie获取参数值
     */
    utils.getCookie = function(name) {
        var reg = new RegExp("(^|\\s)" + name + "=([^;]*)(;|$)");
        var r = document.cookie.match(reg);
        return r && unescape(r[2]);
    };

    /**
     * 设置cookie
     */
    utils.setCookie = function(c_name, value, expiredays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + escape(value) + (expiredays == null ? "" : ";expires=" + exdate.toGMTString());
    };

    utils.getSource = function() {
        return this.getQueryString("_s") || this.getCookie('_s') || this.getQueryString("_source") || this.getCookie('_source');
    };

    utils.getVersion = function() {
        return this.getQueryString("_v") || this.getCookie('_v') || this.getQueryString("_version") || this.getCookie('_version');
    };

    utils.getToken = function() {
        return this.getQueryString('_token') || this.getCookie('tg_auth');
    };

    /**
     * 判断页面是否在IN APP中打开
     * 判断依据： url参数（或Cookie）中存在'_token'('tg_auth'), '_source'与'_version'
     *
     * 2.0中'_source'与'_version'两者分别改为'_s'与'_v'
     * 
     * @return {Boolean}
     */
    utils.isFromInApp = function() {

        if (this.isFromWeChat()) {
            return false;
        }

        var token = this.getToken();
        var source = this.getSource();
        var version = this.getVersion();

        var tokenValid = token && token.trim().length;
        var sourceValid = source && /^(ios|android)$/i.test(source);
        var versionValid = version && /^[\d\.]+$/.test(version);

        return !!(tokenValid && sourceValid && versionValid);
    };

    /**
     * 是否在微信内打开
     * 
     * @return {Boolean}
     */
    utils.isFromWeChat = function() {
        return /MicroMessenger/.test(navigator.userAgent);
    };

    /**
     * 当前版本是否小于给定版本号
     * 
     * @param  所比较目标版本号
     * @return {Boolean}
     */
    utils.isLessThanVersion = function(targetVersion) {

        var currentVersion = this.getVersion();
        targetVersion = targetVersion.toString();

        if (!currentVersion || !targetVersion) {
            throw new Error("Can't get version.");
        }

        var currentVersionSplit = currentVersion.split(".");
        var targetVersionSplit = targetVersion.split(".");
        var loopLength = Math.min(currentVersionSplit.length, targetVersionSplit.length);

        for (var i = 0; i < loopLength; i++) {
            if (currentVersionSplit[i] !== targetVersionSplit[i]) {
                return Number(currentVersionSplit[i]) < Number(targetVersionSplit[i]);
            }
        }

        return currentVersion.length < targetVersion.length;
    };

    // 从URL参数初始化静态页面Cookie： '_token'('tg_auth'), '_s'('_source'), '_v'('_version')
    // 如存在旧值则需被覆盖
    (function() {
        if (utils.isFromInApp()) {
            // !utils.getCookie('tg_auth')  && (document.cookie = "tg_auth="  + utils.getQueryString("_token") + ";path=/;domain=itugo.com");
            // !utils.getCookie('_source')  && (document.cookie = "_source="  + utils.getQueryString('_source') + ";path=/;domain=itugo.com");
            // !utils.getCookie('_version') && (document.cookie = "_version=" + utils.getQueryString('_version') + ";path=/;domain=itugo.com");

            var exdate = new Date();
            exdate.setDate(exdate.getDate() + 30);

            var token = utils.getQueryString("_token");
            var source = utils.getQueryString("_s") || utils.getQueryString("_source");
            var version = utils.getQueryString("_v") || utils.getQueryString("_version");

            token && (document.cookie = "tg_auth=" + token + ";path=/;expires=" + exdate.toGMTString());
            source && (document.cookie = "_s=" + source + ";path=/;expires=" + exdate.toGMTString());
            version && (document.cookie = "_v=" + version + ";path=/;expires=" + exdate.toGMTString());
        }
    })();


    $(document).ready(function() {

        var isFromInApp = utils.isFromInApp();

        /**
         * 当在IN APP内打开WEB页面时，为标签添加data-call-app
         * 属性，利用JsBridge跳转至APP内相应页面，并阻止其默认
         * 行为（如a标签链接跳转）。
         */
        isFromInApp && $("body").on("click", "[data-call-app]", function(e) {
            e.preventDefault();
            var msg = $(this).data('callApp');
            msg && callApp && utils.isFromInApp() && callApp(JSON.parse(msg.replace(/'/g, '"')));
        });

        /**
         * @deprecated
         * 
         * 在微信内打开（不支持直接下载）页面时，替换所有
         * a.InAppDownload的href属性为应用宝下载地址。
         */
        var TXAppCenterUrl = $("#TXAppCenterUrl").val();
        if (TXAppCenterUrl && utils.isFromWeChat()) {
            $("a.InAppDownload").each(function(idx, elem) {
                $(this).attr("href", TXAppCenterUrl);
            });
        }

        /**
         * 避免与data-tracker冲突
         */
        isFromInApp && $("a.InAppDownload, a[data-call-app], a.InAppRequest").attr("href", "javascript:;");


        // 优先使用参数上的协议, add by xiaofeng
        var protocol = utils.getQueryString('protocol');
        if (protocol && protocol.indexOf('in://') == 0) {
            var str = '{"iosMessage": "' + protocol + '", "androidMessage": "' + protocol + '"}';

            window.appUrlObj = JSON.parse(str.replace(/'/g, '"'));
        }

        utils.openInApp = function(callback) {
            if (typeof appUrlObj === 'undefined' || !$.isPlainObject(appUrlObj))
                return;

            var ua = navigator.userAgent.toLowerCase(),
                appUrl = '';
            var ifr;
            var isAndroid = /android|adr/gi.test(ua),
                isIos = /iphone|ipod|ipad/gi.test(ua) && !isAndroid;

            if (utils.isFromInApp()) {
                if (!/in:\/\/webview\?url=/.test(appUrlObj.iosMessage)) {
                    callApp(appUrlObj);
                }
                return;
            } else if (isIos) {
                appUrl = appUrlObj.iosMessage;
            } else if (isAndroid) {
                appUrl = appUrlObj.androidMessage;
            }

            if (typeof appUrl === 'undefined') {
                return;
            }

            if (ua.indexOf('qq/') > -1 || (ua.indexOf('safari') > -1 && ua.indexOf('os 9_') > -1)) {
                location.href = appUrl;
            } else {
                ifr = document.createElement('iframe');
                ifr.src = appUrl;

                ifr.style.display = 'none';
                document.body.appendChild(ifr);

                // 超时跳转失败则认为未安装APP
                window.setTimeout(function() {
                    document.body.removeChild(ifr);
                    callback && callback();
                }, 1000);
            }
        };

        /**
         * 如页面上有appUrlObj，则根据其值自动打开IN
         * var appUrlObj = {'iosMessage':'in://main/friend','androidMessage':'in://main/friend'};
         */
        utils.autoOpenInApp = function() {
            //若有这个标识则标识不需要进页面就open
            if (typeof doNotNeedAutoOpen == 'boolean' && doNotNeedAutoOpen) return;

            if (typeof appUrlObj === 'undefined' || !$.isPlainObject(appUrlObj))
                return;

            var ua = navigator.userAgent.toLowerCase(),
                appUrl = '';
            var ifr;
            var isAndroid = /android|adr/gi.test(ua),
                isIos = /iphone|ipod|ipad/gi.test(ua) && !isAndroid;

            if (utils.isFromInApp()) {
                if (!/in:\/\/webview\?url=/.test(appUrlObj.iosMessage)) {
                    callApp(appUrlObj);
                }
                return;
            } else if (isIos) {
                appUrl = appUrlObj.iosMessage;
            } else if (isAndroid) {
                appUrl = appUrlObj.androidMessage;
            }

            if (typeof appUrl === 'undefined') {
                return;
            }

            if (ua.indexOf('qq/') > -1 || (ua.indexOf('safari') > -1 && ua.indexOf('os 9_') > -1)) {
                location.href = appUrl;
            } else {
                ifr = document.createElement('iframe');
                ifr.src = appUrl;
                ifr.style.display = 'none';
                document.body.appendChild(ifr);

                // 超时跳转失败则认为未安装APP
                // window.setTimeout(function() {
                //     document.body.removeChild(ifr);
                //     callback && callback();
                // }, 1000);
            }
        };
        utils.autoOpenInApp();

        /**
         * 页面有协议appUrlObj，则根据其值自动打开对于的app   
         * 
         */
        utils.openApp = function(callback) {
            if (typeof appUrlObj === 'undefined' || !$.isPlainObject(appUrlObj))
                return;

            var ua = navigator.userAgent.toLowerCase(),
                appUrl = '';
            var ifr;
            var isAndroid = /android|adr/gi.test(ua),
                isIos = /iphone|ipod|ipad/gi.test(ua) && !isAndroid;

            if (isIos) {
                appUrl = appUrlObj.iosMessage;
            } else if (isAndroid) {
                appUrl = appUrlObj.androidMessage;
            }

            if (typeof appUrl === 'undefined') {
                return;
            }
            if (utils.isFromWeChat() && ua.indexOf('os 9_') > -1) {
                var applinks = /in:\/\//.test(appUrl) ? "//m.in66.com/applinks" : "//chat.in66.com/applinks";
                location.href = applinks + '?protocol=' + encodeURIComponent(appUrl);
            } else {
                ifr = document.createElement('iframe');
                ifr.src = appUrl;

                ifr.style.display = 'none';
                document.body.appendChild(ifr);

                // 超时跳转失败则认为未安装APP
                window.setTimeout(function() {
                    document.body.removeChild(ifr);
                    callback && callback();
                }, 1000);
            }
        }
    });

    // Register as a named AMD module
    if (typeof define === "function") {
        define("InAppUtils", [], function() {
            return utils;
        });
    } else {
        window.InAppUtils = utils;
    }



    // // 防嵌入
    // // from qzone.qq.com
    // (function() {
    //     try {
    //         if (parent != self && (parent.document.domain != document.domain || (document.referrer && !/^http(s)?:\/\/[.\w-]+\.qq\.com\//i.test(document.referrer)))) {
    //             throw new Error("can't be iframed");
    //         }
    //     } catch (e) {
    //         debugger;
    //         window.open(location.href, "_top");
    //     }
    // })();

})();

//向服务器发送所有query string parameters，根据token来筛选js被阻塞的用户信息
//seedtype=fe_blocked 为本次的统计类型
// (function(){
//     var href=window.location.href,
//         queryStr;

//     if(href.indexOf("?")==-1){
//         queryStr="?seedtype=fe_blocked"
//     }
//     else{
//         queryStr=href.substr(href.indexOf("?"),href.length)+"&seedtype=fe_blocked"
//     }

//     var postUrl="http://stats1.jiuyan.info/itugo_deleven.html"+queryStr;

//     $.ajax({
//         url:postUrl,
//         dataType: 'jsonp',
//         jsonp: 'jsonpCallback'/*,
//         success:function(data){
//             console.log("traker successed!")
//         }*/
//     });

// })()
