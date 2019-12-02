import axios from 'axios';

export default class Service {
  static _instance = null;
  host = `${process.env.REACT_APP_SERVER_PROTOCOL}://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}`;

  static getInstance() {
    if (Service._instance == null) {
      Service._instance = new Service();
    }

    return this._instance;
  }

  // Make a move.
  async guess(sessionId, playerId, row, col) {
    let payload = {
      session_id: sessionId,
      player_id: playerId,
      row,
      col
    };

    try {
      const res = await axios.post(
        `${this.host}/guess`,
        payload);

      let data = await res.data;

      return {
        gameOver: data.game_over,
        hit: data.hit
      };
    }
    catch (err) {
      if (err.response.status === 422) {
        return { notYourTurn: true };
      }

      console.log(err);
      alert(err);
    }
  }

  // Who's turn is it?
  async turn(sessionId) {
    let payload = {
      session_id: sessionId
    };

    try {
      const res = await axios.post(
        `${this.host}/turn`,
        payload);

      let data = await res.data;

      return data;
    }
    catch (err) {
      // if (err.response.status === 422) {
      //   return { notYourTurn: true };
      // }

      console.log(err);
      alert(err);
    }
  }

  // Start a new game.
  async newGame(player1Name, player2Name, dimension) {
    try {
      const res = await axios.post(
        `${this.host}/newgame`,
        {
          board_dimension: parseInt(dimension),
          player_names: [player1Name, player2Name]
        });

      let data = await res.data;

      return data.session_id;
    }
    catch (err) {
      console.log(err);
      alert(err);
    }
  }
}
