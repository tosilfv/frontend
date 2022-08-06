// import React, { Component } from 'react'
// import {
//   PILE_CPU,
//   PILE_TABLE
// } from '../constants/constants'
// import '../styles/theme/light/Cpu.css'

// class Cpu extends Component {
//   constructor(props) {
//     super(props)
//     this.handleHitCard = this.handleHitCard.bind(this)
//   }
//   handleHitCard() {
//     const {
//       cpuPile,
//       hitCard,
//       playersTurn,
//       startButton
//     } = this.props
//     if (startButton === 'hidden' && playersTurn === false) {
//       hitCard(cpuPile[0].code, PILE_CPU, PILE_TABLE)
//     }
//   }
//   render() {
//     return (
//       <div className='Cpu'>
//         <div className="Cpu-loader">cpu</div>
//         {this.handleHitCard()}
//       </div>
//     )
//   }
// }

// export default Cpu