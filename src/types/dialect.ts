// Dialect interface type definitions

import type { SqlNode } from './sql';

export interface DialectConfig {
  name: string;
  version: string;
}

export interface Dialect {
  config: DialectConfig;
  quoteIdentifier(id: string): string;
  quoteIfNeeded(id: string): string;
  mapType(cdsType: string): string;
  mapFunction(funcName: string): string;
  formatParam(param: string | number): string;
  formatOperator(op: string): string;
  supportsLimitOffset(): boolean;
  supportsNullsOrdering(): boolean;
  supportsDistinctOn(): boolean;
  supportsReturning(): boolean;
  supportsMerge(): boolean;
  generate(node: SqlNode): string;
}

export interface DialectRegistry {
  register(dialect: Dialect): void;
  get(name: string): Dialect | undefined;
  list(): Dialect[];
}
