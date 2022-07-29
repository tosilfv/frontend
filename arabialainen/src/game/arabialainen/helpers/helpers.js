import React from 'react'
import axios from 'axios'
import Card from '../components/Card'
import {
  API_BASE,
  DECK_COUNT,
  JOKERS_ENABLED,
  PILE_TABLE
} from '../constants/constants'

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
export function createCard(c, hitFn, pileName) {
  return (
    <Card
      key={c.code}
      code={c.code}
      hitCard={hitFn}
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
export async function removeFromPile(deckId, codes, fromPile) {
  try {
    const pileRes = await apiGet(deckId, codes, '', fromPile, 'removeFromPile')
    apiResponse('removeFromPile', pileRes, '')
  } catch (error) {
    caughtError('removeFromPile', error)
  }
}