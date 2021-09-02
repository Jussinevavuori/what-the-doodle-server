import { getRandomItemFromSet } from "../functions/getRandomItemFromSet";
import { randomInts } from "../functions/randomInts";
import { fiTopics } from "../topics/topics.fi";

export class TopicGenerator {
  //----------------------------------------------------------------------------
  // STATIC METHODS
  //----------------------------------------------------------------------------

  /**
   * Fetches all existing topics
   */
  static getAllTopics(): string[] {
    return [...fiTopics];
  }

  /**
   * Fetches n random topics
   */
  static getRandomTopics(n: number): string[] {
    const topics = TopicGenerator.getAllTopics();
    return randomInts(n, topics.length, true).map((i) => topics[i]);
  }

  //----------------------------------------------------------------------------
  // INSTANCE PROPERTIES
  //----------------------------------------------------------------------------

  private availableTopics: Set<string>;

  constructor() {
    // Initialize available topics as having all topics available
    this.availableTopics = new Set(TopicGenerator.getAllTopics());
  }

  //----------------------------------------------------------------------------
  // INSTANCE METHODS
  //----------------------------------------------------------------------------

  /**
   * Get a random available topic and remove it from random possibilities.
   */
  private getNextRandomTopic() {
    // When available topics is emptied, refill it.
    if (this.availableTopics.size === 0) {
      this.availableTopics = new Set(TopicGenerator.getAllTopics());
    }
    const topic = getRandomItemFromSet(this.availableTopics);
    if (!topic) {
      throw new Error("No next random topic generated");
    }
    this.availableTopics.delete(topic);
    return topic;
  }

  /**
   * Get n random topics. This function will generate unique topics on each run
   * until the list of all available topics is exhausted. When that happens,
   * the list of all available topics is reset to its original state and the
   * list is exhausted again.
   */
  public getRandomTopics(n: number) {
    let topics: string[] = [];
    while (topics.length < n) {
      topics.push(this.getNextRandomTopic());
    }
    return topics;
  }
}
