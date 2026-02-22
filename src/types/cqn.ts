// CQN (Core Query Notation) type definitions
// Mirrors SAP's CQN specification exactly

export type CqnValue = string | number | boolean | null | undefined;

export interface CqnRef {
  ref: string[];
  as?: string;
  cast?: CqnDataType;
  param?: boolean;
}

export interface CqnVal {
  val: CqnValue;
}

export type CqnOperator = '=' | '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'like' | 'and' | 'or' | 'not' | 'between' | 'is null' | 'is not null';

export type CqnExpr = CqnRef | CqnVal | CqnXpr | CqnList | CqnFunc | CqnSelect;

export interface CqnXpr {
  xpr: (CqnExpr | CqnOperator)[];
}

export interface CqnList {
  list: CqnExpr[];
}

export interface CqnFunc {
  func: string;
  args: CqnExpr[];
  as?: string;
  cast?: CqnDataType;
}

export interface CqnOrder {
  ref: string[];
  sort: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

export interface CqnLimit {
  rows: CqnVal;
  offset?: CqnVal;
}

export type CqnDataType =
  | 'cds.UUID'
  | 'cds.String'
  | 'cds.Boolean'
  | 'cds.Integer'
  | 'cds.Decimal'
  | 'cds.Date'
  | 'cds.Time'
  | 'cds.DateTime'
  | 'cds.Timestamp'
  | 'cds.Binary'
  | 'cds.LargeString'
  | 'cds.LargeBinary';

export interface CqnColumn {
  '*'?: true;
  ref?: string[];
  func?: string;
  args?: CqnExpr[];
  as?: string;
  cast?: CqnDataType;
}

export type CqnSource = CqnRef | CqnSelect | CqnJoin;

export interface CqnJoin {
  join: 'inner' | 'left' | 'right' | 'cross';
  args: [CqnSource, CqnSource];
  on?: CqnExpr;
  as?: string;
}

export interface CqnSelect {
  from: CqnSource;
  columns?: CqnColumn[];
  where?: CqnExpr;
  groupBy?: CqnExpr[];
  having?: CqnExpr;
  orderBy?: CqnOrder[];
  limit?: CqnLimit;
  distinct?: boolean;
}

export interface CqnInsertEntry {
  [key: string]: CqnValue | CqnInsertEntry | CqnValue[];
}

export interface CqnInsert {
  into: CqnRef;
  entries?: CqnInsertEntry[];
  values?: CqnVal[][];
  rows?: CqnVal[][];
  columns?: string[];
  as?: string;
}

export interface CqnUpdate {
  update: CqnRef;
  set: Record<string, CqnExpr>;
  where?: CqnExpr;
}

export interface CqnDelete {
  delete: CqnRef;
  where?: CqnExpr;
}

export interface CqnUpsert {
  upsert: CqnRef;
  into?: CqnRef;
  entries?: CqnInsertEntry[];
  values?: CqnVal[][];
  rows?: CqnVal[][];
  columns?: string[];
  where?: CqnExpr;
}

export type CqnQuery = {
  SELECT?: CqnSelect;
} | {
  INSERT?: CqnInsert;
} | {
  UPSERT?: CqnUpsert;
} | {
  UPDATE?: CqnUpdate;
} | {
  DELETE?: CqnDelete;
};
