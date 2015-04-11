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
} = React;

var InstructionType = {
  Steer: 0,
  Gas: 1,
  Brake: 2,
  Shift: 3
};

var GameModel = function(currScore, playerInstructions, timeToDest) {
  this.currScore = currScore;
  this.playerInstructions = playerInstructions;
  this.timeToDest = timeToDest;
}

var PlayerInstruction = function (type, expireTime, startTime, started, goalState) {
  this.type = type;
  this.expireTime = expireTime;
  this.startTime = startTime;
  this.started = started;
  this.goalState = goalState;
}

function GameHandler(userId, uiHandler) {
  this.gameState = new GameModel();
  this.eventLoop = this.startEventLoop(15);
  this.userId = userId;
  this.actionTime = 10000;
  this.uiHandler = uiHandler;
}

GameHandler.prototype.startEventLoop = function(interval) {
  return setInterval(this.update, interval);
}

GameHandler.prototype.update = function() {
  var currTime = new Date().getTime();
  console.log(this);
  var myInstructions = this.getMyInstructions();
  for (instruction in myInstructions) {
    if (instruction.startTime >= currTime) {
      instruction.started = true;

      this.handleStateChange();
    }
    if (instruction.expireTime >= currTime) {
      this.punish();
      this.generateNewInstruction();
      this.handleStateChange();
    }
  }
}

// For when server tells me to update my state
GameHandler.prototype.handleStateUpdate = function(newState) {
  this.gameState = newState;
  this.dispatchUIChanges(); //and transitions
}

// For when my own actions caused my state to change
GameHandler.prototype.handleStateChange = function() {
  this.dispatchUIChanges(); //and transitions
}

GameHandler.prototype.getMyInstructions = function() {
  return null;
  // console.log(this.gameState.playerInstructions);
  // return this.gameState.playerInstructions[this.userId];
}

GameHandler.prototype.punish = function() {
  this.gameState.score -= 1;
}

GameHandler.prototype.generateNewInstruction = function() {
  var newType = (int)(Math.random() * InstructionType.keys(obj).length);
  var numStates;
  var expireTime;

  switch(newType) {
    case InstructionType.Steer:
    case InstructionType.Gas: 
    case InstructionType.Brake:
      numStates = 2;
      expireTime = new Date().getTime() + actionTime;
      startTime = 0;
      break;
    case InstructionType.Shift:
      numStates = 6;
      expireTime = new Date().getTime() + actionTime;
      startTime = 0;
      break;
  }

  var goalState = (int)(Math.random() * numStates);
  var started = startTime === 0 ? true : false;

  var instruction = new PlayerInstruction(newType, expireTime, startTime, started, goalState);
  this.gameState.playerInstructions[this.userId] = instruction;
}

var UberTeam = React.createClass({

  getInitialState: function() {
    return {
      game_id: 1
    }
  },


  componentDidMount: function() {
    // initialize socket
    var id = new Date().getTime();
    // var socket = io();
    // socket.emit('join-game', id);
    var gameLogic = new GameHandler(id, this);
    this.setState({gameLogic: gameLogic});
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+Control+Z for dev
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('UberTeam', () => UberTeam);
