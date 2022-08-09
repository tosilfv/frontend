import React from 'react'
import axios from 'axios'
import Card from '../components/Card'
import {
  API_BASE,
  DECK_COUNT,
  JOKERS_ENABLED,
  PILE_CPU,
  PILE_DISCARD,
  PILE_TABLE
} from '../constants/constants'

export async function addToPile(deckId, codes, fromPile, toPile) {
  try {
    await checkPile(deckId, codes, fromPile, toPile)
    const pileRes = await apiGet(deckId, codes, '', toPile, 'addToPile')
    apiResponse('hitCard pileRes', pileRes, '')
  } catch (error) {
    caughtError('addToPile', error)
  }
}
export async function apiGet(deckId, codes, numCards, pile, gameFn) {
  switch (gameFn) {
  case 'addToPile':
    return await axios.get(
      `${API_BASE}${deckId}/pile/${pile}/add/?cards=${codes}`
    )
  case 'drawFromDeck':
    return await axios.get(`${API_BASE}${deckId}/draw/?count=${numCards}`)
  case 'getCards':
    return await axios.get(`${API_BASE}${deckId}/pile/${pile}/list/`)
  case 'getDeck':
    return await axios.get(
      `${API_BASE}new/shuffle/?deck_count=${DECK_COUNT}
            &jokers_enabled=${JOKERS_ENABLED}`
    )
  case 'removeFromPile':
    return await axios.get(
      `${API_BASE}${deckId}/pile/${pile}/draw/?cards=${codes}`
    )
  default:
    break
  }
}
export function apiResponse(gameFn, apiRes, retVal) {
  if (!apiRes.data.success) {
    caughtError(gameFn, 'cannot get apiRes.data.success.')
  } else {
    return retVal
  }
}
export function caughtError(gameFn, error) {
  throw new Error(`${gameFn} error: ${error}`)
}
export async function checkPile(deckId, codes, fromPile, toPile) {
  if (toPile === PILE_TABLE && codes !== '') {
    await removeFromPile(deckId, codes, fromPile)
  }
}
export function createCard(c, clickFn, pileName) {
  return (
    <Card
      key={c.code}
      code={c.code}
      clickCard={clickFn}
      image={c.image}
      name={`${c.value} of ${c.suit}`}
      pile={pileName}
      suit={c.suit}
      value={c.value}
    />
  )
}
export function createCardArray(cards) {
  const pileCardArray = []
  for (let card of cards) {
    pileCardArray.push(card.code)
  }
  return pileCardArray
}
export async function drawFromDeck(deckId, numCards, toPile) {
  try {
    const pileRes = await apiGet(deckId, '', numCards, '', 'drawFromDeck')
    apiResponse('drawFromDeck pileRes', pileRes, '')
    const pileCardArray = createCardArray(pileRes.data.cards)
    return addToPile(deckId, pileCardArray.toString(), '', toPile)
  } catch (error) {
    caughtError('drawFromDeck', error)
  }
}
export async function getCards(deckId, pile) {
  try {
    const pileRes = await apiGet(deckId, '', '', pile, 'getCards')
    return apiResponse(
      'getCards pileRes',
      pileRes,
      pileRes.data.piles[pile].cards
    )
  } catch (error) {
    caughtError('getCards', error)
  }
}
export async function getDeck() {
  try {
    const deckRes = await apiGet('', '', '', '', 'getDeck')
    return apiResponse('getDeck deckRes', deckRes, deckRes.data.deck_id)
  } catch (error) {
    caughtError('getDeck', error)
  }
}
export function mapPile(pileState, clickFn, pileName) {
  if (pileName === PILE_DISCARD) {
    return pileState.map((c) => createCard(c, '', pileName))
  }
  if (pileName === PILE_TABLE) {
    return pileState.map((c) => createCard(c, clickFn, pileName))
  }
  if (pileName === PILE_CPU) {
    return pileState.map((c) => createCard(c, clickFn, pileName))
  } else {
    const pileSorted = sortPile(pileState)
    return pileSorted.map((c) => createCard(c, clickFn, pileName))
  }
}
export function nameCard(c) {
  switch (c.value) {
  case '2':
    c.sortName = '2'
    break
  case '3':
    c.sortName = '3'
    break
  case '4':
    c.sortName = '4'
    break
  case '5':
    c.sortName = '5'
    break
  case '6':
    c.sortName = '6'
    break
  case '7':
    c.sortName = '7'
    break
  case '8':
    c.sortName = '8'
    break
  case '9':
    c.sortName = '9'
    break
  case '10':
    c.sortName = '10'
    break
  case 'JACK':
    c.sortName = '11'
    break
  case 'QUEEN':
    c.sortName = '12'
    break
  case 'KING':
    c.sortName = '13'
    break
  case 'ACE':
    c.sortName = '14'
    break
  case 'JOKER':
    c.sortName = '15'
    break
  default:
    break
  }
  return c
}
export function namePileCards(pile) {
  const pileCardsNamed = [ ...pile ].map((c) => {
    nameCard(c)
    return c
  })
  return pileCardsNamed
}
export async function removeFromPile(deckId, codes, fromPile) {
  try {
    const pileRes = await apiGet(deckId, codes, '', fromPile, 'removeFromPile')
    apiResponse('removeFromPile', pileRes, '')
  } catch (error) {
    caughtError('removeFromPile', error)
  }
}
export function sortPile(pile) {
  const pileWillSort = namePileCards(pile)
  return pileWillSort.sort((a, b) => Number(a.sortName) - Number(b.sortName))
}
