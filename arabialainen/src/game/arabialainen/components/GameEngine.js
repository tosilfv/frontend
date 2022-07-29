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
import Table from './Table'
import '../styles/theme/light/Cpu.css'
import '../styles/theme/light/Player.css'
import '../styles/theme/light/Table.css'
import Card from './Card'
import axios from 'axios'

class GameEngine extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cpuPile: [],
      deckId: null,
      discardPile: [],
      playerPile: [],
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
    console.log('componentDidUpdate: ', this.state.turn)
    if (this.state.turn === 'cpu') {
      console.log('hello1')
      // 9. kutsu tietokoneen lyöntifunktiota
      this.hitCpuCard()
    }
  }
  async drawCard(toPile) {
    await this.dealToPile(DRAW_ONE, toPile)
  }
  async hitCpuCard() {
    // 0. tarkista, että on tietokoneen vuoro
    console.log('hitCpuCard: ', this.state.turn)
    if (this.state.turn === 'cpu') {
      console.log('hello2')
      let deckCardCode = null
      let pileResCpu = null
      let pileResTable = null
      // 1. tietokone valitsee oman korttinsa
      let randNum = Math.floor(Math.random() * this.state.cpuPile.length)
      let cpuCardCode = this.state.cpuPile[randNum].code
      console.log('this.state.cpuPile: ', this.state.cpuPile)
      // 2. poista kortti tietokoneen pinosta
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
      // 3. lisää kortti pöydän pinoon
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
      // 4. poista kortti pakasta
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from deck ${this.state.deckId} for cpu.`)
        }
        // tallenna kortin koodi
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot draw card from deck for cpu error: ${error}.`)
      }
      // 5. lisää kortti tietokoneen pinoon
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
      // 6. listaa näkyville pöydän kortit
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
      // 7. listaa tietokoneen kortit
      try {
        pileResCpu = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/list/`
        )
        if (!pileResCpu.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_CPU}.`)
        }
        // 8. vaihda vuoro pelaajalle
        // aseta uusi tietokoneen korttien tila
        // aseta uusi pöydän korttien tila
        this.setState({
          turn: 'player',
          [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
          [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards
        })
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
    }
  }
  async hitPlayerCard(code, fromPile, toPile) {
    // 0. tarkista, että on pelaajan vuoro
    if (this.state.turn === 'player') {
      let deckCardCode = null
      let pileResPlayer = null
      let pileResTable = null
      // 2. poista kortti pelaajan pinosta
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
      // 3. lisää kortti pöydän pinoon
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
      // 4. poista kortti pakasta
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot draw card from deck ${this.state.deckId} for player.`)
        }
        // tallenna kortin koodi
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot draw card from deck for player error: ${error}.`)
      }
      // 5. lisää kortti pelaajan pinoon
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
      // 6. listaa näkyville pöydän kortit
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
      // 7. listaa näkyville pelaajan kortit
      try {
        pileResPlayer = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${fromPile}/list/`
        )
        if (!pileResPlayer.data.success) {
          throw new Error(`Error: cannot list cards for ${fromPile}.`)
        }
        // 8. vaihda vuoro tietokoneelle
        // aseta uusi pelaajan korttien tila
        // aseta uusi pöydän korttien tila
        this.setState({
          turn: 'cpu',
          [fromPile]: pileResPlayer.data.piles[fromPile].cards,
          [toPile]: pileResTable.data.piles[toPile].cards
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
    // 1. pelaaja klikkaa omaa korttiaan
    // järjestä pelaajan kortit
    const pileSorted = sortPile(this.state.playerPile)
    const playerCards = pileSorted.map((c) => (
      <Card
        key={c.code}
        code={c.code}
        hitCard={this.hitPlayerCard}
        image={c.image}
        name={`${c.value} of ${c.suit}`}
        pile={PILE_PLAYER}
        suit={c.suit}
        value={c.value}
      />))
    console.log(this.state.turn)
    return (
      <div>
        <Table
          initGame={this.initGame}
          mapPile={mapPile}
          startButton={this.state.startButton}
          tablePile={this.state.tablePile}
        />
        <div className="Player">
          {playerCards}
        </div>
      </div>
    )
  }
}

export default GameEngine
