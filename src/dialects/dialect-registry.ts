// Dialect Registry - Singleton for dialect registration

import type { Dialect, DialectRegistry as IDialectRegistry } from '../../types/dialect';

class DialectRegistryImpl implements IDialectRegistry {
  private dialects: Map<string, Dialect> = new Map();

  register(dialect: Dialect): void {
    this.dialects.set(dialect.config.name, dialect);
  }

  get(name: string): Dialect | undefined {
    return this.dialects.get(name);
  }

  list(): Dialect[] {
    return Array.from(this.dialects.values());
  }
}

// Singleton instance
export const DialectRegistry: IDialectRegistry = new DialectRegistryImpl();
