import React, { Component } from 'react'
import { PILE_DISCARD } from '../constants/constants'
import { mapPile } from '../helpers/helpers'
import '../styles/theme/light/Discard.css'

class Discard extends Component {
  render() {
    const { discardPile } = this.props
    return (
      <div className='Discard'>
        {mapPile(discardPile, '', PILE_DISCARD)}
      </div>
    )
  }
}

export default Discard
