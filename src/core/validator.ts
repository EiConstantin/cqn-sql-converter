// CQN Validator - Validates CQN queries before transformation

import type { CqnQuery, CqnSelect, CqnInsert, CqnUpdate, CqnDelete, CqnUpsert, CqnSource } from '../types/cqn';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class Validator {
  validate(query: CqnQuery): void {
    if (!query || typeof query !== 'object') {
      throw new ValidationError('Query must be an object');
    }

    const keys = Object.keys(query);

    if (keys.length !== 1) {
      throw new ValidationError('Query must have exactly one key (SELECT, INSERT, UPDATE, DELETE, or UPSERT)');
    }

    const validKeys = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'UPSERT'];
    const queryType = keys[0];

    if (!validKeys.includes(queryType)) {
      throw new ValidationError(`Invalid query type: ${queryType}. Must be one of: ${validKeys.join(', ')}`);
    }

    switch (queryType) {
      case 'SELECT':
        this.validateSelect(query.SELECT!);
        break;
      case 'INSERT':
        this.validateInsert(query.INSERT!);
        break;
      case 'UPDATE':
        this.validateUpdate(query.UPDATE!);
        break;
      case 'DELETE':
        this.validateDelete(query.DELETE!);
        break;
      case 'UPSERT':
        this.validateUpsert(query.UPSERT!);
        break;
    }
  }

  private validateSelect(select: CqnSelect): void {
    if (!select.from) {
      throw new ValidationError('SELECT query must have a from clause');
    }
    this.validateSource(select.from);
  }

  private validateInsert(insert: CqnInsert): void {
    if (!insert.into) {
      throw new ValidationError('INSERT query must have an into clause');
    }

    const hasEntries = insert.entries && insert.entries.length > 0;
    const hasValues = insert.values && insert.values.length > 0;
    const hasRows = insert.rows && insert.rows.length > 0;

    if (!hasEntries && !hasValues && !hasRows) {
      throw new ValidationError('INSERT must have entries, values, or rows');
    }
  }

  private validateUpdate(update: CqnUpdate): void {
    if (!update.update) {
      throw new ValidationError('UPDATE query must have an update clause');
    }
    if (!update.set || Object.keys(update.set).length === 0) {
      throw new ValidationError('UPDATE query must have a set clause');
    }
  }

  private validateDelete(deleteQuery: CqnDelete): void {
    if (!deleteQuery.delete) {
      throw new ValidationError('DELETE query must have a delete clause');
    }
  }

  private validateUpsert(upsert: CqnUpsert): void {
    if (!upsert.upsert && !upsert.into) {
      throw new ValidationError('UPSERT query must have an upsert or into clause');
    }

    const hasEntries = upsert.entries && upsert.entries.length > 0;
    const hasValues = upsert.values && upsert.values.length > 0;
    const hasRows = upsert.rows && upsert.rows.length > 0;

    if (!hasEntries && !hasValues && !hasRows) {
      throw new ValidationError('UPSERT must have entries, values, or rows');
    }
  }

  private validateSource(source: CqnSource): void {
    if ('ref' in source) {
      // CqnRef - valid
      return;
    }
    if ('SELECT' in source) {
      // Subquery - valid
      return;
    }
    if ('join' in source) {
      // CqnJoin - validate args
      const join = source as any;
      if (!join.args || join.args.length !== 2) {
        throw new ValidationError('JOIN must have exactly two arguments');
      }
      this.validateSource(join.args[0]);
      this.validateSource(join.args[1]);
      return;
    }
    throw new ValidationError('Invalid source type');
  }
}
