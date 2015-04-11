'use strict';

var GameModel = function(currScore, playerInstructions, timeToDest) {
  this.currScore = currScore;
  this.playerInstructions = playerInstructions;
  this.timeToDest = timeToDest;
};

var PlayerInstruction = function (type, expireTime, startTime, started, goalState) {
  this.type = type;
  this.expireTime = expireTime;
  this.tartTime = startTime;
  this.started = started;
  this.goalState = goalState;
}

module.exports = {
  GameModel: GameModel,
  PlayerInstruction: PlayerInstruction
};