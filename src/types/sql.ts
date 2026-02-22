// SQL AST type definitions
// Intermediate representation before string generation

export type SqlValue = string | number | boolean | null | undefined;

export interface SqlRef {
  type: 'ref';
  name: string[];
  as?: string;
}

export interface SqlVal {
  type: 'val';
  value: SqlValue;
}

export type SqlOperator = '=' | '==' | '!=' | '<' | '<=' | '>' | '>=' | 'IN' | 'LIKE' | 'AND' | 'OR' | 'NOT' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL' | '+' | '-' | '*' | '/' | '%';

export type SqlExpr = SqlRef | SqlVal | SqlBinaryOp | SqlUnaryOp | SqlFunc | SqlList | SqlParam | SqlSelect;

export interface SqlBinaryOp {
  type: 'binary';
  op: SqlOperator;
  left: SqlExpr;
  right: SqlExpr;
}

export interface SqlUnaryOp {
  type: 'unary';
  op: 'NOT';
  operand: SqlExpr;
}

export interface SqlFunc {
  type: 'func';
  name: string;
  args: SqlExpr[];
  as?: string;
}

export interface SqlList {
  type: 'list';
  values: SqlExpr[];
}

export interface SqlParam {
  type: 'param';
  index: number;
}

export interface SqlSelect {
  type: 'select';
  columns: SqlColumn[];
  from: SqlSource;
  where?: SqlExpr;
  groupBy?: SqlExpr[];
  having?: SqlExpr;
  orderBy?: SqlOrder[];
  limit?: SqlLimit;
  distinct?: boolean;
}

export interface SqlColumn {
  '*'?: true;
  expr?: SqlExpr;
  as?: string;
}

export type SqlSource = SqlRef | SqlSelect | SqlJoin;

export interface SqlJoin {
  type: 'join';
  join: 'inner' | 'left' | 'right' | 'cross';
  left: SqlSource;
  right: SqlSource;
  on?: SqlExpr;
  as?: string;
}

export interface SqlOrder {
  expr: SqlExpr;
  sort: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

export interface SqlLimit {
  rows: SqlExpr;
  offset?: SqlExpr;
}

export interface SqlInsert {
  type: 'insert';
  into: SqlRef;
  columns?: string[];
  values?: SqlVal[][];
  rows?: SqlVal[][];
  entries?: Record<string, SqlVal>[];
  select?: SqlSelect;
}

export interface SqlUpdate {
  type: 'update';
  table: SqlRef;
  set: Record<string, SqlExpr>;
  where?: SqlExpr;
}

export interface SqlDelete {
  type: 'delete';
  from: SqlRef;
  where?: SqlExpr;
}

export interface SqlUpsert {
  type: 'upsert';
  into: SqlRef;
  columns?: string[];
  values?: SqlVal[][];
  rows?: SqlVal[][];
  entries?: Record<string, SqlVal>[];
  where?: SqlExpr;
}

export type SqlNode = SqlSelect | SqlInsert | SqlUpdate | SqlDelete | SqlUpsert;
