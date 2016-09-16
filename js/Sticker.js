window.Sticker = function(imageUrl, options) {
    var defaultOptions = {
        rem2px: true,
        top: undefined,
        left: undefined,
        w: undefined,
        h: undefined,
        angle: 0,
        imgAngle: 0,
        unit: 'px',
        container: '.sticker',
        controlDel: '.sticker-control-del',
        controlMove: '.sticker-control-move',
        controlScale: '.sticker-control-scale'
    }
    if (!options.container) throw new Error('No options error: container !');
    if (!options.parentContainer) throw new Error('No options error: parentContainer !');

    this.options = $.extend({}, defaultOptions, options);
    this.angle = this.options.angle;
    this.imgAngle = this.options.imgAngle 
    this.scale = 1;
    this.unit = this.options.unit;
    if (this.options.rem2px) {
        this.size = {w: Sticker.px(this.options.w), h: Sticker.px(this.options.h)};
    } else {
        this.size = {w: this.options.w, h: this.options.h};
    } 

    this.startPoint = {x: 0, y:0};

    this.pos = {};
    this.bottomRightPos = {};
    this.centerPorintPos = {};

    this.extraX = 0;
    this.extraY = 0;

    this.$pC = $(this.options.parentContainer);
    this.container = this.options.container;
    this.imgUrl = imageUrl;
}

Sticker.prototype.touchDisable = function(event) {
    return (event.target && event.target.className == this.options.controlDel.replace("\.",'')) || 
        (event.target && event.target.className == this.options.controlMove.replace("\.",'')); 
}

Sticker.prototype.imgTotalAngle = function() {
   return this.angle + this.imgAngle; 
} 

Sticker.prototype.sticker = function() {
    if (this.$pC.find(this.container).length == 0) {
        var img = '<img class="sticker-control-img" src="' + this.imgUrl + '"/>';
        var del = '<div class="sticker-control-del"></div>';
        var move = '<div class="sticker-control-move"></div>';
        var scale = '<div class="sticker-control-scale"></div>';
        var stickerHtml =  '<div class="shoe-sticker isActive ' + this.container.replace('\.', '') + '">' + img + del + move + scale + '</div>';
        this.$sticker = $(stickerHtml);
        this.$pC.append(this.$sticker); 
    }
   return this.$sticker; 
} 

Sticker.prototype.stickerImg = function() {
    return this.sticker().find('.sticker-control-img');
}

Sticker.prototype.stickerDel = function() {
    return this.sticker().find('.sticker-control-del');
}

Sticker.prototype.stickerMove = function() {
    return this.sticker().find('.sticker-control-move');
}

Sticker.prototype.stickerScale = function() {
    return this.sticker().find('.sticker-control-scale');
}

Sticker.prototype.init = function() {
    $('.shoe-sticker').removeClass('isActive');
    this.initPos();
    this.bindEvent();
}

Sticker.prototype.draw = function() {
    this.sticker().css({
        position: "absolute",
        width: this.size.w + this.unit,
        height: this.size.h + this.unit,
        top: this.pos.top + this.unit,
        left: this.pos.left + this.unit,
        '-webkit-transform': "rotate(" + (this.angle) + "deg)",
        "transform": "rotate(" + (this.angle) + "deg)"
    });
}
Sticker.px2rem = function(px) { return lib.flexible.px2rem(px); }
Sticker.rem2px = function(rem) { return lib.flexible.rem2px(rem); }
Sticker.px = function(rem) { return lib.flexible.rem * rem; }

Sticker.prototype.initPos = function() {
    this.pos.left = (this.$pC.width() - this.size.w)/2;
    this.pos.top = (this.$pC.height() - this.size.h)/2;
    this.bottomRightPos = { left: this.pos.left + this.size.w, top: this.pos.top + this.size.h }
    this.centerPorintPos = { left: this.pos.left + this.size.w/2, top: this.pos.top + this.size.h/2 }
    this.draw();
}

Sticker.prototype.bindEvent = function() {
    this.stickerDel().on("click", this.onStickerDelClick.bind(this));
    this.stickerMove().on("click", this.onStickerMoveTap.bind(this));
    this.$pC.on("click", this.onParentClick.bind(this));

    this.sticker().on("touchmove", this.onStickerTouchmove.bind(this));
    this.stickerScale().on("touchmove", this.onStickerScaleTouchmove.bind(this));

    this.sticker().on("touchstart", this.onTouchstart.bind(this));
    this.stickerScale().on("touchstart", this.onTouchstart.bind(this));

    this.sticker().on("touchend", this.onTouchend.bind(this));
    this.stickerScale().on("touchend", this.onTouchend.bind(this));

    // this.stickerMove().on("touchmove", this.onStickerMoveTouchmove.bind(this));
    // this.stickerMove().on("touchstart", this.onTouchstart.bind(this));
    // this.stickerMove().on("touchend", this.onTouchend.bind(this));
}

Sticker.eventTouches = function(event) {
    var touches = event.touches || event.originalEvent.touches;
    if (!touches.length) throw new Error('Cant get touch points !');
    return touches;
}

Sticker.prototype.onStickerTouchmove = function(event) {
    if (this.touchDisable(event)) return true;
    var touches = Sticker.eventTouches(event);
    this.move(touches[0]);
    return false;
}

Sticker.prototype.onStickerMoveTap = function(event) {
    console.log(123)
    this.stickerImg().css("-webkit-transform","rotate("+(this.imgAngle - 90)+"deg)");
    this.stickerImg().css("transform","rotate("+(this.imgAngle - 90)+"deg)");
    // this.angle = this.angle - 90;
    this.imgAngle = this.imgAngle - 90;
    return false;
}

Sticker.prototype.move = function(touch) {
    var targetPoint = {x: Math.floor(touch.pageX), y: Math.floor(touch.pageY)}
    var disX = (targetPoint.x - this.startPoint.x);
    var disY = (targetPoint.y - this.startPoint.y);

    this.pos.left += disX;
    this.pos.top += disY;
    this.centerPorintPos = { left: this.pos.left + this.size.w/2, top: this.pos.top + this.size.h/2 }
    this.bottomRightPos = { left: this.pos.left + this.size.w, top: this.pos.top + this.size.h }

    this.draw();
    this.startPoint = targetPoint;
}

Sticker.prototype.onStickerScaleTouchmove = function(event) {
    var touches = Sticker.eventTouches(event);
    var touch = touches[0]; 
    var targetPoint = {x: Math.floor(touch.pageX), y: Math.floor(touch.pageY)}
    this.extraX += (targetPoint.x - this.startPoint.x);
    this.extraY += (targetPoint.y - this.startPoint.y);

    var centerX = this.centerPorintPos.left;

    var centerY = this.centerPorintPos.top;
    var lb_posX = this.bottomRightPos.left + this.extraX;
    var lb_posY = this.bottomRightPos.top + this.extraY;

    var radio = this.size.h/this.size.w;
    this.size.w = Math.sqrt(2 * ((lb_posX-centerX)*(lb_posX-centerX) + (lb_posY-centerY)*(lb_posY-centerY)));
    this.size.h = this.size.w * radio 

    var targetAngle = Math.atan2(lb_posX-centerX,lb_posY-centerY) * 180/Math.PI -45;
    this.angle = 360 - targetAngle;
    this.pos.top = this.centerPorintPos.top - this.size.h/2;
    this.pos.left = this.centerPorintPos.left - this.size.w/2;
    this.draw();
    this.startPoint = targetPoint;

    return false;
}

Sticker.prototype.onStickerDelClick = function(event) {
    this.sticker().remove();
    return false;
}
 
Sticker.prototype.onTouchstart = function(event) {
    if (this.touchDisable(event)) return true;
    
    var touches = Sticker.eventTouches(event);
    if (touches.length === 1) {
        var touch = touches[0]; 
        this.startPoint = {x: touch.pageX, y: touch.pageY}; 
    }
    $('.shoe-sticker').removeClass('isActive');
    if (!this.sticker().hasClass('isActive')) {
        this.sticker().addClass('isActive')
    }
    return false;
}

Sticker.prototype.onParentClick = function() {
    $('.shoe-sticker').removeClass('isActive');
    return false;
}

Sticker.prototype.onTouchend = function(event) {
    if (this.touchDisable(event)) return true;
    return false;
}
