var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var games_dict = {};

app.get('/', function(req, res){
  	res.sendfile('index.html');
});

io.on('connection', function(socket){

 	socket.on('join-game', function(user_id, name, game_id){
 		console.log(user_id + ' ' + name + ' joined '+ game_id);

 		if (!(game_id in games_dict)) {
 			games_dict[game_id]= {'players': {}, 'state': {}};
 		}
 		socket.join(game_id);
 		games_dict[game_id].players[user_id] = {'name': name};
 		emitUpdateGame(game_id, games_dict[game_id]);

 		console.log('this '+ game_id + 'has these players: '+ games_dict[game_id].players.keys());
 	});

 	socket.on('update-game', function(user_id, game_id, game_state){
 		//TODO SHA knowing last update
 		console.log(user_id + ' updated the game ' + game_state);
 		games_dict[game_id].state = game_state;
 		emitUpdateGame(game_id, games_dict[game_id]);
 	});

 	function emitUpdateGame (game_id, game_info){
 		io.to(game_id).emit(game_info);
 	};
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});