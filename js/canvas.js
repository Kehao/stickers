$(function(){
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    var w = 500;
    var h = 466;
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;
    var deviceRatio = devicePixelRatio / backingStorePixelRatio;
    canvas.width = w * deviceRatio;
    canvas.height = h * deviceRatio;
    cw = canvas.width; 
    var flowId = 1;

    var drawImage = function(url, size) {
        // url = url.replace('images', 'images1');
        url += ('?flowId=' + flowId + Date.parse(new Date()));
        flowId++;
        console.log(url);
        var defer = $.Deferred();
        var img = new Image();
        img.crossOrigin = "";
        img.onload = function(){
            console.log('loaded')
            ctx.save();
            if (size.r) {
                ctx.translate(size.l * cw + size.w * cw/2, size.t * cw + size.h * cw/2);
                ctx.rotate(size.r*Math.PI/180);
                ctx.drawImage(this, size.w * cw/-2, size.h * cw/-2, size.w * cw, size.h * cw);
            } else {
                ctx.drawImage(this, size.l * cw, size.t * cw, size.w * cw, size.h * cw);
            }
            ctx.restore();

            setTimeout(function(){
                defer.resolve(this);
            }, 1500)
        }

        img.onerror = function(e){
            console.log('error')
            defer.reject(e);                    
        }
        img.src = url;
        return defer.promise();
    }

    var genImage = function(specs) {
        var mainImg = specs.shift();
        var promise = drawImage(mainImg.imgSrc, mainImg); 
        $.each(specs, function(){
            promise = promise.then(drawImage(this.imgSrc, this));
        });
        promise.then(function(){ 
            console.log('图片生成成功'); 
            var newImg = canvas.toDataURL('image/jpeg', 1); 
            $('#result').prop('src', newImg);$('.page3').fadeOut(100);$('.page4').fadeIn(500);

        },function(){ 
            console.log('图片生成失败') 
        })
    }

    var getLogo = function() {
        var $logo =  $('.logo');
        var shoeW = $('.theShoe').width(); 
        return {
            imgSrc: $logo.attr('src'),
                t: 10/75 * lib.flexible.rem/shoeW,
                l: (shoeW - 110/75* lib.flexible.rem)/shoeW,
                w: $logo.width()*1.2/shoeW,
                h: $logo.height()*1.2/shoeW
        };
    }
    var getRotate = function($el) {
        var rotate = 0;
        var transform = $el.css('transform'); 
        if (transform) {
            var m = transform.match(/-?\d+/);
            if (m) {
                rotate = parseFloat(m);
            }
        }
        return rotate;
    };

    var getSticker = function(sticker) {
        var $theShoe = $('.theShoe');
        var img = sticker.find('.sticker-control-img');
        var imgSrc = img.attr('src'); 
        var shoeW = $theShoe.width(); 
        var t = img.offset().top -  $theShoe.offset().top;
        var l = img.offset().left -  $theShoe.offset().left;
        var w = img.width();
        var h = img.height();
        var rotate = getRotate(sticker) + getRotate(sticker.find('.sticker-control-img'));
        return {
            imgSrc: imgSrc,
            t: t/shoeW,
            l: l/shoeW,
            w: w/shoeW,
            h: h/shoeW,
            r: rotate || 0
        };
    }

    $('.done').on('click', function(){
        var $stickers = $('.shoe-sticker');
        var $theShoe = $('.theShoe'); 
        $.hintMessage('正在生成图片... ');
        var imgs = [];
        imgs.push({
            imgSrc: $theShoe.find('img').attr('src'),
            w: 1, h: $theShoe.height()/$theShoe.width(), t: 0, l:0
        });
        imgs.push(getLogo());
        $.each($stickers, function() {
            imgs.push(getSticker($(this)));
        }); 
        genImage(imgs);
        $.hintMessage('请截图保存',2000)
    })
})
