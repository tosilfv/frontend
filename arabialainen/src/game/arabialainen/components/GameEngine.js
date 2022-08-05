import React, { Component } from 'react'
import {
  drawFromDeck,
  getCards,
  getDeck,
  mapPile,
  nameCard,
  namePileCards,
  sortPile,
} from '../logic/logic'
import {
  createCard,
  createCardArray
} from '../helpers/helpers'
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
      // name cpu card
      // let namedCard = nameCard(this.state.cpuPile[randNum])
      // let cpuCardName = namedCard.sortName
      // check cpu card
      // if (!this.checkCard(cpuCardName)) {
      // console.log('cannot hit cpu card: ', cpuCardName)
      // }
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
            [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            spinAmount: 1,
            spinVisibility: 'hidden',
            turn: 'player'
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
      let pileResDiscard = null
      let pileResPlayer = null
      let pileResTable = null
      let clickedCard = this.state.playerPile.find(c => c.code === code)
      // name player card
      let namedCard = nameCard(clickedCard)
      let playerCardName = namedCard.sortName
      // check player card
      const discardCard = this.checkCard(playerCardName)
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
        // discardCard && add table pile to discard pile
        if (discardCard) {
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
          // set state for player, table and discard pile
          this.setState({
            [fromPile]: pileResPlayer.data.piles[fromPile].cards,
            [toPile]: pileResTable.data.piles[toPile].cards,
            [PILE_DISCARD]: pileResDiscard.data.piles[PILE_DISCARD].cards
          })
          // call api to add card to table pile
          // try {
          //   const pileRes = await axios.get(
          //     `${API_BASE}${this.state.deckId}/pile/${toPile}/add/?cards=${code}`
          //   )
          //   if (!pileRes.data.success) {
          //     throw new Error(`Error: cannot add card to ${toPile}.`)
          //   }
          // } catch (error) {
          //   throw new Error(`Cannot add card error: ${error}.`)
          // }
        } else {
          // change turn to cpu
          // set state for player and table
          this.setState({
            [fromPile]: pileResPlayer.data.piles[fromPile].cards,
            [toPile]: pileResTable.data.piles[toPile].cards,
            spinAmount: 'infinite',
            spinVisibility: 'visible',
            turn: 'cpu'
          })
        }
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
    // 1.1 tarkista pelaajan kortti
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
    // 1.1 tarkista tietokoneen kortti
  // 2. poista kortti tietokoneen pinosta
  // 3. lisää kortti pöydän pinoon
  // 4. poista kortti pakasta
  // 5. lisää kortti tietokoneen pinoon
  // 6. listaa näkyville pöydän kortit
  // 7. listaa tietokoneen kortit
  // 8. vaihda vuoro pelaajalle

  checkCard(card) {
    if (this.state.tablePile.length > 0) {
      const tableCard = this.state.tablePile[this.state.tablePile.length - 1].sortName
      const canHit = this.checkRules(tableCard, card)
      return canHit
    }
  }

  checkRules(tableCard, card) {
    const tableValue = Number(tableCard)
    const cardValue = Number(card)
    // number cards
    // if (tableValue >= 3 && tableValue <= 9) {
    //   if (cardValue >= 3 && cardValue <= 9) {
    //     if (tableValue > cardValue) {
    //       throw new Error(`Cannot hit a smaller number card: ${card} on top of a bigger number card: ${tableCard}.`)
    //     }
    //   }
    // }
    // picture cards
    // if (tableValue >= 11 && tableValue <= 13) {
    //   if (cardValue >= 11 && cardValue <= 13) {
    //     if (tableValue > cardValue) {
    //       throw new Error(`Cannot hit a smaller picture card: ${card} on top of a bigger picture card: ${tableCard}.`)
    //     }
    //   }
    //   if (cardValue >= 3 && cardValue <= 9) {
    //     throw new Error(`Cannot hit a number card: ${card} on top of a picture card: ${tableCard}.`)
    //   }
    // }
    // twos
    // if (tableValue === 2) {
    //   if (cardValue === 10) {
    //     throw new Error(`Cannot hit a ten: ${card} on top a two: ${tableCard}.`)
    //   }
    //   if (cardValue === 14) {
    //     throw new Error(`Cannot hit an ace: ${card} on top a two: ${tableCard}.`)
    //   }
    // }
    // if (tableValue === 10 || tableValue === 14 || tableValue === 15) {
    //   if (cardValue === 2) {
    //     throw new Error(`Cannot hit a two: ${card} on top a different special card: ${tableCard}.`)
    //   }
    // }
    // tens
    // if (tableValue === 10) {
    //   throw new Error(`Cannot hit any card on top of a ten: ${tableCard}.`)
    // }
    if (tableValue >= 3 && tableValue <= 9) {
      // use ten to discard table pile
      if (cardValue === 10) {
        return true
      }
    }
    // aces
    // if (tableValue === 14) {
    //   throw new Error(`Cannot hit any card on top of an ace: ${tableCard}.`)
    // }
    if (tableValue >= 11 && tableValue <= 13) {
      // use ace to discard table pile
      if (cardValue === 14) {
        return true
      }
    }
    

    // jokers
    // if (tableValue === 15) {
    //   if (cardValue !== 15) {
    //     if (tableValue > cardValue) {
    //       throw new Error(`Cannot hit any other card on top of a joker, except another joker: ${tableCard}.`)
    //     }
    //   }
    // }

    // kaato ässällä
    // nosto pöydästä
    // nosto pakasta

    // tens
      // Tyhjään pöytään lyöty kymppi on nostettava pöydästä.
      // Kuvallista korttia K, Q, tai J, ei voi lyödä pöytään ennen kuin numerokortit on kaadettu ainakin kerran kympillä.
    // aces
      // Tyhjään pöytään lyöty ässä on nostettava pöydästä.
    // number cards
      // Kuvakortin voi lyödä numerokortin päälle kun pöydän numerokortit on ainakin kerran kaadettu kympillä.
    // 2
      // Kakkosta ei voi kaataa.
      // Tyhjään pöytään lyötyä kakkosta ei tarvitse nostaa pöydästä.
    // joker
      // Jokeria ei voi kaataa.
      // Tyhjään pöytään lyötyä jokeria ei tarvitse nostaa pöydästä jos sen päälle voi lyödä jokerin, muussa tapauksessa tyhjään pöytään lyödyn jokerin joutuu nostamaan pöydästä.
    // other
      // pick table cards to hand
        // Kun pelaaja on nostanut, vuoro vaihtuu tietokoneelle. Kun tietokone on nostanut, vuoro vaihtuu pelaajalle.
      // discard cards
        // Jos pelaaja tai tietokone on kaatanut pöydän kortit kympillä tai ässällä, vuoro ei vaihdu.
      // try a card from top of the deck
        // Pakan päällimmäisen kortin voi lyödä omalla vuorollaan pöytään jos pakassa on kortteja jäljellä. Jos pakasta pöytään lyöty kortti ei ole pöytään lyötäväksi kelpaava, joutuu pöydän kortit nostamaan käteen.
    // table
      // Jos kädessä tai pakan päällä ei ole pöytään lyötäväksi kelpaavaa korttia, joutuu pöydän kortit nostamaan käteen.
  }

  render() {
    // player clicked a player card
    // sort player pile
    const pileSorted = sortPile(this.state.playerPile)
    const playerCards = pileSorted.map((c) => createCard(
      c, this.hitPlayerCard, PILE_PLAYER
    ))
    // name table pile cards
    namePileCards(this.state.tablePile)
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
          </div>
          <div className='Discard'>
            {mapPile(this.state.discardPile, '', PILE_DISCARD)}
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
