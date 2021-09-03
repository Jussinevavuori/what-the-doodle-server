"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logGameState = void 0;
function logGameState(cards, rounds, players) {
    var n = players.length;
    // Perform an action n times
    var x = function (cb) {
        for (var i = 0; i < n; i++)
            cb(i);
    };
    // String to collect and utility function to append
    var str = "";
    var s = function (_s) { return (str += _s); };
    // Header
    s("\n| Round  ");
    x(function (i) { return s("| " + i + " "); });
    s("|\n");
    // Header and body separator
    s("+--------");
    x(function () { return s("+---"); });
    s("+\n");
    // Each round
    x(function (r) {
        var rnds = rounds.filter(function (_) { return _.roundNumber === r; });
        // Spacing
        if (n % 2 === 0 && r === Math.floor(n / 2) && n > 2) {
            s("|        ");
            x(function () { return s("|   "); });
            s("|\n");
        }
        // Drawers
        s("| d" + r + "     ");
        x(function (p) {
            var _a;
            var round = rnds.find(function (_) { return _.drawerId === players[p].id; });
            var card = (_a = cards.find(function (_) { return _.id === (round === null || round === void 0 ? void 0 : round.cardId); })) === null || _a === void 0 ? void 0 : _a.cardNumber;
            s("| " + (card !== null && card !== void 0 ? card : "_") + " ");
        });
        s("|\n");
        // Spacing
        if (n % 2 === 1 && r === Math.floor(n / 2) && n > 2) {
            s("|        ");
            x(function () { return s("|   "); });
            s("|\n");
        }
        // Guessers
        s("| g" + r + "     ");
        x(function (p) {
            var _a;
            var round = rnds.find(function (_) { return _.guesserId === players[p].id; });
            var card = (_a = cards.find(function (_) { return _.id === (round === null || round === void 0 ? void 0 : round.cardId); })) === null || _a === void 0 ? void 0 : _a.cardNumber;
            s("| " + (card !== null && card !== void 0 ? card : "_") + " ");
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
exports.logGameState = logGameState;
