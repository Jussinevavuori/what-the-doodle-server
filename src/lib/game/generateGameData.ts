import { DrawingState } from "../drawing/DrawingState";
import { createIndexArray } from "../functions/createIndexArray";
import { padInt } from "../functions/padInt";
import { randomInt } from "../functions/randomInt";
import { randomInts } from "../functions/randomInts";
import { rotateRight } from "../functions/rotateRight";
import { shuffle } from "../functions/shuffle";
import { TopicGenerator } from "./TopicGenerator";

/**
 * Based on the list of players, generates all cards and rounds for a gamestate
 * object and assigns the given players to those rounds.
 */
export function generateGameData(players: Player[]): {
  cards: Card[];
  rounds: Round[];
} {
  // Utility shortcut: a game with n players has n cards and n rounds
  // per cards totaling n*n rounds.
  const n = players.length;

  // Topic generator
  const topicGenerator = new TopicGenerator();

  // List all cards and rounds
  const cards: Card[] = [];
  const rounds: Round[] = [];

  // Current mapping: starts from direct x -> x mapping
  let mapping = createIndexArray(n);

  // Utility function to rotate or shuffle the mapping
  const nextMapping = (type: "rotate" | "shuffle") => {
    switch (type) {
      case "rotate": {
        mapping = rotateRight(mapping);
        break;
      }
      case "shuffle": {
        const prev = mapping;
        mapping = shuffle(mapping);

        while (prev.findIndex((v, k) => mapping[k] === v) >= 0) {
          const i = prev.findIndex((v, k) => mapping[k] === v);
          const j = randomInt(n);
          const temp = mapping[i];
          mapping[i] = mapping[j];
          mapping[j] = temp;
        }
      }
    }
  };

  // Create all cards
  for (let ci = 0; ci < n; ci++) {
    const card: Card = {
      id: `C#${padInt(ci, 2)}`,
      topic: "",
      cardNumber: ci,
      topicOptions: topicGenerator.getRandomTopics(3),
    };
    cards.push(card);

    // Create all rounds for that card
    for (let ri = 0; ri < n; ri++) {
      const round: Round = {
        id: `R#${padInt(ci, 2)}/${padInt(ri, 2)}`,
        guess: "",
        picture: new DrawingState(),
        cardId: card.id,
        drawerId: "",
        guesserId: "",
        roundNumber: ri,
        cardNumber: ci,
        topic: "",
      };
      rounds.push(round);
    }
  }

  // Assign drawers and guesses for each round
  for (let ri = 0; ri < n; ri++) {
    // Shuffle halfway if n is even and n > 2
    if (n % 2 === 0 && ri === Math.floor(n / 2) && n > 2) {
      nextMapping("shuffle");
    } else {
      nextMapping("rotate");
    }

    // Get all drawers from mapping
    for (let ci = 0; ci < n; ci++) {
      const round = rounds.find((round) => {
        return round.roundNumber === ri && round.cardNumber === ci;
      });
      if (!round) {
        continue;
      }
      const pi = mapping[ci];
      const drawer = players[pi];
      round.drawerId = drawer.id;
    }

    // Do not assign guessers for last round
    if (ri === n - 1) {
      break;
    }

    // Shuffle halfway if n is odd and n > 2
    // else rotate.
    if (n % 2 === 1 && ri === Math.floor(n / 2) && n > 2) {
      nextMapping("shuffle");
    } else {
      nextMapping("rotate");
    }

    // Get all guessers from mapping
    for (let ci = 0; ci < n; ci++) {
      const round = rounds.find((round) => {
        return round.roundNumber === ri && round.cardNumber === ci;
      });
      if (!round) {
        continue;
      }
      const pi = mapping[ci];
      const guesser = players[pi];
      round.guesserId = guesser.id;
    }
  }

  // logGameState(cards, rounds, players);

  return { cards, rounds };
}
