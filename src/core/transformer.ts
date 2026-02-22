// Transformer - Converts CQN to SQL AST

import type {
  CqnQuery, CqnSelect, CqnInsert, CqnUpdate, CqnDelete, CqnUpsert,
  CqnSource, CqnColumn, CqnExpr, CqnVal, CqnRef, CqnXpr, CqnList, CqnFunc,
  CqnOrder, CqnLimit, CqnJoin, CqnInsertEntry
} from '../types/cqn';
import type {
  SqlNode, SqlSelect, SqlInsert, SqlUpdate, SqlDelete, SqlUpsert,
  SqlSource, SqlColumn, SqlExpr, SqlVal, SqlRef, SqlBinaryOp, SqlUnaryOp,
  SqlFunc, SqlList, SqlParam, SqlJoin, SqlOrder, SqlLimit
} from '../types/sql';
import { ConverterContext } from './context';

export class Transformer {
  private context: ConverterContext;

  constructor(context: ConverterContext) {
    this.context = context;
  }

  transform(query: CqnQuery): SqlNode {
    if ('SELECT' in query) {
      return this.transformSelect(query.SELECT!);
    }
    if ('INSERT' in query) {
      return this.transformInsert(query.INSERT!);
    }
    if ('UPDATE' in query) {
      return this.transformUpdate(query.UPDATE!);
    }
    if ('DELETE' in query) {
      return this.transformDelete(query.DELETE!);
    }
    if ('UPSERT' in query) {
      return this.transformUpsert(query.UPSERT!);
    }
    throw new Error('Invalid query type');
  }

  private transformSelect(select: CqnSelect): SqlSelect {
    return {
      type: 'select',
      columns: this.transformColumns(select.columns),
      from: this.transformSource(select.from),
      where: select.where ? this.transformExpr(select.where) : undefined,
      groupBy: select.groupBy?.map(e => this.transformExpr(e)),
      having: select.having ? this.transformExpr(select.having) : undefined,
      orderBy: select.orderBy?.map(o => this.transformOrder(o)),
      limit: select.limit ? this.transformLimit(select.limit) : undefined,
      distinct: select.distinct
    };
  }

  private transformColumns(columns?: CqnColumn[]): SqlColumn[] {
    if (!columns || columns.length === 0) {
      return [{ '*': true }];
    }
    return columns.map(col => {
      if ('*' in col && col['*'] === true) {
        return { '*': true };
      }
      if (col.ref) {
        return {
          expr: {
            type: 'ref',
            name: col.ref,
            as: col.as
          } as SqlRef,
          as: col.as
        };
      }
      if (col.func) {
        return {
          expr: {
            type: 'func',
            name: col.func,
            args: (col.args || []).map(a => this.transformExpr(a)),
            as: col.as
          } as SqlFunc,
          as: col.as
        };
      }
      return { '*': true };
    });
  }

  private transformSource(source: CqnSource): SqlSource {
    if (!source) {
      throw new Error('Source is undefined');
    }
    if ('ref' in source) {
      return this.transformRef(source as CqnRef);
    }
    if ('SELECT' in source) {
      return this.transformSelect(source as any);
    }
    if ('join' in source) {
      return this.transformJoin(source as CqnJoin);
    }
    throw new Error('Invalid source type');
  }

  private transformJoin(join: CqnJoin): SqlJoin {
    return {
      type: 'join',
      join: join.join,
      left: this.transformSource(join.args[0]),
      right: this.transformSource(join.args[1]),
      on: join.on ? this.transformExpr(join.on) : undefined,
      as: join.as
    };
  }

  private transformRef(ref: CqnRef): SqlRef {
    return {
      type: 'ref',
      name: ref.ref,
      as: ref.as
    };
  }

  private transformOrder(order: CqnOrder): SqlOrder {
    return {
      expr: { type: 'ref', name: order.ref } as SqlRef,
      sort: order.sort,
      nulls: order.nulls
    };
  }

  private transformLimit(limit: CqnLimit): SqlLimit {
    return {
      rows: this.transformExpr(limit.rows),
      offset: limit.offset ? this.transformExpr(limit.offset) : undefined
    };
  }

  private transformInsert(insert: CqnInsert): SqlInsert {
    const result: SqlInsert = {
      type: 'insert',
      into: this.transformRef(insert.into),
      columns: insert.columns
    };

    if (insert.entries) {
      result.entries = insert.entries.map(entry => this.transformEntry(entry));
    }
    if (insert.values) {
      result.values = insert.values.map(row => row.map(v => this.transformVal(v)));
    }
    if (insert.rows) {
      result.rows = insert.rows.map(row => row.map(v => this.transformVal(v)));
    }

    return result;
  }

  private transformEntry(entry: CqnInsertEntry): Record<string, SqlVal> {
    const result: Record<string, SqlVal> = {};
    for (const [key, value] of Object.entries(entry)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Nested object - skip for now (deep insert)
        continue;
      }
      if (Array.isArray(value)) {
        continue;
      }
      result[key] = this.transformVal(value as CqnVal);
    }
    return result;
  }

  private transformVal(val: CqnValue): SqlVal {
    if (typeof val === 'object' && 'val' in val) {
      return { type: 'val', value: (val as CqnVal).val };
    }
    return { type: 'val', value: val as SqlVal['value'] };
  }

  private transformUpdate(update: CqnUpdate): SqlUpdate {
    return {
      type: 'update',
      table: this.transformRef(update.update),
      set: Object.fromEntries(
        Object.entries(update.set).map(([k, v]) => [k, this.transformExpr(v)])
      ),
      where: update.where ? this.transformExpr(update.where) : undefined
    };
  }

  private transformDelete(deleteQuery: CqnDelete): SqlDelete {
    return {
      type: 'delete',
      from: this.transformRef(deleteQuery.delete),
      where: deleteQuery.where ? this.transformExpr(deleteQuery.where) : undefined
    };
  }

  private transformUpsert(upsert: CqnUpsert): SqlUpsert {
    const target = upsert.upsert || upsert.into!;
    const result: SqlUpsert = {
      type: 'upsert',
      into: this.transformRef(target),
      columns: upsert.columns
    };

    if (upsert.entries) {
      result.entries = upsert.entries.map(entry => this.transformEntry(entry));
    }
    if (upsert.values) {
      result.values = upsert.values.map(row => row.map(v => this.transformVal(v)));
    }
    if (upsert.rows) {
      result.rows = upsert.rows.map(row => row.map(v => this.transformVal(v)));
    }

    return result;
  }

  private transformExpr(expr: CqnExpr): SqlExpr {
    if (!expr) {
      throw new Error('Expression is undefined');
    }
    if ('ref' in expr) {
      const ref = expr as CqnRef;
      if (ref.param || (ref.ref.length === 1 && ref.ref[0] === '?')) {
        return { type: 'param', index: this.context.nextParamIndex() } as SqlParam;
      }
      return this.transformRef(ref);
    }
    if ('val' in expr) {
      return this.transformVal((expr as CqnVal).val);
    }
    if ('xpr' in expr) {
      return this.transformXpr(expr as CqnXpr);
    }
    if ('list' in expr) {
      return {
        type: 'list',
        values: (expr as CqnList).list.map(e => this.transformExpr(e))
      } as SqlList;
    }
    if ('func' in expr) {
      const func = expr as CqnFunc;
      return {
        type: 'func',
        name: func.func,
        args: func.args.map(a => this.transformExpr(a)),
        as: func.as
      } as SqlFunc;
    }
    if ('SELECT' in expr) {
      return this.transformSelect(expr as CqnSelect);
    }
    // Handle plain subquery without SELECT wrapper (e.g., in WHERE clause)
    if ('from' in expr && 'columns' in expr) {
      return this.transformSelect(expr as CqnSelect);
    }
    throw new Error('Invalid expression type');
  }

  private transformXpr(xpr: CqnXpr): SqlExpr {
    const items = xpr.xpr;

    if (items.length === 1) {
      return this.transformExpr(items[0] as CqnExpr);
    }

    if (items.length === 2) {
      const op = items[0];
      const operand = items[1];
      if (op === 'not' || op === 'NOT') {
        return {
          type: 'unary',
          op: 'NOT',
          operand: this.transformExpr(operand as CqnExpr)
        } as SqlUnaryOp;
      }
    }

    if (items.length === 3) {
      const left = items[0];
      const op = items[1];
      const right = items[2];

      return {
        type: 'binary',
        op: this.mapOperator(op as string),
        left: this.transformExpr(left as CqnExpr),
        right: this.transformExpr(right as CqnExpr)
      } as SqlBinaryOp;
    }

    // Handle chained expressions like a AND b AND c
    if (items.length > 3) {
      let result = this.transformExpr(items[0] as CqnExpr);
      for (let i = 1; i < items.length; i += 2) {
        const op = items[i];
        const right = items[i + 1];
        result = {
          type: 'binary',
          op: this.mapOperator(op as string),
          left: result,
          right: this.transformExpr(right as CqnExpr)
        } as SqlBinaryOp;
      }
      return result;
    }

    throw new Error('Invalid expression');
  }

  private mapOperator(op: string): string {
    const operatorMap: Record<string, string> = {
      '=': '=',
      '==': '=',
      '!=': '!=',
      '<>': '!=',
      '<': '<',
      '<=': '<=',
      '>': '>',
      '>=': '>=',
      'in': 'IN',
      'like': 'LIKE',
      'and': 'AND',
      'or': 'OR',
      'not': 'NOT',
      'between': 'BETWEEN'
    };
    return operatorMap[op] || op;
  }
}
