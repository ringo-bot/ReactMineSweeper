'use strict';

const e = React.createElement;

class Square extends React.Component {
  constructor(props) {
    super(props);
	const {cell} = this.props;
  }

  render() {
	const flex = (40);
	const color = ['Blue', 'Green', 'Red', 'Navy', 'Crimson', 'Gold', 'Black', 'Grey']
    return e(
      'div',
      { 
	  class: 'square',
	  style: {flexBasis: flex, backgroundColor: this.props.cell.isRevealed ? 'White' : '#eef0f7', color: color[this.props.cell.value-1]},
	  onClick: (event) => {this.props.onClick(event);},
	  onContextMenu: (event) => {this.props.onContextMenu(event);},
	  },
	  this.props.cell.value
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
	this.state = {SIZE: 0, ROWS: 10, COLUMNS: 10, logicBoard: new Array(), menu: new Array(), inStartMenu: false, inGame: false, milliseconds: 0, timerIntervalID: null, revealed: 0, mines: 0};
  }
  
  startTime(){
	  var timerIntervalID = setInterval( () => this.setState({milliseconds: this.state.milliseconds+1000}), 1000 ); 
	  this.setState({milliseconds: 0, timerIntervalID: timerIntervalID});
  }
  
  stopTime(){
	  clearInterval(this.state.timerIntervalID);
	  this.setState({timerIntervalID: null});
  }
  
  checkNeighbours(index){
	let row = Math.floor(index / this.state.COLUMNS);
	let column = (index % this.state.COLUMNS);
	let neighbourMines = 0;
	for (let i = (row-1); i <= (row+1); i++){
		if (i < 0 || i > this.state.ROWS-1) continue;
		for (let j = (column-1); j <= (column+1); j++){
			if (j < 0 || j > this.state.COLUMNS-1) continue;
			if (this.state.logicBoard[j + i*this.state.COLUMNS].neighbourMines == -1) neighbourMines++;
		}
	}
	return neighbourMines;
  }
  
  handleClick(event, i){
	event.preventDefault();
	if (this.state.inStartMenu && this.state.inGame) return;
	if (this.state.revealed == 0) {
		this.setMines(i); 
		this.setCells(); 
		var revealed = this.reveal(i);
		this.setState({revealed: this.state.revealed + revealed});
		if ((this.state.SIZE - (this.state.revealed+revealed)) == this.state.mines) this.winGame();
		this.setState({logicBoard: this.state.logicBoard});
		return;
	}
	if (event.button == 0) {
		var revealed = this.reveal(i);
		this.setState({revealed: this.state.revealed + revealed});
		if ((this.state.SIZE - (this.state.revealed+revealed)) == this.state.mines) this.winGame();
	}
	if (event.button == 2) {
		if (!this.state.logicBoard[i].isRevealed){
			this.state.logicBoard[i].isFlagged = !this.state.logicBoard[i].isFlagged;
			this.state.logicBoard[i].value = this.state.logicBoard[i].isFlagged ? e('i', {class: 'fa fa-flag', style: {color: 'red'}}, ) : '';
		}
	}
	
	if (event.detail == 2) { 
		var revealed = this.revealIfSafe(i);
		this.setState({revealed: this.state.revealed + revealed});
		if ((this.state.SIZE - (this.state.revealed+revealed)) == this.state.mines) this.winGame();
	}

	this.setState({logicBoard: this.state.logicBoard});
  }
  
  reveal(i){
	if (!this.state.logicBoard[i].isFlagged) {
		if (this.state.logicBoard[i].neighbourMines == -1) {
			this.explode();
			this.stopTime();
		} else if (!this.state.logicBoard[i].isRevealed && this.state.logicBoard[i].neighbourMines != 0){
			this.state.logicBoard[i].value = this.state.logicBoard[i].neighbourMines;
			this.state.logicBoard[i].isRevealed = true;
			return 1;
		} else if (!this.state.logicBoard[i].isRevealed){
			this.state.logicBoard[i].isRevealed = true;
			var revealed = 1;
			let row = Math.floor(i / this.state.COLUMNS);
			let column = (i % this.state.COLUMNS);
			for (let j = (row-1); j <= (row+1); j++){
				if (j < 0 || j > this.state.ROWS-1) continue;
				for (let k = (column-1); k <= (column+1); k++){
					if (k < 0 || k > this.state.COLUMNS-1) continue;
					revealed += this.reveal(k+j*this.state.COLUMNS);
				}
			}
			return revealed;
			}
	}
	return 0;
  }
  
  revealIfSafe(i){
	let revealed = 0;
	let row = Math.floor(i / this.state.COLUMNS);
	let column = (i % this.state.COLUMNS);
	let flagged = 0;
	for (let j = (row-1); j <= (row+1); j++){
		if (j < 0 || j > this.state.ROWS-1) continue;
		for (let k = (column-1); k <= (column+1); k++){
			if (k < 0 || k > this.state.COLUMNS-1) continue;
			if (this.state.logicBoard[k+j*this.state.COLUMNS].isFlagged) flagged++;
		}
	}
	if (flagged == this.state.logicBoard[i].neighbourMines){
		for (let j = (row-1); j <= (row+1); j++){
		if (j < 0 || j > this.state.ROWS-1) continue;
			for (let k = (column-1); k <= (column+1); k++){
				if (k < 0 || k > this.state.COLUMNS-1) continue;
				revealed += this.reveal(k+j*this.state.COLUMNS);
			}
		}
	}
	return revealed;
  }
  
  explode(){
	for (let i = 0; i < this.state.SIZE; i++){
		if (this.state.logicBoard[i].neighbourMines == -1){
			this.state.logicBoard[i].value = e('i', {class: 'fa fa-bomb', style: {color: 'red'}}, );
			this.state.logicBoard[i].isRevealed = true;			
		}
	}
	this.setState({inStartMenu: true, inGame: true});
	this.playAgain();
  }
  
  playAgain(){
	  this.state.menu.push(e(
						'button',
						{
							class: 'play',
							onClick: () => {this.boardReset();},
						},
						'Play Again'
		));
  }
  
  boardReset(){
	  this.setState({SIZE: 0, ROWS: 10, COLUMNS: 10, logicBoard: new Array(), menu: new Array(), inStartMenu: false, inGame: false, milliseconds: 0, revealed: 0, mines: 0});
  }
  
  winGame(){
	this.setState({inStartMenu: true, inGame: true});
	this.stopTime();
	this.playAgain();
  }
  
  startMenu(){
	const DIFFICULTIES = [{difficulty: 'EASY', size: 81, rows: 9, columns: 9, mines: 10}, 
						  {difficulty: 'MEDIUM', size: 256, rows: 16, columns: 16, mines: 40},
						  {difficulty: 'EXPERT', size: 480, rows: 16, columns: 30, mines: 99}]  
	for (let i = 0; i < 3; i++){
		this.state.menu.push(e(
								'button',
								{class: 'menu', 
								onClick: () => {
									this.startGame(DIFFICULTIES[i]);
									this.setState({inGame: true});
									}
								},
								DIFFICULTIES[i].difficulty
		));
	}
	this.setState({inStartMenu: true})
  }
  
  startGame(difficulty){
	const cell = {value: '', neighbourMines: 0, isMine: false, isFlagged: false, isRevealed: false}; 
	for (let i = 0; i < difficulty.size; i++){
		this.state.logicBoard.push(Object.create(cell));
	}
	this.setState({SIZE: difficulty.size, ROWS: difficulty.rows, COLUMNS: difficulty.columns, menu: new Array(), mines: difficulty.mines});
	this.setState({inStartMenu: false});
	//this.revealAll(difficulty);
	this.startTime();
  }
  
  setMines(i){
	let filled = 0;
	let row = Math.floor(i / this.state.COLUMNS);
	let column = (i % this.state.COLUMNS);
	while (filled < this.state.mines){
		var randIndex = Math.floor(Math.random()*this.state.SIZE);
		let randRow = Math.floor(randIndex / this.state.COLUMNS);
		let randCol = (randIndex % this.state.COLUMNS);
		if (((randCol < column-1) || (randCol > column+1) || (randRow < row-1) || (randRow > row+1)) 
			&& this.state.logicBoard[randIndex].neighbourMines != -1){
			this.state.logicBoard[randIndex].neighbourMines = -1;
			this.state.logicBoard[randIndex].isMine = true;
			filled++;
		}
	}
  }
  
  setCells(){
	for (let i = 0; i < this.state.SIZE; i++){
		if (!this.state.logicBoard[i].isMine) {
			this.state.logicBoard[i].neighbourMines = this.checkNeighbours(i);
		}
	}
  }
  
  revealAll(difficulty){
	for (let i = 0; i < difficulty.size; i++){
		this.state.logicBoard[i].value = this.state.logicBoard[i].neighbourMines;
	}
  }

  render() {
	const menu = this.state.menu.map((difficulty) => {return(difficulty)});
	const gameBoard = new Array(this.state.SIZE);
	for (let i = 0; i < this.state.SIZE; i++){
		gameBoard.push(e(
						Square,
						{
							onClick: (event) => {this.handleClick(event, i);},
							onContextMenu: (event) => {this.handleClick(event, i);},
							cell: this.state.logicBoard[i],
						},
		));
	}
	
    return e(
      'div',
      { 
	  class: 'game',
	  style: {width: (40*this.state.COLUMNS), height: (40*this.state.ROWS), flexDirection: this.state.inGame ? '' : 'column'},
	  },
	  gameBoard,
	  e('button', 
	  {
		  class: 'start',
		  onClick: () => {this.startMenu();}, 
		  disabled: (this.state.inStartMenu || this.state.inGame)
	  }, 
	  'START', 
	  ),
	  menu,
	  e('div', {class: 'timer', style: {width: (40*this.state.COLUMNS),}}, 
	  e('i', {class: 'fa fa-bomb', style: {color: 'red'}}, ), 
	  this.state.mines + '\u00a0\u00a0\u00a0',
	  Math.floor(this.state.milliseconds/3600000 % 24).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
	  + ':' + Math.floor(this.state.milliseconds/60000 % 60).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) 
	  + ':' + Math.floor(this.state.milliseconds/1000 % 60).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) )
    );
  }
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Game));