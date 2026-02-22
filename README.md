# CQN to SQL Converter

A TypeScript library that converts SAP's CQN (Core Query Notation) queries to various SQL dialects.

## Installation

```bash
npm install cqn-sql-converter
```

## Usage

```typescript
import { Converter, AnsiSqlDialect } from 'cqn-sql-converter';

const dialect = new AnsiSqlDialect();
const converter = new Converter(dialect);

const cqn = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['title'] }, { ref: ['author'] }],
    where: {
      xpr: [{ ref: ['price'] }, '>', { val: 100 }]
    }
  }
};

const sql = converter.compile(cqn);
console.log(sql);
```

Output:
```sql
SELECT "title", "author"
FROM "Books"
WHERE "price" > 100
```

## Supported Features

### SELECT Queries
- Basic SELECT with columns
- WHERE clauses with all operators (=, !=, <, >, <=, >=, LIKE, IN, AND, OR, NOT)
- JOINs (inner, left, right, cross)
- Aliasing (table aliases, column aliases)
- Subqueries in WHERE and FROM clauses
- GROUP BY and HAVING
- ORDER BY with NULLS FIRST/LAST
- LIMIT and OFFSET
- DISTINCT

### INSERT Queries
- INSERT with entries (object form)
- INSERT with values (array form)
- INSERT with rows (bulk insert)

### UPDATE Queries
- UPDATE with SET and WHERE

### DELETE Queries
- DELETE with WHERE

### UPSERT Queries
- Basic UPSERT support

## Dialects

Currently supports:
- ANSI SQL

Future dialect support:
- PostgreSQL
- SparkSQL

## Architecture

The library follows a 4-stage conversion pipeline:

```
CQN Input → Validate → Transform → Generate → Plain SQL String
```

1. **Validate**: Validates the CQN structure
2. **Transform**: Converts CQN to an intermediate SQL AST
3. **Generate**: Uses the dialect to generate SQL strings from the AST

## License

MIT
