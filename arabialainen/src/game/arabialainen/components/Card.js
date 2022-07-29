import React, { Component } from 'react'
import { PILE_TABLE } from '../constants/constants'
import '../styles/theme/light/Card.css'

class Card extends Component {
  constructor(props) {
    super(props)
    this.handleHitCard = this.handleHitCard.bind(this)
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
  handleHitCard() {
    this.props.hitCard(this.props.code, this.props.pile, PILE_TABLE)
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
        {pile === 'tablePile' && (
          this.createImg(image, name, 'Card-table', null, this._transform)
        )}
      </div>
    )
  }
}

export default Card
