/**
 * Utility for managing localStorage with module-specific prefixes
 * to avoid conflicts between Module Federation modules
 */

const MODULE_PREFIX = 'insights_';

class ModuleStorage {
  constructor(prefix = MODULE_PREFIX) {
    this.prefix = prefix;
  }

  /**
   * Get prefixed key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  _getPrefixedKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in localStorage with module prefix
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  setItem(key, value) {
    const prefixedKey = this._getPrefixedKey(key);
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefixedKey, serializedValue);
  }

  /**
   * Get item from localStorage with module prefix
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Retrieved value
   */
  getItem(key, defaultValue = null) {
    const prefixedKey = this._getPrefixedKey(key);
    const value = localStorage.getItem(prefixedKey);

    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Remove item from localStorage with module prefix
   * @param {string} key - Storage key
   */
  removeItem(key) {
    const prefixedKey = this._getPrefixedKey(key);
    localStorage.removeItem(prefixedKey);
  }

  /**
   * Clear all items with this module's prefix
   */
  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Get all keys with this module's prefix
   * @returns {string[]} Array of unprefixed keys
   */
  keys() {
    const moduleKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        moduleKeys.push(key.replace(this.prefix, ''));
      }
    }
    return moduleKeys;
  }

  /**
   * Check if key exists with module prefix
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  hasItem(key) {
    const prefixedKey = this._getPrefixedKey(key);
    return localStorage.getItem(prefixedKey) !== null;
  }
}

export const moduleStorage = new ModuleStorage();

export { ModuleStorage };

export default moduleStorage;
