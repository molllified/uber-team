/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var GameHandler = require('game-handler');
console.log(GameHandler);
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

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
