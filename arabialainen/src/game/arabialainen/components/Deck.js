import React, { Component } from 'react'
import { PILE_PLAYER } from '../constants/constants'
import '../styles/theme/light/Deck.css'

class Deck extends Component {
  constructor(props) {
    super(props)
    this.handlePickFromDeck = this.handlePickFromDeck.bind(this)
  }
  handlePickFromDeck() {
    return this.props.pickFromDeck(PILE_PLAYER)
  }
  render() {
    const {
      cardsRemaining,
      deckVisibility
    } = this.props
    return (
      <div>
        {cardsRemaining === 0 &&
          <div></div>
        }
        {cardsRemaining === 1 &&
          <div className="Deck-pick"
            onClick={this.handlePickFromDeck}
            style={{ visibility: deckVisibility }}
            >
              arabialainen
          </div>
        }
        {cardsRemaining > 1 &&
          <div>
            <div className="Deck"
              style={{ visibility: deckVisibility }}
              >
                arabialainen
            </div>
            <div className="Deck-pick"
              onClick={this.handlePickFromDeck}
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
