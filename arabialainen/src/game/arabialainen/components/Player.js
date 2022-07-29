import React, { Component } from 'react'
import { PILE_PLAYER } from '../constants/constants'
import '../styles/theme/light/Player.css'

class Player extends Component {
  constructor(props) {
    super(props)
    this.handleMapPile = this.handleMapPile.bind(this)
  }
  handleMapPile() {
    const {
      hitCard,
      mapPile,
      playerPile
    } = this.props
    return mapPile(playerPile, hitCard, PILE_PLAYER)
  }
  render() {
    return (
      <div className="Player">
        {this.handleMapPile()}
      </div>
    )
  }
}

export default Player