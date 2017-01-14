var connected = false;
var socket;
var joinedGame = false;
var players = [];
var renderMode;
var me;
var nameInput, timer, renderModeSelect, undoButton, wordDiv;
var colorSelector;
var currentDrawing;
var undoState = false;


function setup() {
    // devicePixelScaling(false);
    currentDrawing = new Drawing();
    cc = createCanvas(P2D);
    resizeCanvas(windowWidth * .6, windowHeight - 48);

    timer = createDiv('90');
    timer.id('timer');
    colorSelector = createInput();
    colorSelector.id('colorSelector');
    colorSelector.attribute('type', 'color');
    socket = io.connect('http://116.240.152.165:9876');

    wordDiv = createDiv('');
    wordDiv.id('wordDiv');

    undoButton = createDiv('Undo');
    undoButton.id('undoButton');
    undoButton.mouseClicked(function() {
        console.log('undo pressed!')
        socket.emit('undoDrawing');
    });


    // cc.touchStarted(function(){
    //   console.log('touch triggered\n' + mouseX + " - " + mouseY);
    //   // mousePressed();
    //   startDrawing();
    // });
    // cc.touchMoved(function(){
    //   console.log('touch dragged\n' + mouseX + " - " + mouseY);
    //   // mouseDragged();
    //   continueDrawing();
    // });
    // cc.touchEnded(function(){
    //   console.log('touch released\n' + mouseX + " - " + mouseY);
    //   // mouseReleased();
    //   endDrawing();
    // });

    socket.on('connected', function(data) {
        background(200);
        stroke(2);
        fill(255);
        console.log('connected');
        askForName();
        console.log(data);
        connected = true;
        for (var i = 0; i < data.players.length; i++) {
            players.push(data.players[i]);
        }
        console.log(data.drawing);
        data.drawing.forEach(function(e) {
            e.x = e.x * (width / e.w);
            e.y = e.y * (height / e.h);
            currentDrawing.addPoint(e);
            //currentDrawing.show();
        });



        refreshPlayerList();
    });

    socket.on('requestData',function(data){
      console.log(data);
    })

    socket.on('pushAlert', function(data) {
        new Alert(data.msg, data.bg, data.fg)
    });

    socket.on('disconnect', function(data) {
        players = [];
        removePlayerList();

        connected = false;
        joinedGame = false;
        nameInput.remove();
        currentDrawing.clear();
    });

    socket.on('addPlayer', function(data) {
        players.push(data);
        new Alert(`<span style="font-weight: bold">` + data.name + "</span> has joined the game!")
        addPlayerCard(data);
    })

    socket.on('removePlayer', function(data) {
        // console.log(data);
        for (var i = 0; i < players.length; i++) {
            var p = players[i];
            if (data === p.id) {
                removePlayerCard(p);
                players.splice(i, 1);
                // console.log('deleted player');

            }
        }
    });

    socket.on('updateTimer', function(data) {
        timer.html(data);
    })

    socket.on('guesserWord', function(data) {
        new Alert(`Round ` + data.count + `!<br>Your word to guess is <span style="font-weight: bold;">` + data.length + "</span> letters long", "#B71C1C");
        addToChat(`Round ` + data.count + `!<span style="color: rgba(255,128,128,1)"><br>Your word to guess is <span style="font-weight: bold;">` + data.length + "</span> letters long<BR><BR></span>")
        showWord(data.length);
        removeGuesses();
        removeUndo();
    });

    socket.on('drawerWord', function(data) {
        new Alert(`Round ` + data.count + `!<br>Your word to draw is <span style="font-weight: bold;">` + data.word + ".</span>", "#1B5E20");
        addToChat(`Round ` + data.count + `!<span style="color: rgba(128,255,128,1)"><br>Your word to draw is <span style="font-weight: bold;">` + data.word + ".</span><BR><BR></span>");
        showWord(data.word);
        removeGuesses();
    })

    socket.on('joinGame', function(data) {
        // background(200);
        me = new Player(data, socket.id);
        // console.log('added ' + me);
        socket.emit('addPlayer', me);
        players.push(me);
        joinedGame = true;
        nameInput.remove();
        addPlayerCard(me);
        // refreshPlayerList();
    });

    socket.on('isDrawing', function(data) {
        if (data.id === me.id) {
            me.isDrawing = true;
            canvas.style.cursor = "crosshair"

        } else canvas.style.cursor = "default";
        players.forEach(function(e) {
            if (e.id == data.id) {
                e.isDrawing = true;
            } else {
                e.isDrawing = false;
            }
            updatePlayerCard(e);
        });
    });

    socket.on('removeGuesses', removeGuesses);


    socket.on('joinFailed', function(data) {
        new Alert(data, "#B71C1C");
    });

    socket.on('undoDrawing', function() {
        // console.log('msg recieved');
        undoDrawing();
    });

    socket.on('clearDrawing', clearDrawing);

    socket.on('updateChat', function(data) {
        addToChat(data);

    });

    socket.on('correctGuess', function(data) {
        // addToChat('<span style="font-weight: bold">Correct! The word was ' + data + "!</span><br><br>");
        new Alert('Correct! The word was <span style="font-weight: bold">' + data + '</span>!');
        me.correctlyGuessed = true;

        // updatePlayerList();
    })

    socket.on('updateScoreboard', function(data) {
        var p = idPlayer(data.id);
        // console.log(data);
        p.score = data.score;
        p.correctlyGuessed = data.correctlyGuessed;
        updatePlayerCard(p);
    });


    socket.on('clearScores', clearScores);

    socket.on('chatTooLong', function() {
        addToChat("Message too long! Must be less than 300 characters.<BR><BR>");
    });

    socket.on('addToDrawing', function(data) {
        data.x = data.x * (width / data.w);
        data.y = data.y * (height / data.h);
        currentDrawing.addPoint(data);
        // currentDrawing.show();
        // console.log('data recieved');
    })


    var chatInput = select('#chatInput');
    chatInput.changed(sendChat);

}

function clearDrawing() {
    currentDrawing.clear();
}

function removeGuesses() {
    players.forEach(function(e) {
        e.correctlyGuessed = false;
        updatePlayerCard(e);
    });
    me.correctlyGuessed = false;
}





function mousePressed() {
    startDrawing();
}

function mouseDragged() {
    continueDrawing();
    return false;
}

function showWord(s) {
    if (typeof(s) === "string") {
        wordDiv.html(s);
    } else if (typeof(s) === "number") {
        var string = "";
        for (var i = 1; i <= s; i++) {
            string = string + "_ ";
        }
        wordDiv.html(string);
    }
}


function removeUndo() {
    if (undoState) {
        undoState = false;
        $('#undoButton').animate({
            opacity: 0
        }, 250, function() {
            undoButton.style('display', 'none');
        });
    }
}

function readdUndo() {
    if (!undoState) {
        undoState = true;
        undoButton.style('display', 'inline-block');
        $('#undoButton').animate({
            opacity: 1
        }, 250);
    }
}

function mouseReleased() {
    endDrawing();
    // return false;
}

// function askUndo(){
// socket.emit('askUndo')
// }

function undoDrawing() {
    // console.log(currentDrawing.drawing.length);
    for (var i = currentDrawing.drawing.length - 1; i >= 0; i--) {
        console.log('looking for beginning at latest ' + i);
        if (currentDrawing.drawing[i].begin) {
            // console.log(i);
            // console.log(j);
            for (var j = currentDrawing.drawing.length - 1; j >= i; j--) {
                currentDrawing.drawing.splice(j, 1);
            }
            if (currentDrawing.drawing.length === 0) removeUndo();
            currentDrawing.show();

            break;

        }
    }
}


function addToChat(data) {
    var chatBox = select('#chatHistory');
    chatBox.html(chatBox.html() + data);
    $("#chatHistory").scrollTop($("#chatHistory").prop("scrollHeight"));
}

function startDrawing() {
    // print('mouse pressed! ' + mouseX + " - " + mouseY)
    var col = color(document.getElementById('colorSelector').value);
    if (joinedGame && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
        var json = {
            x: mouseX,
            y: mouseY,
            w: width,
            h: height,
            begin: true,
            r: col.levels[0],
            g: col.levels[1],
            b: col.levels[2],
            end: false,
            player: me
        }
        currentDrawing.addPoint(json);
        // currentDrawing.show();
        // console.log('begun drawing');
        // console.log(json + " is all the drawing data");
        socket.emit('addToDrawing', json);
        readdUndo();
        // console.log('added ellipse at ' + mouseX + ", " + mouseY);
    }
    // return false;
}

function idPlayer(playerID) {
    for (var i = 0; i < players.length; i++) {
        if (playerID === players[i].id) {
            return players[i];
        }
    }
}


function continueDrawing() {
    // print('mouse dragged! ' + mouseX + " - " + mouseY)
    var col = color(document.getElementById('colorSelector').value);
    if (joinedGame && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
        var json = {
            x: mouseX,
            y: mouseY,
            w: width,
            h: height,
            begin: false,
            r: col.levels[0],
            g: col.levels[1],
            b: col.levels[2],
            end: false,
            player: me
        }
        // console.log(json + " is all the drawing data");
        currentDrawing.addPoint(json);
        socket.emit('addToDrawing', json);
        // currentDrawing.show();
        // console.log('added ellipse at ' + mouseX + ", " + mouseY);
    }
    return false;
}



function endDrawing() {
    // print('mouse released! ' + mouseX + " - " + mouseY)
    var col = color(document.getElementById('colorSelector').value);
    if (joinedGame && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
        var json = {
            x: mouseX,
            y: mouseY,
            w: width,
            h: height,
            begin: false,
            r: col.levels[0],
            g: col.levels[1],
            b: col.levels[2],
            end: true,
            player: me
        }
        currentDrawing.addPoint(json);
        socket.emit('addToDrawing', json);
        // console.log('added ellipse at ' + mouseX + ", " + mouseY);

    }
    // return false;
}



function sendChat() {

    if (joinedGame) {
        var chatBox = select('#chatInput');
        socket.emit('chatMsg', chatBox.value());
        chatBox.value('');
    }

}

function removePlayerList() {
    var p = selectAll('.playerEntry');
    p.forEach(function(element) {
        element.remove();
    })
    var sc = selectAll('.playerScore');
    sc.forEach(function(e) {
        e.remove();
    })
}

function refreshPlayerList() {
    removePlayerList();
    players.forEach(function(e) {
        // if (e != me || e == me) {
        var p = createDiv(e.name);
        p.class('playerEntry');
        p.parent('#playerList');
        p.style('background-color', 'rgba(0,0,0,0)');
        p.style('font-weight', 'regular');
        console.log(e.id);
        p.id(e.id + '-name');
        var sc = createDiv(e.score);
        sc.class('playerScore');
        sc.parent('#playerList');
        sc.id(e.id + '-score');
        if (e.correctlyGuessed) {

            p.style('background-color', 'rgba(0,96,0,.3)');
            // p.style('font-weight', 'bold');
            sc.style('background-color', 'rgba(0,96,0,.3)');

            // sc.style('font-weight', 'bold');
        }
        if (e.isDrawing) {
            p.style('background-color', 'rgba(0,0,96,.3)');
            // p.style('font-weight', 'bold');/
            sc.style('background-color', 'rgba(0,0,96,.3)');
            // sc.style('font-weight', 'bold');
        }
        // }
    });
}

function removePlayerCard(a) {
    var p = a;
    var name = $('#' + p.id + '-name');
    var score = $('#' + p.id + '-score');
    name.fadeOut(2000, function() {
        name.remove();
    });

    score.fadeOut(2000, function() {
        score.remove();
    });



}

function updatePlayerCard(a) {
    var p = a;
    var sc = $('#' + p.id + '-score');
    var name = $('#' + p.id + '-name');
    if (p.isDrawing) {
        sc.css('background-color', 'rgba(0,0,96,.3)');
        name.css('background-color', 'rgba(0,0,96,.3)');
    } else if (p.correctlyGuessed) {
        sc.css('background-color', 'rgba(0,96,0,.3)');
        name.css('background-color', 'rgba(0,96,0,.3)');
    } else if (p.id == me.id){
        name.css('background-color', 'rgba(0,0,0,0.2)');
        sc.css('background-color', 'rgba(0,0,0,0.2)');
    } else {
      sc.css('background-color', 'rgba(0,0,0,0)');
      name.css('background-color', 'rgba(0,0,0,0)');
    }
    sc.html(p.score);

}

function addPlayerCard(a) {
    var player = a;
    var p = createDiv(player.name);
    p.class('playerEntry');
    p.parent('#playerList');
    // p.style('background-color', 'rgba(0,0,0,0)');

    p.style('font-weight', 'regular');
    p.id(player.id + '-name');

    var sc = createDiv(player.score);
    sc.id(player.id + '-score');
    sc.class('playerScore');
    sc.parent('#playerList');
    
    if (player.id === me.id){
      p.style('background-color', 'rgba(0,0,0,0.2)');
      sc.style('background-color', 'rgba(0,0,0,0.2)');
    } else {
      p.style('background-color', 'rgba(0,0,0,0)');
      sc.style('background-color', 'rgba(0,0,0,0)');
    }
}

function clearScores() {
    players.forEach(function(e) {
        e.score = 0;
    });
}


function askForName() {
    nameInput = createInput('');
    nameInput.value('Type your name here, then press enter.');
    nameInput.id('nameInput');
    nameInput.mousePressed(function() {
        nameInput.value('');
    });

    nameInput.changed(function() {
        socket.emit('joinAttempt', nameInput.value());
        // nameInput.remove();
    });
}
//
// function touchMoved() {
//     return false;
// }

// function touchStarted(){
//   return false;
// }

// function touchEnded(){
//   return false;
// }

function draw() {



    // background(200);
    if (!connected) {
        stroke(0);
        strokeWeight(1);
        fill(0);
        textSize(24);
        textAlign(CENTER);
        text("connecting...", width / 2, height / 2);
    }
    stroke(0);
    fill(0);
    // textSize(12);
    // textAlign(LEFT);
    // text("FPS: " + Math.floor(frameRate()), 1, 12);

    // currentDrawing.show();

}


function windowResized() {
    // console.log('width: ' + width + ' height: ' + height + "\nwinW: " + (windowWidth * .6) + " winH: " + windowHeight);
    currentDrawing.rescale(((windowWidth * .6) / width), ((windowHeight - 48) / height));
    resizeCanvas(windowWidth * .6, windowHeight - 48);
    // currentDrawing.drawing = [];
    currentDrawing.show();
    $("#chatHistory").scrollTop($("#chatHistory").prop("scrollHeight"));
}
