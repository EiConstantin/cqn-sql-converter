// Converter context for tracking state during compilation

import type { Dialect } from '../types/dialect';
import type { SqlNode } from '../types/sql';

export class ConverterContext {
  public dialect: Dialect;
  public paramIndex: number = 0;
  public sqlAst: SqlNode | null = null;

  constructor(dialect: Dialect) {
    this.dialect = dialect;
  }

  nextParamIndex(): number {
    return ++this.paramIndex;
  }

  reset(): void {
    this.paramIndex = 0;
    this.sqlAst = null;
  }
}
