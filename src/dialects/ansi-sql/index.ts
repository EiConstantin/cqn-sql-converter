// ANSI SQL Dialect - SQL generation for ANSI SQL standard

import type { Dialect, DialectConfig } from '../../types/dialect';
import type {
  SqlNode, SqlSelect, SqlInsert, SqlUpdate, SqlDelete, SqlUpsert,
  SqlSource, SqlColumn, SqlExpr, SqlVal, SqlRef, SqlBinaryOp, SqlUnaryOp,
  SqlFunc, SqlList, SqlParam, SqlJoin, SqlOrder, SqlLimit
} from '../../types/sql';

export class AnsiSqlDialect implements Dialect {
  public config: DialectConfig = {
    name: 'ansi-sql',
    version: '1.0.0'
  };

  quoteIdentifier(id: string): string {
    return `"${id}"`;
  }

  quoteIfNeeded(id: string): string {
    // Quote identifiers that contain special characters or are reserved words
    const reservedWords = [
      'select', 'from', 'where', 'and', 'or', 'not', 'in', 'like',
      'order', 'by', 'group', 'having', 'limit', 'offset', 'as', 'on',
      'join', 'inner', 'left', 'right', 'outer', 'cross', 'full',
      'insert', 'into', 'values', 'update', 'set', 'delete', 'create',
      'table', 'index', 'primary', 'key', 'foreign', 'references',
      'null', 'true', 'false', 'is', 'between', 'exists', 'case',
      'when', 'then', 'else', 'end', 'union', 'all', 'distinct'
    ];
    if (reservedWords.includes(id.toLowerCase()) || /[^a-zA-Z0-9_]/.test(id)) {
      return this.quoteIdentifier(id);
    }
    return id;
  }

  mapType(cdsType: string): string {
    const typeMap: Record<string, string> = {
      'cds.UUID': 'VARCHAR(36)',
      'cds.String': 'VARCHAR(5000)',
      'cds.Boolean': 'BOOLEAN',
      'cds.Integer': 'INTEGER',
      'cds.Decimal': 'DECIMAL',
      'cds.Date': 'DATE',
      'cds.Time': 'TIME',
      'cds.DateTime': 'TIMESTAMP',
      'cds.Timestamp': 'TIMESTAMP',
      'cds.Binary': 'BLOB',
      'cds.LargeString': 'TEXT',
      'cds.LargeBinary': 'BLOB'
    };
    return typeMap[cdsType] || 'VARCHAR(5000)';
  }

  mapFunction(funcName: string): string {
    const funcMap: Record<string, string> = {
      'UPPER': 'UPPER',
      'LOWER': 'LOWER',
      'TRIM': 'TRIM',
      'LTRIM': 'LTRIM',
      'RTRIM': 'RTRIM',
      'SUBSTRING': 'SUBSTRING',
      'CONCAT': 'CONCAT',
      'COALESCE': 'COALESCE',
      'IFNULL': 'IFNULL',
      'NULLIF': 'NULLIF',
      'LENGTH': 'LENGTH',
      'ABS': 'ABS',
      'CEIL': 'CEIL',
      'FLOOR': 'FLOOR',
      'ROUND': 'ROUND',
      'MOD': 'MOD',
      'POWER': 'POWER',
      'SQRT': 'SQRT',
      'NOW': 'CURRENT_TIMESTAMP',
      'YEAR': 'YEAR',
      'MONTH': 'MONTH',
      'DAY': 'DAY',
      'HOUR': 'HOUR',
      'MINUTE': 'MINUTE',
      'SECOND': 'SECOND',
      'COUNT': 'COUNT',
      'SUM': 'SUM',
      'AVG': 'AVG',
      'MIN': 'MIN',
      'MAX': 'MAX'
    };
    return funcMap[funcName.toUpperCase()] || funcName;
  }

  formatParam(param: string | number): string {
    return `$${param}`;
  }

  formatOperator(op: string): string {
    return op;
  }

  supportsLimitOffset(): boolean {
    return true;
  }

  supportsNullsOrdering(): boolean {
    return true;
  }

  supportsDistinctOn(): boolean {
    return false;
  }

  supportsReturning(): boolean {
    return false;
  }

  supportsMerge(): boolean {
    return false;
  }

  generate(node: SqlNode): string {
    switch (node.type) {
      case 'select':
        return this.generateSelect(node);
      case 'insert':
        return this.generateInsert(node);
      case 'update':
        return this.generateUpdate(node);
      case 'delete':
        return this.generateDelete(node);
      case 'upsert':
        return this.generateUpsert(node);
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  private generateSelect(select: SqlSelect): string {
    const parts: string[] = [];

    // SELECT clause
    let selectStr = 'SELECT ';
    if (select.distinct) {
      selectStr += 'DISTINCT ';
    }
    selectStr += this.generateColumns(select.columns);
    parts.push(selectStr);

    // FROM clause
    parts.push(`FROM ${this.generateSource(select.from)}`);

    // JOINs
    if (select.from && 'type' in select.from && select.from.type === 'join') {
      parts[parts.length - 1] = this.generateSource(select.from);
    }

    // WHERE clause
    if (select.where) {
      parts.push(`WHERE ${this.generateExpr(select.where)}`);
    }

    // GROUP BY clause
    if (select.groupBy && select.groupBy.length > 0) {
      parts.push(`GROUP BY ${select.groupBy.map(e => this.generateExpr(e)).join(', ')}`);
    }

    // HAVING clause
    if (select.having) {
      parts.push(`HAVING ${this.generateExpr(select.having)}`);
    }

    // ORDER BY clause
    if (select.orderBy && select.orderBy.length > 0) {
      parts.push(`ORDER BY ${select.orderBy.map(o => this.generateOrder(o)).join(', ')}`);
    }

    // LIMIT/OFFSET clause
    if (select.limit) {
      const limitSql = this.generateLimit(select.limit);
      if (limitSql) {
        parts.push(limitSql);
      }
    }

    return parts.join('\n');
  }

  private generateColumns(columns: SqlColumn[]): string {
    if (!columns || columns.length === 0 || (columns.length === 1 && '*' in columns[0])) {
      return '*';
    }
    return columns.map(col => {
      if ('*' in col && col['*'] === true) {
        return '*';
      }
      const exprStr = col.expr ? this.generateExpr(col.expr) : '';
      if (col.as) {
        return `${exprStr} AS ${this.quoteIdentifier(col.as)}`;
      }
      return exprStr;
    }).join(', ');
  }

  private generateSource(source: SqlSource): string {
    if (source.type === 'ref') {
      const name = source.name.map(n => this.quoteIdentifier(n)).join('.');
      if (source.as) {
        return `${name} AS ${this.quoteIdentifier(source.as)}`;
      }
      return name;
    }
    if (source.type === 'select') {
      const subquery = this.generateSelect(source);
      if (source.as) {
        return `(${subquery}) AS ${this.quoteIdentifier(source.as)}`;
      }
      return `(${subquery})`;
    }
    if (source.type === 'join') {
      return this.generateJoin(source);
    }
    throw new Error('Invalid source type');
  }

  private generateJoin(join: SqlJoin): string {
    const left = this.generateSource(join.left);
    const right = this.generateSource(join.right);
    const joinType = join.join.toUpperCase();

    if (join.join === 'cross') {
      return `${left} CROSS JOIN ${right}`;
    }

    const on = join.on ? this.generateExpr(join.on) : '1=1';
    return `${left} ${joinType} JOIN ${right} ON ${on}`;
  }

  private generateOrder(order: SqlOrder): string {
    let result = this.generateExpr(order.expr);
    result += ` ${order.sort.toUpperCase()}`;
    if (order.nulls) {
      result += ` NULLS ${order.nulls.toUpperCase()}`;
    }
    return result;
  }

  private generateLimit(limit: SqlLimit): string {
    const rows = this.generateExpr(limit.rows);
    if (limit.offset) {
      const offset = this.generateExpr(limit.offset);
      return `LIMIT ${rows} OFFSET ${offset}`;
    }
    return `LIMIT ${rows}`;
  }

  private generateInsert(insert: SqlInsert): string {
    const parts: string[] = [];

    // INTO clause
    const into = this.generateRef(insert.into);
    parts.push(`INSERT INTO ${into}`);

    // Columns
    if (insert.columns && insert.columns.length > 0) {
      const cols = insert.columns.map(c => this.quoteIdentifier(c)).join(', ');
      parts.push(`(${cols})`);
    }

    // VALUES or SELECT
    if (insert.entries && insert.entries.length > 0) {
      const values = insert.entries.map(entry => {
        const vals = Object.values(entry).map(v => this.generateVal(v));
        return `(${vals.join(', ')})`;
      });
      parts.push(`VALUES ${values.join(', ')}`);
    } else if (insert.values && insert.values.length > 0) {
      const values = insert.values.map(row => {
        return `(${row.map(v => this.generateVal(v)).join(', ')})`;
      });
      parts.push(`VALUES ${values.join(', ')}`);
    } else if (insert.rows && insert.rows.length > 0) {
      const values = insert.rows.map(row => {
        return `(${row.map(v => this.generateVal(v)).join(', ')})`;
      });
      parts.push(`VALUES ${values.join(', ')}`);
    }

    return parts.join('\n');
  }

  private generateUpdate(update: SqlUpdate): string {
    const parts: string[] = [];

    // UPDATE clause
    const table = this.generateRef(update.table);
    parts.push(`UPDATE ${table}`);

    // SET clause
    const setParts = Object.entries(update.set).map(([k, v]) => {
      return `${this.quoteIdentifier(k)} = ${this.generateExpr(v)}`;
    });
    parts.push(`SET ${setParts.join(', ')}`);

    // WHERE clause
    if (update.where) {
      parts.push(`WHERE ${this.generateExpr(update.where)}`);
    }

    return parts.join('\n');
  }

  private generateDelete(deleteQuery: SqlDelete): string {
    const parts: string[] = [];

    // DELETE FROM clause
    const from = this.generateRef(deleteQuery.from);
    parts.push(`DELETE FROM ${from}`);

    // WHERE clause
    if (deleteQuery.where) {
      parts.push(`WHERE ${this.generateExpr(deleteQuery.where)}`);
    }

    return parts.join('\n');
  }

  private generateUpsert(upsert: SqlUpsert): string {
    const parts: string[] = [];

    // INTO clause
    const into = this.generateRef(upsert.into);
    parts.push(`INSERT INTO ${into}`);

    // Columns
    if (upsert.columns && upsert.columns.length > 0) {
      const cols = upsert.columns.map(c => this.quoteIdentifier(c)).join(', ');
      parts.push(`(${cols})`);
    }

    // VALUES
    if (upsert.entries && upsert.entries.length > 0) {
      const values = upsert.entries.map(entry => {
        const vals = Object.values(entry).map(v => this.generateVal(v));
        return `(${vals.join(', ')})`;
      });
      parts.push(`VALUES ${values.join(', ')}`);
    } else if (upsert.values && upsert.values.length > 0) {
      const values = upsert.values.map(row => {
        return `(${row.map(v => this.generateVal(v)).join(', ')})`;
      });
      parts.push(`VALUES ${values.join(', ')}`);
    }

    return parts.join('\n');
  }

  private generateRef(ref: SqlRef): string {
    const name = ref.name.map(n => this.quoteIdentifier(n)).join('.');
    if (ref.as) {
      return `${name} AS ${this.quoteIdentifier(ref.as)}`;
    }
    return name;
  }

  private generateExpr(expr: SqlExpr): string {
    switch (expr.type) {
      case 'ref':
        return this.generateRef(expr);
      case 'val':
        return this.generateVal(expr);
      case 'binary':
        return this.generateBinaryOp(expr);
      case 'unary':
        return this.generateUnaryOp(expr);
      case 'func':
        return this.generateFunc(expr);
      case 'list':
        return this.generateList(expr);
      case 'param':
        return this.generateParam(expr);
      case 'select':
        return `(${this.generateSelect(expr)})`;
      default:
        throw new Error('Invalid expression type');
    }
  }

  private generateVal(val: SqlVal): string {
    if (val.value === null) {
      return 'NULL';
    }
    if (typeof val.value === 'string') {
      return `'${this.escapeString(val.value)}'`;
    }
    if (typeof val.value === 'boolean') {
      return val.value ? 'TRUE' : 'FALSE';
    }
    return String(val.value);
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }

  private generateBinaryOp(op: SqlBinaryOp): string {
    const left = this.generateExpr(op.left);
    const right = this.generateExpr(op.right);
    const operator = this.formatOperator(op.op);

    if (op.op === 'IN' || op.op === 'NOT IN') {
      return `${left} ${operator} ${right}`;
    }
    if (op.op === 'BETWEEN') {
      return `${left} BETWEEN ${right}`;
    }

    return `${left} ${operator} ${right}`;
  }

  private generateUnaryOp(op: SqlUnaryOp): string {
    const operand = this.generateExpr(op.operand);
    return `${op.op} ${operand}`;
  }

  private generateFunc(func: SqlFunc): string {
    const name = this.mapFunction(func.name);
    const args = func.args.map(a => this.generateExpr(a)).join(', ');
    const result = `${name}(${args})`;
    if (func.as) {
      return `${result} AS ${this.quoteIdentifier(func.as)}`;
    }
    return result;
  }

  private generateList(list: SqlList): string {
    const values = list.values.map(v => this.generateExpr(v)).join(', ');
    return `(${values})`;
  }

  private generateParam(param: SqlParam): string {
    return this.formatParam(param.index);
  }
}
