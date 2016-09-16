$(function(){
var initResult = function() {
    var photoId = InApp.getQueryString('photo_id');
    if (photoId) {
        var url = location.protocol + '//www.in66.com/promo/commonapi/photoinfo?img_type=w720&promo_name=fed';
        InApp.ajax(url, 'Get', {photo_id: photoId}, function(data){
            if (data.realUrl) {
                var $userImg = '<img class="pic" src="' + data.realUrl + '">';
                if ($('.result').length != 0) {
                    $('.result').append($userImg);
                } else {
                    $('.share-result').append($userImg);
                }
            }
        }); 
    } else {
        $.hintMessage('请求失败');    
    }

}
    initResult();
    InApp.bindApp({
        'app-g-share': {
            beforeCall: function(options) {
                Tracker.addAll('fed/result*share');
            },
            callback: 'shareCallback'      
        },
    })
	// share config
    var isWeChat = InApp.isWeChat;
    var isInApp = InApp.isInApp;
    (function() {
        if (isWeChat && SHARE && URLS && URLS.jssdk) {
            $.ajax({
                url: URLS.jssdk,
                data: { redirectUrl: location.href.split('#')[0] },
                success: function(res) {
                    res.succ && config(res.data);
                }
            });
            function config(data) {
                var shareObj = {
                    title : SHARE['shareTitle'],
                    link  : SHARE['shareLink'],
                    imgUrl: SHARE['shareImgSrc'],
                    desc  : SHARE['shareDesc'],
                    success: function() {
                        Tracker.addAll('fed*index*share_success')
                    }
                };

                wx.config({
                    debug    : false,
                    appId    : data.appId,
                    timestamp: data.timestamp,
                    nonceStr : data.nonceStr,
                    signature: data.signature,
                    jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline']
                });

                wx.ready(function() {
                    wx.onMenuShareTimeline(shareObj);  
                    wx.onMenuShareAppMessage(shareObj);
                });
            }
        } else if (isInApp && SHARE) {
            var html = [
                '<input type="hidden" id="shareCallback" value="https://stats1.jiuyan.info/itugo_deleven.html?action=fed*index*share_success">'
            ];
            $.each(SHARE, function(i, v) {
                html.push('<input type="hidden" id="'+ i +'" value="'+ v +'">');    
            });
            $('body').prepend(html.join(''));
        }
    })();



})
