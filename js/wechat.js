// share config
var isWeChat = InAppUtils.isFromInApp();
var isInApp = InAppUtils.isFromWeChat();
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
                    // Tracker.addAll('suren*index*share_success')
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
            '<input type="hidden" id="shareCallback" value="https://stats1.jiuyan.info/itugo_deleven.html?action=suren*index*share_success">'
        ];
        $.each(SHARE, function(i, v) {
            html.push('<input type="hidden" id="'+ i +'" value="'+ v +'">');    
        });
        $('body').prepend(html.join(''));
    }
})();

