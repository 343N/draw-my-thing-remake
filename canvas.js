var connected = false;
var socket;
var joinedLobby = false;
var players = [];
var renderMode;
// var me = new Player)
var me;
var nameInput, timer, renderModeSelect, undoButton, wordDiv;
var colorSelector;
var currentDrawing;
var allLobbyInfo;
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
        // console.log('undo pressed!');
        socket.emit('undoDrawing', me.currentLobby.id);
    });

    // $('#rightDiv').css('opacity','0');
    // $('#leftDiv').css('opacity','0');



    // cc.touchStarted(function(){
    //   // console.log('touch triggered\n' + mouseX + " - " + mouseY);
    //   // mousePressed();
    //   startDrawing();
    // });
    // cc.touchMoved(function(){
    //   // console.log('touch dragged\n' + mouseX + " - " + mouseY);
    //   // mouseDragged();
    //   continueDrawing();
    // });
    // cc.touchEnded(function(){
    //   // console.log('touch released\n' + mouseX + " - " + mouseY);
    //   // mouseReleased();
    //   endDrawing();
    // });

    socket.on('connected', function() {
        background(150);
        stroke(2);
        fill(255);
        // console.log('connected');
        $('#Welcome').html('')
        askForName();
        $('#chatHistory').html('');

        // console.log(data);
        connected = true;
    });

    // socket.on('updateLobbies')



    socket.on('joinLobby', function(data) {
        // console.log(data);
        clearDrawing();
        if (!data.isMainLobby) {
            // console.log(data.currentDrawing);
            data.currentDrawing.forEach(function(e) {
                e.x = e.x * (width / e.w);
                e.y = e.y * (height / e.h);
                currentDrawing.addPoint(e);
                //currentDrawing.show();
            });
        }
        // data.players.push(me);
        me.currentLobby = data;
        // me.currentLobby.players[0].currentLobby = undefined
        // me.currentLobby.players.me.currentLobby.players = undefined;
        if (me.currentLobby.currentWord) showWord(me.currentLobby.currentWord);
        else showWord('');
        removeLobbyList();
        removePlayerList();
        addToChat("You've joined " + data.name + "<br><br>");
        addPlayerCard(me);
        players = data.players;
        players.forEach(function(e) {
            addPlayerCard(e);
            // console.log('does ' + e.id + ' match ' + me.id);
        })
        joinedLobby = true;
        // refreshPlayerList();
        // console.log('joined lobby');

        // players = data.players;
        // else {
        //   lobbySelectionScreen();
        // }
    })

    socket.on('updateLobbyInfo', function(data) {
        updateLobby(data);
    })

    socket.on('allLobbyInfo', function(data) {
        createLobbyList(data);
    });

    socket.on('addLobbyToList', function(data) {
        addLobby(data);
    });

    socket.on('requestData', function(data) {
        // console.log(data);
    })

    socket.on('pushAlert', function(data) {
        new Alert(data.msg, data.bg, data.fg)
    });

    socket.on('closePopups', function() {
        $('.popupOverlay').trigger('click');
    })

    socket.on('disconnect', function(data) {
        players = [];
        connected = false;
        joinedLobby = false;
        nameInput.remove();
        // joinedLobby = false;
        currentDrawing.clear();
        $('.popupOverlay').trigger('click');
        $('#Welcome').css('background-color', '#212121');
        $('#Welcome').html('Connecting...')
        $('#Welcome').css('z-index', '2');
        setTimeout(function() {
            removePlayerList();
            removeLobbyList();
        }, 2000);
    });

    socket.on('removeLobby', function(data) {
        removeLobby(data);
    })

    socket.on('addPlayer', function(data) {
        players.push(data);
        new Alert(`<span style="font-weight: bold">` + data.name + "</span> has joined the game!")
        addPlayerCard(data);
    })

    socket.on('removePlayer', function(data) {
        // console.log(data);
        players.forEach(function(e, i) {
            if (data === e.id) {
                removePlayerCard(e);
                players.splice(i, 1);
                // console.log('deleted player');

            }
        });
    });

    socket.on('updateTimer', function(data) {
        // console.log(data);
        timer.html(data);
    })

    socket.on('guesserWord', function(data) {
        new Alert(`Round ` + data.count + `!<br>Your word to guess is <span style="font-weight: bold;">` + data.length + "</span> letters long", "#B71C1C");
        addToChat(`Round ` + data.count + `!<span style="color: rgba(255,128,128,1)"><br>Your word to guess is <span style="font-weight: bold;">` + data.length + "</span> letters long<BR><BR></span>")
        me.isDrawing = false;
        showWord(data.length);
        removeGuesses();
        removeUndo();
    });

    socket.on('drawerWord', function(data) {
        new Alert(`Round ` + data.count + `!<br>Your word to draw is <span style="font-weight: bold;">` + data.word + ".</span>", "#1B5E20");
        addToChat(`Round ` + data.count + `!<span style="color: rgba(128,255,128,1)"><br>Your word to draw is <span style="font-weight: bold;">` + data.word + ".</span><BR><BR></span>");
        me.isDrawing = true;
        showWord(data.word);
        removeGuesses();
    })



    // socket.on('connectToGame', function(data) {
    //     // background(200);
    //     me = new Player(data, socket.id);
    //     // console.log('added ' + me);
    //     // socket.emit('addPlayer', me);
    //     players.push(me);
    //     joinedLobby = true;
    //     nameInput.remove();
    //     addPlayerCard(me);
    //     // refreshPlayerList();
    // });

    socket.on('givePlayer', function(p) {
        me = p;
        nameInput.remove();
        $('#Welcome').css('background-color', 'rgba(0,0,0,0)');
        setTimeout(function() {
            $('#Welcome').css('z-index', '-2');
        })
    });

    socket.on('isDrawing', function(data) {
        if (data.id === me.id) {
            me.isDrawing = true;
            canvas.style.cursor = "crosshair"

        } else canvas.style.cursor = "default";
        players.forEach(function(e) {
            if (e.id == data.id) {
                if (data.id == me.id) me.isDrawing = true;
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

    socket.on('requestPassword', function(data) {
        console.log(data);
        data.popup.button.click = function() {
            console.log('logging');
            var el = "#" + this.id.substr(0, this.id.length - 1) + '1';
            var json = {
                l: data.l,
                password: $(el).val()
            }
            // var json = {
            // }
            // socket.emit('createNewLobby', json);
            socket.emit('passwordAttempt', json);
            console.log($(el).val());

        }
        new Popup(data.popup);
    })

    socket.on('correctGuess', function(data) {
        // addToChat('<span style="font-weight: bold">Correct! The word was ' + data + "!</span><br><br>");
        new Alert('Correct! The word was <span style="font-weight: bold">' + data + '</span>!');
        showWord(data);
        me.correctlyGuessed = true;

        // updatePlayerList();
    })

    socket.on('updateScoreboard', function(data) {
        var p = idPlayer(data.id);
        // console.log(data);
        // console.log(p);
        if (p.id == me.id){
          me.correctlyGuessed = data.correctlyGuessed;
          me.score = data.score;
          updatePlayerCard(me);
        } else {
          p.score = data.score;
          p.correctlyGuessed = data.correctlyGuessed;
          updatePlayerCard(p);
        }
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
    });

    socket.on('receiveData', function(a) {
        // console.log(a);
    });


    var chatInput = select('#chatInput');
    chatInput.changed(sendChat);
    createDiv('').id('Welcome');
    $('#Welcome').css('transition', 'all 1s');


}

function clearDrawing() {
    currentDrawing.clear();
}

function removeGuesses() {
    me.correctlyGuessed = false;
    players.forEach(function(e) {
        e.correctlyGuessed = false;
        updatePlayerCard(e);
        updatePlayerCard(me);
    });

}

//
// LOBBY LIST MANIPULATION
//

function createLobbyList(allLobbyInfo) {
    createDiv('').id('lobbySelectionContainer');
    var lCont = $('#lobbySelectionContainer');
    lCont.css('height', height);
    $("#wordDiv").append(`<div id="createLobbyButton">Create Lobby</div>`)
    console.log(newLobbyPopup);
    $('#createLobbyButton').off('click').on('click', newLobbyPopup);
    // console.log(allLobbyInfo);
    allLobbyInfo.forEach(function(e) {
        // console.log(e);
        addLobby(e);
    });
}

function newLobbyPopup() {
    var popupData = {
        title: {
            text: "Create a new lobby.",
            properties: {
                color: 'white',
                'font-size': '36px'
            }
        },
        desc: {
            text: "You can create your own lobby!<br>Specify the name, password (optional), and the player limit!",
            properties: {
                color: 'rgba(200,200,200,1)',
                'font-size': '16px',
                'margin-bottom': '24px'
            }
        },
        "input-1": {
            label: {
                text: "Lobby Name",
                properties: {
                    'color': 'white',
                    'margin-top': '8px',
                    'margin-bottom': '0px',
                    'font-size': '14px',
                    'margin-left': '5%'
                }
            },
            properties: {
                color: 'white',
                'background-color': '#212121',
                'width': '80%',
                'height': 'auto',
                'position': 'relative',
                'padding-left': '5%',
                'padding-right': '5%',
                'left': '5%'
            }
        },
        "input-2": {
            label: {
                text: "Password (optional)",
                properties: {
                    'color': 'white',
                    'margin-top': '8px',
                    'margin-bottom': '0px',
                    'font-size': '14px',
                    'margin-left': '5%'
                }
            },
            properties: {
                color: 'white',
                'background-color': '#212121',
                'padding-left': '5%',
                'width': '80%',
                'height': 'auto',
                'position': 'relative',
                'padding-left': '5%',
                'padding-right': '5%',
                'left': '5%'
            }
        },
        "numberInput-3": {
            label: {
                text: "Player Limit",
                properties: {
                    'color': 'white',
                    'margin-top': '8px',
                    'margin-bottom': '0px',
                    'font-size': '14px',
                    'margin-left': '5%'
                }
            },
            properties: {
                color: 'white',
                'background-color': '#212121',
                'padding-left': '5%',
                'width': '80%',
                'height': 'auto',
                'position': 'relative',
                'padding-left': '5%',
                'padding-right': '5%',
                'margin-bottom': '8px',
                'left': '5%'
            }
        },
        "button-4": {
            text: "Create Lobby",
            properties: {
                color: 'white',
                'background-color': 'rgba(0,60,0,.5)',
                // 'padding-left': '5%',
                'width': '90%',
                'height': 'auto',
                'position': 'relative',
                // 'padding-left': '10%',
                // 'padding-right': '10%',
                'left': '5%'
            },
            click: function() {
                var s = this.id.substr(0, this.id.length - 1);
                console.log(s);
                console.log($('#' + s + "1").val());
                console.log($('#' + s + "2").val());
                console.log($('#' + s + "3").val());
                var json = {
                    name: $('#' + s + "1").val(),
                    password: $('#' + s + "2").val(),
                    limit: $('#' + s + "3").val()
                }
                socket.emit('createNewLobby', json);
            }
        }
    }
    console.log(popupData);
    new Popup(popupData);
}

function updateLobby(l) {
    var le = $('#' + l.id + "-count");
    var counterText = (l.playerLimit >= 999) ? (l.playerCount + " players") : (l.playerCount + "/" + l.playerLimit + " players");

    le.html(counterText);
}

function addLobby(l) {
    var lCont = $('#lobbySelectionContainer');
    lCont.append('<div id="lobby-' + l.id + '" class="lobbyContainer"></div>')
    var le = $('#lobby-' + l.id);
    if (l.passworded) le.css('background-color', 'rgba(66,66,77,1)');
    le.append('<div class="lobbyTitle">' + l.name + '</div>');
    le.append('<div class="lobbyJoin" id="' + l.id + '-join">Join!</div>');
    var counterText = (l.playerLimit >= 999) ? (l.playerCount + " players") : (l.playerCount + "/" + l.playerLimit + " players");
    console.log(l.playerLimit);
    le.append('<div class="lobbySize" id="' + l.id + '-count">' + counterText + '</div>');
    var join = $("#" + l.id + '-join');
    join.off('click').on('click', function() {
        var json = {
            p: me.id,
            l: l.id,
            leaving: me.currentLobby.id
        };
        // console.log('attempting to join ' + l.name);
        socket.emit('joinLobbyAttempt', json);
    });
}


function removeLobby(l) {
    var e = $('#lobby-' + l.id);
    // console.log('removing lobby ' + l.name);
    var animTime = 1
    e.css('animation-name', 'fadeOut');
    e.css('animation-iteration-count', '1');
    e.css('animation-duration', animTime + 's');
    e.css('animation-timing-function', 'ease-out');
    e.css('animation-fill-mode', 'forwards');
    setTimeout(function() {
        e.remove();
    }, animTime * 1000);
}

function removeLobbyList() {
    $('#lobbySelectionContainer').remove();
    $('#createLobbyButton').remove();
}

function mousePressed() {
    startDrawing();
}

function mouseDragged() {
    continueDrawing();
    return false;
}

function mouseReleased() {
    endDrawing();
    // return false;
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


// function askUndo(){
// socket.emit('askUndo')
// }

function undoDrawing() {
    // console.log(currentDrawing.drawing.length);
    for (var i = currentDrawing.drawing.length - 1; i >= 0; i--) {
        // console.log('looking for beginning at latest ' + i);
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
    if (joinedLobby && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
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
            // id: me.id,
            lobby: me.currentLobby.id
        }
        currentDrawing.addPoint(json);
        // console.log('i am drawnig is all the drawing data');

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
    // console.log(playerID + ' matches ' + me.id + "?");
    if (playerID === me.id) return me;
    for (var i = 0; i < players.length; i++) {
        if (playerID === players[i].id) {
            return players[i];
        }
    }
}


function continueDrawing() {
    // print('mouse dragged! ' + mouseX + " - " + mouseY)
    var col = color(document.getElementById('colorSelector').value);
    if (joinedLobby && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
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
            // id: me.id,
            lobby: me.currentLobby.id
        }
        // console.log('i am drawnig is all the drawing data');
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
    if (joinedLobby && me.isDrawing && mouseX > 0 && mouseX < width && mouseY > 0) {
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
            // id: me.id,
            lobby: me.currentLobby.id
        }
        currentDrawing.addPoint(json);
        socket.emit('addToDrawing', json);
        // console.log('added ellipse at ' + mouseX + ", " + mouseY);

    }
    // return false;
}



function sendChat() {

    if (joinedLobby) {
        var chatBox = select('#chatInput');

        var json = {
            msg: chatBox.value(),
            id: me.id,
            lobby: me.currentLobby.id
        }
        socket.emit('chatMsg', json);
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
        addPlayerCard(e);
    });
}

function removePlayerCard(p) {
    $('#' + p.id).attr("id", p.id + '-removing');
    var e = $('#' + p.id + '-removing');
    var animTime = 1
    // .remove()
    e.css('animation-name', 'fadeOut');
    e.css('animation-iteration-count', '1');
    e.css('animation-duration', animTime + 's');
    e.css('animation-timing-function', 'ease-out');
    e.css('animation-fill-mode', 'forwards');
    setTimeout(function() {
        e.remove()
    }, animTime * 1000)




}

function updatePlayerCard(pl) {
    var p = pl;
    var card = $('#' + p.id);
    // var sc = $('#' + p.id + '-score');
    // var name = $('#' + p.id + '-name');
    if (p.isDrawing) {
        card.css('background-color', 'rgba(0,0,96,.3)');
    } else if (p.correctlyGuessed) {
        card.css('background-color', 'rgba(0,96,0,.3)');
    } else if (p.id == me.id) {
        card.css('background-color', 'rgba(0,0,0,0.2)');
    } else {
        card.css('background-color', 'rgba(0,0,0,0)');
    }
    $('#' + p.id + '-score').html(p.score);

}

function addPlayerCard(pl) {
    // var player = a;
    var list = $('#playerList');
    list.append('<div id="' + pl.id + '" class="playerContainer"></div>');
    var c = $('#' + pl.id);
    // console.log(c);
    // var p = $('#'+pl.id+'-name');

    if (!me.currentLobby.isMainLobby) {
        c.append('<div id="' + pl.id + '-name" class="playerEntry">' + pl.name + '</div>');
        c.append('<div id="' + pl.id + '-score" class="playerScore">' + pl.score + '</div>');
    } else c.append('<div id="' + pl.id + '-name" class="playerEntry" style="width: 100%">' + pl.name + '</div>');

    if (pl.id === me.id) {
        c.css('background-color', 'rgba(0,0,0,0.2)');
        if (!me.currentLobby.isMainLobby) c.css('cursor', 'pointer');
        else {
            c.css('cursor', 'default')
        }
        c.hover(function() {
            if (!me.currentLobby.isMainLobby) $(this).css('background-color', 'rgba(255,0,0,.1)');
        }, function() {
            if (!me.currentLobby.isMainLobby) $(this).css('background-color', 'rgba(0,0,0,.2)');
        });
        c.off('click').on('click', leaveLobby);

    } else c.css('background-color', 'rgba(0,0,0,0)');

    if (pl.isDrawing){
      c.css('background-color', 'rgba(0,0,96,.3)');
    } else if (pl.correctGuessed) c.css('background-color', 'rgba(0,96,0,.3)');


    // sc.style('background-color', 'rgba(0,0,0,0)');
}

function clearScores() {
    players.forEach(function(e) {
        e.score = 0;
    });
    me.score = 0;
}


function leaveLobby() {
    // console.log('called')
    if (!me.currentLobby.isMainLobby) {
        var json = {
            p: me.id,
            l: 0,
            leaving: me.currentLobby.id
        };
        socket.emit('joinLobbyAttempt', json);
    }
}

function askForName() {
    nameInput = createInput('');
    nameInput.value('Type your name here, then press enter.');
    nameInput.id('nameInput');
    nameInput.mousePressed(function() {
        nameInput.value('');
    });

    nameInput.changed(function() {
        var player = new Player(nameInput.value(), socket.id);
        socket.emit('joinServerAttempt', player);
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

function updateAllPlayerCards(){
  players.forEach(function(e){
    updatePlayerCard(e);
  })
}

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
