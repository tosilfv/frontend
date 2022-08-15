import React, { Component } from 'react'
import '../styles/theme/light/Player.css'

class Player extends Component {
  render() {
    const { playerCards } = this.props
    return (
      <div className="Player">
        {playerCards}
      </div>
    )
  }
}

export default Player