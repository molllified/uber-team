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
  Image,
  SwitchIOS,
  SliderIOS,
  TouchableHighlight,
  NavigatorIOS
} = React;

var InstructionType = {
  Steer: 0,
  Gas: 1,
  Brake: 2,
  Shift: 3,
  AC: 4,
  HeadLights: 5
};

var Colors = {
  lightBlue: '#1AD6FD'
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
  this.actionTime = 10;
  this.uiHandler = uiHandler;
}

GameHandler.prototype.stopLoop = function() {
  clearInterval(this.eventLoop);
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
  console.log(widgetType + ' '+ state);
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
  console.log(myInstruction.expireTime + ' '+ currTime);
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

var sessionMessage = '';

// TODO build a lobby screen (waiting to join a game)
// This lobby screen will give players an option to join a game
// Once a game has been joined, you can press start
// If every other player also presses start, the server will call one of the players to build the gamestate
// Then the server will broadcast initial state to everyone
// Then an UberTeam obj can be created.

var UberTeam = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Game',
          component: StartScreen
        }} />
    );
  }
});

var StartScreen = React.createClass({
  startGame: function() {
    sessionMessage = '';
    this.props.navigator.push({
      title: 'Game',
      component: MainScreen
    });
  },
  render: function() {
    console.log(sessionMessage);
    return (
      <View>
        <Text>
          {sessionMessage}
        </Text>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableHighlight onPress={this.startGame} style={{height: 30, backgroundColor: Colors.li, width:30, marginTop: 200, flexDirection: 'row', alignItems:'stretch'}}>
            <Text>Start Game</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
});

var MainScreen = React.createClass({
  getInitialState: function() {
    return {
      game_id: 1,
      score: 50,
      instructionText: '',
      timePercent: 0, 
      Steer: false, 
      Gas: false, 
      Brake: false, 
      Shift: false, 
      AC: false, 
      Headlights: false
      timePercent: 0,
      gameLogic: null
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
    console.log('test');
    this.setState({
      score: data.score,
      instructionText: data.instruction,
      timePercent: data.timePercent
    });
    if(this.state.score <= 0) {
      sessionMessage = 'You lose!';
      this.state.gameLogic.stopLoop();
      this.props.navigator.pop();
    }
    if(this.state.score >= 100) {
      sessionMessage = 'You win!';
      this.props.navigator.pop();
    }
  },

  _handleHeadLightsChange (value) {
    this.state.Headlights = value;
    if (!this.state.gameLogic || !value) {
      // this.state.gameLogic.handleWidgetChange(InstructionType.Headlights, value);
    }
  },

  _handleACChange (value) {
    this.state.AC = value;
    if (!this.state.gameLogic || !value) {
      // this.state.gameLogic.handleWidgetChange(InstructionType.Headlights, value);
    }
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Image style={styles.pic} source={require('image!bug2')}>
          <View style={{height: 50, width: 10}}></View>
          <View style={{height: 50, width: 10, backgroundColor: 'blue'}}></View>
        </Image>
        <View style={{height: 50, translateX: 50, width: 10, backgroundColor: 'red'}}></View>

        <Text>
          Score: {this.state.score}
        </Text>
        <Text>
          Time: {this.state.timePercent}
        </Text>
        <Text style={styles.banner}>{this.state.instructionText}</Text>
        <View style={{height: 3, flexDirection: 'row', alignItems:'stretch'}}>
          <View style={{height: 3, flex: this.state.timePercent, backgroundColor: Colors.lightBlue}}></View>
          <View style={{height: 1, flex: 1 - this.state.timePercent}}></View>
        </View>
        <View style={styles.instructions}>
          <View style = {styles.instructions_column}>
            <Text>Headlights</Text>
            <SwitchIOS onValueChange = {this._handleHeadLightsChange} ref='HeadLights' value={this.state.Headlights} />
          </View>
          <View style = {styles.instructions_column}>
            <Text>A/C</Text>
            <SwitchIOS onValueChange = {this._handleACChange} ref='AC' value={this.state.AC} />
          </View>
          <View style = {styles.instructions_column}>
            <Text>Temperature</Text>
            <SliderIOS />
          </View>
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  horizontal: {
    height: 100,
  },
  pic: {
    height: 100,
    flexDirection: 'row',
    alignItems:'stretch'
  },
  instructions: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 5,
    justifyContent: 'center'
  },
  instructions_column: {
    marginLeft: 10,
  },
  banner: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  road: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.8)'
  }
});

AppRegistry.registerComponent('UberTeam', () => UberTeam);
