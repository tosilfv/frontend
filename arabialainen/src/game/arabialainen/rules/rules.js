export function checkRules(tableCard, card) {
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
