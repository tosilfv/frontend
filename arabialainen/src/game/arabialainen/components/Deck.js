import React, { Component } from 'react'
import { PILE_PLAYER, TURN_CPU, TURN_PLAYER } from '../constants/constants'
import '../styles/theme/light/Deck.css'

class Deck extends Component {
  constructor(props) {
    super(props)
    this.handlePickFromDeck = this.handlePickFromDeck.bind(this)
  }
  handlePickFromDeck() {
    if (this.props.disableDeck === false) {
      return this.props.pickFromDeck(PILE_PLAYER)
    }
  }
  render() {
    const {
      cardsRemaining,
      deckVisibility,
      turn
    } = this.props
    return (
      <div>
        {cardsRemaining === 0 &&
          <div></div>
        }
        {cardsRemaining === 1 &&
          <div className='Deck-pick'
            onClick={turn === TURN_PLAYER ? this.handlePickFromDeck : null}
            style={{ visibility: deckVisibility }}
            >
              arabialainen
          </div>
        }
        {cardsRemaining > 1 &&
          <div>
            <div className={turn === TURN_CPU ? 'Deck Deck-pick-noevents' : 'Deck'}
              style={{ visibility: deckVisibility }}
              >
                arabialainen
            </div>
            <div className={turn === TURN_CPU ? 'Deck-pick Deck-pick-noevents' : 'Deck-pick'}
              onClick={turn === TURN_PLAYER ? this.handlePickFromDeck : null}
              style={{ visibility: deckVisibility }}
              >
                arabialainen
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Deck
