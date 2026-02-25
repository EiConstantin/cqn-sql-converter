// Integration tests for the full converter pipeline

import { describe, it, expect } from 'vitest';
import { Converter } from '../../src/core/converter';
import { AnsiSqlDialect } from '../../src/dialects/ansi-sql';
import * as fixtures from '../fixtures/cqn-queries';

describe('Converter Integration Tests', () => {
  const dialect = new AnsiSqlDialect();
  const converter = new Converter(dialect);

  describe('SELECT queries', () => {
    it('should compile simple SELECT', () => {
      const sql = converter.compile(fixtures.simpleSelect);
      expect(sql).toBe('SELECT *\nFROM "Books"');
    });

    it('should compile SELECT with columns', () => {
      const sql = converter.compile(fixtures.selectWithColumns);
      expect(sql).toBe('SELECT "title", "author"\nFROM "Books"');
    });

    it('should compile SELECT with WHERE', () => {
      const sql = converter.compile(fixtures.selectWithWhere);
      expect(sql).toBe('SELECT "title", "author"\nFROM "Books"\nWHERE "price" > 100');
    });

    it('should compile SELECT with JOIN', () => {
      const sql = converter.compile(fixtures.selectWithJoin);
      expect(sql).toContain('INNER JOIN');
      expect(sql).toContain('"b"."author_id"');
      expect(sql).toContain('"a"."id"');
    });

    it('should compile SELECT with ORDER BY', () => {
      const sql = converter.compile(fixtures.selectWithOrderBy);
      expect(sql).toContain('ORDER BY');
      expect(sql).toContain('ASC');
    });

    it('should compile SELECT with ORDER BY NULLS FIRST', () => {
      const sql = converter.compile(fixtures.selectWithOrderByNulls);
      expect(sql).toContain('NULLS FIRST');
    });

    it('should compile SELECT with LIMIT/OFFSET', () => {
      const sql = converter.compile(fixtures.selectWithLimitOffset);
      expect(sql).toContain('LIMIT 10');
      expect(sql).toContain('OFFSET 20');
    });

    it('should compile SELECT DISTINCT', () => {
      const sql = converter.compile(fixtures.selectWithDistinct);
      expect(sql).toContain('SELECT DISTINCT');
    });

    it('should compile SELECT with GROUP BY', () => {
      const sql = converter.compile(fixtures.selectWithGroupBy);
      expect(sql).toContain('GROUP BY');
      expect(sql).toContain('COUNT');
    });

    it('should compile SELECT with HAVING', () => {
      const sql = converter.compile(fixtures.selectWithHaving);
      expect(sql).toContain('HAVING');
    });

    it('should compile SELECT with IN list', () => {
      const sql = converter.compile(fixtures.selectWithInList);
      expect(sql).toContain('IN');
      expect(sql).toContain("'active'");
      expect(sql).toContain("'pending'");
    });

    it('should compile SELECT with LIKE', () => {
      const sql = converter.compile(fixtures.selectWithLike);
      expect(sql).toContain('LIKE');
    });

    it('should compile SELECT with alias', () => {
      const sql = converter.compile(fixtures.selectWithAlias);
      expect(sql).toContain('AS "b"');
      expect(sql).toContain('AS "book_title"');
    });

    it('should compile SELECT with subquery', () => {
      const sql = converter.compile(fixtures.selectWithSubquery);
      expect(sql).toContain('SELECT');
    });

    it('should compile SELECT with function', () => {
      const sql = converter.compile(fixtures.selectWithFunction);
      expect(sql).toContain('UPPER');
    });

    it('should handle NULL values', () => {
      const sql = converter.compile(fixtures.selectWithNull);
      expect(sql).toContain('NULL');
    });

    it('should handle BETWEEN operator', () => {
      const sql = converter.compile(fixtures.selectWithBetween);
      expect(sql).toContain('BETWEEN');
    });

    it('should handle IS NULL', () => {
      const sql = converter.compile(fixtures.selectWithIsNull);
      expect(sql).toContain('IS NULL');
    });

    it('should handle IS NOT NULL', () => {
      const sql = converter.compile(fixtures.selectWithIsNotNull);
      expect(sql).toContain('IS NOT NULL');
    });

    it('should handle COUNT(*)', () => {
      const sql = converter.compile(fixtures.selectWithCountAll);
      expect(sql).toContain('COUNT(*)');
    });
  });

  describe('INSERT queries', () => {
    it('should compile INSERT with entries', () => {
      const sql = converter.compile(fixtures.insertWithEntries);
      expect(sql).toContain('INSERT INTO');
      expect(sql).toContain('VALUES');
      expect(sql).toContain("'The Great Gatsby'");
    });

    it('should compile INSERT with values', () => {
      const sql = converter.compile(fixtures.insertWithValues);
      expect(sql).toContain('INSERT INTO');
      expect(sql).toContain('VALUES');
    });
  });

  describe('UPDATE queries', () => {
    it('should compile UPDATE with SET', () => {
      const sql = converter.compile(fixtures.updateWithSet);
      expect(sql).toContain('UPDATE');
      expect(sql).toContain('SET');
    });

    it('should compile UPDATE with WHERE', () => {
      const sql = converter.compile(fixtures.updateWithWhere);
      expect(sql).toContain('UPDATE');
      expect(sql).toContain('SET');
      expect(sql).toContain('WHERE');
    });
  });

  describe('DELETE queries', () => {
    it('should compile DELETE with WHERE', () => {
      const sql = converter.compile(fixtures.deleteWithWhere);
      expect(sql).toContain('DELETE FROM');
      expect(sql).toContain('WHERE');
    });
  });

  describe('UPSERT queries', () => {
    it('should compile UPSERT', () => {
      const sql = converter.compile(fixtures.upsertQuery);
      expect(sql).toContain('INSERT INTO');
    });
  });

  describe('Error handling', () => {
    it('should throw error for empty query', () => {
      expect(() => converter.compile({} as any)).toThrow();
    });

    it('should throw error for invalid query type', () => {
      expect(() => converter.compile({ INVALID: {} } as any)).toThrow();
    });
  });
});
