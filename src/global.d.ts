type Player = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
};

/**
 * Describes a single round where a picture is drawn and then guessed by the
 * specified players. All rounds belong to a single card.
 */
type Round = {
  id: string;
  cardId: string;
  topic: string;
  picture: import("./lib/drawing/DrawingState").DrawingState;
  guess: string;
  drawerId: string;
  guesserId: string;
  roundNumber: number;
  cardNumber: number;
};

/**
 * A single card consists of an initial topic and multiple rounds which are
 * player alternating between drawing the latest guess (starting with the
 * initial topic) and guessing the latest drawing. The topic can be a free
 * player input or chosen from the given topic options.
 */
type Card = {
  id: string;
  topic: string;
  topicOptions: string[];
  cardNumber: number;
};

/**
 * Current state:
 * - `"idle"` 		= Not starterd
 * - `"init"`			= Choose initial topics
 * - `"draw"` 		= A round is active in drawing phase
 * - `"guess"` 		= A round is active in guessing phase
 * - `"final"`		= Players are guessing their own
 * - `"finish"` 	= The game has finished
 */
type GameStatus = "idle" | "choose" | "draw" | "guess" | "final" | "finish";
