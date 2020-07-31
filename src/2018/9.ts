import {declareProblem, declareSubproblem} from '~/util/util';
import {timer} from '~/util/Timer';

const simulations = () => [
  {p: 10, s: 1618},
  {p: 13, s: 7999},
  {p: 17, s: 1104},
  {p: 21, s: 6111},
  {p: 30, s: 5807},
  {p: 411, s: 72059},
  {p: 411, s: 7205900},
];

class Node {
  public prev: Node;
  public next: Node;

  constructor(public val: number, prev?: Node, next?: Node) {
    this.prev = prev ?? this;
    this.next = next ?? this;
  }
}

class CircularDoublyLinkedList {
  public current: Node;

  constructor() {
    this.current = new Node(0);
  }

  addToNext(val: number) {
    const addTo = this.current.next;
    const temp = addTo.next;
    const node = new Node(val, addTo, temp);
    addTo.next.prev = node;
    addTo.next = node;
    this.current = addTo.next;
  }

  removeBack(offsetFromCurrent = 0) {
    let node = this.current;
    while (offsetFromCurrent-- > 0) {
      node = node.prev;
    }
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.current = node.next;
    return node.val;
  }

  toString() {
    let firstIdx = 0;
    let node = this.current;
    const nodes = [node];

    while (node.next != this.current) {
      node = node.next;
      nodes.push(node);
      if (node.val === 0) {
        firstIdx = nodes.length - 1;
      }
    }

    let output = '';
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[(i + firstIdx) % nodes.length];
      output += ' ';
      output += node === this.current ? `(${node.val})` : node.val;
    }
    return output;
  }
}

class MarbleGame {
  private marbles: CircularDoublyLinkedList;
  private nextMarble = 1;
  private currentPlayer = 0;
  private playerScores: number[] = [];

  constructor(private numplayers: number) {
    this.marbles = new CircularDoublyLinkedList();
  }

  next() {
    if (this.nextMarble % 23 !== 0) {
      this.marbles.addToNext(this.nextMarble);
    } else {
      const score = this.playerScores[this.currentPlayer] ?? 0;
      this.playerScores[this.currentPlayer] =
        score + this.nextMarble + this.marbles.removeBack(7);
    }
    this.nextMarble++;
    this.currentPlayer++;
    this.currentPlayer = this.currentPlayer % this.numplayers;
  }

  play(untilMarble: number) {
    for (let i = 1, player = 0; i <= untilMarble; i++, player++) {
      this.next();
    }
  }

  get topScore() {
    return this.playerScores.reduce((a, c) => (c ?? 0) > a ? c : a, 0);
  }
}

const runSimulation =
    (title: string) => (players: number, playUntil: number) => {
  declareSubproblem(title);
  const game = new MarbleGame(players);
  game.play(playUntil);
  return game.topScore;
};

export const run = () => {
  declareProblem('day 9');
  for (const {p, s} of simulations()) {
    timer.run(runSimulation(p + ''), p + '', p, s);
  }
};
