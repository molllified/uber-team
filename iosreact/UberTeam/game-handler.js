var GameModel = require('game-model').GameModel;
var PlayerInstruction = require('game-model').PlayerInstruction;

var GameHandler = function(userId, uiHandler) {
  this.gameState = new GameModel();
  this.eventLoop = this.startEventLoop(15);
  this.userId = userId;
  this.actionTime = 10000;
  this.uiHandler = uiHandler;
}

// GameHandler.prototype.startEventLoop = function(interval) {
//   return setInterval(this.update, interval);
// }

// GameHandler.prototype.update = function() {
//   var currTime = new Date().getTime();
//   var myInstructions = this.getMyInstructions();
//   for (instruction in myInstructions) {
//     if (instruction.startTime >= currTime) {
//       instruction.started = true;

//       this.handleStateChange();
//     }
//     if (instruction.expireTime >= currTime) {
//       this.punish();
//       this.generateNewInstruction();
//       this.handleStateChange();
//     }
//   }
// }

// // For when server tells me to update my state
// GameHandler.prototype.handleStateUpdate = function(newState) {
//   this.gameState = newState;
//   this.dispatchUIChanges(); //and transitions
// }

// // For when my own actions caused my state to change
// GameHandler.prototype.handleStateChange = function() {
//   this.dispatchUIChanges(); //and transitions
// }

// GameHandler.prototype.getMyInstructions = function() {
//   return this.gameState.playerInstructions[this.userId];
// }

// GameHandler.prototype.punish = function() {
//   this.gameState.score -= 1;
// }

// GameHandler.prototype.generateNewInstruction = function() {
//   var newType = (int)(Math.random() * InstructionType.keys(obj).length);
//   var numStates;
//   var expireTime;

//   switch(newType) {
//     case InstructionType.Steer:
//     case InstructionType.Gas: 
//     case InstructionType.Brake:
//       numStates = 2;
//       expireTime = new Date().getTime() + actionTime;
//       startTime = 0;
//       break;
//     case InstructionType.Shift:
//       numStates = 6;
//       expireTime = new Date().getTime() + actionTime;
//       startTime = 0;
//       break;
//   }

//   var goalState = (int)(Math.random() * numStates);
//   var started = startTime === 0 ? true : false;

//   var instruction = new PlayerInstruction(newType, expireTime, startTime, started, goalState);
//   this.gameState.playerInstructions[this.userId] = instruction;
// }

module.exports = GameHandler;

InstructionType = {
  Steer: 0,
  Gas: 1,
  Brake: 2,
  Shift: 3
};