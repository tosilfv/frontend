import React, { Component } from 'react'
import '../styles/theme/light/Player.css'

class Player extends Component {
  render() {
    const {
      disableCards,
      playerCards,
      playerCardsLeft
    } = this.props
    return (
      <div>
        {disableCards || playerCardsLeft === 0 ? (
          <div className="Player" disabled>
            {playerCards}
          </div>
        ):(
          <div className="Player">
            {playerCards}
          </div>
        )}
      </div>
    )
  }
}

export default Player