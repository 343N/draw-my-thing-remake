function Player(name, id) {

    this.name = name;
    this.id = id;
    this.isDrawing = false;
    this.score = 0;
    this.correctlyGuessed = false;
    this.hasDrawn = false;
    // this.drawCount = 0;

    this.addPoints = function(points) {
        this.score += points;
    }

}
