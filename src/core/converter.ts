// Main Converter - Orchestrates the CQN to SQL conversion pipeline

import type { CqnQuery } from '../types/cqn';
import type { Dialect } from '../types/dialect';
import type { SqlNode } from '../types/sql';
import { ConverterContext } from './context';
import { Validator, ValidationError } from './validator';
import { Transformer } from './transformer';

export class Converter {
  private context: ConverterContext;
  private validator: Validator;
  private transformer: Transformer;

  constructor(dialect: Dialect) {
    this.context = new ConverterContext(dialect);
    this.validator = new Validator();
    this.transformer = new Transformer(this.context);
  }

  compile(cqn: CqnQuery): string {
    try {
      // Step 1: Validate the CQN
      this.validator.validate(cqn);

      // Step 2: Transform to SQL AST
      const sqlAst = this.transformer.transform(cqn);
      this.context.sqlAst = sqlAst;

      // Step 3: Generate SQL string using dialect
      const sql = this.context.dialect.generate(sqlAst);

      // Reset context for next compilation
      this.context.reset();

      return sql;
    } catch (error) {
      this.context.reset();
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Conversion failed: ${error}`);
    }
  }

  getDialect(): Dialect {
    return this.context.dialect;
  }
}
