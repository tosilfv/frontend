import {
  PILE_CPU,
  PILE_DISCARD,
  PILE_TABLE
} from '../constants/constants'
import {
  apiGet,
  apiResponse,
  caughtError,
  checkPile,
  createCard,
  createCardArray
} from '../helpers/helpers'

export async function addToPile(deckId, codes, fromPile, toPile) {
  try {
    await checkPile(deckId, codes, fromPile, toPile)
    const pileRes = await apiGet(deckId, codes, '', toPile, 'addToPile')
    apiResponse('hitCard pileRes', pileRes, '')
  } catch (error) {
    caughtError('addToPile', error)
  }
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
export function mapPile(pileState, hitFn, pileName) {
  if (pileName === PILE_DISCARD) {
    return pileState.map((c) => createCard(c, '', pileName))
  }
  if (pileName === PILE_TABLE) {
    return pileState.map((c) => createCard(c, '', pileName))
  }
  if (pileName === PILE_CPU) {
    return pileState.map((c) => createCard(c, hitFn, pileName))
  } else {
    const pileSorted = sortPile(pileState)
    return pileSorted.map((c) => createCard(c, hitFn, pileName))
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
export function sortPile(pile) {
  const pileWillSort = namePileCards(pile)
  return pileWillSort.sort((a, b) => Number(a.sortName) - Number(b.sortName))
}
