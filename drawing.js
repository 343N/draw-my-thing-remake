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
        var length = this.drawing.length;
        var prevObj = this.drawing[length - 1];
        strokeWeight(5);
        stroke(json.r, json.g, json.b);
        noFill();
        if (!json.begin && this.drawing.length > 0) {
            line(prevObj.x, prevObj.y, json.x, json.y);
        }
        this.drawing.push(json);




    }

    this.show = function() {
        // noStroke();
        background(200);
        for (var i = 0; i < this.drawing.length; i++) {
            var obj = this.drawing[i];
            var prevObj = this.drawing[i - 1];
            noFill();
            strokeWeight(5);
            stroke(obj.r, obj.g, obj.b);
            // console.log(obj);
            // console.log(prevObj);
            if (obj.begin) console.log(`new line!`);
            if (!obj.begin) {
                // console.log(obj);
                // console.log(prevObj);
                // console.log('line from ' + prevObj.x + " - " + prevObj.y + "\n" + "to " + obj.x + " - " + obj.y);
                line(prevObj.x, prevObj.y, obj.x, obj.y);
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
