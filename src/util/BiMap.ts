/**
 * Supports bidirectional O(1) access to both key and values.
 * Only unique pairs are allowed. E.g., if you add (1, 3) and later tried to add
 * it again, it would do nothing. You could, however, add (4, 3) or (1, 2)
 * without a problem.
 */
export class BiMap<K, V> {
  private readonly keyMap = new Map<K, V[]>();
  private readonly valMap = new Map<V, K[]>();
  private size_ = 0;

  constructor(keyVals: [K, V][] = []) {
    for (const [k, v] of keyVals) {
      this.set(k, v);
    }
  }

  getValue(key: K): V | undefined {
    if (this.keyMap.has(key)) {
      return this.keyMap.get(key)![0];
    }
    return undefined;
  }

  getKey(val: V): K | undefined {
    if (this.valMap.has(val)) {
      return this.valMap.get(val)![0];
    }
    return undefined;
  }

  set(key: K, val: V): BiMap<K, V> {
    if (this.has(key, val)) {
      return this;
    }
    if (!this.keyMap.has(key)) {
      this.keyMap.set(key, []);
    }
    if (!this.valMap.has(val)) {
      this.valMap.set(val, []);
    }
    this.keyMap.get(key)!.push(val);
    this.valMap.get(val)!.push(key);
    this.size_++;
    return this;
  }

  deleteByKey(key: K): boolean {
    if (!this.keyMap.has(key)) {
      return false;
    }
    const vals = this.keyMap.get(key)!;
    this.keyMap.delete(key);
    this.size_ -= vals.length;

    for (const v of vals) {
      if (this.valMap.has(v)) {
        const newKeysForVal = this.valMap.get(v)!.filter((k) => k !== key);
        if (newKeysForVal.length === 0) {
          this.valMap.delete(v);
        } else {
          this.valMap.set(v, newKeysForVal);
        }
      }
    }
    return true;
  }

  deleteByValue(val: V): boolean {
    if (!this.valMap.has(val)) {
      return false;
    }
    const keys = this.valMap.get(val)!;
    this.valMap.delete(val);
    this.size_ -= keys.length;

    for (const k of keys) {
      if (this.keyMap.has(k)) {
        const newValsForKey = this.keyMap.get(k)!.filter((v) => v !== val);
        if (newValsForKey.length === 0) {
          this.keyMap.delete(k);
        } else {
          this.keyMap.set(k, newValsForKey);
        }
      }
    }
    return true;
  }

  hasKey(key: K): boolean {
    return this.keyMap.has(key);
  }

  hasValue(val: V): boolean {
    return this.valMap.has(val);
  }

  has(key: K, val: V): boolean {
    return this.keyMap.has(key) && this.keyMap.get(key)!.includes(val);
  }

  entries(): [K, V][] {
    return Array.from(this.keyMap.entries()).flatMap(([k, vals]) =>
      vals.map((v) => [k, v] as [K, V])
    );
  }

  get size() {
    return this.size_;
  }
}
