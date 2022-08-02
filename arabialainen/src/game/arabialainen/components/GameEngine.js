import React, { Component } from 'react'
import {
  drawFromDeck,
  getCards,
  getDeck,
  mapPile,
  sortPile,
} from '../logic/logic'
import {
  API_BASE,
  DRAW_INIT,
  DRAW_ONE,
  DRAW_ZERO,
  PILE_CPU,
  PILE_DISCARD,
  PILE_PLAYER,
  PILE_TABLE,
} from '../constants/constants'
import '../styles/theme/light/Cpu.css'
import '../styles/theme/light/Deck.css'
import '../styles/theme/light/Discard.css'
import '../styles/theme/light/Player.css'
import '../styles/theme/light/Table.css'
import axios from 'axios'
import { createCard } from '../helpers/helpers'

class GameEngine extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cpuPile: [],
      deckId: null,
      discardPile: [],
      playerPile: [],
      spinAmount: 1,
      spinVisibility: 'hidden',
      startButton: 'visible',
      tablePile: [],
      turn: 'player'
    }
    this.hitPlayerCard = this.hitPlayerCard.bind(this)
    this.initGame = this.initGame.bind(this)
  }
  async componentDidMount() {
    const deckId = await getDeck()
    this.setState({ deckId })
  }
  async componentDidUpdate() {
    if (this.state.turn === 'cpu') {
      this.hitCpuCard()
    }
  }
  async drawCard(toPile) {
    await this.dealToPile(DRAW_ONE, toPile)
  }
  async hitCpuCard() {
    if (this.state.turn === 'cpu') {
      let deckCardCode = null
      let pileResCpu = null
      let pileResTable = null
      // select random card from cpu pile
      let randNum = Math.floor(Math.random() * this.state.cpuPile.length)
      let cpuCardCode = this.state.cpuPile[randNum].code
      // call api to draw from cpu pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/draw/?cards=${cpuCardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from ${PILE_CPU}.`)
        }
      } catch (error) {
        throw new Error(`Cannot draw card error: ${error}.`)
      }
      // call api to add card to table pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/add/?cards=${cpuCardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${PILE_TABLE}.`)
        }
      } catch (error) {
        throw new Error(`Cannot add card error: ${error}.`)
      }
      // call api to remove card from deck
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from deck ${this.state.deckId} for cpu.`)
        }
        // save card code
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot draw card from deck for cpu error: ${error}.`)
      }
      // call api to add card to cpu pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/add/?cards=${deckCardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${PILE_CPU}.`)
        }
      } catch (error) {
        throw new Error(`Cannot add card for cpu error: ${error}.`)
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
      // call api to list cpu pile
      try {
        pileResCpu = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/list/`
        )
        if (!pileResCpu.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_CPU}.`)
        }
        // change turn to player
        // set state for cpu and table
        // set spinloader timeout from 100 to 3000 ms
        let randNum = Math.floor(Math.random() * 31) * 100 // ms
        setTimeout(() => {
          this.setState({
            turn: 'player',
            [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            spinAmount: 1,
            spinVisibility: 'hidden'
          })
        }, randNum);
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
    }
  }
  async hitPlayerCard(code, fromPile, toPile) {
    if (this.state.turn === 'player') {
      let deckCardCode = null
      let pileResPlayer = null
      let pileResTable = null
      // call api to draw from player pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/draw/?cards=${code}`
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
          `${API_BASE}${this.state.deckId}/pile/${toPile}/add/?cards=${code}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${toPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot add card error: ${error}.`)
      }
      // call api to remove card from deck
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from deck ${this.state.deckId} for player.`)
        }
        // save card code
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot draw card from deck for player error: ${error}.`)
      }
      // call api to add card to player pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/add/?cards=${deckCardCode}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${fromPile}.`)
        }
      } catch (error) {
        throw new Error(`Cannot add card for player error: ${error}.`)
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
      // call api to list player pile
      try {
        pileResPlayer = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/list/`
        )
        if (!pileResPlayer.data.success) {
          throw new Error(`Error: cannot list cards for ${fromPile}.`)
        }
        // change turn to cpu
        // set state for player and table
        this.setState({
          turn: 'cpu',
          [fromPile]: pileResPlayer.data.piles[fromPile].cards,
          [toPile]: pileResTable.data.piles[toPile].cards,
          spinAmount: 'infinite',
          spinVisibility: 'visible'
        })
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
    }
  }
  async initGame() {
    this.setState({ startButton: 'hidden' })
    await this.dealToPile(DRAW_INIT, PILE_CPU)
    await this.dealToPile(DRAW_ZERO, PILE_DISCARD)
    await this.dealToPile(DRAW_INIT, PILE_PLAYER)
    await this.dealToPile(DRAW_ZERO, PILE_TABLE)
  }

  // helpers
  async dealToPile(numCards, pile) {
    await drawFromDeck(this.state.deckId, numCards, pile)
    await this.listCards(pile)
  }
  async listCards(pile) {
    const cards = await getCards(this.state.deckId, pile)
    this.setState({ [pile]: cards })
  }

  // 0. tarkista, että on pelaajan vuoro
  // 1. pelaaja klikkaa omaa korttiaan
  // 2. poista kortti pelaajan pinosta
  // 3. lisää kortti pöydän pinoon
  // 4. poista kortti pakasta
  // 5. lisää kortti pelaajan pinoon
  // 6. listaa näkyville pöydän kortit
  // 7. listaa näkyville pelaajan kortit
  // 8. vaihda vuoro tietokoneelle
  // 9. kutsu tietokoneen lyöntifunktiota

  // 0. tarkista, että on tietokoneen vuoro
  // 1. tietokone valitsee oman korttinsa
  // 2. poista kortti tietokoneen pinosta
  // 3. lisää kortti pöydän pinoon
  // 4. poista kortti pakasta
  // 5. lisää kortti tietokoneen pinoon
  // 6. listaa näkyville pöydän kortit
  // 7. listaa tietokoneen kortit
  // 8. vaihda vuoro pelaajalle

  render() {
    // player clicked a player card
    const pileSorted = sortPile(this.state.playerPile)
    const playerCards = pileSorted.map((c) => createCard(
      c, this.hitPlayerCard, PILE_PLAYER
    ))
    return (
      <div>
        <div className="Table">
          <div className='Cpu'>
            <div className="Cpu-loader"
              style={{
                animationIterationCount: this.state.spinAmount,
                visibility: this.state.spinVisibility
              }}
            >cpu</div>
          </div>
          <div className="Table-piles">
            <div>
              <div className="Deck">arabialainen</div>
              <div className="Deck-pick">arabialainen</div>
            </div>
            <div className="Discard">arabialainen</div>
          </div>
          <div className="Table-playfield">
            {mapPile(this.state.tablePile, '', PILE_TABLE)}
            <button
              style={{ visibility: this.state.startButton }}
              onClick={this.initGame}
            >
              Start New Game
            </button>
          </div>
        </div>
        <div className="Player">
          {playerCards}
        </div>
      </div>
    )
  }
}

export default GameEngine
