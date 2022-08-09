import React, { Component } from 'react'
import { PILE_TABLE } from '../constants/constants'
import { mapPile } from '../helpers/helpers'
import Cpu from './Cpu'
import Deck from './Deck'
import Discard from './Discard'
import '../styles/theme/light/Table.css'

class Table extends Component {
  render() {
    const {
      pickFromDeck,
      pickTableCards,
      deckVisibility,
      discardPile,
      initGame,
      spinAmount,
      spinVisibility,
      startButton,
      tablePile
    } = this.props
    return (
      <div className="Table">
        <Cpu
          spinAmount={spinAmount}
          spinVisibility={spinVisibility}
        />
        <div className="Table-piles">
          <Deck
            deckVisibility= {deckVisibility}
            pickFromDeck={pickFromDeck}
          />
        </div>
        <Discard discardPile={discardPile} />
        <div className="Table-playfield">
          {mapPile(tablePile, pickTableCards, PILE_TABLE)}
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

export default Table
