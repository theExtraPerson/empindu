export type SupabaseQueryResponse<T> = {
  data: T;
  error: Error | null;
  count: number | null;
};

class QueryBuilder<TData = unknown> implements PromiseLike<SupabaseQueryResponse<TData>> {
  private mode: 'select' | 'single' | 'maybeSingle' | 'mutate' = 'select';
  private count: number | null = null;
  private head = false;

  select(_columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    if (options?.count) {
      this.count = 0;
    }
    if (options?.head) {
      this.head = true;
    }
    return this;
  }

  insert(_payload: unknown) {
    this.mode = 'mutate';
    return this;
  }

  update(_payload: unknown) {
    this.mode = 'mutate';
    return this;
  }

  upsert(_payload: unknown) {
    this.mode = 'mutate';
    return this;
  }

  delete() {
    this.mode = 'mutate';
    return this;
  }

  eq(_column: string, _value: unknown) {
    return this;
  }

  neq(_column: string, _value: unknown) {
    return this;
  }

  in(_column: string, _values: readonly unknown[]) {
    return this;
  }

  or(_filters: string) {
    return this;
  }

  gte(_column: string, _value: unknown) {
    return this;
  }

  lte(_column: string, _value: unknown) {
    return this;
  }

  order(_column: string, _options?: { ascending?: boolean }) {
    return this;
  }

  maybeSingle() {
    this.mode = 'maybeSingle';
    return this as unknown as QueryBuilder<TData | null>;
  }

  single() {
    this.mode = 'single';
    return this as unknown as QueryBuilder<TData | null>;
  }

  then<TResult1 = SupabaseQueryResponse<TData>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<TData>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.buildResponse()).then(onfulfilled, onrejected);
  }

  private buildResponse(): SupabaseQueryResponse<TData> {
    let data: unknown;

    if (this.mode === 'maybeSingle' || this.mode === 'single') {
      data = null;
    } else if (this.mode === 'mutate' || this.head) {
      data = null;
    } else {
      data = [];
    }

    return {
      data: data as TData,
      error: null,
      count: this.count,
    };
  }
}

export const supabase = {
  from<TData = unknown>(_table: string) {
    return new QueryBuilder<TData>();
  },
  auth: {
    async getUser() {
      return {
        data: { user: null as { id: string } | null },
        error: null as Error | null,
      };
    },
  },
  functions: {
    async invoke<TData = unknown>(_name: string, _options?: { body?: unknown }) {
      return {
        data: null as TData | null,
        error: null as Error | null,
      };
    },
  },
};
