import { v4 as uuid } from "uuid";

export type PubSubListener<EV> = (event: EV) => void;
export type PubSubUnsubscriber = () => void;

export class PubSubChannel<EV> {
  /**
   * List of all listeners
   */
  listeners: Record<string, PubSubListener<EV> | undefined>;

  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to all events in this channel. The provided listener callback
   * function is fired every time an event is published and given the event
   * object as the argument.
   *
   * Returns an unsubscriber function, calling which will stop events from
   * being published to the listener function.
   */
  subscribe(listener: PubSubListener<EV>): PubSubUnsubscriber {
    const id = uuid();
    this.listeners[id] = listener;
    return () => {
      this.listeners[id] = undefined;
    };
  }

  /**
   * Publish an event that fires each subscribed listener function with the
   * provided event as the callback.
   *
   * @param event The event object to provide as the argument for each listener
   */
  publish(event: EV) {
    Object.values(this.listeners).forEach((listener) => {
      if (listener) {
        listener(event);
      }
    });
  }
}
