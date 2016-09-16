var getQueryString = function (name) { 
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r!=null) return unescape(r[2]); return null; 
}
var shoes = [
                [
                    { url: '/platform/shoe1/1.jpg', color: '#bba2a4'},
                    { url: '/platform/shoe1/2.jpg', color: '#3a3333'},
                    { url: '/platform/shoe1/3.jpg', color: '#d1b996'}
                ],
                [
                    { url: '/platform/shoe2/1.jpg', color: '#473835'},
                    { url: '/platform/shoe2/2.jpg', color: '#be9e5a'},
                    { url: '/platform/shoe2/3.jpg', color: '#262131'}
                ],
                [
                    { url: '/platform/shoe3/1.jpg', color: '#fbca3c'},
                    { url: '/platform/shoe3/2.jpg', color: '#ffffff'},
                    { url: '/platform/shoe3/3.jpg', color: '#1b0000'}
                ],
                [
                    { url: '/platform/shoe4/1.jpg', color: '#b49484'},
                    { url: '/platform/shoe4/2.jpg', color: '#a2906f'},
                    { url: '/platform/shoe4/3.jpg', color: '#343028'}
                ],
];

var shoeIds = function(shoeId) {
    shoeId = shoeId.split('-');
    return { 
        mid: shoeId[0], 
        jid: shoeId[1],
        rmid: shoeId[0] - 1, 
        rjid: shoeId[1] - 1
    }
} 
var getShoes = function(shoeId) {
    return shoes[shoeIds(shoeId).rmid];
}
var getShoe = function(shoeId) {
    var shoes = getShoes(shoeId); 
    return shoes[shoeIds(shoeId).rjid];
}

$(function(){
    FastClick.attach(document.body);

    if ($('.page2').length != 0) {
        var swiperIndex = 1;
        var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            autoplay: 3000,
            loop : true,
            onSlideChangeStart: function(swiper){
                var index = swiper.activeIndex; 
                if (index == 5) { index = 1; }
                if (index == 0) { index = 4; }
                swiperIndex = index; 
            }
        });
    
        $('.swiper-slide img').on('click', function(){
            location.href = $(this).data('url'); 
            return false;
        })
        $('.go-shoe').on('click', function(){
            location.href = 'shoe.html?shoeId=' + swiperIndex+ '-1'; 
            return false;
        })
    }

    if ($('.page5').length != 0) {
        var page5SwiperIndex = 1;
        var colors = [1,1,1,1];
        var page5SelectShoe = function(shoeId) {
            // console.log(shoeId)
            var shoe = getShoe(shoeId);
            var ids = shoeIds(shoeId);
            var $allColor = $('.page5 .color');
            var $color = $allColor.eq(ids.jid-1);
            $('.swiper-slide-active').empty();
            $('.swiper-slide-active').html('<img src="' + imgUrlPrefix + shoe.url + '" data-shoe-id="' + shoeId + '">')
            $('.page5 .color').removeClass('selected');
            $color.addClass('selected');
            colors[ids.mid - 1] = parseInt(ids.jid);
            $('#downloadPictureUrl').val(imgUrlPrefix + shoe.url);
        }

        var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            loop : true,
            onSlideChangeStart: function(swiper){
                var index = swiper.activeIndex; 
                if (index == 5) { index = 1; }
                if (index == 0) { index = 4; }
                page5SwiperIndex = index; 
                $('.page5 .color').each(function(i){
                    var mid = index;
                    var jid = i + 1;
                    var shoeId = '' + mid + '-' + jid;
                    $(this).data('shoe-id', shoeId);
                    $(this).css('background-color', getShoe(shoeId).color)
                });
                page5SelectShoe(index + '-' + colors[index-1]);
           }
        });

        $('.page5 .color').on('click', function(){
            var shoeId = $(this).data('shoe-id');
            page5SelectShoe(shoeId);
            return false;
        })

        var queryString = $.param({pid: '1PgzDQKZ', cid: '1MJplXgX', tagid: '1wBzGRXd', tagname: "innisfree随心所欲私人定制"});
        $('.open').on('click', function(){
            callApp({
                'iosMessage':'in://in?tovc=104&h5=1',
                'androidMessage':'in://in?tovc=104&h5=1' 
            });

            setTimeout(function(){
                callApp({
                    'iosMessage':'in://in?tovc=108&h5=1&type=0&' + queryString,
                    'androidMessage':'in://in?tovc=108&h5=1&type=0&' + queryString
                });
			}, 5000);

        });
    }

    if ($('.page1').length != 0) {
        $('.page1').touchwipe({
            wipeDown: function() {
                $('.page1').addClass('slideUp');
                $('.hide-first').fadeIn(0);
            }
        });
    }
    
    if ($('.page3').length != 0) {
        var shoeId = getQueryString('shoeId');
        var stickerCount = [9,6,6,12];
        var stickerFlowId = 0;
        
        
        var getStickerUrl = function(shoeId, i) {
            return imgUrlPrefix + '/platform/shoe' + shoeIds(currentShoeId).mid + '/s-' + i + '.png';
        } 
        var swiperStickers = function(shoId) {
            var count = stickerCount[shoeIds(currentShoeId).rmid];
            var stickers = '';
            for (var i=1; i <= count; i++) {
                stickers += '<div class="sticker" data-sticker-id="' + i + '"> <img src="' + getStickerUrl(shoeId, i) + '"> </div>';
            }
            $('.stickers').empty();
            $('.stickers').append($(stickers));
        }
    
        var swipeShoe = function(shoeId) {
            var shoe = '<div class="theShoe"><img src="' + imgUrlPrefix + getShoe(shoeId).url + '"></div>';
            currentShoeId = shoeId;
            var jid = shoeIds(shoeId).jid; 
            $('.color').eq(jid-1).addClass('colorSelected');
            $('.theShoe').remove();
            $('.shoe-platform').append($(shoe));
        } 
    
        var shoeColors = '<div class="color" data-shoe-id="' + (shoeIds(shoeId).mid) + '-1"></div>';
        shoeColors += '<div class="color" data-shoe-id="' + (shoeIds(shoeId).mid) + '-2"></div>';
        shoeColors += '<div class="color" data-shoe-id="' + (shoeIds(shoeId).mid) + '-3"></div>';
        var $shoeColor = $('<div class="shoe-color clearfix"> ' + shoeColors + '</div>');
        $('.shoe-platform').append($shoeColor);
        $('.color').each(function(){
           $(this).css('background-color', getShoe($(this).data('shoeId')).color) 
        })
        swipeShoe(shoeId);
        swiperStickers(shoeId);
    
        $('.color').on('click', function() {
            $('.color').removeClass('colorSelected');
            $(this).addClass('colorSelected');
            swipeShoe($(this).data('shoeId'));
            return false;
        })
    
        $('.sticker').on('click', function(){
            var stickerId = $(this).data('stickerId');
            var sticker = new Sticker(getStickerUrl(shoeId, stickerId), { 
                parentContainer: '.shoe-platform',
                container: '.sticker-' + stickerId + '-' + stickerFlowId,
                w: 150/75,
                h: 150/75
            })        
            sticker.init();
            stickerFlowId++;
        });
    }
});
