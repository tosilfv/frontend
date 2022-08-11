export function checkRules(tableCard, card) {
  const tableValue = Number(tableCard)
  const cardValue = Number(card)
  // number cards
  if (tableValue >= 3 && tableValue <= 9) {
    if (cardValue >= 3 && cardValue <= 9) {
      if (tableValue > cardValue) {
        return `Cannot hit a smaller number card: ${card} on top of a bigger number card: ${tableCard}.`
      }
    }
    if (cardValue === 14) {
      return `Cannot hit ace: ${card} on top of a number card: ${tableCard}.`
    }
  }
  // picture cards
  if (tableValue >= 11 && tableValue <= 13) {
    if (cardValue >= 11 && cardValue <= 13) {
      if (tableValue > cardValue) {
        return `Cannot hit a smaller picture card: ${card} on top of a bigger picture card: ${tableCard}.`
      }
    }
    if (cardValue >= 3 && cardValue <= 9) {
      return `Cannot hit a number card: ${card} on top of a picture card: ${tableCard}.`
    }
    if (cardValue === 10) {
      return `Cannot hit a ten: ${card} on top of a picture card: ${tableCard}.`
    }
  }
  // twos
  if (tableValue === 2) {
    if (cardValue === 10) {
      return `Cannot hit a ten: ${card} on top a two: ${tableCard}.`
    }
    if (cardValue === 14) {
      return `Cannot hit an ace: ${card} on top a two: ${tableCard}.`
    }
  }
  if (tableValue === 10 || tableValue === 14 || tableValue === 15) {
    if (cardValue === 2) {
      return `Cannot hit a two: ${card} on top a different special card: ${tableCard}.`
    }
  }
  // tens
  if (tableValue === 10) {
    return `Cannot hit any card on top of a ten: ${tableCard}.`
  }
  if (tableValue >= 3 && tableValue <= 9) {
    // use ten to discard table pile
    if (cardValue === 10) {
      return true
    }
  }
  // aces
  if (tableValue === 14) {
    return `Cannot hit any card on top of an ace: ${tableCard}.`
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
        return `Cannot hit any other card on top of a joker, except another joker: ${tableCard}.`
      }
    }
  }
  return true
}
