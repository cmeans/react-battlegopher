import React from 'react';
import Service from './Service';
import { Grid, Button, InputAdornment, TextField, MenuItem } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import GridOnIcon from '@material-ui/icons/GridOn';
import GameContext from './GameContext';

class Start extends React.Component {
  static contextType = GameContext;

  state = {
    player1Name: '',
    player2Name: '',
    dimension: ''
  };

  constructor(props) {
    super(props);

    this.handlePlayer1Change = this.handlePlayer1Change.bind(this);
    this.handlePlayer2Change = this.handlePlayer2Change.bind(this);
    this.handleDimensionChange = this.handleDimensionChange.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.service = Service.getInstance();
  }

  componentDidMount() {
    this.setState({
      player1Name: this.context.player1Name,
      player2Name: this.context.player2Name,
      dimension: this.context.dimension
    });
  }

  handlePlayer1Change(event) {
    this.setState({ player1Name: event.target.value });
  }

  handlePlayer2Change(event) {
    this.setState({ player2Name: event.target.value });
  }

  handleDimensionChange(event) {
    this.setState({ dimension: event.target.value });
  }

  handleClick(event) {
    this.service.newGame(
      this.state.player1Name,
      this.state.player2Name,
      this.state.dimension)
      .then(sessionId => {
        if (sessionId > 0) {
          // We have a valid sessionId, save the user input.
          this.context.setPlayer1Name(this.state.player1Name);
          this.context.setPlayer2Name(this.state.player2Name);
          this.context.setDimension(this.state.dimension);

          // Set the sessionId (kicks off the new game).
          this.context.setSessionId(sessionId);
        }
      })
      .catch(err => {
        alert(err);
      });
  }

  render() {
    return (
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={3}>
          <TextField
            label="Player #1 Name"
            value={this.state.player1Name}
            onChange={this.handlePlayer1Change}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              )}}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="Player #2 Name"
            value={this.state.player2Name}
            onChange={this.handlePlayer2Change}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              )}}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            label="Board Dimension"
            value={this.state.dimension}
            onChange={this.handleDimensionChange}
            helperText="Please select the board size"
            style={{width: 198}}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GridOnIcon />
                </InputAdornment>
              )}}
          >
            {
              [...Array(20)].map((_, value) => (
                <MenuItem key={value + 1} value={value + 1}>{value + 1} x {value + 1}</MenuItem>
              ))
            }
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <Button onClick={this.handleClick}>
            Start Game
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default Start;
