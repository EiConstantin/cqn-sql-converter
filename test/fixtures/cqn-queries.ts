// Test fixtures for CQN queries

import type { CqnQuery } from '../src/types/cqn';

export const simpleSelect: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] }
  }
};

export const selectWithColumns: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [
      { ref: ['title'] },
      { ref: ['author'] }
    ]
  }
};

export const selectWithWhere: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['title'] }, { ref: ['author'] }],
    where: {
      xpr: [
        { ref: ['price'] },
        '>',
        { val: 100 }
      ]
    }
  }
};

export const selectWithJoin: CqnQuery = {
  SELECT: {
    from: {
      join: 'inner',
      args: [
        { ref: ['Books'], as: 'b' },
        { ref: ['Authors'], as: 'a' }
      ],
      on: {
        xpr: [
          { ref: ['b', 'author_id'] },
          '=',
          { ref: ['a', 'id'] }
        ]
      }
    },
    columns: [
      { ref: ['b', 'title'] },
      { ref: ['a', 'name'] }
    ]
  }
};

export const selectWithOrderBy: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['title'] }],
    orderBy: [
      { ref: ['title'], sort: 'asc' }
    ]
  }
};

export const selectWithOrderByNulls: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['title'] }],
    orderBy: [
      { ref: ['published_at'], sort: 'asc', nulls: 'first' }
    ]
  }
};

export const selectWithLimitOffset: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['title'] }],
    limit: {
      rows: { val: 10 },
      offset: { val: 20 }
    }
  }
};

export const selectWithDistinct: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [{ ref: ['category'] }],
    distinct: true
  }
};

export const selectWithGroupBy: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [
      { ref: ['category'] },
      { func: 'COUNT', args: [{ ref: ['*'] }] }
    ],
    groupBy: [{ ref: ['category'] }]
  }
};

export const selectWithHaving: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [
      { ref: ['category'] },
      { func: 'COUNT', args: [{ ref: ['*'] }] }
    ],
    groupBy: [{ ref: ['category'] }],
    having: {
      xpr: [
        { func: 'COUNT', args: [{ ref: ['*'] }] },
        '>',
        { val: 5 }
      ]
    }
  }
};

export const selectWithInList: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['status'] },
        'in',
        {
          list: [
            { val: 'active' },
            { val: 'pending' }
          ]
        }
      ]
    }
  }
};

export const selectWithLike: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['title'] },
        'like',
        { val: '%War%' }
      ]
    }
  }
};

export const insertWithEntries: CqnQuery = {
  INSERT: {
    into: { ref: ['Books'] },
    entries: [
      { ID: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 10.99 },
      { ID: 2, title: '1984', author: 'George Orwell', price: 9.99 }
    ]
  }
};

export const insertWithValues: CqnQuery = {
  INSERT: {
    into: { ref: ['Books'] },
    columns: ['title', 'author', 'price'],
    values: [
      [{ val: 'The Great Gatsby' }, { val: 'F. Scott Fitzgerald' }, { val: 10.99 }],
      [{ val: '1984' }, { val: 'George Orwell' }, { val: 9.99 }]
    ]
  }
};

export const updateWithSet: CqnQuery = {
  UPDATE: {
    update: { ref: ['Books'] },
    set: {
      price: { val: 19.99 }
    }
  }
};

export const updateWithWhere: CqnQuery = {
  UPDATE: {
    update: { ref: ['Books'] },
    set: {
      price: { val: 19.99 }
    },
    where: {
      xpr: [
        { ref: ['id'] },
        '=',
        { val: 1 }
      ]
    }
  }
};

export const deleteWithWhere: CqnQuery = {
  DELETE: {
    delete: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['price'] },
        '<',
        { val: 5 }
      ]
    }
  }
};

export const upsertQuery: CqnQuery = {
  UPSERT: {
    upsert: { ref: ['Books'] },
    entries: [
      { ID: 1, title: 'Updated Title', price: 15.99 }
    ]
  }
};

export const selectWithAlias: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'], as: 'b' },
    columns: [
      { ref: ['title'], as: 'book_title' }
    ]
  }
};

export const selectWithSubquery: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['price'] },
        '>',
        {
          from: { ref: ['AvgPrices'] },
          columns: [{ ref: ['avg'] }]
        }
      ]
    }
  }
};

export const selectWithFunction: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [
      { func: 'UPPER', args: [{ ref: ['title'] }] }
    ]
  }
};

export const selectWithNot: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        'not',
        {
          xpr: [
            { ref: ['published'] },
            '=',
            { val: true }
          ]
        }
      ]
    }
  }
};

// Edge cases

export const selectWithNull: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['published'] },
        '=',
        { val: null }
      ]
    }
  }
};

export const selectWithBetween: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['price'] },
        'between',
        { val: 10 },
        { val: 50 }
      ]
    }
  }
};

export const selectWithIsNull: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['title'] },
        'is null'
      ]
    }
  }
};

export const selectWithIsNotNull: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    where: {
      xpr: [
        { ref: ['title'] },
        'is not null'
      ]
    }
  }
};

export const selectWithCountAll: CqnQuery = {
  SELECT: {
    from: { ref: ['Books'] },
    columns: [
      { ref: ['*'] }
    ]
  }
};
