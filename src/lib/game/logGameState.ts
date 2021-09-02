export function logGameState(
  cards: Card[],
  rounds: Round[],
  players: Player[]
) {
  const n = players.length;

  // Perform an action n times
  const x = (cb: (i: number) => void) => {
    for (let i = 0; i < n; i++) cb(i);
  };

  // String to collect and utility function to append
  let str = "";
  let s = (_s: string) => (str += _s);

  // Header
  s(`\n| Round  `);
  x((i) => s(`| ${i} `));
  s("|\n");

  // Header and body separator
  s(`+--------`);
  x(() => s("+---"));
  s("+\n");

  // Each round
  x((r) => {
    const rnds = rounds.filter((_) => _.roundNumber === r);

    // Spacing
    if (n % 2 === 0 && r === Math.floor(n / 2) && n > 2) {
      s(`|        `);
      x(() => s(`|   `));
      s("|\n");
    }

    // Drawers
    s(`| d${r}     `);
    x((p) => {
      const round = rnds.find((_) => _.drawerId === players[p].id);
      const card = cards.find((_) => _.id === round?.cardId)?.cardNumber;
      s(`| ${card ?? "_"} `);
    });
    s("|\n");

    // Spacing
    if (n % 2 === 1 && r === Math.floor(n / 2) && n > 2) {
      s(`|        `);
      x(() => s(`|   `));
      s("|\n");
    }

    // Guessers
    s(`| g${r}     `);
    x((p) => {
      const round = rnds.find((_) => _.guesserId === players[p].id);
      const card = cards.find((_) => _.id === round?.cardId)?.cardNumber;
      s(`| ${card ?? "_"} `);
    });
    s("|\n");
  });

  console.log(str);

  // console.log(
  //   rounds
  //     .map((r) => ({
  //       ...r,
  //       guesserId: players.find((_) => _.id === r.guesserId)?.name ?? "_",
  //       drawerId: players.find((_) => _.id === r.drawerId)?.name ?? "_",
  //     }))
  //     .sort(
  //       (a, b) =>
  //         (cards.find((_) => _.id === a.cardId)?.cardNumber ?? -1) -
  //         (cards.find((_) => _.id === b.cardId)?.cardNumber ?? -1)
  //     )
  //     .sort((a, b) => a.roundNumber - b.roundNumber)
  //     .map(
  //       (r) =>
  //         `#${r.roundNumber}: ${r.id}   D: ${r.drawerId
  //           .substring(0, 8)
  //           .padStart(8, " ")}   G: ${r.guesserId
  //           .substring(0, 8)
  //           .padStart(8, " ")}`
  //     )
  //     .join("\n")
  // );
}
