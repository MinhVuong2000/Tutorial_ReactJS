import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square({value, onClick, winningSquare}) {
  return (
    <button className="square"
        onClick={() => onClick()} 
        style={winningSquare?{backgroundColor:'yellow'}:null}>
        {value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          squares: Array(9).fill(null),
          xIsNext: true,
      }
  }

  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]} 
        onClick = {()=>this.props.onClick(i)}
        winningSquare = {this.props.winningLine?this.props.winningLine.includes(i):false}
      />
    );
  }

  render() {
    let board = [];
    for (let row=0;row<3;row++){
      let listRow = [];
      for (let col=0;col<3;col++){
        listRow.push(this.renderSquare(row*3 + col));
      }
      board.push(<div className="board-row">{listRow}</div>);
    }

    return (
      <div>
        {board}
      </div>
    );
  }
};
  
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        changedSquare: null,
      }],
      xIsNext: true,
      stepNumber: 0,
      sortMovesAscending: true,
    }
  }

  handleClick(i){
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares).winner || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X':'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          changedSquare: calculateLocationChangedSquare(i),
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
      })
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2 ) === 0,
    })
  }

  sortTheMovesHandleClick(){
    this.setState({
      sortMovesAscending: !this.state.sortMovesAscending,
    })
  }

  render() {
    const weight_bold = {
      fontWeight:'bold'
    };
    const weight_normal = {
      fontWeight:'normal'
    };

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares).winner;
    const winningLine = calculateWinner(current.squares).winningLine;
    const isDraw = calculateWinner(current.squares).isDraw;
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ` clicked at (${step.changedSquare.row},${step.changedSquare.col})`:
        'Go to game start';
      return (
        <li key={move}>
          <button 
            style={this.state.stepNumber === move ? weight_bold : weight_normal} 
            onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    let color_status;
    if (winner){
      status = 'Winner: ' + winner;
      color_status = {color: 'red'};
    } else {
      if (isDraw){
      status = 'Match is draw';
      color_status = {color: 'red'};
      }
      else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        color_status = {color: 'blue'};
      }
    }

    const ascending = this.state.sortMovesAscending;

    return (
      <div className="game">
        <div className="game-board">
          <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              winningLine={winningLine}
            />
        </div>
        <div className="game-info">
          <div style={color_status}>{status}</div>
          <button onClick={() => this.sortTheMovesHandleClick()}>
            Change Sort The Moves into: <b style={{color:'blue'}}>{ascending?'Descending':'Ascending'}</b>
          </button>
          <ol>{ascending?moves:moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

function calculateLocationChangedSquare(position) {
  const row = position / 3 >> 0;
  const col = position % 3;
  return {'row':row, 'col': col};
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: lines[i],
        isDraw: false,
      };
    }
  }
  let isDraw = true;
  for (let i=0;i<squares.length;i++){
    if (squares[i] === null){
      isDraw = false;
    }
  }
  return {
    winner: null,
    winningLine: null,
    isDraw: isDraw,
  };
};
  
// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
  