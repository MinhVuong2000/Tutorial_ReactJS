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
      const length = props.sizeBoard*props.sizeBoard;
      this.state = {
          squares: Array(length).fill(null),
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
    for (let row=0;row<this.props.sizeBoard;row++){
      let listRow = [];
      for (let col=0;col<this.props.sizeBoard;col++){
        listRow.push(this.renderSquare(row*this.props.sizeBoard + col));
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
    const length = props.sizeBoard*props.sizeBoard;
    this.state = {
      history: [{
        squares: Array(length).fill(null),
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
      if (calculateWinner(squares, current.changedSquare).winner || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X':'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          changedSquare: calculateLocationChangedSquare(i, this.props.sizeBoard),
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
    const winner = calculateWinner(current.squares, current.changedSquare).winner;
    const winningLine = calculateWinner(current.squares, current.changedSquare).winningLine;
    const isDraw = calculateWinner(current.squares, current.changedSquare).isDraw;
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
              sizeBoard={this.props.sizeBoard}
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

function calculateLocationChangedSquare(position, sizeBoard) {
  const row = position / sizeBoard >> 0;
  const col = position % sizeBoard;
  return {'row':row, 'col': col};
}

function Line5SquareWinner(squares, squareStartLoc, addRow, addCol){
  const lengthSquare = squares.length
  const sizeBoard = Math.sqrt(lengthSquare);
  let canFindLine;
  let player = squares[squareStartLoc];
  let locStart=calculateLocationChangedSquare(squareStartLoc, sizeBoard);
  let nextIndex;
  for (let k=0;k<5;k++){
    squareStartLoc = (locStart.row-addRow*k)*sizeBoard + (locStart.col-addCol*k);
    if (squareStartLoc<0 || squareStartLoc>=lengthSquare)
      continue;
    canFindLine = true;
    for (let i = 0; i < 5; i++){
      const locStartNew = calculateLocationChangedSquare(squareStartLoc, sizeBoard);
      nextIndex = (locStartNew.row+addRow*i)*sizeBoard + (locStartNew.col+addCol*i);
      
      if (nextIndex<0 || nextIndex>=lengthSquare || squares[nextIndex]!==player){
        canFindLine = false
        break;
      }
    }
    if (canFindLine===true){
      const line = [squareStartLoc];
      for (let i=1;i<5;i++) {
        line.push(squareStartLoc+addCol*i + addRow*i*sizeBoard);
      }
      return line;
    }
  }
  return null;
}
function calculateWinner(squares, changedSquare) {
  const lengthBoard = squares.length;
  const index = changedSquare?changedSquare.row*Math.sqrt(lengthBoard) + changedSquare.col : null;
  const line_check = {
    'col':[1,0],
    'row':[0,1],
    'grave_accent': [1,1],
    'acute': [-1,1]
  }
  let line;
  for (let key in line_check) {
    line = Line5SquareWinner(squares, index, line_check[key][0], line_check[key][1]);
    if (line !== null)
      return {
        winner: squares[index],
        winningLine: line,
        isDraw: false,
      }
  }

  let isDraw = true;
  for (let i=0;i<lengthBoard;i++){
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

const timer = setInterval((interval) => {
  if (document.getElementById('addSizeBoard').getAttribute('style') === 'display:none') {
    const sizeBoard = Number(document.getElementById('sizeBoard').value, 10);
    ReactDOM.render(
      <Game sizeBoard={sizeBoard}/>,
      document.getElementById('root')
    );
    clearInterval(timer);
  }
}, 100);
