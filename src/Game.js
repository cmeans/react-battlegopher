import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';
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
    dimension: '11',
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

    this.handleNewGameClick = this.handleNewGameClick.bind(this);
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
    this.setState({
      sessionId: value,
      gameMode: (value === -1) ? GameMode.Initialize : GameMode.Active
     });
  }

  handleGameOver() {
    this.setState({ gameMode: GameMode.Over });
    process.nextTick(() => {
      alert('Game Over!');
    });
  }

  handleNewGameClick() {
    this.handleSessionIdChange(-1);
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
            // console.log(`Player Id: ${playerId} turn`);
            this.setState({ activePlayerName: playerId === 0 ? this.state.player1Name : this.state.player2Name })
          })
          .catch(err => {
            console.log(err);
            this.setState({ lostNetwork: true });
          })
      },
      500);
    }

    return isGameActive;
  }

  render() {
    const { gameMode, player1Name, player2Name, dimension, activePlayerName, sessionId } = this.state;

    let content = null;
    let status = null;

    this.isGameActive();

    if (gameMode === GameMode.Initialize)
      content =
        <Start>
        </Start>;
    else {
      if (gameMode === GameMode.Active) {
        status =
          <h4>
            It's {activePlayerName}'s turn.
          </h4>
      } else {
        status =
          <h1>
            {activePlayerName} is the Winner!
          </h1>
      }

      content =
        <div>
          <Grid container justify="center">
            <Grid container direction="column" alignContent="center">
              <Grid item xs={2}>
                <h5>
                  <div>
                    {player1Name} vs {player2Name}
                  </div>
                  <div>
                    Board size: {dimension} x {dimension}
                  </div>
                </h5>
              </Grid>
              <Grid item xs={2}>
                <Button onClick={this.handleNewGameClick}>
                  Start New Game
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction="row" spacing={4} justify="center">
            <Grid item>
              <Board
                playerId={0}
                playerName={player1Name}
                dimension={dimension}
                activePlayerName={activePlayerName}
              >
              </Board>
            </Grid>
            <Grid item>
              <Board
                playerId={1}
                playerName={player2Name}
                dimension={dimension}
                activePlayerName={activePlayerName}
              >
              </Board>
            </Grid>
            <Grid item m={10} xs={12}>
              { status }
            </Grid>
            {/* <Snackbar
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              message={status} //{<span id="message-id">{ status }</span>}
            /> */}
          </Grid>
        </div>;
    }

    return (
      <Box>
        <Grid container justify="center" alignItems="center">
          <Grid item>
            <img src='/BattleGopher.png' alt='Battle Gopher' height="60px"/>
          </Grid>
          <Grid item>
            <h1>Battle Gopher</h1>
          </Grid>
          <Grid item>
            <img src='/BattleGopher.png' alt='Battle Gopher' height="60px"/>
          </Grid>
        </Grid>
        <GameContext.Provider
          value={{
            player1Name: player1Name,
            player2Name: player2Name,
            dimension: dimension,
            sessionId: sessionId,
            setPlayer1Name: this.handlePlayer1NameChange,
            setPlayer2Name: this.handlePlayer2NameChange,
            setDimension: this.handleDimensionChange,
            setSessionId: this.handleSessionIdChange,
            gameOver: this.handleGameOver
          }}
        >
          { content }
        </GameContext.Provider>
      </Box>
    );
  }
}

export default Game;
