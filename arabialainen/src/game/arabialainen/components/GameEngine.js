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
      turn: 'player'
    }
    this.hitPlayerCard = this.hitPlayerCard.bind(this)
    this.initGame = this.initGame.bind(this)
    this.pickFromDeck = this.pickFromDeck.bind(this)
    this.pickTableCards = this.pickTableCards.bind(this)
  }
  async componentDidMount() {
    const deckId = await getDeck()
    this.setState({ deckId })
  }
  async componentDidUpdate() {
    if (this.state.turn === 'cpu') {
      if (!this.state.cpuDidPickTable) {
        this.hitCpuCard()
      }
    }
  }
  async drawCard(toPile) {
    await this.dealToPile(DRAW_ONE, toPile)
  }
  async hitCpuCard() {
    if (this.state.turn === 'cpu') {
      let deckCardCode = null
      let discardCard = null
      let pileResCpu = null
      let pileResTable = null
      let randNum = Math.floor(Math.random() * this.state.cpuPile.length)
      let cpuCard = this.state.cpuPile[randNum]
      let cpuCardCode = cpuCard.code
      // name cpu card
      let namedCard = nameCard(cpuCard)
      let cpuCardName = namedCard.sortName
      // check cpu card
      const cardOk = this.checkCard(cpuCardName)
      if (cardOk) {
        if (cpuCardName === '10' || cpuCardName === '14') {
          discardCard = true
        }
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
        if (this.state.cpuPile.length <= DRAW_INIT) {
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
        } catch (error) {
          throw new Error(`Cannot list cards error: ${error}.`)
        }
        // discardCard && add table pile to discard pile
        if (discardCard) {
          checkedCardsSetCpu.clear()
          this.discardTableCpu(cpuCardCode, PILE_CPU, PILE_TABLE, pileResCpu, pileResTable)
        } else {
          // set state for cpu and table
          // this.setState({
          //   [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
          //   [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
          //   cpuDidPickTable: false
          // })
          checkedCardsSetCpu.clear()
          // change turn to player
          this.setState({
            [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            cpuDidPickTable: false,
            spinAmount: 1,
            spinVisibility: 'hidden',
            turn: 'player'
          })
        }
      } else {
        checkedCardsSetCpu.add(cpuCard)
        if (checkedCardsSetCpu.size < this.state.cpuPile.length) {
          this.hitCpuCard()
        } else {
          // if all cpu cards are checked
          checkedCardsSetCpu.clear()
          this.pickFromDeckCpu()
        }
      }
    }
    // if (this.state.turn === 'cpu') {
    //   let deckCardCode = null
    //   let pileResCpu = null
    //   let pileResTable = null
    //   // select random card from cpu pile
    //   let randNum = Math.floor(Math.random() * this.state.cpuPile.length)
    //   let cpuCardCode = this.state.cpuPile[randNum].code
    //   // name cpu card
    //   // let namedCard = nameCard(this.state.cpuPile[randNum])
    //   // let cpuCardName = namedCard.sortName
    //   // check cpu card
    //   // if (!this.checkCard(cpuCardName)) {
    //   // console.log('cannot hit cpu card: ', cpuCardName)
    //   // }
    //   // call api to draw from cpu pile
    //   try {
    //     const pileRes = await axios.get(
    //       `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/draw/?cards=${cpuCardCode}`
    //     )
    //     if (!pileRes.data.success) {
    //       throw new Error(`Error: cannot draw card from ${PILE_CPU}.`)
    //     }
    //   } catch (error) {
    //     throw new Error(`Cannot draw card error: ${error}.`)
    //   }
    //   // call api to add card to table pile
    //   try {
    //     const pileRes = await axios.get(
    //       `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/add/?cards=${cpuCardCode}`
    //     )
    //     if (!pileRes.data.success) {
    //       throw new Error(`Error: cannot add card to ${PILE_TABLE}.`)
    //     }
    //   } catch (error) {
    //     throw new Error(`Cannot add card error: ${error}.`)
    //   }
    //   // call api to remove card from deck
    //   try {
    //     const pileRes = await axios.get(
    //       `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
    //     )
    //     if (!pileRes.data.success) {
    //       throw new Error(`Error: cannot draw card from deck ${this.state.deckId} for cpu.`)
    //     }
    //     // save card code
    //     deckCardCode = pileRes.data.cards[0].code
    //   } catch (error) {
    //     throw new Error(`Cannot draw card from deck for cpu error: ${error}.`)
    //   }
    //   // call api to add card to cpu pile
    //   try {
    //     const pileRes = await axios.get(
    //       `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/add/?cards=${deckCardCode}`
    //     )
    //     if (!pileRes.data.success) {
    //       throw new Error(`Error: cannot add card to ${PILE_CPU}.`)
    //     }
    //   } catch (error) {
    //     throw new Error(`Cannot add card for cpu error: ${error}.`)
    //   }
    //   // call api to list table pile
    //   try {
    //     pileResTable = await axios.get(
    //       `${API_BASE}${this.state.deckId}/pile/${PILE_TABLE}/list/`
    //     )
    //     if (!pileResTable.data.success) {
    //       throw new Error(`Error: cannot list cards for ${PILE_TABLE}.`)
    //     }
    //   } catch (error) {
    //     throw new Error(`Cannot list cards error: ${error}.`)
    //   }
    //   // call api to list cpu pile
    //   try {
    //     pileResCpu = await axios.get(
    //       `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/list/`
    //     )
    //     if (!pileResCpu.data.success) {
    //       throw new Error(`Error: cannot list cards for ${PILE_CPU}.`)
    //     }
    //     // change turn to player
    //     // set state for cpu and table
    //     // set spinloader timeout from 100 to 3000 ms
    //     let randNum = Math.floor(Math.random() * 31) * 100 // ms
    //     setTimeout(() => {
    //       this.setState({
    //         [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
    //         [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
    //         spinAmount: 1,
    //         spinVisibility: 'hidden',
    //         turn: 'player'
    //       })
    //     }, randNum);
    //   } catch (error) {
    //     throw new Error(`Cannot list cards error: ${error}.`)
    //   }
    // }
  }
  async hitPlayerCard(code, fromPile, toPile) {
    if (this.state.turn === 'player') {
      let deckCardCode = null
      let discardCard = null
      let pileResPlayer = null
      let pileResTable = null
      let clickedCard = this.state.playerPile.find(c => c.code === code)
      // name player card
      let namedCard = nameCard(clickedCard)
      let playerCardName = namedCard.sortName
      // check player card
      const cardOk = this.checkCard(playerCardName)
      if (cardOk) {
        if (playerCardName === '10' || playerCardName === '14') {
          discardCard = true
        }
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
        if (this.state.playerPile.length <= DRAW_INIT) {
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
            [fromPile]: pileResPlayer.data.piles[fromPile].cards,
            [toPile]: pileResTable.data.piles[toPile].cards
          })
        } catch (error) {
          throw new Error(`Cannot list cards error: ${error}.`)
        }
        // discardCard && add table pile to discard pile
        if (discardCard) {
          this.discardTable(code, fromPile, toPile, pileResPlayer, pileResTable)
        } else {
          this.setState({
            cpuDidPickTable: false,
            spinAmount: 'infinite',
            spinVisibility: 'visible',
            turn: 'cpu'
          })
        }
      }
    }
  }
  async discardTable(code, fromPile, toPile, pileResPlayer, pileResTable) {
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
    // set state for player, table and discard pile
    this.setState({
      [fromPile]: pileResPlayer.data.piles[fromPile].cards,
      [toPile]: pileResTable.data.piles[toPile].cards,
      [PILE_DISCARD]: pileResDiscard.data.piles[PILE_DISCARD].cards
    })
  }
  async discardTableCpu(code, fromPile, toPile, pileResCpu, pileResTable) {
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
    // set state for cpu, table and discard pile
    this.setState({
      [fromPile]: pileResCpu.data.piles[fromPile].cards,
      [toPile]: pileResTable.data.piles[toPile].cards,
      [PILE_DISCARD]: pileResDiscard.data.piles[PILE_DISCARD].cards,
      cpuDidPickTable: false
    })
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

  // helpers
  async dealToPile(numCards, pile) {
    await drawFromDeck(this.state.deckId, numCards, pile)
    await this.listCards(pile)
  }
  async listCards(pile) {
    const cards = await getCards(this.state.deckId, pile)
    this.setState({ [pile]: cards })
  }
  async pickTableCardsCpu(code) {
    if (this.state.turn === 'cpu') {
      let pileResCpu = null
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
      // call api to add table cards to cpu pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/add/?cards=${tableCards.toString()}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${PILE_CPU}.`)
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
      // call api to list cpu pile
      try {
        pileResCpu = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/list/`
        )
        if (!pileResCpu.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_CPU}.`)
        }
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
      // set state for cpu and table pile
      // set spinloader timeout from 100 to 3000 ms
      // let randNum = Math.floor(Math.random() * 31) * 100 // ms
      // setTimeout(() => {
        this.setState({
          [PILE_CPU]: pileResCpu.data.piles[PILE_CPU].cards,
          [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
          cpuDidPickTable: true,
          spinAmount: 1,
          spinVisibility: 'hidden',
          turn: 'player'
        })
      // }, randNum);
    }
  }
  async pickTableCards(code) {
    if (this.state.turn === 'player') {
      let pileResPlayer = null
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
      // call api to add table cards to player pile
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_PLAYER}/add/?cards=${tableCards.toString()}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot add card to ${PILE_PLAYER}.`)
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
      // call api to list player pile
      try {
        pileResPlayer = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_PLAYER}/list/`
        )
        if (!pileResPlayer.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_PLAYER}.`)
        }
      } catch (error) {
        throw new Error(`Cannot list cards error: ${error}.`)
      }
      // set state for player and table pile
      this.setState({
        [PILE_PLAYER]: pileResPlayer.data.piles[PILE_PLAYER].cards,
        [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
        spinAmount: 'infinite',
        spinVisibility: 'visible',
        turn: 'cpu'
      })
    }
  }
  async pickFromDeckCpu() {
    if (this.state.turn === 'cpu') {
      let deckCard = null
      let deckCardCode = null
      let pileResCpu = null
      let pileResTable = null
      // call api to remove card from deck
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot pick a card from deck ${this.state.deckId} for cpu.`)
        }
        // save card
        deckCard = pileRes.data.cards[0]
        // save card code
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot pick a card from deck for cpu error: ${error}.`)
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
      // call api to list cpu pile
      try {
        pileResCpu = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_CPU}/list/`
        )
        if (!pileResCpu.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_CPU}.`)
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
      // name cpu card
      let namedCard = nameCard(deckCard)
      let cpuCardName = namedCard.sortName
      const cardOk = this.checkCard(cpuCardName)
      if (cardOk) {
        if (cpuCardName === '10' || cpuCardName === '14') {
          if (this.state.tablePile.length > 0) {
            // discardCard && add table pile to discard pile
            this.discardTable(deckCardCode, PILE_CPU, PILE_TABLE, pileResCpu, pileResTable)
          } else {
            this.setState({
              [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
              cpuDidPickTable: false,
              spinAmount: 1,
              spinVisibility: 'hidden',
              turn: 'player'
            })
          }
        } else {
          this.setState({
            [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards,
            cpuDidPickTable: false,
            spinAmount: 1,
            spinVisibility: 'hidden',
            turn: 'player'
          })
        }
      } else {
        this.pickTableCardsCpu(deckCardCode)
      }
      // set state for table pile
      // this.setState({
      //   [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards
      // })
    }
  }
  async pickFromDeck() {
    if (this.state.turn === 'player') {
      let deckCard = null
      let deckCardCode = null
      let pileResPlayer = null
      let pileResTable = null
      // call api to remove card from deck
      try {
        const pileRes = await axios.get(
          `${API_BASE}${this.state.deckId}/draw/?count=${DRAW_ONE}`
        )
        if (!pileRes.data.success) {
          throw new Error(`Error: cannot pick a card from deck ${this.state.deckId} for player.`)
        }
        // save card
        deckCard = pileRes.data.cards[0]
        // save card code
        deckCardCode = pileRes.data.cards[0].code
      } catch (error) {
        throw new Error(`Cannot pick a card from deck for player error: ${error}.`)
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
      // call api to list player pile
      try {
        pileResPlayer = await axios.get(
          `${API_BASE}${this.state.deckId}/pile/${PILE_PLAYER}/list/`
        )
        if (!pileResPlayer.data.success) {
          throw new Error(`Error: cannot list cards for ${PILE_PLAYER}.`)
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
      // set state for table pile
      this.setState({
        [PILE_TABLE]: pileResTable.data.piles[PILE_TABLE].cards
      })
      // name player card
      let namedCard = nameCard(deckCard)
      let playerCardName = namedCard.sortName
      const cardOk = this.checkCard(playerCardName)
      if (cardOk) {
        if (playerCardName === '10' || playerCardName === '14') {
          if (this.state.tablePile.length > 0) {
            // discardCard && add table pile to discard pile
            this.discardTable(deckCardCode, PILE_PLAYER, PILE_TABLE, pileResPlayer, pileResTable)
          } else {
            this.setState({
              cpuDidPickTable: false,
              spinAmount: 'infinite',
              spinVisibility: 'visible',
              turn: 'cpu'
            })
          }
        } else {
          this.setState({
            cpuDidPickTable: false,
            spinAmount: 'infinite',
            spinVisibility: 'visible',
            turn: 'cpu'
          })
        }
      } else {
        this.pickTableCards(deckCardCode)
      }
    }
  }
  checkCard(card) {
    if (this.state.tablePile.length > 0) {
      const tableCard = this.state.tablePile[this.state.tablePile.length - 1].sortName
      return this.checkRules(tableCard, card) 
    }
    return true
  }
  checkRules(tableCard, card) {
    const tableValue = Number(tableCard)
    const cardValue = Number(card)
    // number cards
    if (tableValue >= 3 && tableValue <= 9) {
      if (cardValue >= 3 && cardValue <= 9) {
        if (tableValue > cardValue) {
          console.log(`Cannot hit a smaller number card: ${card} on top of a bigger number card: ${tableCard}.`)
          return false
        }
      }
      if (cardValue === 14) {
        console.log(`Cannot hit ace: ${card} on top of a number card: ${tableCard}.`)
        return false
      }
    }
    // picture cards
    if (tableValue >= 11 && tableValue <= 13) {
      if (cardValue >= 11 && cardValue <= 13) {
        if (tableValue > cardValue) {
          console.log(`Cannot hit a smaller picture card: ${card} on top of a bigger picture card: ${tableCard}.`)
          return false
        }
      }
      if (cardValue >= 3 && cardValue <= 9) {
        console.log(`Cannot hit a number card: ${card} on top of a picture card: ${tableCard}.`)
        return false
      }
      if (cardValue === 10) {
        console.log(`Cannot hit a ten: ${card} on top of a picture card: ${tableCard}.`)
        return false
      }
    }
    // twos
    if (tableValue === 2) {
      if (cardValue === 10) {
        console.log(`Cannot hit a ten: ${card} on top a two: ${tableCard}.`)
        return false
      }
      if (cardValue === 14) {
        console.log(`Cannot hit an ace: ${card} on top a two: ${tableCard}.`)
        return false
      }
    }
    if (tableValue === 10 || tableValue === 14 || tableValue === 15) {
      if (cardValue === 2) {
        console.log(`Cannot hit a two: ${card} on top a different special card: ${tableCard}.`)
        return false
      }
    }
    // tens
    if (tableValue === 10) {
      console.log(`Cannot hit any card on top of a ten: ${tableCard}.`)
      return false
    }
    if (tableValue >= 3 && tableValue <= 9) {
      // use ten to discard table pile
      if (cardValue === 10) {
        return true
      }
    }
    // aces
    if (tableValue === 14) {
      console.log(`Cannot hit any card on top of an ace: ${tableCard}.`)
      return false
    }
    if (tableValue >= 11 && tableValue <= 13) {
      // use ace to discard table pile
      if (cardValue === 14) {
        return true
      }
    }
    // jokers
    if (tableValue === 15) {
      if (cardValue !== 15) {
        if (tableValue > cardValue) {
          console.log(`Cannot hit any other card on top of a joker, except another joker: ${tableCard}.`)
          return false
        }
      }
    }
    return true
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
              <div className="Deck"
                style={{ visibility: this.state.deckVisibility }}
                >
                  arabialainen
              </div>
              <div className="Deck-pick"
                onClick={this.pickFromDeck}
                style={{ visibility: this.state.deckVisibility }}
                >
                  arabialainen
              </div>
            </div>
          </div>
          <div className='Discard'>
            {mapPile(this.state.discardPile, '', PILE_DISCARD)}
          </div>
          <div className="Table-playfield">
            {mapPile(this.state.tablePile, this.pickTableCards, PILE_TABLE)}
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
