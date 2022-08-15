import React, { Component } from 'react'
import { PILE_TABLE, TURN_CPU, TURN_PLAYER, VISIBLE } from '../constants/constants'
import { mapPile } from '../helpers/helpers'
import Cpu from './Cpu'
import Deck from './Deck'
import Discard from './Discard'
import '../styles/theme/light/Table.css'
import Message from './Message'

class Table extends Component {
  constructor(props) {
    super(props)
    this.handleInitGame = this.handleInitGame.bind(this)
    this.handleNewGame = this.handleNewGame.bind(this)
  }
  getWinningMessage(cpuCardsLeft, playerCardsLeft) {
    if (cpuCardsLeft === 0) {
      return 'CPU WINS'
    }
    if (playerCardsLeft === 0) {
      return `
          😱🤧😇😬😦😧🧐🤓
        YOU WIN, CONGRATULATIONS!
          😁😂🤣😄😆😍🤩🙂`
    }
  }
  handleInitGame() {
    this.props.initGame()
  }
  handleNewGame() {
    this.props.newGame()
  }
  render() {
    const {
      pickFromDeck,
      pickTableCards,
      removeMessage,
      cardsRemaining,
      deckVisibility,
      disableDeck,
      discardPile,
      cpuCardsLeft,
      gameover,
      message,
      playerCardsLeft,
      spinAmount,
      spinVisibility,
      startButton,
      tablePile,
      turn
    } = this.props
    if (gameover) {
      return (
        <div className="Table" disabled>
          <div className='Table-info' disabled>
            <Message
              gameover={gameover}
              message={this.getWinningMessage(cpuCardsLeft, playerCardsLeft)}
              removeMessage={removeMessage}
            />
            <Cpu
              spinAmount={spinAmount}
              spinVisibility={spinVisibility}
            />
          </div>
          <div className="Table-piles" disabled>
            <Deck
              cardsRemaining={cardsRemaining}
              deckVisibility={deckVisibility}
              disableDeck={disableDeck}
              pickFromDeck={pickFromDeck}
              turn={turn}
            />
          </div>
          <Discard discardPile={discardPile} />
          <div className="Table-playfield" disabled>
            {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
            <button
              style={{ visibility: VISIBLE }}
              onClick={this.handleNewGame}
              >
                Play Another Round
            </button>
          </div>
        </div>
      )
    } else {
      if (turn === TURN_CPU) {
        return (
          <div className="Table Table-noevents">
            <div className='Table-info'>
              <Message 
                message={message}
                removeMessage={removeMessage}
              />
              <Cpu
                spinAmount={spinAmount}
                spinVisibility={spinVisibility}
              />
            </div>
            <div className="Table-piles">
              <Deck
                cardsRemaining={cardsRemaining}
                deckVisibility={deckVisibility}
                disableDeck={disableDeck}
                pickFromDeck={pickFromDeck}
                turn={turn}
              />
            </div>
            <Discard discardPile={discardPile} />
            <div className="Table-playfield">
              {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
              <button
                style={{ visibility: startButton }}
                onClick={this.handleInitGame}
                >
                  Start New Game
              </button>
            </div>
          </div>
        )
      }
      if (turn === TURN_PLAYER) {
        return (
          <div className="Table">
            <div className='Table-info'>
              <Message 
                message={message}
                removeMessage={removeMessage}
              />
              <Cpu
                spinAmount={spinAmount}
                spinVisibility={spinVisibility}
              />
            </div>
            <div className="Table-piles">
              <Deck
                cardsRemaining={cardsRemaining}
                deckVisibility={deckVisibility}
                disableDeck={disableDeck}
                pickFromDeck={pickFromDeck}
                turn={turn}
              />
            </div>
            <Discard discardPile={discardPile} />
            <div className="Table-playfield">
              {mapPile(tablePile, pickTableCards, PILE_TABLE, gameover)}
              <button
                style={{ visibility: startButton }}
                onClick={this.handleInitGame}
                >
                  Start New Game
              </button>
            </div>
          </div>
        )
      }
    }
  }
}

export default Table
