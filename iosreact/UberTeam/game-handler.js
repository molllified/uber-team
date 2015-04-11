var GameModel = require('game-model').GameModel;

var GameHandler = function (userId) {
  var gameState = new GameModel();
  var eventLoop = this.startEventLoop(15);
  var userId = userId;
}

GameHandler.prototype.startEventLoop = function(interval) {
  return setInterval(this.update, interval);
}

GameHandler.prototype.update = function() {
  var currTime = new Date().getTime();
  var myInstructions = this.getuserInstructions();
}

// For when server tells me to update my state
GameHandler.prototype.handleStateUpdate = function(newState) {
  this.gameState = newState;
  this.dispatchUIChanges(); //and transitions
}

// For when my own actions caused my state to change
GameHandler.prototype.handleStateChange = function(newState) {
  // todo
}

GameHandler.prototype.getuserInstructions = function() 