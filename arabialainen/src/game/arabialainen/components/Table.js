import React, { Component } from 'react'
import Deck from './Deck'
import Discard from './Discard'
import { PILE_TABLE } from '../constants/constants'
import '../styles/theme/light/Table.css'

class Table extends Component {
  constructor(props) {
    super(props)
    this.handleInitGame = this.handleInitGame.bind(this)
    this.handleMapPile = this.handleMapPile.bind(this)
  }
  handleInitGame() {
    const { initGame } = this.props
    return initGame
  }
  handleMapPile() {
    const {
      mapPile,
      tablePile
    } = this.props
    return mapPile(tablePile, '', PILE_TABLE)
  }
  render() {
    const { startButton } = this.props
    return (
      <div className="Table">
        <div className="Table-piles">
          <Deck />
          <Discard />
        </div>
        <div className="Table-playfield">
          {this.handleMapPile()}
          <button
            style={{ visibility: startButton }}
            onClick={this.handleInitGame()}
          >
            Start New Game
          </button>
        </div>
      </div>
    )
  }
}

export default Table
