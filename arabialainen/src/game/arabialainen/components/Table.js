import React, { Component } from 'react'
import { PILE_TABLE, TURN_CPU, VISIBLE } from '../constants/constants'
import { mapPile } from '../helpers/helpers'
import Cpu from './Cpu'
import Deck from './Deck'
import Discard from './Discard'
import Message from './Message'
import '../styles/theme/light/Table.css'

class Table extends Component {
  constructor(props) {
    super(props)
    this.handleInitGame = this.handleInitGame.bind(this)
    this.handleNewGame = this.handleNewGame.bind(this)
  }
  getWinningMessage(cpuCardsLeft, playerCardsLeft) {
    if (cpuCardsLeft === 0) {
      return 'CPU WINS'
    }
    if (playerCardsLeft === 0) {
      return `
          😱🤧😇😬😦😧🧐🤓
        YOU WIN, CONGRATULATIONS!
          😁😂🤣😄😆😍🤩🙂`
    }
  }
  handleInitGame() {
    this.props.initGame()
  }
  handleNewGame() {
    this.props.newGame()
  }
  render() {
    const {
      cardsRemaining,
      cpuCardsLeft,
      deckVisibility,
      disableDeck,
      discardPile,
      gameover,
      message,
      pickFromDeck,
      pickTableCards,
      playerCardsLeft,
      removeMessage,
      spinAmount,
      spinVisibility,
      startButton,
      tablePile,
      turn
    } = this.props
    return (
      <div className='Table'>
        <div className='Table-info'>
          <Message
            gameover={gameover}
            message={gameover ? this.getWinningMessage(cpuCardsLeft, playerCardsLeft) : message}
            removeMessage={removeMessage}
          />
          <Cpu
            spinAmount={spinAmount}
            spinVisibility={spinVisibility}
          />
        </div>
        <div className={turn === TURN_CPU ? 'Table-piles Table-piles-noevents' : 'Table-piles'}>
          <Deck
            cardsRemaining={cardsRemaining}
            deckVisibility={deckVisibility}
            disableDeck={disableDeck}
            pickFromDeck={pickFromDeck}
            turn={turn}
          />
        </div>
        <Discard discardPile={discardPile} />
        <div className="Table-playfield">
          {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
          <button
            style={gameover ? { visibility: VISIBLE } : { visibility: startButton }}
            onClick={gameover ? this.handleNewGame : this.handleInitGame}
            >
              {gameover ? 'Play Another Round' : 'Start New Game'}
          </button>
        </div>
      </div>
    )
  }
}

export default Table
