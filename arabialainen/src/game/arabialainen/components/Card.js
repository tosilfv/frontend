import React, { Component } from 'react'
import {
  PILE_PLAYER,
  PILE_TABLE
} from '../constants/constants'
import '../styles/theme/light/Card.css'

class Card extends Component {
  constructor(props) {
    super(props)
    this.handleHitCard = this.handleHitCard.bind(this)
    this.handlePickTableCards = this.handlePickTableCards.bind(this)
    const randNum = Math.random() * 90 - 45
    const [ angle, x, y ] = [ randNum, randNum, randNum ]
    this._transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`
  }
  createImg(image, name, clName, clickFn, styleStr) {
    return (
      <img
        className={clName}
        src={image}
        alt={name}
        onClick={clickFn}
        style={{ transform: styleStr }}
      />
    )
  }
  createDiscardImg(styleStr) {
    return (
      <div className={'Card-discard'}
        style={{ transform: styleStr }}>
        arabialainen
      </div>
    )
  }
  handleHitCard() {
    this.props.clickCard(this.props.code, this.props.pile, PILE_TABLE)
  }
  handlePickTableCards() {
    this.props.clickCard('', PILE_PLAYER)
  }
  render() {
    const {
      image,
      name,
      pile
    } = this.props
    return (
      <div>
        {pile === 'cpuPile' && (
          this.createImg(image, name, 'Card', this.handleHitCard, '')
        )}
        {pile === 'playerPile' && (
          this.createImg(image, name, 'Card', this.handleHitCard, '')
        )}
        {pile === 'discardPile' && (
          this.createDiscardImg(this._transform)
        )}
        {pile === 'tablePile' && (
          this.createImg(image, name, 'Card-table', this.handlePickTableCards, this._transform)
        )}
      </div>
    )
  }
}

export default Card
