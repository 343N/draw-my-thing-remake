function Alert(msg, bg, fg) {

    this.msg = msg;
    this.bg = bg || "#212121";
    this.fg = fg || "#FFFFFF";
    this.id = Math.floor(random(1000));


    // this.height = 64;

    this.dom = createDiv('');
    this.dom.class('alert');
    this.dom.id(this.id);
    this.dom.html(msg);
    this.dom.style('color', this.fg);
    this.dom.style('background-color', this.bg);



    // console.log(this.height);
    this.jq = $('#' + this.id);
    this.height = this.jq.height;
    // this.height = this.dom.heght;
    this.dom.style('top', -this.height + 'px');
    this.jq.animate({
        top: '2px'
        // top: 0
    }, 250, 'swing', function() {
        // console.log('entering page');
        // console.log(leavePage);
        // console.log(this.id);
        setTimeout(deleteElement, 4000, this.id);
    });

    function deleteElement(id){
      jq = $('#' + id);
      // p5dom = select('#' + id);
      jq.animate({
            left: "20%",
            opacity: 0
        }, 500, 'swing', function() {
            jq.remove();
        });
    }
}
