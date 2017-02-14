var game = {
    version: '1',
    player: {
        name: ""
    },
    logedin: false,
    init: function() {
        if (PBS.cookie.check('password') && PBS.cookie.check('username')) {
            this.un = PBS.cookie.get('username');
            this.pw = PBS.cookie.get('password');
            this.unReal = false;
            this.pwReal = false;
            for (i=0; i<data.players.length; i++) {
                if ( this.un === data.players[i]) {
                    this.unReal = true;
                }
            }
            if ( this.pw === data.password) {
                this.pwReal = true;
            }
            if (this.unReal === true && this.pwReal === true) {
                game.logedin = true;
            }
        }
        if (game.logedin == true) {
            game.player.name = PBS.cookie.get('username');
            document.getElementsByTagName("login")["0"].style.display = "none";
            document.getElementsByTagName("nav")["0"].style.display = "block";
            document.getElementsByTagName("side")["0"].style.display = "block";
            document.getElementById("usernameNav").innerHTML = game.player.name + "!";
            document.getElementById("hostName").innerHTML = data.host;
            document.getElementById("gameId").innerHTML = data.id;
            document.getElementById("map").style.display = "block";
            document.getElementById("map").style.backgroundImage = "url(/static/maps/"+ data.map.type + "/" + data.map.name;
            document.getElementById("numPlayers").innerHTML = data.players.length;
            if (game.player.name === data.host) {
                game.load.hostTools();
            }
        }
        setInterval(function () {
            this.log = document.getElementsByTagName('iframe')[0];
            this.log.setAttribute('src', '/chat?id='+data.id+'&file='+game.chat.current+'&msg=');
        }, 10000);
    },
    load: {
        hostTools: function() {
            // Create Tools
            this.tool = document.createElement("tools");
            this.tool.style = 'cursor:pointer;';
            this.tool.innerHTML = "<span style='font-size:32px;margin:4px;display:inline-block;'><i class='icon ion-navicon'></i></span>";
            document.body.appendChild(this.tool);
            
            this.toolSel = document.createElement("tools");
            this.toolSel.style = "bottom: 3.75em; border-radius: 5px; display: none;";
            this.toolSel.id = 'toolset';
            
            this.colors = game.host.tool.colors;
            
            this.newHTML = "<span style='font-size:24px;display:inline-block;'><i class='fa fa-floppy-o' style='padding:10px 8px;cursor:pointer;' onclick= 'game.host.tool.toggle(";
            this.newHTML += '"save"';
            this.newHTML += ")' ></i></span><span style='font-size:24px;display:inline-block;'><i class='fa fa-font' style='padding:10px 8px;cursor:pointer;' onclick = 'game.host.tool.toggle(";
            this.newHTML += '"text"';
            this.newHTML += ")' ></i><div id='toolset_textbox' style='height: 40px; background-color: #FFF; border: 1px solid #000; border-radius: 5px; display: none; margin-left:5px; position: absolute;'><input type='text' placeholder='Type Here' style='border-radius: 5px;' id='canvas_textbox'></div></span><span style='font-size:24px; display: inline-block;'><i class='fa fa-pencil' style='padding:10px 8px;cursor:pointer;' onclick = 'game.host.tool.toggle(";
            this.newHTML += '"color"';
            this.newHTML += ")' ></i><div id='toolset_color' style='height: 40px; background-color: #FFF; border: 1px solid #000; border-radius: 5px; display: none; margin-left:5px; position: absolute;'>";
            
            // Making All Color Elements
                
            for (i=0; i<this.colors.length; i++) {
                this.newColor = "<span style='font-size:32px;";
                
                if ( i == 0 ) {
                    this.newColor += "margin: 4px 4px 4px 8px;";
                } else if (i == (this.colors.length - 1)) {
                    this.newColor += "margin: 4px 8px 4px 4px;";
                } else { 
                    this.newColor += "margin: 4px;";
                }
                
                this.newColor += "display:inline-block; color: #" + this.colors[i].color + "'><i onclick='game.host.tool.color.change(";
                this.newColor += '"' + this.colors[i].color + '"';
                this.newColor += ")' style='cursor:pointer;' id='color_" + this.colors[i].color + "' class='icon " + this.colors[i].type;
                
                if ( i === 0) {
                    this.newColor += "'></i></span>";
                } else {
                    this.newColor += "-blank'></i></span>";
                }
                
                this.newHTML += this.newColor;
            }
            
            this.newHTML += '</div></span>';
            this.toolSel.innerHTML = this.newHTML;
            
            document.body.appendChild(this.toolSel);
            this.tool.addEventListener('click', game.host.tools.toogle);
            
            game.map.canvas.addEventListener('click', function(e){
                e.preventDefault();
                if (game.host.tool.selected == 'text') {
                    this.rect = game.map.canvas.getBoundingClientRect();
                    this.msg = document.getElementById('canvas_textbox').value;
                    this.pos = {
                        x: event.clientX - this.rect.left,
                        y: event.clientY - this.rect.top
                    };
                    game.map.context.font = "12px Arial";
                    game.map.context.fillText(this.msg,this.pos.x,this.pos.y);
                }
            });
            game.map.canvas.addEventListener('mousedown', function(e){
                if (game.host.tool.selected == 'color') {
                	this.pos = game.host.tool.getPos(e);
                    game.host.tool.savedPos = {x: this.pos.x, y: this.pos.y}
	                game.host.tool.drawDot(this.pos.x,this.pos.y);
	                game.host.tool.mouseDown = true;
                }
            });
            game.map.canvas.addEventListener('mousemove', function(e){
                if (game.host.tool.selected == 'color' && game.host.tool.mouseDown == true) {
                	this.pos = game.host.tool.getPos(e);
	                game.host.tool.drawDot(this.pos.x,this.pos.y);
                }
            });
            game.map.canvas.addEventListener('mouseup', function(e) {
                if (game.host.tool.selected == 'color' && game.host.tool.mouseDown == true) {
                	this.pos = game.host.tool.getPos(e);
	                game.host.tool.mouseDown = false;
                }
            });
        }
    },
    side: {
        position: 'close',
        screen: 'apps',
        screens: ['apps', 'chat', 'stats'],
        toggle: function(tab) {
            this.side = document.getElementsByTagName('side')[0];
            
            this.chatbtn = document.getElementById('chat-btn');
            this.appsbtn = document.getElementById('side-btn');
            this.statsbtn = document.getElementById('stats-btn');
            
            this.chat = document.getElementsByTagName('chat')[0];
            this.apps = document.getElementsByTagName('apps')[0];
            this.stats = document.getElementsByTagName('stats')[0];
            
            switch (tab) {
                case 'apps':
                    if (game.side.position == 'close') {
                        this.side.setAttribute('style', 'right: 0; display: block;');
                        game.side.position = 'open';
                    } else if (game.side.screen == 'apps') {
                        this.side.setAttribute('style', 'right: -300px; display: block;');
                        game.side.position = 'close';
                    }
                    game.side.screen = 'apps';
                    this.apps.setAttribute('style', 'display: block;');
                    this.chat.setAttribute('style', 'display: none;');
                    this.stats.setAttribute('style', 'display: none;');
                    break;
                case 'chat':
                    if (game.side.position == 'close') {
                        this.side.setAttribute('style', 'right: 0; display: block;');
                        game.side.position = 'open';
                    } else if (game.side.screen == 'chat') {
                        this.side.setAttribute('style', 'right: -300px; display: block;');
                        game.side.position = 'close';
                    }
                    game.side.screen = 'chat';
                    this.apps.setAttribute('style', 'display: none;');
                    this.chat.setAttribute('style', 'display: block;');
                    this.stats.setAttribute('style', 'display: none;');
                    break;
                case 'stats':
                    if (game.side.position == 'close') {
                        this.side.setAttribute('style', 'right: 0; display: block;');
                        game.side.position = 'open';
                    } else if (game.side.screen == 'stats') {
                        this.side.setAttribute('style', 'right: -300px; display: block;');
                        game.side.position = 'close';
                    }
                    game.side.screen = 'stats';
                    this.apps.setAttribute('style', 'display: none;');
                    this.chat.setAttribute('style', 'display: none;');
                    this.stats.setAttribute('style', 'display: block;');
                    break;
                case 'logout':
                    PBS.cookie.deleteList(['username','password']);
                    window.location.reload();
                    break;
            }
        }
    },
    toUpdate: [],
    update: function () {
        for (i = 0; i < game.toUpdate.length; i++) {
            game.toUpdate[i]();
        }
        window.requestAnimationFrame(game.update());
    },
    host: {
        tools: {
            position: 'close',
            toogle: function() {
                this.tools = document.getElementById('toolset');
                if (game.host.tools.position == 'close') {
                    this.tools.setAttribute('style', 'display: block; bottom: 3.75em; border-radius: 5px;');
                    game.host.tool.selected = game.host.tool.lastUsed;
                    game.host.tools.position = 'open';
                } else {
                    this.tools.setAttribute('style', 'display: none;');
                    game.host.tools.position = 'close';
                    game.host.tool.lastUsed = game.host.tool.selected;
                    game.host.tool.selected = 'none';
                }
            }
        },
        tool: {
            selected: 'none',
            lastUsed: 'none',
            toggle: function (tool) {
                if (game.host.tool.selected != tool) {
                    document.getElementById('toolset_textbox').style.display = 'none';
                    document.getElementById('toolset_color').style.display = 'none';
                    game.host.tool.lastUsed = game.host.tool.selected;
                    game.host.tool.selected = tool;
                    switch (tool) {
                        case 'text':
                            document.getElementById('toolset_textbox').style.display = 'inline-flex';
                            break;
                        case 'color':
                            document.getElementById('toolset_color').style.display = 'inline-flex';
                            break;
                        case 'save':
                            game.host.tool.save();
                            break;
                    }
                } else {
                    document.getElementById('toolset_textbox').style.display = 'none';
                    document.getElementById('toolset_color').style.display = 'none';
                    game.host.tool.selected = 'none';
                }
            },
            color: {
                current: '000',
                change: function (color) {
                    this.colors = game.host.tool.colors;
                    for (i=0; i < this.colors.length; i++) {
                        if (this.colors[i].color == color) {
                            document.getElementById('color_'+this.colors[i].color).setAttribute('class', ('icon ' + this.colors[i].type));
                        } else {
                            document.getElementById('color_'+this.colors[i].color).setAttribute('class', ('icon ' + this.colors[i].type + '-blank'));
                        }
                    }
                    game.host.tool.color.current = color;
                }
            },
            colors: [{
                    color: '000',
                    type: 'ion-android-checkbox'
                },{
                    color: 'd00',
                    type: 'ion-android-checkbox'
                },{
                    color: '0d0',
                    type: 'ion-android-checkbox'
                },{
                    color: '00d',
                    type: 'ion-android-checkbox'
                },{
                    color: 'dd0',
                    type: 'ion-android-checkbox'
                },{
                    color: 'd60',
                    type: 'ion-android-checkbox'
                },{
                    color: '0dd',
                    type: 'ion-android-checkbox'
                },{
                    color: 'd0d',
                    type: 'ion-android-checkbox'
            }],
            savedPos: {x: 0, y: 0},
            drawDot: function (x,y){
                this.ctx = game.map.context;
                this.ctx.strokeStyle = '#' + game.host.tool.color.current;
	            // Draw filled line
	            this.ctx.beginPath();
                this.ctx.lineCap = "round";
                this.ctx.lineJoin = "round";
                this.ctx.lineWidth = 4;
                this.ctx.moveTo(game.host.tool.savedPos.x,game.host.tool.savedPos.y);
                this.ctx.lineTo(x,y);
	            this.ctx.stroke();
                
                game.host.tool.savedPos = {x: x, y: y};
            },
            getPos: function (e) {
            	this.x;
	            this.y;
	            if (e.pageX || e.pageY) {
		            this.x = e.pageX;
		            this.y = e.pageY;
	            } else {
		            this.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		            this.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	            }
	            this.x -= game.map.canvas.offsetLeft;
	            this.y -= game.map.canvas.offsetTop;
	            this.pos = {};
	            this.pos.x = this.x;
	            this.pos.y = this.y;
	            return this.pos;
            },
            mouseDown: false,
            save: function() {
                let img = game.map.canvas.toDataURL()
                
                let ajax = new XMLHttpRequest();
                ajax.open("POST",window.location.href);
                ajax.setRequestHeader('Content-Type', 'application/octet-stream');
                ajax.send(img);
            }
        }
    },
    map: {
        canvas: document.getElementById('map'),
        context: document.getElementById('map').getContext('2d')
    },
    chat: {
        current: 'global',
        change: function(log) {
            this.chatScreen = document.getElementsByTagName('iframe')[0];
            this.chatScreen.setAttribute('src', '/chat?id='+data.id+'&file='+log+'&msg=');
            this.chat = document.getElementById('chat_main')
            this.chat.setAttribute('style', 'display: none')
            this.chatLog = document.getElementById('chat_log')
            this.chatLog.setAttribute('style', 'display: block')
            game.chat.current = log;
        },
        send: function() {
            this.msg = document.getElementById('chat_msg');
            this.chat = document.getElementsByTagName('iframe')[0];
            this.chat.setAttribute('src', '/chat?id='+data.id+'&file='+game.chat.current+'&msg='+this.msg.value+'&name='+game.player.name);
            this.msg.value = '';
            return false;
        }
    }
}

game.init()

var login = function login() {
    this.unReal = false;
    this.pwReal = false;
    this.un = document.getElementById("username").value;
    this.pw = document.getElementById("password").value;
    for (i=0; i<data.players.length; i++) {
        if ( this.un === data.players[i]) {
            this.unReal = true;
        }
    }
    if ( this.pw === data.password) {
        this.pwReal = true;
    }
    console.log(this.un, this.unReal, this.pw, this.pwReal)
    if (this.unReal === true && this.pwReal === true) {
        PBS.cookie.setList([
            {
                name: 'username',
                value: this.un,
                days: '1'
            },
            {
                name: 'password',
                value: this.pw,
                days: '1'
            }
        ]);
        game.logedin = true;
        game.init();
    }
    return false;
}

// game.update();
