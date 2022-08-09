import React, { Component } from 'react'
import axios from 'axios'
import {
  API_BASE,
  DRAW_INIT,
  DRAW_ONE,
  DRAW_ZERO,
  PILE_CPU,
  PILE_DISCARD,
  PILE_PLAYER,
  PILE_TABLE,
  TURN_CPU,
  TURN_PLAYER,
} from '../../constants/constants'
import {
  createCard,
  createCardArray,
  drawFromDeck,
  getCards,
  getDeck,
  nameCard,
  namePileCards,
  sortPile,
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
      cpuDidPickTable: false,
      cpuPile: [],
      deckId: null,
      deckVisibility: 'hidden',
      discardPile: [],
      playerPile: [],
      spinAmount: 1,
      spinVisibility: 'hidden',
      startButton: 'visible',
      tablePile: [],
      turn: TURN_PLAYER
    }
    this.hitCard = this.hitCard.bind(this)
    this.initGame = this.initGame.bind(this)
    this.pickFromDeck = this.pickFromDeck.bind(this)
    this.pickTableCards = this.pickTableCards.bind(this)
  }
  async componentDidMount() {
    const deckId = await getDeck()
    this.setState({ deckId })
  }
  async componentDidUpdate() {
    if (this.state.turn === TURN_CPU) {
      if (!this.state.cpuDidPickTable) {
        this.hitCard('', PILE_CPU, PILE_TABLE)
      }
    }
  }
  async initGame() {
    this.setState({
      deckVisibility: 'visible',
      startButton: 'hidden'
    })
    await this.dealToPile(DRAW_INIT, PILE_CPU)
    await this.dealToPile(DRAW_ZERO, PILE_DISCARD)
    await this.dealToPile(DRAW_INIT, PILE_PLAYER)
    await this.dealToPile(DRAW_ZERO, PILE_TABLE)
  }
  async dealToPile(numCards, pile) {
    await drawFromDeck(this.state.deckId, numCards, pile)
    await this.listCards(pile)
  }
  async listCards(pile) {
    const cards = await getCards(this.state.deckId, pile)
    this.setState({ [pile]: cards })
  }
  async drawCard(toPile) {
    await this.dealToPile(DRAW_ONE, toPile)
  }
  checkCard(card) {
    if (this.state.tablePile.length > 0) {
      const tableCard = this.state.tablePile[this.state.tablePile.length - 1].sortName
      return checkRules(tableCard, card) 
    }
    return true
  }
  async discardTable(code, fromPile, toPile, pileRes, pileResTable) {
    let pileResDiscard = null
    const tableCards = createCardArray(this.state.tablePile)
    // add discardCard code to tableCards
    tableCards.push(code)
    // call api to draw from table pile
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/draw/?cards=${tableCards}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot draw card from ${PILE_TABLE}.`)
      }
    } catch (error) {
      throw new Error(`Cannot draw card error: ${error}.`)
    }
    // call api to add table cards to discard pile
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_DISCARD}/add/?cards=${tableCards.toString()}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot add card to ${PILE_DISCARD}.`)
      }
    } catch (error) {
      throw new Error(`Cannot add card error: ${error}.`)
    }
    // call api to list table pile
    try {
      pileResTable = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${toPile}/list/`
      )
      if (!pileResTable.data.success) {
        throw new Error(`Error: cannot list cards for ${toPile}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    // call api to list discard pile
    try {
      pileResDiscard = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_DISCARD}/list/`
      )
      if (!pileResDiscard.data.success) {
        throw new Error(`Error: cannot list cards for ${PILE_DISCARD}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    this.setState({
      [fromPile]: pileRes.data.piles[fromPile].cards,
      [toPile]: pileResTable.data.piles[toPile].cards,
      [PILE_DISCARD]: pileResDiscard.data.piles[PILE_DISCARD].cards,
      cpuDidPickTable: false
    })
  }
  async hitCard(code, fromPile, toPile) {
    let card = null
    let cardCode = code
    let deckCardCode = null
    let discardCard = null
    let pileRes = null
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
      if (cardName === '10' || cardName === '14') {
        discardCard = true
      }
      // call api to draw from fromPile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/draw/?cards=${cardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from ${fromPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot draw card error: ${error}.`)
      }
      // call api to add card to table pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${toPile}/add/?cards=${cardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${toPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot add card error: ${error}.`)
      }
      if (this.state[fromPile].length <= DRAW_INIT) {
        // call api to remove card from deck
        try {
          const pileRes = await axios.get(
            `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
          )
          if (!pileRes.data.success) {
            throw new Error(`Error: cannot draw a card from deck ${this.state.deckId}.`)
          }
          deckCardCode = pileRes.data.cards[0].code
        } catch (error) {
          throw new Error(`Cannot draw card from deck error: ${error}.`)
        }
        // call api to add card to fromPile
        try {
          const pileRes = await axios.get(
            `${API_BASE}${this.state.deckId}/pile/${fromPile}/add/?cards=${deckCardCode}`
          )
          if (!pileRes.data.success) {
            throw new Error(`Error: cannot add card to ${fromPile}.`)
          }
        } catch (error) {
          throw new Error(`Cannot add card error: ${error}.`)
        }
      }
      // call api to list table pile
      try {
        pileResTable = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${toPile}/list/`
        )
        if (!pileResTable.data.success) {
          throw new Error(`Error: cannot list cards for ${toPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
      // call api to list fromPile
      try {
        pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/list/`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot list cards for ${fromPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
      if (discardCard) {
        if (this.state.turn === TURN_CPU) {
          checkedCardsSetCpu.clear()
        }
        this.discardTable(cardCode, fromPile, toPile, pileRes, pileResTable)
      } else {
        if (this.state.turn === TURN_CPU) {
          checkedCardsSetCpu.clear()
          this.setState({
            [fromPile]: pileRes.data.piles[fromPile].cards,
            [toPile]: pileResTable.data.piles[toPile].cards,
            cpuDidPickTable: false,
            spinAmount: 1,
            spinVisibility: 'hidden',
            turn: TURN_PLAYER
          })
        }
        if (this.state.turn === TURN_PLAYER) {
          this.setState({
            [fromPile]: pileRes.data.piles[fromPile].cards,
            [toPile]: pileResTable.data.piles[toPile].cards,
            cpuDidPickTable: false,
            spinAmount: 'infinite',
            spinVisibility: 'visible',
            turn: TURN_CPU
          })
        }
      }
    } else {
      if (this.state.turn === TURN_CPU) {
        checkedCardsSetCpu.add(card)
        if (checkedCardsSetCpu.size < this.state.cpuPile.length) {
          this.hitCard('', PILE_CPU, PILE_TABLE)
        } else {
          // if all cpu cards are checked
          checkedCardsSetCpu.clear()
          this.pickFromDeck(PILE_CPU)
        }
      }
    }
  }
  async pickFromDeck(toPile) {
    let deckCard = null
    let deckCardCode = null
    let pileRes = null
    let pileResTable = null
    // call api to remove card from deck
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot pick a card from deck ${this.state.deckId}.`)
      }
      deckCard = pileRes.data.cards[0]
      deckCardCode = pileRes.data.cards[0].code
    } catch (error) {
      throw new Error(`Cannot pick a card from deck error: ${error}.`)
    }
    // call api to add card to table pile
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/add/?cards=${deckCardCode}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot add card to ${PILE_TABLE}.`)
      }
    } catch (error) {
      throw new Error(`Cannot add card for table error: ${error}.`)
    }
    // call api to list toPile
    try {
      pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${toPile}/list/`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot list cards for ${toPile}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    // call api to list table pile
    try {
      pileResTable = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/list/`
      )
      if (!pileResTable.data.success) {
        throw new Error(`Error: cannot list cards for ${PILE_TABLE}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    let namedCard = nameCard(deckCard)
    let cardName = namedCard.sortName
    const cardOk = this.checkCard(cardName)
    if (cardOk) {
      if (cardName === '10' || cardName === '14') {
        if (this.state.tablePile.length > 0) {
          this.discardTable(deckCardCode, toPile, PILE_TABLE, pileRes, pileResTable)
        }
      } else {
        if (this.state.turn === TURN_PLAYER) {
          this.setState({
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            cpuDidPickTable: false,
            spinAmount: 'infinite',
            spinVisibility: 'visible',
            turn: TURN_CPU
          })
        }
        if (this.state.turn === TURN_CPU) {
          this.setState({
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            cpuDidPickTable: false,
            spinAmount: 1,
            spinVisibility: 'hidden',
            turn: TURN_PLAYER
          })
        }
      }
    } else {
      if (this.state.turn === TURN_PLAYER) {
        this.pickTableCards(deckCardCode, PILE_PLAYER)
      }
      if (this.state.turn === TURN_CPU) {
        this.pickTableCards(deckCardCode, PILE_CPU)
      }
    }
  }
  async pickTableCards(code, toPile) {
    let pileRes = null
    let pileResTable = null
    const tableCards = createCardArray(this.state.tablePile)
    // add picked card code to tableCards
    tableCards.push(code)
    // call api to draw from table pile
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/draw/?cards=${tableCards}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot draw card from ${PILE_TABLE}.`)
      }
    } catch (error) {
      throw new Error(`Cannot draw card error: ${error}.`)
    }
    // call api to add table cards to toPile
    try {
      const pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${toPile}/add/?cards=${tableCards.toString()}`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot add card to ${toPile}.`)
      }
    } catch (error) {
      throw new Error(`Cannot add card error: ${error}.`)
    }
    // call api to list table pile
    try {
      pileResTable = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/list/`
      )
      if (!pileResTable.data.success) {
        throw new Error(`Error: cannot list cards for ${PILE_TABLE}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    // call api to list toPile
    try {
      pileRes = await axios.get(
        `${API_BASE}${this.state.deckId}/pile/${toPile}/list/`
      )
      if (!pileRes.data.success) {
        throw new Error(`Error: cannot list cards for ${toPile}.`)
      }
    } catch (error) {
      throw new Error(`Cannot list cards error: ${error}.`)
    }
    if (this.state.turn === TURN_PLAYER) {
      this.setState({
        [toPile]: pileRes.data.piles[toPile].cards,
        [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
        spinAmount: 'infinite',
        spinVisibility: 'visible',
        turn: TURN_CPU
      })
    }
    if (this.state.turn === TURN_CPU) {
      this.setState({
        [toPile]: pileRes.data.piles[toPile].cards,
        [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
        cpuDidPickTable: true,
        spinAmount: 1,
        spinVisibility: 'hidden',
        turn: TURN_PLAYER
      })
    }
  }

// tietokone
// Tyhjään pöytään lyöty kymppi on nostettava pöydästä.
// Tyhjään pöytään lyöty ässä on nostettava pöydästä, myös pakasta lyöty.
// Kakkosta ei voi kaataa.
// Tyhjään pöytään lyötyä kakkosta ei tarvitse nostaa pöydästä.
// Tyhjään pöytään lyötyä jokeria ei tarvitse nostaa pöydästä jos sen päälle voi lyödä jokerin, muussa tapauksessa tyhjään pöytään lyödyn jokerin joutuu nostamaan pöydästä.
// Kun tietokone on nostanut, vuoro vaihtuu pelaajalle.
// Jos pakasta pöytään lyöty kortti ei ole pöytään lyötäväksi kelpaava, joutuu pöydän kortit nostamaan käteen.

// pelin lopetus
// Kädessä on aina seitsemän korttia, ellei pakasta ole kortit loppuneet.

// kympillä kaato
// Kuvallista korttia K, Q, tai J, ei voi lyödä pöytään ennen kuin numerokortit on kaadettu ainakin kerran kympillä.
// Kuvakortin voi lyödä numerokortin päälle kun pöydän numerokortit on ainakin kerran kaadettu kympillä.

// muut
// disable deck until player cards are loaded

  render() {
    const playerPileSorted = sortPile(this.state.playerPile)
    const playerCards = playerPileSorted.map((c) => createCard(
      c, this.hitCard, PILE_PLAYER
    ))
    namePileCards(this.state.tablePile)
    return (
      <div>
        <Table
          initGame={this.initGame}
          pickFromDeck={this.pickFromDeck}
          pickTableCards={this.pickTableCards}
          deckVisibility={this.state.deckVisibility}
          discardPile={this.state.discardPile}
          spinAmount={this.state.spinAmount}
          spinVisibility={this.state.spinVisibility}
          startButton={this.state.startButton}
          tablePile={this.state.tablePile}
        />
        <Player playerCards={playerCards} />
      </div>
    )
  }
}

export default GameEngine
