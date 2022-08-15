export function checkRules(tableCardName, cardName, discardedByTen) {
  const tableValue = Number(tableCardName)
  const cardValue = Number(cardName)
  // discarded by ten
  if (cardValue >= 11 && cardValue <= 13) {
    if (!discardedByTen) {
      return `Cannot hit a court card (${cardName}) before table cards are discarded by ten (10) at least once.`
    }
  }
  // number cards
  if (tableValue >= 3 && tableValue <= 9) {
    if (cardValue >= 3 && cardValue <= 9) {
      if (tableValue > cardValue) {
        return `Cannot hit a smaller number card (${cardName}) on top of a bigger number card (${tableCardName}).`
      }
    }
    if (cardValue === 14) {
      return `Cannot hit ace (${cardName}) on top of a number card (${tableCardName}).`
    }
  }
  // court cards
  if (tableValue >= 11 && tableValue <= 13) {
    if (cardValue >= 11 && cardValue <= 13) {
      if (tableValue > cardValue) {
        return `Cannot hit a smaller court card (${cardName}) on top of a bigger court card (${tableCardName}).`
      }
    }
    if (cardValue >= 3 && cardValue <= 9) {
      return `Cannot hit a number card (${cardName}) on top of a court card (${tableCardName}).`
    }
    if (cardValue === 10) {
      return `Cannot hit a ten (${cardName}) on top of a court card (${tableCardName}).`
    }
  }
  // twos
  if (tableValue === 2) {
    if (cardValue === 10) {
      return `Cannot hit a ten (${cardName}) on top a two (${tableCardName}).`
    }
    if (cardValue === 14) {
      return `Cannot hit an ace (${cardName}) on top a two (${tableCardName}).`
    }
  }
  if (tableValue === 10 || tableValue === 14 || tableValue === 15) {
    if (cardValue === 2) {
      return `Cannot hit a two (${cardName}) on top of a special card (${tableCardName}) that is other than two.`
    }
  }
  // tens
  if (tableValue === 10) {
    return `Cannot hit any card on top of a ten (${tableCardName}).`
  }
  if (tableValue >= 3 && tableValue <= 9) {
    // use ten to discard table pile
    if (cardValue === 10) {
      return true
    }
  }
  // aces
  if (tableValue === 14) {
    return `Cannot hit any card on top of an ace (${tableCardName}).`
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
        return `Cannot hit any other card (${cardName}) on top of a joker (${tableCardName}), except another joker (${tableCardName}).`
      }
    }
  }
  return true
}
