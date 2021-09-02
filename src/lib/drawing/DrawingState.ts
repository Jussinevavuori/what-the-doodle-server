export class DrawingState {
  state: String;

  constructor() {
    this.state = "";
  }

  apply(serial: string) {
    // Get all actions in serial
    const actions = serial.split("!");

    // Ensure at least some actions exist
    if (actions.length === 0) return;

    // Add action delimiter
    if (
      this.state.length > 0 &&
      this.state.charAt(this.state.length - 1) !== "!"
    ) {
      this.state += "!";
    }

    // Add each action separately
    for (const action of actions) {
      // Clear state on clear action
      if (action[0] === "C") {
        this.state = "";
      }
      this.state += action;
    }
  }
}
