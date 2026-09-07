/**
 * Demo DB adapter — mimics the drizzle-orm query builder surface used across
 * the app so pages and API routes work without a real PostgreSQL connection.
 * Activated automatically when DATABASE_URL is not set.
 */
import { randomUUID } from "crypto";
import { getTableName } from "drizzle-orm";
import {
  demoUsers,
  demoProviders,
  demoServices,
  demoBookings,
  demoReviews,
  demoAvailability,
} from "./demo-data";

// ---- Table registry -------------------------------------------------------

type TableName = "users" | "providers" | "services" | "bookings" | "reviews" | "availability";

interface Row {
  [key: string]: unknown;
}

// Tables reference the in-memory demo arrays directly so mutations made through
// the demo query builder stay visible to demo-auth (and vice versa).
const tables: Record<TableName, Row[]> = {
  users: demoUsers as unknown as Row[],
  providers: demoProviders as unknown as Row[],
  services: demoServices as unknown as Row[],
  bookings: demoBookings as unknown as Row[],
  reviews: demoReviews as unknown as Row[],
  availability: demoAvailability as unknown as Row[],
};

// ---- Column reference helper ---------------------------------------------

interface ColRef {
  __col: true;
  table: TableName;
  name: string;
}

function col(table: TableName, name: string): ColRef {
  return { __col: true, table, name };
}

// Demo column refs mirror the Drizzle schema shapes so both import paths
// (@/db/schema and @/lib/demo-db) work in demo mode.
export const users = {
  id: col("users", "id"),
  name: col("users", "name"),
  email: col("users", "email"),
  passwordHash: col("users", "passwordHash"),
  role: col("users", "role"),
  phone: col("users", "phone"),
  avatarUrl: col("users", "avatarUrl"),
  createdAt: col("users", "createdAt"),
} as const;

export const providers = {
  id: col("providers", "id"),
  userId: col("providers", "userId"),
  businessName: col("providers", "businessName"),
  type: col("providers", "type"),
  tagline: col("providers", "tagline"),
  description: col("providers", "description"),
  city: col("providers", "city"),
  address: col("providers", "address"),
  phone: col("providers", "phone"),
  email: col("providers", "email"),
  imageUrl: col("providers", "imageUrl"),
  priceFrom: col("providers", "priceFrom"),
  rating: col("providers", "rating"),
  reviewCount: col("providers", "reviewCount"),
  isActive: col("providers", "isActive"),
  createdAt: col("providers", "createdAt"),
  updatedAt: col("providers", "updatedAt"),
} as const;

export const services = {
  id: col("services", "id"),
  providerId: col("services", "providerId"),
  name: col("services", "name"),
  description: col("services", "description"),
  durationMinutes: col("services", "durationMinutes"),
  price: col("services", "price"),
  category: col("services", "category"),
  imageUrl: col("services", "imageUrl"),
  isActive: col("services", "isActive"),
  createdAt: col("services", "createdAt"),
  updatedAt: col("services", "updatedAt"),
} as const;

export const bookings = {
  id: col("bookings", "id"),
  customerId: col("bookings", "customerId"),
  providerId: col("bookings", "providerId"),
  serviceId: col("bookings", "serviceId"),
  date: col("bookings", "date"),
  startTime: col("bookings", "startTime"),
  endTime: col("bookings", "endTime"),
  status: col("bookings", "status"),
  notes: col("bookings", "notes"),
  totalPrice: col("bookings", "totalPrice"),
  createdAt: col("bookings", "createdAt"),
  updatedAt: col("bookings", "updatedAt"),
} as const;

export const reviews = {
  id: col("reviews", "id"),
  bookingId: col("reviews", "bookingId"),
  providerId: col("reviews", "providerId"),
  customerId: col("reviews", "customerId"),
  rating: col("reviews", "rating"),
  comment: col("reviews", "comment"),
  createdAt: col("reviews", "createdAt"),
} as const;

export const availability = {
  id: col("availability", "id"),
  providerId: col("availability", "providerId"),
  dayOfWeek: col("availability", "dayOfWeek"),
  startTime: col("availability", "startTime"),
  endTime: col("availability", "endTime"),
  isActive: col("availability", "isActive"),
} as const;

// ---- Condition helpers ----------------------------------------------------

interface EqCondition {
  __eq: true;
  col: unknown;
  value: unknown;
}

interface NeCondition {
  __ne: true;
  col: unknown;
  value: unknown;
}

interface NotInCondition {
  __notIn: true;
  col: unknown;
  values: unknown[];
}

interface ILikeCondition {
  __ilike: true;
  col: unknown;
  value: string;
}

interface AndCondition {
  __and: true;
  conditions: Condition[];
}

interface OrCondition {
  __or: true;
  conditions: Condition[];
}

type Condition = EqCondition | NeCondition | NotInCondition | ILikeCondition | AndCondition | OrCondition;

export function eq(colRef: unknown, value: unknown): EqCondition {
  return { __eq: true, col: colRef, value };
}

export function ne(colRef: unknown, value: unknown): NeCondition {
  return { __ne: true, col: colRef, value };
}

export function notInArray(colRef: unknown, values: unknown[]): NotInCondition {
  return { __notIn: true, col: colRef, values };
}

export function and(...conditions: Condition[]): AndCondition {
  return { __and: true, conditions };
}

export function or(...conditions: Condition[]): OrCondition {
  return { __or: true, conditions };
}

export function ilike(colRef: unknown, value: string): ILikeCondition {
  return { __ilike: true, col: colRef, value };
}

interface AscDesc {
  __order: true;
  col: unknown;
  dir: "asc" | "desc";
}

export function asc(colRef: unknown): AscDesc {
  return { __order: true, col: colRef, dir: "asc" };
}

export function desc(colRef: unknown): AscDesc {
  return { __order: true, col: colRef, dir: "desc" };
}

// Aggregation expression helpers (used inside select projections)
interface AvgExpr {
  __avg: true;
  col: unknown;
}

interface CountExpr {
  __count: true;
  col: unknown;
}

export function avg(colRef: unknown): AvgExpr {
  return { __avg: true, col: colRef };
}

export function count(colRef?: unknown): CountExpr {
  return { __count: true, col: colRef ?? null };
}

// ---- Resolution helpers ----------------------------------------------------
// Drizzle columns expose the DB column name (snake_case) and a back-reference
// to their table; demo rows use camelCase keys, so we translate both.

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_m, ch: string) => ch.toUpperCase());
}

function isDemoCol(x: unknown): x is ColRef {
  return !!x && typeof x === "object" && (x as any).__col === true;
}

function isColumnLike(x: unknown): boolean {
  return !!x && typeof x === "object" && ((x as any).__col === true || typeof (x as any).name === "string");
}

function resolveTableName(x: unknown): TableName | null {
  if (typeof x === "string") return x as TableName;
  if (!x || typeof x !== "object") return null;
  // Demo table object (Record<string, ColRef>)
  const first = Object.values(x as any)[0];
  if (isDemoCol(first)) return first.table;
  // Drizzle pgTable
  try {
    const n = getTableName(x as any);
    if (typeof n === "string" && n in tables) return n as TableName;
  } catch {
    // not a drizzle table
  }
  return null;
}

function resolveColTable(col: unknown): TableName | null {
  if (!col || typeof col !== "object") return null;
  if (isDemoCol(col)) return col.table;
  const c = col as any;
  if (c.table) {
    try {
      const n = getTableName(c.table);
      if (typeof n === "string" && n in tables) return n as TableName;
    } catch {
      // ignore
    }
  }
  return null;
}

function resolveColName(col: unknown): string | null {
  if (!col || typeof col !== "object") return null;
  if (isDemoCol(col)) return col.name;
  const c = col as any;
  if (typeof c.name === "string") return snakeToCamel(c.name);
  return null;
}

/** Compare two values tolerating Date/number/string mismatches found in demo data. */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  if (a instanceof Date || b instanceof Date) {
    const ta = a instanceof Date ? a.getTime() : new Date((a as any).toString()).getTime();
    const tb = b instanceof Date ? b.getTime() : new Date((b as any).toString()).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return false;
    return ta === tb;
  }
  return String(a) === String(b);
}
// ---- Query builder --------------------------------------------------------

// Each select row is scoped per table so inner/left joins can reference
// columns from multiple tables without key collisions.
type Scope = Partial<Record<TableName, Row>>;

interface JoinSpec {
  kind: "inner" | "left";
  table: TableName;
  on: EqCondition;
}

/** Case-insensitive glob match: % = any sequence, _ = exactly one char. */
function ilikeMatch(s: string, pattern: string): boolean {
  let si = 0;
  let pi = 0;
  let starP = -1;
  let starS = 0;
  const S = s.toLowerCase();
  const P = pattern.toLowerCase();
  while (si < S.length) {
    if (pi < P.length && (P[pi] === "_" || P[pi] === S[si])) {
      si++;
      pi++;
    } else if (pi < P.length && P[pi] === "%") {
      starP = pi++;
      starS = si;
    } else if (starP >= 0) {
      pi = starP + 1;
      si = ++starS;
    } else {
      return false;
    }
  }
  while (pi < P.length && P[pi] === "%") pi++;
  return pi === P.length;
}

function lookup(scope: Scope, col: unknown): unknown {
  const tbl = resolveColTable(col);
  const key = resolveColName(col);
  if (!tbl || !key) return undefined;
  const row = scope[tbl];
  if (row == null) return undefined;
  return row[key];
}

// Normalize timestamp columns to Date objects (matching Drizzle's return
// shape) so UI code can call toISOString() etc.
function timestampKeys(rec: Row): void {
  for (const key of ["createdAt", "updatedAt"]) {
    const v = rec[key];
    if (typeof v === "string") {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) rec[key] = d;
    }
  }
}

function toModel(row: Row): Row {
  const out = { ...row };
  timestampKeys(out);
  return out;
}

function dedupeRows(rows: Row[]): Row[] {
  const seen = new Set<string>();
  const out: Row[] = [];
  for (const r of rows) {
    const key = JSON.stringify(r ?? {});
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

class QueryBuilder {
  private _table: TableName | null = null;
  private _where: Condition[] = [];
  private _orConditions: Condition[][] = [];
  private _joins: JoinSpec[] = [];
  private _orderBy: AscDesc[] = [];
  private _limit: number | null = null;
  private _insertVals: Row[] = [];
  private _updateVals: Row | null = null;
  private _returning = false;
  private _projection: Record<string, unknown> | null = null;
  private _distinct = false;

  constructor(private mode: "select" | "insert" | "update" | "delete" = "select") {}

  from(table: unknown): this {
    this._table = resolveTableName(table);
    return this;
  }

  setProjection(fields?: Record<string, unknown>): this {
    this._projection = fields ?? null;
    return this;
  }

  where(cond: Condition | Condition[]): this {
    const list = Array.isArray(cond) ? cond : [cond];
    for (const c of list) this._applyWhere(c);
    return this;
  }

  private _applyWhere(cond: Condition): void {
    const c = cond as any;
    if (c.__and) {
      for (const sub of c.conditions) this._applyWhere(sub);
    } else if (c.__or) {
      this._orConditions.push(c.conditions);
    } else {
      this._where.push(cond);
    }
  }

  limit(n: number): this {
    this._limit = n;
    return this;
  }

  orderBy(...specs: AscDesc[]): this {
    for (const s of specs) {
      if (s && s.__order) this._orderBy.push(s);
    }
    return this;
  }

  innerJoin(table: unknown, on: EqCondition): this {
    const t = resolveTableName(table);
    if (t) this._joins.push({ kind: "inner", table: t, on });
    return this;
  }

  leftJoin(table: unknown, on: EqCondition): this {
    const t = resolveTableName(table);
    if (t) this._joins.push({ kind: "left", table: t, on });
    return this;
  }

  values(vals: Row | Row[]): this {
    this._insertVals = Array.isArray(vals) ? vals : [vals];
    return this;
  }

  set(vals: Row): this {
    this._updateVals = vals;
    return this;
  }

  returning(): this {
    this._returning = true;
    return this;
  }

  distinct(): this {
    this._distinct = true;
    return this;
  }

  async execute(): Promise<Row[]> {
    if (!this._table) {
      throw new Error("[demo-db] Cannot run query — table not resolved");
    }
    if (this.mode === "insert") return this._runInsert();
    if (this.mode === "update") return this._runUpdate();
    if (this.mode === "delete") return this._runDelete();
    return this._runSelect();
  }

  // ---- INSERT --------------------------------------------------------------

  private _runInsert(): Row[] {
    const arr = tables[this._table!];
    const inserted: Row[] = [];
    for (const vals of this._insertVals) {
      const row: Row = { ...vals };
      if (row.id == null) row.id = randomUUID();
      if (row.createdAt == null) row.createdAt = new Date().toISOString();
      if (row.updatedAt == null) row.updatedAt = row.createdAt;
      if (this._table === "users" && row.role == null) row.role = "customer";
      if (this._table === "bookings" && row.status == null) row.status = "pending";
      arr.push(row);
      inserted.push(row);
    }
    return this._returning ? inserted.map(toModel) : [];
  }

  // ---- UPDATE --------------------------------------------------------------

  private _runUpdate(): Row[] {
    const arr = tables[this._table!];
    const matched: Row[] = [];
    for (const row of arr) {
      if (this._matchRow(row)) {
        Object.assign(row, this._updateVals);
        matched.push(row);
      }
    }
    return this._returning ? matched.map(toModel) : [];
  }

  // ---- DELETE --------------------------------------------------------------

  private _runDelete(): Row[] {
    const arr = tables[this._table!];
    const keep = arr.filter((row) => !this._matchRow(row));
    arr.length = 0;
    arr.push(...keep);
    return [];
  }

  // ---- SELECT --------------------------------------------------------------

  private _runSelect(): Row[] {
    const baseTable = this._table!;
    let scopes: Scope[] = tables[baseTable].map((r) => ({ [baseTable]: r }));

    // Apply joins (column-to-column or column-to-literal) with per-table scope
    for (const join of this._joins) {
      const joinRows = tables[join.table];
      const lhsKey = resolveColName(join.on.col) ?? "id";
      const rhsExpr = join.on.value;
      const rhsIsCol = isColumnLike(rhsExpr);
      const next: Scope[] = [];
      for (const scope of scopes) {
        const rhsVal = rhsIsCol ? lookup(scope, rhsExpr) : rhsExpr;
        let matched = false;
        for (const jRow of joinRows) {
          if (valuesEqual(jRow[lhsKey], rhsVal)) {
            next.push({ ...scope, [join.table]: jRow });
            matched = true;
          }
        }
        if (!matched && join.kind === "left") {
          next.push({ ...scope, [join.table]: {} });
        }
      }
      scopes = next;
    }

    // WHERE (after joins to mirror SQL semantics)
    scopes = scopes.filter((s) => this._matchScope(s));

    // ORDER BY (before projection so hidden sort keys still apply)
    this._sortScopes(scopes);

    // Projection (aggregate or row mapping)
    if (this._projection && Object.keys(this._projection).length > 0) {
      if (this._hasAggregates()) {
        const aggRow: Row = {};
        for (const [alias, expr] of Object.entries(this._projection)) {
          aggRow[alias] = this._aggregate(expr, scopes);
        }
        return [aggRow];
      }
      let rows = scopes.map((s) => {
        const rec: Row = {};
        for (const [alias, expr] of Object.entries(this._projection!)) {
          rec[alias] = isColumnLike(expr) ? lookup(s, expr) : undefined;
        }
        timestampKeys(rec);
        return rec;
      });
      if (this._distinct) rows = dedupeRows(rows);
      if (this._limit != null) rows = rows.slice(0, this._limit);
      return rows;
    }

    // Plain rows (no projection)
    let rows = scopes.map((s) => toModel(s[baseTable] ?? {}));
    if (this._distinct) rows = dedupeRows(rows);
    if (this._limit != null) rows = rows.slice(0, this._limit);
    return rows;
  }

  private _sortScopes(scopes: Scope[]): void {
    for (const spec of this._orderBy) {
      const dir = spec.dir === "asc" ? 1 : -1;
      scopes.sort((a, b) => {
        const av = lookup(a, spec.col);
        const bv = lookup(b, spec.col);
        if (av == null && bv == null) return 0;
        if (av == null) return 1 * dir;
        if (bv == null) return -1 * dir;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
  }

  private _hasAggregates(): boolean {
    return Object.values(this._projection ?? {}).some((e) => e && (e as any).__avg === true || e && (e as any).__count === true);
  }

  private _aggregate(expr: unknown, scopes: Scope[]): unknown {
    const e = expr as any;
    if (e && e.__count) {
      if (e.col) return scopes.filter((s) => lookup(s, e.col) != null).length;
      return scopes.length;
    }
    if (e && e.__avg) {
      const vals: number[] = scopes
        .map((s) => Number(lookup(s, e.col)))
        .filter((v) => Number.isFinite(v));
      if (vals.length === 0) return null;
      return vals.reduce((sum, v) => sum + v, 0) / vals.length;
    }
    return null;
  }

  private _matchRow(row: Row): boolean {
    return this._matchScope({ [this._table!]: row });
  }

  private _matchScope(scope: Scope): boolean {
    for (const cond of this._where) {
      if (!this._evalCondition(cond, scope)) return false;
    }
    for (const group of this._orConditions) {
      if (!group.some((c) => this._evalCondition(c, scope))) return false;
    }
    return true;
  }

  private _evalCondition(cond: Condition, scope: Scope): boolean {
    const c = cond as any;
    if (c.__eq) return valuesEqual(lookup(scope, c.col), c.value);
    if (c.__ne) return !valuesEqual(lookup(scope, c.col), c.value);
    if (c.__notIn) {
      const list: unknown[] = c.values ?? [];
      return !list.includes(lookup(scope, c.col));
    }
if (c.__ilike) {
      const val = lookup(scope, c.col);
      if (typeof val !== "string" && typeof val !== "number") return false;
      return ilikeMatch(String(val), String(c.value));
    }
    if (c.__and) return (c.conditions as Condition[]).every((sub) => this._evalCondition(sub, scope));
    if (c.__or) return (c.conditions as Condition[]).some((sub) => this._evalCondition(sub, scope));
    return false;
  }

  then(onFulfilled?: (value: Row[]) => any, onRejected?: (reason: any) => any): Promise<Row[]> {
    return this.execute().then(onFulfilled, onRejected);
  }
}
// ---- Chainable API ---------------------------------------------------------

function makeChainable(b: QueryBuilder) {
  const chain = {
    from: (table: unknown) => {
      b.from(table);
      return chain;
    },
    where: (cond: Condition | Condition[]) => {
      b.where(cond);
      return chain;
    },
    limit: (n: number) => {
      b.limit(n);
      return chain;
    },
    orderBy: (...specs: AscDesc[]) => {
      b.orderBy(...specs);
      return chain;
    },
    innerJoin: (table: unknown, on: EqCondition) => {
      b.innerJoin(table, on);
      return chain;
    },
    leftJoin: (table: unknown, on: EqCondition) => {
      b.leftJoin(table, on);
      return chain;
    },
    distinct: () => {
      b.distinct();
      return chain;
    },
    then: (onFulfilled?: (value: Row[]) => any, onRejected?: (reason: any) => any) =>
      b.execute().then(onFulfilled, onRejected),
  };
  return chain;
}

export const db = {
  select: (fields?: Record<string, unknown>) => {
    const b = new QueryBuilder("select");
    b.setProjection(fields);
    return makeChainable(b);
  },
  selectDistinct: (fields?: Record<string, unknown>) => {
    const b = new QueryBuilder("select");
    b.setProjection(fields);
    b.distinct();
    return makeChainable(b);
  },
  insert: (table: unknown) => {
    const b = new QueryBuilder("insert");
    b.from(table);
    return {
      values: (vals: Row | Row[]) => {
        b.values(vals);
        return {
          returning: () => {
            b.returning();
            return b.execute();
          },
          then: (onFulfilled?: (value: Row[]) => any, onRejected?: (reason: any) => any) =>
            b.execute().then(onFulfilled, onRejected),
        };
      },
    };
  },
  update: (table: unknown) => {
    const b = new QueryBuilder("update");
    b.from(table);
    return {
      set: (vals: Row) => {
        b.set(vals);
        return {
          where: (cond: Condition | Condition[]) => {
            b.where(cond);
            return {
              returning: () => {
                b.returning();
                return b.execute();
              },
              then: (onFulfilled?: (value: Row[]) => any, onRejected?: (reason: any) => any) =>
                b.execute().then(onFulfilled, onRejected),
            };
          },
        };
      },
    };
  },
  delete: (table: unknown) => {
    const b = new QueryBuilder("delete");
    b.from(table);
    return {
      where: (cond: Condition | Condition[]) => {
        b.where(cond);
        return b.execute();
      },
    };
  },
  // Health-check shim: resolves so /api/health reports healthy in demo mode.
  execute: async () => [{ ok: true }],
} as any;
