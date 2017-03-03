import os, sys, json

from flask import *
from flask_socketio import *
from werkzeug.utils import *
from array import *
from flaskext.markdown import Markdown

LOCATION = '/home/dylan/Desktop/MapGame/MapGame/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
SERVERS = LOCATION + 'static/Servers/'
VERSION = 'dev'
HOST = '127.0.0.1'
PORT = 3000

app = Flask(__name__)



Markdown(app)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html', ver=VERSION)

@app.route('/status')
@app.route('/status/')
def status():
    return redirect('https://github.com/PiggahBroStudios/MapGame/projects/1')

@app.route('/create', methods=['GET', 'POST'])
def create():
    
    if request.method == 'POST':
        id = request.form['id']
        host = request.form['username']
        password = request.form['password']
        mapName = request.form['map']
        players = request.form['players']
        
        newfile = id + ".json"
        os.makedirs(SERVERS+id)
        with open(SERVERS+id+"/"+newfile, "w") as s:
            s.write('{"id": "'+id+'", "host": "'+host+'", "password": "'+password+'", "map": "'+mapName+'", "players": ["'+host+'", ' + players + ']}')
        os.makedirs(SERVERS+id+"/chat/")
        with open(SERVERS+id+"/chat/global.txt", "w") as c:
            c.write('')
        return redirect("/game/"+id)
    else:
        mapListOfficial = []
        officialMaps = os.listdir(LOCATION + "static/maps")

        for file in officialMaps:
            mapListOfficial.append(file)

        return render_template('create2.html', officialMaps=mapListOfficial, ver=VERSION)

@app.route('/chat/<id>/<file>', methods=['GET', 'POST'])
@app.route('/chat/<id>/<file>/', methods=['GET', 'POST'])
def chat(id, file):
    
    if file != '':
        log = open(SERVERS+id+"/chat/"+file+".txt", "r").read()
        return render_template('chat.html', chat=log, ver=VERSION)
        
    return render_template('chat.html', log="We cant find that log!", ver=VERSION)

@app.route('/join')
@app.route('/join/')
def join():
    return render_template('join.html', ver=VERSION)

@app.route('/credits')
@app.route('/credits/')
def credits():
    return render_template('credits.html', ver=VERSION)

@app.route('/how-to-play')
@app.route('/how-to-play/')
def htp():
    return render_template('htp.html', ver=VERSION)

@app.route('/game/<id>', methods=["POST", "GET"])
@app.route('/game/<id>/', methods=["POST", "GET"])
def serveGameUpdate(id):
    if request.method == "GET":
        data = ""

        if id and os.path.exists(SERVERS+id):
            if 'name' in session:
                with open(SERVERS+id+"/"+id+".json", "r") as f:
                    data = json.dumps(json.load(f))
                return render_template('game.html', data=data, id=id, ver=VERSION)
            else:
                return render_template('login.html', id=id, ver=VERSION)
        else:
            return 'Could not find game id #' + id
    else:
        data = ""
        if id and os.path.exists(SERVERS+id):
            if "name" in session:
                print('Getting Data')
                map = request.form['map']
                FileStorage(stream=map).save(SERVER+id, id+'.png')
                with open(SERVERS+id+"/"+id+".json", "r") as f:
                    data = json.dumps(json.load(f))
                return render_template('game.html', data=data, id=session['id'], ver=VERSION)
            else:
                session['logged_in'] = False
                with open(SERVERS+id+"/"+id+".json", "r") as f:
                    data = json.load(f)
                for user in data['players']:
                    if user == request.form["username"]:
                        session['name'] = request.form["username"]
                        if request.form["password"] == data['password']:
                            session['logged_in'] = True
                            session["id"] = data['id']
                            session["host"] = data['host']
                            with open(SERVERS+id+"/"+id+".json", "r") as f:
                                data = json.dumps(json.load(f))
                            return render_template('game.html', data=data, id=session["id"], ver=VERSION)
                return render_template('login.html', id=id, ver=VERSION)
        else:
            return 'Could not find game id #' + id

@app.route('/game/new')
@app.route('/game/new/')
def newServer():
    id = request.args.get('id')
    host = request.args.get('host')
    password = request.args.get('password')
    mapName = request.args.get('mapname')
    players = request.args.get('players')
    
    newfile = ""+id+".json"
    os.makedir(SERVERS+id)
    os.makedir(SERVERS+id+"/chat")
    with open(SERVERS+id+"/chat/global.txt", "w+") as c:
        c.write("<tr><td id='name'>System</td><td id='msg'>Welcome to game #"+id+"'s game!</td></tr>")
        c.close()
    with open(SERVERS+id+"/"+newfile, "w") as s:
        s.write('{"id": "'+id+'", "host": "'+host+'", "password": "'+password+'", "map": {"type": "Official", "name": "'+mapName+'" }, "players": ["'+host+'", ' + players + ']}')
        s.close()
    return redirect("/game/"+id)
    
@app.route('/git-payload', methods=["POST"])
def fromGithub():
    data = request.json
    with open(LOCATION+"github/info.txt", "w") as c:
        c.write(data)
        c.close()
    return 'Received'

@socketio.on('joined', namespace='/chat')
def joined():
    if 'name' in session:
        room = session.get('room')
        join_room(room)
        emit('status', {'msg': "<tr><td style='width:25%'>*System*</td><td style='width:75%'>***"+session['name']+"*** has joined the chat log</td></tr>\n"}, room=room, broadcast=True)

@socketio.on('message', namespace='/chat')
def text(cjson):
    if 'name' in session:
        message = json.loads(cjson)
        room = session.get('room')
        if message['msg'] == '/logout':
            emit('status', {'msg': "<tr><td style='width:25%'>*System*</td><td style='width:75%'>"+session['name']+" has left the chat log</td></tr>\n"}, room=room, broadcast=True)
            leave_room(room)
        else:
            msgs = open(LOCATION + 'templates/chat/chat.txt', 'r')
            content = msgs.read()
            msgs.close()
            msgs = open(LOCATION + 'templates/chat/chat.txt', 'w')
            msgs.write("<tr><td style='width:25%'>"+session['name']+"</td><td style='width:75%'>"+message['msg']+"</td></tr>\n" + content)
            msgs.close()
            emit('message', {'msg': "<tr><td style='width:25%'>"+session['name']+"</td><td style='width:75%'>"+message['msg']+"</td></tr>\n"}, room=room, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, debug=True, host=HOST, port=PORT)
