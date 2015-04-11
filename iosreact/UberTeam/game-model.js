'use strict';

var GameModel = function() {
  var currScore= 0;
  var playerInstructions= {};
  var timeToDest= 0;
};

var PlayerInstruction = function () {
  var type= null;
  var expireTime= null;
  var startTime= null;
  var started= false;
  var data= null;
}

module.exports = {
  GameModel: GameModel,
  Player: Player,
  Instruction: Instruction
};