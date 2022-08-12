import React, { Component } from 'react'
import { PILE_TABLE, VISIBLE } from '../constants/constants'
import { mapPile } from '../helpers/helpers'
import Cpu from './Cpu'
import Deck from './Deck'
import Discard from './Discard'
import '../styles/theme/light/Table.css'
import Message from './Message'

class Table extends Component {
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
  render() {
    const {
      initGame,
      pickFromDeck,
      pickTableCards,
      cardsRemaining,
      deckVisibility,
      discardPile,
      cpuCardsLeft,
      gameover,
      message,
      playerCardsLeft,
      spinAmount,
      spinVisibility,
      startButton,
      tablePile
    } = this.props
    if (gameover) {
      return (
        <div className="Table" disabled>
          <div className='Table-info' disabled>
            <Message message={this.getWinningMessage(cpuCardsLeft, playerCardsLeft)} />
            <Cpu
              spinAmount={spinAmount}
              spinVisibility={spinVisibility}
              />
          </div>
          <div className="Table-piles" disabled>
            <Deck
              cardsRemaining={cardsRemaining}
              deckVisibility={deckVisibility}
              pickFromDeck={pickFromDeck}
              />
          </div>
          <Discard discardPile={discardPile} />
          <div className="Table-playfield" disabled>
            {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
            <button
              style={{ visibility: VISIBLE }}
              onClick={initGame}
              >
                Start New Game
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="Table">
          <div className='Table-info'>
            <Message message={message} />
            <Cpu
              spinAmount={spinAmount}
              spinVisibility={spinVisibility}
              />
          </div>
          <div className="Table-piles">
            <Deck
              cardsRemaining={cardsRemaining}
              deckVisibility={deckVisibility}
              pickFromDeck={pickFromDeck}
              />
          </div>
          <Discard discardPile={discardPile} />
          <div className="Table-playfield">
            {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
            <button
              style={{ visibility: startButton }}
              onClick={initGame}
              >
                Start New Game
            </button>
          </div>
        </div>
      )
    }
  }
}

export default Table
