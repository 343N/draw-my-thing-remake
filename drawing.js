function Drawing() {
    this.drawing = [];
    // this.sizeX = x;
    // this.sizeY = y;
    // this.originX = oX;
    // this.originY = oY;
    // beginShape(LINES);
    // vertex(0, 0);
    // endShape();
    this.renderMode = 0;

    this.d = 10;

    this.addPoint = function(json) {
        // console.log(json);
        // print(json);
        var length = this.drawing.length;
        strokeWeight(10);
        if (json.col){
          stroke(json.col.levels[0], json.col.levels[1], json.col.levels[2]);
        }
        // stroke(0);
        // console.log(json);
        // alert('adding point!');
        if (!json.begin && this.drawing.length > 0){

          line(this.drawing[length - 1].x, this.drawing[length - 1].y, json.x, json.y);

        }
        this.drawing.push(json);




    }

    this.show = function() {
        // noStroke();


        background(200);
        for (var i = 0; i < this.drawing.length; i++) {
                noFill();
                strokeWeight(10);
                stroke(0);
                var length = this.drawing.length;
                var obj = this.drawing[i-1];
                var obj2 = this.drawing[i]
                stroke(this.drawing[i].col.levels[0], this.drawing[i].col.levels[1], this.drawing[i].col.levels[2]);
                if (!this.drawing[i].begin){
                  line(obj.x, obj.y, obj2.x, obj2.y);
                }


            }
    }

    this.rescale = function(w, h) {
        for (var i = 0; i < this.drawing.length; i++) {
            console.log(w + " " + h)
            this.drawing[i].x = this.drawing[i].x * w;
            this.drawing[i].y = this.drawing[i].y * h;
        }
    }
    // this.show();

    this.clear = function() {
        endShape();
        this.drawing = [];
        background(200);
    }

}
