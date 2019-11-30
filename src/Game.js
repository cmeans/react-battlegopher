import React from 'react';
import { Grid, Button } from '@material-ui/core';
import Board from './Board';
import Start from './Start';
import Service from './Service';
import GameContext from './GameContext';

// import './Game.css';

const GameMode = Object.freeze({
  Initialize: 0,
  Active: 1,
  Over: 2
});

class Game extends React.Component {
  state = {
    player1Name: 'Gary',
    player2Name: 'Christine',
    dimension: 11,
    // Values less than zero indicate no active game/session.
    sessionId: -1,
    activePlayerName: '',
    lostNetwork: false,
    gameMode: GameMode.Initialize
  };

  constructor(props) {
    super(props);

    this.service = Service.getInstance();

    this.handlePlayer1NameChange = this.handlePlayer1NameChange.bind(this);
    this.handlePlayer2NameChange = this.handlePlayer2NameChange.bind(this);
    this.handleDimensionChange = this.handleDimensionChange.bind(this);
    this.handleSessionIdChange = this.handleSessionIdChange.bind(this);
    this.handleGameOver = this.handleGameOver.bind(this);

    this.handleRestartClick = this.handleRestartClick.bind(this);
  }

  handlePlayer1NameChange(name) {
    this.setState({ player1Name: name });
  }

  handlePlayer2NameChange(name) {
    this.setState({ player2Name: name });
  }

  handleDimensionChange(value) {
    this.setState({ dimension: value });
  }

  handleSessionIdChange(value) {
    this.setState({ sessionId: value });
    if (value > -1) {
      this.setState({ gameMode: GameMode.Active });
    }
  }

  handleGameOver() {
    this.setState({ gameMode: GameMode.Over });
    process.nextTick(() => {
      alert('Game Over!');
    });
  }

  handleRestartClick() {
    this.setState({
      sessionId: -1,
      gameMode: GameMode.Initialize })
  }

  isGameActive() {
    let isGameActive = (this.state.gameMode === GameMode.Active);

    if (this.intervalHandleId) {
      clearInterval(this.intervalHandleId);
      this.intervalHandleId = null;
    }

    if (isGameActive &&
        !this.state.lostNetwork) {
      this.intervalHandleId = setInterval(() => {
        this.service.turn(
          this.state.sessionId)
          .then(playerId => {
            console.log(`Player Id: ${playerId} turn`);
            this.setState({ activePlayerName: playerId === 0 ? this.state.player1Name : this.state.player2Name })
          })
          .catch(err => {
            console.log(err);
            this.setState({ lostNetwork: true });
          })
      },
      2000);
    }

    return isGameActive;
  }

  render() {
    let content = null;

    this.isGameActive();

    switch (this.state.gameMode) {
      case GameMode.Initialize:
        content =
          <Start>
          </Start>;
        break;
      default:
        content =
          <div>
            <Grid container justify="center">
              <Grid item xs={2}>
                <Button onClick={this.handleRestartClick}>
                  Restart
                </Button>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={4} justify="center">
              <Grid item>
                <Board
                  playerId={0}
                  playerName={this.state.player1Name}
                  dimension={this.state.dimension}
                >
                </Board>
                </Grid>
              <Grid item>
                <Board
                  playerId={1}
                  playerName={this.state.player2Name}
                  dimension={this.state.dimension}
                >
                </Board>
              </Grid>
              <Grid item m={10} xs={12}>
                It's player: {this.state.activePlayerName}'s turn.
              </Grid>
            </Grid>
          </div>;
    }

    return (
      <GameContext.Provider
        value={{
          player1Name: this.state.player1Name,
          player2Name: this.state.player2Name,
          dimension: this.state.dimension,
          sessionId: this.state.sessionId,
          setPlayer1Name: this.handlePlayer1NameChange,
          setPlayer2Name: this.handlePlayer2NameChange,
          setDimension: this.handleDimensionChange,
          setSessionId: this.handleSessionIdChange,
          gameOver: this.handleGameOver
        }}
      >
        { content }
      </GameContext.Provider>
    );
  }
}

export default Game;
