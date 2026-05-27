type Column<T> = {
  label: string;
  key: keyof T;
};

type StatsRow = Record<string, string | number> & {
  id: string | number;
  player: string;
  team: string;
  updatedAt: string;
};

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
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>

      {rows.length > 0 ? (
        <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm md:block">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-4 py-3">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row) => (
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
          {rows.map((row) => (
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
