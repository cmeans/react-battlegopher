import React from 'react';
import { Box, Chip, Grid } from '@material-ui/core';
import Service from './Service';
import GameContext from './GameContext';
import './Board.css';

const WIDTH = 400;
const HEIGHT = 400;

class Cell extends React.Component {
  render() {
    const { x, y, status, cellSize } = this.props;

    return (
      <div
        className={ `Cell ${status}` }
        style={{
          left: `${cellSize * x + 1}px`,
          top: `${cellSize * y + 1}px`,
          width: `${cellSize - 1}px`,
          height: `${cellSize - 1}px`,
        }}
      />
    );
  }
}

class Board extends React.Component
{
  static contextType = GameContext;

  constructor(props) {
    super(props);

    this.state = {
      cells: [],
      playerId: this.props.playerId,
      playerName: this.props.playerName
    };

    this.service = Service.getInstance();
  }

  componentDidMount() {
    this.setState({
      sessionId: this.context.sessionId
    });

    this.cellSize = WIDTH / this.context.dimension;
    this.rows = HEIGHT / this.cellSize;
    this.cols = WIDTH / this.cellSize;
    this.board = this.makeEmptyBoard();
  }

  // Create an empty board.
  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < this.rows; y++) {
      board[y] = [];
      for (let x = 0; x < this.cols; x++) {
        board[y][x] = 'Unknown';
      }
    }
    return board;
  }

  // Create cells from this.board.
  makeCells() {
    let cells = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x] !== 'Unknown') {
          cells.push({ x, y, status: this.board[y][x] });
        }
      }
    }
    return cells;
  }

  // Compute the difference between the page and a cell on the board.
  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;

    return {
      x: (rect.left + window.pageXOffset) - doc.clientLeft,
      y: (rect.top + window.pageYOffset) - doc.clientTop
    };
  }

  handleClick = (event) => {
    const elemOffset = this.getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;
    const x = Math.floor(offsetX / this.cellSize);
    const y = Math.floor(offsetY / this.cellSize);

    if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
      // Should only let user click "Unknown" cells.
      if (this.board[y][x] === 'Unknown') {
        // Send this move.
        this.service.guess(
          this.context.sessionId,
          this.state.playerId,
          y,
          x)
          .then(res => {
            if (res.notYourTurn) {
              alert('It is not your turn!');
            } else {
              // Record the hit or miss.
              this.board[y][x] = res.hit ? 'Hit' : 'Miss';

              // Update the board.
              this.setState({ cells: this.makeCells() });

              if (res.gameOver) {
                // We have a winner with that last move.
                this.context.gameOver();
              }
            }
          });
      }
    }
  }

  render()
  {
    const { cells, playerName } = this.state;

    const activeChipColor = (playerName === this.props.activePlayerName) ? "primary" : "secondary";
    const activeBoard = (playerName === this.props.activePlayerName) ? "ActivePlayer" : "";

    return (
      <Box>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <Chip
              size="medium"
              color={activeChipColor}
              label={playerName}
            />
          </Grid>
          <Grid item xs={12}>
            <div
            className={ `Board ${activeBoard}` }
            style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${this.cellSize}px ${this.cellSize}px`}}
            onClick={this.handleClick}
            ref={(n) => {
              this.boardRef = n;
            }}
          >
            {
              cells.map(cell => (
                <Cell
                  cellSize={this.cellSize}
                  status={cell.status}
                  x={cell.x}
                  y={cell.y}
                  key={`${cell.x},${cell.y}`}
                />
              ))
            }
            </div>
          </Grid>
        </Grid>
      </Box>
    );
  }
}

// Not yet implemented.
// Board.defaultProps = {
//   width: 800,
//   dimensions: 5
// };

export default Board;
