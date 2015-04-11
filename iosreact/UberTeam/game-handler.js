var GameModel = require('game-model').GameModel;

var GameHandler = function (playerId) {
  var gameState = new GameModel();
  var eventLoop = this.startEventLoop(100);
  var playerId = playerId;
}

GameHandler.prototype.startEventLoop = function(interval) {
  return setInterval(this.update, interval);
}

GameHandler.prototype.update = function() {
  var currTime = new Date().getTime();
  var myInstructions = this.getPlayerInstructions();
}

// For when server tells me to update my state
GameHandler.prototype.handleStateUpdate = function(newState) {
  this.gameState = newState;
  this.dispatchUIChanges();
}

// For when my own actions caused my state to change
GameHandler.prototype.handleStateChange = function(newState) {
  // todo
}

GameHandler.prototype.getPlayerInstructions = function() 