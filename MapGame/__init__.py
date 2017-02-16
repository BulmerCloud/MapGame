import os, sys, json

from flask import Flask, render_template, request, redirect, url_for, jsonify
from werkzeug.utils import *
from array import *

LOCATION = '< folder location >'
UPLOAD_FOLDER = LOCATION + 'static/maps/Uploaded'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
SERVERS = LOCATION + 'static/Servers/'
HOST = '127.0.0.1' # or 'localhost'
PORT = 8000

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status/')
@app.route('/status')
def test():
    return 'We are running good!'

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
            s.write('{"id": "'+id+'", "host": "'+host+'", "password": "'+password+'", "map": {"type": "Official", "name": "'+mapName+'" }, "players": ["'+host+'", ' + players + ']}')
        return redirect("/game/"+id)
    else:
        mapListOfficial = []
        officialMaps = os.listdir(LOCATION + "/static/maps/Official")

        for file in officialMaps:
            mapListOfficial.append(file)

        return render_template('create2.html', officialMaps=mapListOfficial)
        
@app.route('/chat', methods=['GET', 'POST'])
def chat():
    id = request.args.get('id')
    file = request.args.get('file')
    msg = request.args.get('msg')
    name = request.args.get('name')
    
    if file != '':
        if msg != '':
            msgs = open(SERVERS+id+"/chat/"+file+".txt", "r")
            content = msgs.read()
            msgs.close()
            msgs = open(SERVERS+id+"/chat/"+file+".txt", "w")
            msgs.write("<tr><td id='name'>"+name+"</td><td id='msg'>"+msg+"</td></tr>\n" + content)
            msgs.close()
        log = open(SERVERS+id+"/chat/"+file+".txt", "r").read()
        return render_template('chat.html', log=log)
        
    return render_template('chat.html', log="We cant find that log!")

@app.route('/join')
def join():
    return render_template('join.html')

@app.route('/credits')
def credits():
    return render_template('credits.html')

@app.route('/how-to-play')
def htp():
    return render_template('htp.html')

@app.route('/game')
def serveGame():
	id = request.args.get('id')
	data = ""

	if id and os.path.exists(SERVERS+id):
		with open(SERVERS+id+"/"+id+".json", "r") as f:
			data = json.dumps(json.load(f))
		return render_template('game.html', data=data, id=id)
	else:
		return 'Could not find game id #' + id

@app.route('/game/<id>', methods=["POST", "GET"])
def serveGameUpdate(id):
    if request.method == "POST":
        print('receiving post')
        data = request.files['image']
        FileStorage(stream=data).save(SERVER+id, 'test.png')
        return 'ok'
    else:
	    data = ""

	    if id and os.path.exists(SERVERS+id):
		    with open(SERVERS+id+"/"+id+".json", "r") as f:
			    data = json.dumps(json.load(f))
		    return render_template('game.html', data=data, id=id)
	    else:
		    return 'Could not find game id #' + id

@app.route('/game/new')
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

@app.route('/upload', methods=["GET", "POST"])
def upload():
    data = request.json
    print(data['id'], data['image'])
    return 'ok'

@app.route('/Error/<code>')
def errorPage(code):
    text = request.args.get('type')

    return "<html><body><h1>Error Code "+code+"</h1><p>"+text+"</p></body></html>"

if __name__ == "__main__":
    app.run(debug=True, host=HOST, port=PORT)
