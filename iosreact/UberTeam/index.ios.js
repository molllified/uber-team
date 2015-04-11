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
  NavigatorIOS,
  ActivityIndicatorIOS,
  TouchableOpacity
} = React;

var InstructionType = {
  Gas: 0,
  Brake: 1,
  AC: 2,
  Headlights: 3
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
  this.actionTime = 5000;
  this.uiHandler = uiHandler;
  this.widgetStates = {}
  this.widgetStates[InstructionType.Gas] = 0;
  this.widgetStates[InstructionType.Brake] = 0;
  this.widgetStates[InstructionType.AC] = 0;
  this.widgetStates[InstructionType.Headlights] = 0;
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

GameHandler.prototype.handleWidgetChange = function(widgetType, state, widgetStates) {
  this.widgetStates = widgetStates;
  for (var userId in this.gameState.userInstructions) {
    var instruction = this.gameState.userInstructions[userId];
    console.log(widgetType + ' '+ state);
    console.log(instruction.type + ' ' + InstructionType[widgetType]);
    console.log(instruction.goalState);
    if (instruction.type == InstructionType[widgetType] && instruction.goalState == state) {
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
    case InstructionType.Brake:
    case InstructionType.Gas: 
      numStates = 1;
      expireTime = new Date().getTime() + this.actionTime;
      break;
    case InstructionType.Steer:
    case InstructionType.AC:
    case InstructionType.Headlights:
      numStates = 2;
      expireTime = new Date().getTime() + this.actionTime;
      break;
    case InstructionType.Shift:
      numStates = 6;
      expireTime = new Date().getTime() + this.actionTime;
      break;
  }

  var goalState;
  console.log(this.widgetStates);
  if (numStates == 2) {
    goalState = 1 - this.widgetStates[newType];
  }
  else {
    goalState = 0;
  }

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
    case InstructionType.Headlights:
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
        navigationBarHidden={true}
        initialRoute={{
          title: 'Game',
          component: StartScreen
        }} />
    );
  }
});

var StartScreen = React.createClass({
  getInitialState: function() {
    var userId = new Date().getTime();

    return {
      gameReady: true,
      users: [],
      userId: userId
    };
  },
  userJoined: function(data) {
    this.state.users.push(data.name);
  },
  startGame: function() {
    sessionMessage = '';
    this.props.navigator.push({
      title: 'Game',
      component: MainScreen,
      passProps: {id: this.state.userId, navigationBarHidden: true}
    });
  },
  render: function() {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{marginBottom: 100}}>
          {{sessionMessage}}
        </Text>
        <TouchableHighlight onPress={this.startGame} style={{textAlign: 'center', height: 30}}>
          <Text>Start Game</Text>
        </TouchableHighlight>
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
      Headlights: false,
      gameLogic: null
    }
  },

  componentDidMount: function() {
    // initialize socket
    // var socket = io();
    // socket.emit('join-game', id);
    var userInstructions = {};
    userInstructions[this.props.id] = new UserInstruction(InstructionType.AC, new Date().getTime() + 5000, new Date().getTime(), true, 1);
    var gameHandler = new GameHandler(this.props.id, this, userInstructions);
    this.setState({gameLogic: gameHandler});
  },

  update: function(data) {
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
      this.state.gameLogic.stopLoop();
      this.props.navigator.pop();
    }
  },

  _getWidgetStates() {
    var widgetStates = {};
    widgetStates[InstructionType.Gas] = 0;
    widgetStates[InstructionType.Brake] = 0;
    widgetStates[InstructionType.AC] = this.state.AC ? 1 : 0;
    widgetStates[InstructionType.Headlights] = this.state.Headlights ? 1 : 0;

    return widgetStates;
  },

  _handleHeadLightsChange (value) {
    this.state.Headlights = value;
    this.state.gameLogic.handleWidgetChange('Headlights', value, this._getWidgetStates());
  },

  _handleACChange (value) {
    this.state.AC = value;
    this.state.gameLogic.handleWidgetChange('AC', value, this._getWidgetStates());
  },

  _onPressGasButton () {
    this.state.Gas = 0;
    this.state.gameLogic.handleWidgetChange('Gas', 0, this._getWidgetStates());
  },

  _onPressBrakeButton () {
    this.state.Brake = 1;
    this.state.gameLogic.handleWidgetChange('Brake', 0, this._getWidgetStates());
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Image style={styles.pic} source={require('image!newroad')}>
        </Image>
        <Image style={{height: 25, left: 400 * this.state.score/100. - 25, top:-33, width:50}} source={require('image!vehicle')}></Image>
        <Text style={styles.banner}>{this.state.instructionText}</Text>
        <View style={{height: 3, flexDirection: 'row', alignItems:'stretch'}}>
          <View style={{height: 3, flex: this.state.timePercent, backgroundColor: Colors.lightBlue}}></View>
          <View style={{height: 1, flex: 1 - this.state.timePercent}}></View>
        </View>
        <View style={styles.instructions}>
          <View style = {styles.instructions_column}>
            <Text>Headlights</Text>
            <SwitchIOS onValueChange = {this._handleHeadLightsChange} value={this.state.Headlights} />
          </View>
          <View style = {styles.instructions_column}>
            <Text>A/C</Text>
            <SwitchIOS onValueChange = {this._handleACChange} value={this.state.AC} />
          </View>
          <View style = {styles.instructions_column}>
            <Text>Temperature</Text>
            <SliderIOS />
          </View>
        </View>
        <View style= {{flex: 1, flexDirection: 'row', marginTop: 20, justifyContent: 'center'}}>
          <View>
            <TouchableOpacity onPress={this._onPressBrakeButton}>
              <Image style={styles.brakeButton} source={require('image!brake')}>
              </ Image>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={this._onPressGasButton}>
              <Image style={styles.gasButton} source={require('image!gas')}>
              </ Image>
            </TouchableOpacity>
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
  brakeButton: {
    height: 100,
    width: 200,
    // width: 100,
    // flex: 0.01,
    // alignItems:'stretch',

  },
  gasButton: {
    height: 150,
    width: 100,
    // width: 150,
    // flex: 0.01,
    // alignItems:'stretch',

  },
  pic: {
    height: 50,
    width: 400,
    flexDirection: 'row',
    alignItems:'stretch',
    flex: 0.2
  },
  instructions: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 5,
    justifyContent: 'center'
  },
  slider: {
    height: 10,
    margin: 10
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
  },  
  button: {
    backgroundColor: Colors.lightBlue,
    marginRight: 20,
    padding: 20,
  }
});

AppRegistry.registerComponent('UberTeam', () => UberTeam);
