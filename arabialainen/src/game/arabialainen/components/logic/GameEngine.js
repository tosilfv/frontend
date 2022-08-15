import React, { Component } from 'react'
import {
  BOOLEAN,
  DRAW_INIT,
  DRAW_ONE,
  DRAW_ZERO,
  FOURTEEN,
  HIDDEN,
  INFINITE,
  PILE_CPU,
  PILE_DISCARD,
  PILE_PLAYER,
  PILE_TABLE,
  STRING,
  TEN,
  TURN_CPU,
  TURN_PLAYER,
  VISIBLE,
} from '../../constants/constants'
import {
  addToPile,
  createCardArray,
  drawFromDeck,
  drawFromPile,
  getCards,
  getDeck,
  mapPile,
  nameCard,
  namePileCards,
} from '../../helpers/helpers'
import { checkRules } from '../../rules/rules'
import Player from '../Player'
import Table from '../Table'

// global variables
let checkedCardsSetCpu = new Set()

class GameEngine extends Component {
  constructor(props) {
    super(props)
    this.state = {
      canPickFromDeck: false,
      cardsRemaining: 2,
      cpuDidhitCard: false,
      cpuDidPickTable: false,
      cpuPile: [],
      deckId: null,
      deckVisibility: HIDDEN,
      disableCards: false,
      discardedByTen: false,
      discardPile: [],
      gameover: false,
      message: '',
      playerPile: [],
      spinAmount: 1,
      spinVisibility: HIDDEN,
      startButton: VISIBLE,
      tablePile: [],
      turn: TURN_PLAYER
    }
    this.hitCard = this.hitCard.bind(this)
    this.initGame = this.initGame.bind(this)
    this.newGame = this.newGame.bind(this)
    this.pickFromDeck = this.pickFromDeck.bind(this)
    this.pickTableCards = this.pickTableCards.bind(this)
    this.removeMessage = this.removeMessage.bind(this)
  }
  async changeTurn() {
    const isGameover = this.gameover()
    if (isGameover) {
      this.setState({
        gameover: true,
        spinAmount: 1,
        spinVisibility: HIDDEN,
      })
    } else {
      if (this.state.turn === TURN_CPU) {
        checkedCardsSetCpu.clear()
        this.setState({
          canPickFromDeck: true,
          disableCards: false,
          spinAmount: 1,
          spinVisibility: HIDDEN,
          turn: TURN_PLAYER
        })
      }
      if (this.state.turn === TURN_PLAYER) {
        this.setState({
          canPickFromDeck: false,
          cpuDidhitCard: false,
          cpuDidPickTable: false,
          spinAmount: INFINITE,
          spinVisibility: VISIBLE,
          turn: TURN_CPU
        })
      }
    }
  }
  checkCard(cardName) {
    // discarded by ten
    const cardValue = Number(cardName)
    if (cardValue >= 11 && cardValue <= 13) {
      if (!this.state.discardedByTen) {
        if (this.state.turn === TURN_PLAYER) {
          this.setState({
            message: `Cannot hit a court card (${cardName}) before table cards are discarded by ten (10) at least once.`
          })
          return false
        }
        if (this.state.turn === TURN_CPU) {
          return false
        }
      }
    }
    // table is not empty
    if (this.state.tablePile.length > 0) {
      const tableCardName = this.state.tablePile[this.state.tablePile.length - 1].sortName
      let message = checkRules(tableCardName, cardName, this.state.discardedByTen)
      if (this.state.turn === TURN_PLAYER) {
        if (typeof message === STRING) {
          this.setState({ message })
          return false
        } else {
          return message
        }
      }
      if (this.state.turn === TURN_CPU) {
        if (typeof message === BOOLEAN) {
          return message
        } else {
          return false
        }
      }
    }
    // table is empty
    return true
  }
  async componentDidMount() {
    // call api to get deckId
    const deckId = await getDeck()
    this.setState({ deckId })
  }
  componentDidUpdate() {
    if (this.state.turn === TURN_CPU) {
      if (!this.state.cpuDidPickTable) {
        if (!this.state.cpuDidhitCard) {
          this.hitCard('', PILE_CPU)
        }
      }
    }
  }
  async dealToPile(numCards, pile) {
    const pileRes = await drawFromDeck(this.state.deckId, numCards)
    const pileCardArray = createCardArray(pileRes.data.cards)
    await addToPile(this.state.deckId, pileCardArray.toString(), pile)
    await this.listCards(pile)
  }
  async discardTable(code, fromPile, toPile, pileRes, pileResTable) {
    let pileResDiscard = null
    const tableCards = createCardArray(this.state.tablePile)
    // add discardCard code to tableCards
    tableCards.push(code)
    // call api to draw from table pile
    await drawFromPile(this.state.deckId, tableCards, PILE_TABLE)
    // call api to add table cards to discard pile
    await addToPile(this.state.deckId, tableCards.toString(), PILE_DISCARD)
    // call api to list table pile
    pileResTable = await getCards(this.state.deckId, PILE_TABLE)
    // call api to list discard pile
    pileResDiscard = await getCards(this.state.deckId, PILE_DISCARD)
    if (this.state.turn === TURN_PLAYER) {
      this.setState({
        disableCards: false
      })
    }
    this.setState({
      [fromPile]: pileRes.data.piles[fromPile].cards,
      [toPile]: pileResTable.data.piles[toPile].cards,
      [PILE_DISCARD]: pileResDiscard.data.piles[PILE_DISCARD].cards,
      canPickFromDeck: true,
      cpuDidhitCard: false,
      cpuDidPickTable: false
    })
  }
  gameover() {
    if (
      (this.state.cpuPile.length === 0 ||
      this.state.playerPile.length === 0) &&
      this.state.cardsRemaining === 0) {
        return true
      }
  }
  async hitCard(code, fromPile) {
    let card = null
    let cardCode = code
    let deckCardCode = null
    let discardCard = null
    let pileRes = null
    let pileResDeck = null
    let pileResTable = null
    let randNum = null
    if (this.state.turn === TURN_PLAYER) {
      card = this.state.playerPile.find(c => c.code === cardCode)
    }
    if (this.state.turn === TURN_CPU) {
      randNum = Math.floor(Math.random() * this.state.cpuPile.length)
      card = this.state.cpuPile[randNum]
      cardCode = card.code
    }
    let namedCard = nameCard(card)
    let cardName = namedCard.sortName
    const cardOk = this.checkCard(cardName)
    if (cardOk) {
      if (cardName === TEN || cardName === FOURTEEN) {
        discardCard = true
      }
      if (this.state.turn === TURN_PLAYER && !discardCard) {
        this.setState({
          canPickFromDeck: false,
          cpuDidhitCard: false,
          cpuDidPickTable: false,
          spinAmount: INFINITE,
          spinVisibility: VISIBLE,
        })
      }
        // call api to draw from fromPile
        await drawFromPile(this.state.deckId, cardCode, fromPile)
        // call api to add card to table pile
        await addToPile(this.state.deckId, cardCode, PILE_TABLE)
        if (this.state.cardsRemaining > 0) {
          if (this.state[fromPile].length <= DRAW_INIT) {
            // call api to remove card from deck
            pileResDeck = await drawFromDeck(this.state.deckId, DRAW_ONE)
            deckCardCode = pileResDeck.data.cards[0].code
            // call api to add card to fromPile
            await addToPile(this.state.deckId, deckCardCode, fromPile)
            // call api to list table pile
            pileResTable = await getCards(this.state.deckId, PILE_TABLE)
            // call api to list fromPile
            pileRes = await getCards(this.state.deckId, fromPile)
            if (this.state.turn === TURN_CPU) {
              this.setState({
                cpuDidhitCard: true
              })
            }
            this.setState({
              [fromPile]: pileRes.data.piles[fromPile].cards,
              [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
              canPickFromDeck: false,
              cardsRemaining: pileResDeck.data.remaining,
              disableCards: true
            })
          } else {
            // call api to list table pile
            pileResTable = await getCards(this.state.deckId, PILE_TABLE)
            // call api to list fromPile
            pileRes = await getCards(this.state.deckId, fromPile)
            if (this.state.turn === TURN_CPU) {
              this.setState({
                cpuDidhitCard: true
              })
            }
            this.setState({
              [fromPile]: pileRes.data.piles[fromPile].cards,
              [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
              canPickFromDeck: false,
              disableCards: true
            })
          }
        } else {
          // call api to list table pile
          pileResTable = await getCards(this.state.deckId, PILE_TABLE)
          // call api to list fromPile
          pileRes = await getCards(this.state.deckId, fromPile)
          if (this.state.turn === TURN_CPU) {
            this.setState({
              cpuDidhitCard: true
            })
          }
          this.setState({
            [fromPile]: pileRes.data.piles[fromPile].cards,
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            canPickFromDeck: false,
            disableCards: true
          })
        }
        if (discardCard) {
          if (this.state.tablePile.length > 0) {
            if (this.state.turn === TURN_CPU) {
              checkedCardsSetCpu.clear()
            }
            if (cardName === TEN) {
              this.setState({
                cardsRemaining: pileRes.data.remaining,
                discardedByTen: true
              })
            }
            this.discardTable(cardCode, fromPile, PILE_TABLE, pileRes, pileResTable)
          } else {
            this.setState({
              canPickFromDeck: false,
              cardsRemaining: pileRes.data.remaining
            })
            this.changeTurn()
          }
        } else {
          this.changeTurn()
        }
      } else {
        if (this.state.turn === TURN_CPU) {
          checkedCardsSetCpu.add(card)
          if (checkedCardsSetCpu.size < this.state.cpuPile.length) {
            this.hitCard('', PILE_CPU)
          } else {
            // if all cpu cards are checked
            checkedCardsSetCpu.clear()
            if (this.state.canPickFromDeck) {
              this.pickFromDeck(PILE_CPU)
            } else {
              this.pickTableCards('', PILE_CPU)
            }
          }
        }
      }
  }
  async initGame() {
    this.setState({
      deckVisibility: VISIBLE,
      startButton: HIDDEN
    })
    await this.dealToPile(DRAW_INIT, PILE_CPU)
    await this.dealToPile(DRAW_INIT, PILE_PLAYER)
    await this.dealToPile(DRAW_ZERO, PILE_DISCARD)
    await this.dealToPile(DRAW_ZERO, PILE_TABLE)
  }
  async listCards(pile) {
    const cards = await getCards(this.state.deckId, pile)
    this.setState({ [pile]: cards.data.piles[pile].cards })
  }
  async newGame() {
    this.setState({
      canPickFromDeck: false,
      cardsRemaining: 2,
      cpuDidhitCard: false,
      cpuDidPickTable: false,
      cpuPile: [],
      deckId: null,
      deckVisibility: HIDDEN,
      disableCards: false,
      discardedByTen: false,
      discardPile: [],
      gameover: false,
      message: '',
      playerPile: [],
      spinAmount: 1,
      spinVisibility: HIDDEN,
      startButton: VISIBLE,
      tablePile: [],
      turn: TURN_PLAYER
    })
    // call api to get deckId
    const deckId = await getDeck()
    this.setState({ deckId })
  }
  async pickFromDeck(pile) {
    let pileResDeck = null
    if (this.state.cardsRemaining > 0) {
      if (this.state.canPickFromDeck) {
        this.setState({
          canPickFromDeck: false
        })
        let deckCard = null
        let deckCardCode = null
        let pileRes = null
        let pileResTable = null
        // call api to remove card from deck
        pileResDeck = await drawFromDeck(this.state.deckId, DRAW_ONE)
        deckCard = pileResDeck.data.cards[0]
        deckCardCode = pileResDeck.data.cards[0].code
        // call api to add card to table pile
        await addToPile(this.state.deckId, deckCardCode, PILE_TABLE)
        // call api to list pile
        pileRes = await getCards(this.state.deckId, pile)
        // call api to list table pile
        pileResTable = await getCards(this.state.deckId, PILE_TABLE)
        if (this.state.turn === TURN_PLAYER) {
          this.setState({
            disableCards: true
          })
        }
        if (this.state.turn === TURN_CPU) {
          this.setState({
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            canPickFromDeck: true,
            cardsRemaining: pileResDeck.data.remaining,
            cpuDidhitCard: true,
            cpuDidPickTable: false
          })
        }
        if (this.state.turn === TURN_PLAYER) {
          this.setState({
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            canPickFromDeck: false,
            cardsRemaining: pileResDeck.data.remaining
          })
        }
        let namedCard = nameCard(deckCard)
        let cardName = namedCard.sortName
        const cardOk = this.checkCard(cardName)
        if (cardOk) {
          if (cardName === TEN || cardName === FOURTEEN) {
            if (this.state.tablePile.length > 0) {
              if (this.state.turn === TURN_CPU) {
                checkedCardsSetCpu.clear()
              }
              if (cardName === TEN) {
                this.setState({
                  cardsRemaining: pileResDeck.data.remaining,
                  discardedByTen: true
                })
              }
              this.discardTable(deckCardCode, pile, PILE_TABLE, pileRes, pileResTable)
            } else {
              this.setState({
                canPickFromDeck: false,
                cardsRemaining: pileResDeck.data.remaining
              })
              this.changeTurn()
            }
          } else {
            this.changeTurn()
          }
        } else {
          this.pickTableCards(deckCardCode, pile)
        }
      }
    }
  }
  async pickTableCards(code, pile) {
    let pileRes = null
    let pileResTable = null
    const tableCards = createCardArray(this.state.tablePile)
    // add picked card code to tableCards
    tableCards.push(code)
    // call api to draw from table pile
    await drawFromPile(this.state.deckId, tableCards, PILE_TABLE)
    // call api to add table cards to pile
    await addToPile(this.state.deckId, tableCards.toString(), pile)
    // call api to list table pile
    pileResTable = await getCards(this.state.deckId, PILE_TABLE)
    // call api to list pile
    pileRes = await getCards(this.state.deckId, pile)
    if (this.state.turn === TURN_CPU) {
      this.setState({
        canPickFromDeck: false,
        cpuDidPickTable: true,
        message: `CPU picked up the table card(s).`
      })
    }
    this.setState({
      [pile]: pileRes.data.piles[pile].cards,
      [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
      disableCards: true
    })
    this.changeTurn()
  }
  removeMessage() {
    if (this.state.turn === TURN_PLAYER) {
      this.setState({
        message: ''
      })
    }
  }
  render() {
    const playerCards = mapPile(
      this.state.playerPile, this.hitCard, PILE_PLAYER, this.state.gameover
    )
    namePileCards(this.state.tablePile)
    return (
      <div>
        <Table
          initGame={this.initGame}
          newGame={this.newGame}
          pickFromDeck={this.pickFromDeck}
          pickTableCards={this.pickTableCards}
          removeMessage={this.removeMessage}
          cardsRemaining={this.state.cardsRemaining}
          cpuCardsLeft={this.state.cpuPile.length}
          deckVisibility={this.state.deckVisibility}
          discardPile={this.state.discardPile}
          gameover={this.state.gameover}
          message={this.state.message}
          playerCardsLeft={this.state.playerPile.length}
          spinAmount={this.state.spinAmount}
          spinVisibility={this.state.spinVisibility}
          startButton={this.state.startButton}
          tablePile={this.state.tablePile}
          turn={this.state.turn}
        />
        <Player
          disableCards={this.state.disableCards}
          playerCards={playerCards}
          playerCardsLeft={this.state.playerPile.length}
        />
      </div>
    )
  }
}

export default GameEngine
