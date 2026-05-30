"use client";

import { useMemo, useState } from "react";

type Column<T> = {
  label: string;
  key: keyof T;
  preferredDirection?: SortDirection;
};

type StatsRow = Record<string, string | number> & {
  id: string | number;
  player: string;
  team: string;
  updatedAt: string;
};

type SortDirection = "asc" | "desc";

type SortState<T> = {
  key: keyof T;
  direction: SortDirection;
};

function getComparableValue(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const parsedNumber = Number(value);

  if (Number.isFinite(parsedNumber)) {
    return parsedNumber;
  }

  return value;
}

function compareValues(left: string | number, right: string | number) {
  const comparableLeft = getComparableValue(left);
  const comparableRight = getComparableValue(right);

  if (
    typeof comparableLeft === "number" &&
    typeof comparableRight === "number"
  ) {
    return comparableLeft - comparableRight;
  }

  return String(comparableLeft).localeCompare(String(comparableRight), "ja");
}

function getDefaultDirection<T extends StatsRow>(
  column: Column<T>
): SortDirection {
  return column.preferredDirection ?? "desc";
}

export function StatsSection<T extends StatsRow>({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: Column<T>[];
  rows: T[];
}) {
  const [sortState, setSortState] = useState<SortState<T> | null>(null);
  const sortedRows = useMemo(() => {
    if (!sortState) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      const comparison = compareValues(left[sortState.key], right[sortState.key]);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [rows, sortState]);

  function sortBy(column: Column<T>) {
    setSortState((current) => {
      if (current?.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: column.key,
        direction: getDefaultDirection(column),
      };
    });
  }

  function getSortMark(column: Column<T>) {
    if (sortState?.key !== column.key) {
      return "";
    }

    return sortState.direction === "asc" ? "↑" : "↓";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>

      {rows.length > 0 ? (
        <label className="block text-sm text-zinc-600 md:hidden">
          並び替え
          <select
            className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950"
            value={String(sortState?.key ?? "")}
            onChange={(event) => {
              const column = columns.find(
                (item) => String(item.key) === event.target.value
              );

              if (column) {
                setSortState({
                  key: column.key,
                  direction: getDefaultDirection(column),
                });
              } else {
                setSortState(null);
              }
            }}
          >
            <option value="">初期表示</option>
            {columns.map((column) => (
              <option key={String(column.key)} value={String(column.key)}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {rows.length > 0 ? (
        <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm md:block">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-4 py-3">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-semibold uppercase tracking-wide text-zinc-600 transition-colors hover:text-zinc-950"
                      onClick={() => sortBy(column)}
                    >
                      {column.label}
                      <span className="inline-block w-3 text-zinc-900">
                        {getSortMark(column)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sortedRows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-zinc-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-4 text-zinc-800 first:font-medium first:text-zinc-950"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
          データがありません
        </div>
      ) : (
        <div className="grid gap-3 md:hidden">
          {sortedRows.map((row) => (
            <article
              key={String(row.id)}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="font-semibold text-zinc-950">{row.player}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{row.team}</p>
                </div>
                <p className="text-right text-xs leading-5 text-zinc-500">
                  {row.updatedAt}
                </p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {columns.slice(2, -1).map((column) => (
                  <div
                    key={String(column.key)}
                    className="rounded-md bg-zinc-50 p-3"
                  >
                    <dt className="text-xs text-zinc-500">{column.label}</dt>
                    <dd className="mt-1 font-semibold text-zinc-950">
                      {row[column.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
