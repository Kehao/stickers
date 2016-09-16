window.InApp = {
    imageHost: location.protocol + '//res.jiuyan.info', 
    phpHost: location.protocol + '//www.in66.com',
    isIos: function() {
         var ua = navigator.userAgent.toLowerCase();
         var isAndroid = /android|adr/gi.test(ua);
         return /iphone|ipod|ipad/gi.test(ua) && !isAndroid;
    },
    isBottom: function() {
        return ($('body').height() - $(window).scrollTop() - $(window).height()) < 100;
    },
    getQueryString: function (name) { 
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
        var r = window.location.search.substr(1).match(reg); 
        if (r!=null) return unescape(r[2]); return null; 
    },
    showLoading: function() {
        var $loading = $('.loading');
        $loading.find('.loading-wrapper').html('<img src="//res.jiuyan.info/in_promo/beiduofen/images/loading.gif">加载中...');
        $loading.show();
    },
    emptyCallback: function() {
        var $loading = $('.loading');
        $loading.find('.loading-wrapper').html("<p>没有更多了哦 =_=\"</p>");
        $loading.show();
    },
    isInApp: InAppUtils.isFromInApp(),
    isWeChat: InAppUtils.isFromWeChat(),
    ajax: function(url, type, params, successCallback) {
        $.ajax({
            url: url,
            type: type,
            dataType: 'jsonp',
            data: params,
        }).done(function (res) {
            if (res.succ && res.data) {
                successCallback(res.data);
            } else {
                $.hintMessage( res.msg || res.data && res.data.msg || '请求失败！');
            }
        }).fail(function(){
            $.hintMessage('网络错误！');
        });
    },
    ajaxRender: function(url, type, params, emptyCallback, successCallback) {
        $.ajax({
            url: url,
            dataType: 'json',
            data: params, 
        }).done(function (res) {
            if (res.succ && res.data) {
                if (res.data.length == 0){
                    emptyCallback();
                } else {
                    successCallback(res.data);
                }   
            } else {
                $.hintMessage( res.data && res.msg || '请求失败！');
            }
        }).fail(function(){
            $.hintMessage('网络错误！');
        });
    },

    bindId: function() {
        var index = 0;
        return function() {
            return ++index; 
        };
    },
    bindApp: function(options) {
        var self = this;
        $.each(options, function(name, params) {
            var bindFnName = $.camelCase('bind-' + name);
            if (bindFnName && bindFnName in window.InApp) {
                var fn = window.InApp[bindFnName];
                fn.call(self, $.extend(params,{name: name}));
            }
        }) 
    },
    inOpenDownloadDialog: function(options) {
        if ($('.in-open-download-dialog').length == 0) {
            if (!(typeof(options) == "object")) {
                options = {};
            }
            options = $.extend({
                downloadImg: this.imageHost + '/in_promo/20160621_fulishe/index/images/om-down.png',
                openImg: this.imageHost + '/in_promo/20160621_fulishe/index/images/om-have.png',
                openTipImg: this.imageHost + '/in_promo/20160621_fulishe/index/images/other.png',
                downloadDataAllseed: '',
                openDataAllseed: '',
            }, options);

            var downloadDataAllseed = '';
            var openDataAllseed = '';

            if (options.downloadDataAllseed) {
                downloadDataAllseed = 'data-allseed=' + options.downloadDataAllseed;
            }

            if (options.openDataAllseed) {
                openDataAllseed = 'data-allseed=' + options.openDataAllseed;
            }

            var $inMask = $('<div class="in-mask hide"><img src="' + options.openTipImg + '" class="in-open-tip hide" /></div>');
            var $inOpenDownloadDialog = $(''
                + '<div class="in-open-download-dialog hide">'
                + '<div class="in-open-download-dialog-conent">'
                + '<a class="open-link" href="javascript:;" ' + openDataAllseed + '> <img src="' + options.openImg + '"> </a>'
                + '<a class="download-link" href="http://a.app.qq.com/o/simple.jsp?pkgname=com.jiuyan.infashion" ' + downloadDataAllseed + '><img src="' + options.downloadImg + '"> </a>'
                + '</div>'
                + '</div>'); 
            $('body').append($inMask);
            $('body').append($inOpenDownloadDialog);
            
            $inOpenDownloadDialog.find('.open-link').on('click', function(){
                $('.in-open-tip').removeClass('hide');     
                $inOpenDownloadDialog.addClass('hide');
            });
            $inMask.on('click', function(){
                $(this).addClass('hide');
                $inOpenDownloadDialog.addClass('hide');
            });
        }
        return {
            show: function() {
                $('.in-mask').removeClass('hide');
                $('.in-open-tip').addClass('hide');
                $('.in-open-download-dialog').removeClass('hide');
            }, 
            hide: function() {
                $('.in-mask').addClass('hide');
                $('.in-open-download-dialog').addClass('hide');
            }
        };
    },
    bindAppGShare: function(options) {
        var self = this;
        $(document).on('click', '.' + options.name, function() {
            if (!self.isInApp) {
                self.inOpenDownloadDialog().show()
                return false;
            }
            if (typeof(options.beforeCall) == 'function') {
                options.beforeCall(options);
            }
            var queryString = $.param({callback: options.callback});
            if (self.isIos()) {
                callApp({
                    'iosMessage':'in://in?tovc=102&h5=1&type=all&' + queryString,
                    'androidMessage':'in://in?tovc=102&h5=1&type=all&' + queryString 
                });
            } else {
                callApp({
                    'iosMessage':'in://in?tovc=102&h5=1&type=wechattimeline&' + queryString,
                    'androidMessage':'in://in?tovc=102&h5=1&type=wechattimeline&' + queryString
                });
            }
            return false;
        });
    },
    bindAppGCamera: function(options){ 
        if (this.getQueryString('photo_id') && typeof(options.callback) == 'function') {
            options.callback(options);
        }
        var self = this;
        $('.n-td').on('click', function(){
            $('.n-td').removeClass('animated');
            $(this).addClass('animated')
            $('#redirectUrl').val([options.redirectUrl, '?bg-id=', $(this).data('bgId')].join(''));
        })

        $(document).on('click', '.' + options.name, function() {
            if (!self.isInApp) {
                self.inOpenDownloadDialog().show()
                return false;
            }
            var $animated = $('table .animated'); 
            if ($animated.length != 0) {
                var pid = $animated.data('pid');
                var cid = $animated.data('cid');

                var queryString = $.param({pid: pid, cid: cid, tagid: options.tagid, tagname: options.tagname});
                if (typeof(options.beforeCall) == 'function') {
                    options.beforeCall(options);
                }
                callApp({
                    'iosMessage':'in://in?tovc=108&h5=1&type=0&' + queryString,
                    'androidMessage':'in://in?tovc=108&h5=1&type=0&' + queryString
                });
            } else {
                $.hintMessage('请先选择一款气垫霜!');
            }
            return false;
        })
    },
}
