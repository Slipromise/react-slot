import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import DigitRoll from "digit-roll-react";
import Slot from "react-slot-machine";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardArray: [],
      slotTargets: [],
      score: 0,
      totalScore: 50000,
      bet: 100,
      situation: 0,
      rollingCount: 0,
      isRolling: false,
    };
    this.setRandomBoard = this.setRandomBoard.bind(this);
    this.onSpin = this.onSpin.bind(this);
    this.onGetScore = this.onGetScore.bind(this);
    this.onBetChange = this.onBetChange.bind(this);
    this.onSlotEnd = this.onSlotEnd.bind(this);
  }

  render() {
    const {
      boardArray,
      score,
      totalScore,
      bet,
      situation,
      slotTargets,
    } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <SlotFrame
          boardArray={boardArray}
          slotTargets={slotTargets}
          onSlotEnd={this.onSlotEnd}
        />
        <div>
          <span>得分</span>
          <DigitRoll divider="," num={score} length={5} height={1.5} />
        </div>
        <span>{SITUATION_TYPE[situation]}</span>
        <div>
          <span>總分</span>
          <DigitRoll divider="," num={totalScore} length={7} height={1.5} />
        </div>
        <div>
          <span>注碼</span>
          <DigitRoll divider="," num={bet} length={4} height={1.5} />
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={bet}
            onChange={this.onBetChange}
            disabled={situation !== 0}
          />
        </div>
        <div>
          <button
            disabled={situation === 1}
            onClick={situation === 2 ? this.onGetScore : this.onSpin}
            className="SpinButton"
            data-situation={situation === 2 ? "GetScore" : "Spin"}
          ></button>
        </div>
      </div>
    );
  }

  componentWillMount() {
    this.setRandomBoard();
  }

  componentDidUpdate() {
    const { boardArray, situation, isRolling, slotTargets, bet } = this.state;
    let score;
    if (!isRolling && situation === 1) {
      const targetSymbol = slotTargets.map(
        (traget, index) => boardArray[traget - 1 + index * ROW_COUNT]
      );
      score = bet * odds(targetSymbol);
      this.setState({
        situation: score > 0 ? 2 : 0,
        score,
      });
    }
  }

  setRandomBoard() {
    const { slotTargets } = this.state;
    let nextSlotTargets = [],
      boardArray = [];
    for (let index = 0; index < ROW_COUNT * COLUMN_COUNT; index++) {
      boardArray.push(Math.floor(Math.random() * SYMBOL_COUNT));
    }
    for (let index = 0; index < COLUMN_COUNT; index++) {
      let tmpTarget = Math.floor(Math.random() * ROW_COUNT) + 1;
      nextSlotTargets[index] =
        slotTargets[index] !== tmpTarget
          ? tmpTarget
          : slotTargets[index] !== 1
          ? slotTargets[index] - 1
          : slotTargets[index] + 1;
    }
    this.setState({ boardArray, slotTargets: nextSlotTargets });
  }

  onSpin() {
    const { bet, totalScore } = this.state;
    this.setRandomBoard();
    this.setState({
      situation: 1,
      totalScore: totalScore - bet,
      rollingCount: COLUMN_COUNT,
      isRolling: true,
    });
  }

  onGetScore() {
    const { score, totalScore } = this.state;
    this.setState({
      score: 0,
      totalScore: totalScore + score,
      situation: 0,
    });
  }

  onBetChange(e) {
    this.setState({ bet: e.target.value });
  }

  onSlotEnd() {
    this.setState((state) => ({
      rollingCount: state.rollingCount - 1,
      isRolling: state.rollingCount - 1 !== 0,
    }));
  }
}

const SYMBOL_COUNT = 4;
const ROW_COUNT = 8;
const COLUMN_COUNT = 3;
const SITUATION_TYPE = ["請下注並開始!", "開獎中...", "恭喜獲獎!請取分"];

const odds = (arry = []) => {
  const MIN_MATCH_COUNT = 2;
  let result = 0;
  for (let index = 0; index < SYMBOL_COUNT; index++) {
    const matchCount = arry.filter((item) => item === index).length;
    result +=
      matchCount >= MIN_MATCH_COUNT
        ? (index + 1) * Math.pow(2, matchCount - MIN_MATCH_COUNT)
        : 0;
  }
  return result;
};

const SlotFrame = (props) => {
  const { boardArray, slotTargets, onSlotEnd } = props;
  let slotSymbols = [];

  for (let index = 0; index < boardArray.length; index++) {
    const symbol = boardArray[index];
    let slotsIndex = Math.floor(index / ROW_COUNT);
    slotSymbols[slotsIndex] = slotSymbols[slotsIndex]
      ? slotSymbols[slotsIndex].concat(symbol)
      : [0, symbol];
  }

  slotSymbols = slotSymbols.map((symbols, index) => (
    <Slot
      key={index}
      target={slotTargets[index]}
      onEnd={onSlotEnd}
      className="Slot"
      times={10}
    >
      {symbols.map((symbol, index) => (
        <div key={index} data-symbol={symbol}></div>
      ))}
    </Slot>
  ));

  return <div className="SlotFrame">{slotSymbols}</div>;
};

export default App;
