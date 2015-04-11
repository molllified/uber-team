/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image
  SwitchIOS,
  SliderIOS
} = React;

var InstructionType = {
  Steer: 0,
  Gas: 1,
  Brake: 2,
  Shift: 3,
  AC: 4,
  HeadLights: 5
};

var GameModel = function(currScore, userInstructions, timeToDest) {
  this.currScore = currScore;
  this.userInstructions = userInstructions;
  this.timeToDest = timeToDest;
}

var UserInstruction = function (type, expireTime, startTime, started, goalState) {
  this.type = type;
  this.expireTime = expireTime;
  this.startTime = startTime;
  this.started = started;
  this.goalState = goalState;
}

function GameHandler(userId, uiHandler, userInstructions) {
  this.gameState = new GameModel(50, userInstructions, 0);
  this.eventLoop = this.startEventLoop(15);
  this.userId = userId;
  this.actionTime = 1000;
  this.uiHandler = uiHandler;
}

GameHandler.prototype.startEventLoop = function(interval) {
  return setInterval(this.update.bind(this), interval);
}

GameHandler.prototype.update = function() {
  var currTime = new Date().getTime();
  var myInstruction = this.getMyInstruction();

  if (myInstruction.startTime >= currTime) {
    myInstruction.started = true;

    this.handleStateChange();
  }
  if (currTime >= myInstruction.expireTime) {
    this.punish();
    this.generateNewInstruction();
    this.handleStateChange();
  }

  this.dispatchUIChanges();
}

GameHandler.prototype.handleWidgetChange = function(widgetType, state) {
  for (userId in this.gameState.userInstructions) {
    instruction = this.gameState.userInstructions[user];
    if (instruction.type === widgetType && instruction.goalState === state) {
      this.reward();
      this.generateNewInstructionForUser(userId);
      this.handleStateChange();
    }
  }
}

// For when server tells me to update my state
GameHandler.prototype.forceStateUpdate = function(newState) {
  this.gameState = newState;
}

// For when my state changes
GameHandler.prototype.handleStateChange = function() {
  // tell server to broadcast
  // this.uiHandler.broadcastState(this.gameState); // TODO molly implement this
}

GameHandler.prototype.dispatchUIChanges = function() {
  var myInstruction = this.getMyInstruction();
  var currTime = new Date().getTime();
  var timePercent = (myInstruction.expireTime - currTime) / (myInstruction.expireTime - myInstruction.startTime);
  this.uiHandler.update({
    score: this.gameState.currScore,
    instruction: this.getInstructionLabel(myInstruction.type, myInstruction.goalState),
    timePercent: timePercent
  });
}

GameHandler.prototype.getMyInstruction = function() {
  return this.gameState.userInstructions[this.userId];
}

GameHandler.prototype.punish = function() {
  this.gameState.currScore -= 1;
}

GameHandler.prototype.reward = function() {
  this.gameState.currScore += 1;
}

GameHandler.prototype.generateNewInstructionForUser = function(userId) {
  var newType = parseInt(Math.random() * Object.keys(InstructionType).length);
  var numStates;
  var expireTime;
  var startTime = new Date().getTime();

  switch(newType) {
    case InstructionType.Steer:
    case InstructionType.Gas: 
    case InstructionType.Brake:
    case InstructionType.AC:
    case InstructionType.HeadLights:
      numStates = 2;
      expireTime = new Date().getTime() + this.actionTime;
      break;
    case InstructionType.Shift:
      numStates = 6;
      expireTime = new Date().getTime() + this.actionTime;
      break;
  }

  var goalState = parseInt(Math.random() * numStates);
  var started = true

  var instruction = new UserInstruction(newType, expireTime, startTime, started, goalState);

  this.gameState.userInstructions[userId] = instruction;
}

GameHandler.prototype.generateNewInstruction = function() {
  this.generateNewInstructionForUser(this.userId);
}

GameHandler.prototype.getInstructionLabel = function(instructionType, goalState) {
  switch(instructionType) {
    case InstructionType.Steer:
      return 'Turn steering wheel ' + (goalState === 0 ? 'left' : 'right');
    case InstructionType.Gas: 
      return 'Press gas';
    case InstructionType.Brake:
      return 'Press brake';
    case InstructionType.Shift:
      return 'Shift to gear ' + (goalState + 1);
    case InstructionType.AC:
      return 'Turn ' + (goalState === 0 ? 'off' : 'on') + ' the AC';
    case InstructionType.HeadLights:
      return 'Turn ' + (goalState === 0 ? 'off' : 'on') + ' the headlights';
  }
}

// TODO build a lobby screen (waiting to join a game)
// This lobby screen will give players an option to join a game
// Once a game has been joined, you can press start
// If every other player also presses start, the server will call one of the players to build the gamestate
// Then the server will broadcast initial state to everyone
// Then an UberTeam obj can be created.

var UberTeam = React.createClass({
  getInitialState: function() {
    return {
      game_id: 1,
      score: 50,
      instructionText: '',
      timePercent: 0
    }
  },

  componentDidMount: function() {
    // initialize socket
    var id = new Date().getTime();
    // var socket = io();
    // socket.emit('join-game', id);
    var userInstructions = {};
    userInstructions[id] = new UserInstruction(InstructionType.Steer, new Date().getTime() + 1000, new Date().getTime(), true, 1);
    var gameHandler = new GameHandler(id, this, userInstructions);
    this.setState({gameLogic: gameHandler});
  },

  update: function(data) {
    this.setState({
      score: data.score,
      instructionText: data.instruction,
      timePercent: data.timePercent
    });
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Image style={styles.pic} source={require('image!bug2')} />
        <Text style={styles.welcome}>
          {this.state.instructionText}
        </Text>
        <Text>
          Score: {this.state.score}
        </Text>
        <Text>
          Time: {this.state.timePercent}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  },
  horizontal: {
    height: 100,
  },
  pic: {
    // backgroundColor: '#000000',
    // alignSelf: 'auto',
    width: 100,
    height: 100
  },
  instructions: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 5,
  },
  banner: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
});

AppRegistry.registerComponent('UberTeam', () => UberTeam);
