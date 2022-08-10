import { message } from "../helpers/helpers"

export function checkRules(tableCard, card, turn) {
  const tableValue = Number(tableCard)
  const cardValue = Number(card)
  // number cards
  if (tableValue >= 3 && tableValue <= 9) {
    if (cardValue >= 3 && cardValue <= 9) {
      if (tableValue > cardValue) {
        message(
          `Cannot hit a smaller number card: ${card} on top of a bigger number card: ${tableCard}.`,
          turn
        )
        return false
      }
    }
    if (cardValue === 14) {
      message(
        `Cannot hit ace: ${card} on top of a number card: ${tableCard}.`,
        turn
      )
      return false
    }
  }
  // picture cards
  if (tableValue >= 11 && tableValue <= 13) {
    if (cardValue >= 11 && cardValue <= 13) {
      if (tableValue > cardValue) {
        message(
          `Cannot hit a smaller picture card: ${card} on top of a bigger picture card: ${tableCard}.`,
          turn
        )
        return false
      }
    }
    if (cardValue >= 3 && cardValue <= 9) {
      message(
        `Cannot hit a number card: ${card} on top of a picture card: ${tableCard}.`,
        turn
      )
      return false
    }
    if (cardValue === 10) {
      message(
        `Cannot hit a ten: ${card} on top of a picture card: ${tableCard}.`,
        turn
      )
      return false
    }
  }
  // twos
  if (tableValue === 2) {
    if (cardValue === 10) {
      message(
        `Cannot hit a ten: ${card} on top a two: ${tableCard}.`,
        turn
      )
      return false
    }
    if (cardValue === 14) {
      message(
        `Cannot hit an ace: ${card} on top a two: ${tableCard}.`,
        turn
      )
      return false
    }
  }
  if (tableValue === 10 || tableValue === 14 || tableValue === 15) {
    if (cardValue === 2) {
      message(
        `Cannot hit a two: ${card} on top a different special card: ${tableCard}.`,
        turn
      )
      return false
    }
  }
  // tens
  if (tableValue === 10) {
    message(
      `Cannot hit any card on top of a ten: ${tableCard}.`,
      turn
    )
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
    message(
      `Cannot hit any card on top of an ace: ${tableCard}.`,
      turn
    )
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
        message(
          `Cannot hit any other card on top of a joker, except another joker: ${tableCard}.`,
          turn
        )
        return false
      }
    }
  }
  return true
}
