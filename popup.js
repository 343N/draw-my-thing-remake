function Popup(obj) {

    // this.title;
    this.obj = obj;
    this.id = Date.now();
    $('body').append('<div class="popupOverlay" id="' + this.id + '-overlay"></div>')
    $('#' + this.id + '-overlay').append('<div class="popupContainer" id="' + this.id + '"></div>');
    this.overlay = $('#' + this.id + '-overlay')
    this.container = $('#' + this.id);
    if (this.obj.bg) {
        $('#' + this.id).css('background-color', this.obj.bg);
    }
    if (this.obj.fg) {
        this.container.css('color', this.obj.fg)
    }


    if (this.obj.title) {
        this.container.append('<div id="' + this.id + '-title" class="popupTitle">' + this.obj.title.text + '</div>');
        this.title = $('#' + this.id + '-title');
        // console.log(this.obj.title);
        // console.log(this.title);
        if (this.obj.title.properties) {
            var properties = Object.keys(this.obj.title.properties);
            var values = Object.values(this.obj.title.properties);
            // console.log(properties);
            for (var i = 0; i < properties.length; i++) {
                this.title.css(properties[i], values[i]);
            }
            // this.title.css(this.obj.title.properties);
        }

        // console.log)
        // console.log(this.title);/
        // console.log(this.title);

    }
    if (this.obj.desc) {
        this.container.append('<div id="' + this.id + '-desc" class="popupDescription">' + this.obj.desc.text + '</div>');
        this.desc = $('#' + this.id + '-desc');
        if (this.obj.desc.properties) {
            var properties = Object.keys(this.obj.desc.properties);
            var values = Object.values(this.obj.desc.properties);
            console.log('desc prop:' + properties);
            // console.log(properties);
            for (var i = 0; i < properties.length; i++) {
                this.desc.css(properties[i], values[i]);
            }
            // console.log)
            // console.log(this.title);/
            // console.log(this.title);

        }
        // console.log(this.obj.desc);
        // console.log(this.desc);
        // this.title.css(this.obj.title.properties);
    }


    objKeys = Object.keys(this.obj);
    var eCount = 1;
    objKeys.forEach(function(e, i) {
        // console.log(e);
        if (this.obj[e] != this.obj.desc && this.obj[e] != this.obj.title && this.obj[e]) {
            var html;
            // console.log(e);
            console.log(this.obj[e]);
            if (this.obj[e].label) {
                $('#' + this.id).append('<div id="' + this.id + '-' + eCount + '-label" class="popupLabel">' + this.obj[e].label.text + "</div>");
                if (this.obj[e].label.properties) {
                    var properties = Object.keys(this.obj[e].label.properties);
                    var values = Object.values(this.obj[e].label.properties);
                    // console.log(properties);
                    // console.log(values);
                    for (var i = 0; i < properties.length; i++) {
                        // console.log(properties[i]);
                        // console.log(values[i]);
                        $('#' + this.id + '-' + eCount + '-label').css(properties[i], values[i]);
                    }
                }
            }

            if (e.split('-')[0] == 'button') {
                // console.log(e)

                $('#' + this.id).append('<input id="' + this.id + '-' + eCount + '" class="popupButton" type="button">');

                html = $("#" + this.id + "-" + eCount);
                if (this.obj[e].text) html.attr('value', this.obj[e].text);
                console.log(this.obj[e]);

                html.off('click').on('click', this.obj[e].click);

            } else if (e.split('-')[0] == 'input') {
                $('#' + this.id).append('<input id="' + this.id + '-' + eCount + '" class="popupInput">');
                html = $("#" + this.id + "-" + eCount);
                if (this.obj[e].text) html.attr('value', this.obj[e].text);
                if (this.obj[e].click) html.off('click').on('click', this.obj[e].click);

            } else if (e.split('-')[0] == 'numberInput') {
                $('#' + this.id).append('<input id="' + this.id + '-' + eCount + '" class="popupInput" type="number">')
                html = $("#" + this.id + "-" + eCount);
                if (this.obj[e].text) html.attr('value', this.obj[e].text);
                if (this.obj[e].click) html.off('click').on('click', this.obj[e].click);

            }
            if (this.obj[e].properties) {
                var properties = Object.keys(this.obj[e].properties);
                var values = Object.values(this.obj[e].properties);
                // console.log(properties);
                // console.log(values);
                for (var i = 0; i < properties.length; i++) {
                    // console.log(properties[i]);
                    // console.log(values[i]);
                    html.css(properties[i], values[i]);
                }
            }

            eCount++;
        }
    }, this);



    this.container.css('transform', 'translate(-50%, -50%)');
    this.overlay.click(function(e) {
        if (e.target != this) {
            return false;
        }
        var animTime = .5;
        var html = $('#' + this.id);
        html.css('animation-name', 'fadeOut');
        html.css('animation-iteration-count', '1');
        html.css('animation-duration', animTime + 's');
        html.css('animation-timing-function', 'ease-out');
        html.css('animation-fill-mode', 'forwards');
        setTimeout(function() {
            html.remove();
        }, animTime * 1000);
    });
    var animTime = .5;
    this.overlay.css('animation-name', 'fadeIn');
    this.overlay.css('animation-iteration-count', '1');
    this.overlay.css('animation-duration', animTime + 's');
    this.overlay.css('animation-timing-function', 'ease-out');
    this.overlay.css('animation-fill-mode', 'forwards');

    // function removeElement(obj){
    //   console.log(obj.overlay);
    //   obj.remove();
    // }


}
