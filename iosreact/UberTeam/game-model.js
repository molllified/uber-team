'use strict';

var GameModel = function() {
  var currScore: 0;
  var players: [];
  var timeToDest: 0;
};

var Player = function () {
  var instructions: [];
  var uuid: '';
};

var Instruction = function () {
  var type: null;
  var expireTime: null;
  var startTime: null;
  var started: false;
}

module.exports = {
  GameModel: GameModel,
  Player: Player,
  Instruction: Instruction
};