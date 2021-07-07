export interface IPrintable {
  toString(): string;
}

export function defaultToString<E>(w: E | undefined) {
  /* eslint-disable */
  if (typeof (w as any)?.toString === 'function') {
    return (w as any).toString();
  }
  /* eslint-enable */
  return '';
}

export class WGraph<T extends IPrintable, E> {
  private _vertices: Set<T>;
  private edges: Map<T, Set<T>>;
  private weights: Map<string, E>;

  constructor() {
    this._vertices = new Set();
    this.edges = new Map();
    this.weights = new Map();
  }

  addUndirectedEdge(from: T, to: T, weight?: E) {
    this.addDirectedEdge(from, to, weight);
    this.addDirectedEdge(to, from, weight);
  }

  addDirectedEdge(from: T, to: T, weight?: E) {
    // because it's a set, if it already exists, it won't do anything.
    this._vertices.add(from);
    this._vertices.add(to);

    if (!this.edges.has(from)) this.edges.set(from, new Set());

    this.edges.get(from)!.add(to);

    if (weight != null)
      this.weights.set(`${from.toString()},${to.toString()}`, weight);
  }

  addVertex(node: T) {
    this._vertices.add(node);
    if (!this.edges.has(node)) this.edges.set(node, new Set());
  }

  hasEdge(from: T, to: T) {
    return this.edges.has(from) && this.edges.get(from)!.has(to);
  }

  getWeight(from: T, to: T) {
    return this.weights.get(`${from.toString()},${to.toString()}`);
  }

  setWeight(from: T, to: T) {
    if (!this.hasEdge(from, to))
      throw new Error(
        `Cannot add weight to path ${from.toString()} -> ${to.toString()} because it doesn't exist`
      );
  }

  toString(wToString?: (w: E | undefined) => string, useDefault = false) {
    const toStringFunc =
      wToString != null ? wToString : useDefault ? defaultToString : undefined;
    let str = '';
    if (toStringFunc != null) {
      for (const [key, val] of this.edges.entries())
        str += `${key} -> ${Array.from(val)
          .map((v) => `${toStringFunc(this.getWeight(key, v))} ${v}`)
          .join(', ')}\n`;
    } else {
      for (const [key, val] of this.edges.entries())
        str += `${key} -> ${Array.from(val).join(',')}\n`;
    }
    return str;
  }

  getAdjList(v: T) {
    return Array.from(this.edges.get(v) ?? []);
  }

  get vertices() {
    return Array.from(this._vertices.values());
  }

  tranpose() {
    const graph = new WGraph<T, E>();
    for (const v of this.vertices) {
      graph.addVertex(v);
    }
    for (const [edge, connections] of this.edges) {
      for (const connection of connections) {
        graph.addDirectedEdge(
          connection,
          edge,
          this.getWeight(edge, connection)
        );
      }
    }
    return graph;
  }
}
