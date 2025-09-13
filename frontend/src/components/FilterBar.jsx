import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/FilterBar.scss";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function FilterBar({
  fields,
  onChange,
  collapsedByDefault = false,
}) {
  const query = useQuery();
  const navigate = useNavigate();
  const [open, setOpen] = useState(!collapsedByDefault);

  const [values, setValues] = useState(() =>
    fields.reduce(
      (acc, f) => ({ ...acc, [f.name]: query.get(f.name) || "" }),
      {}
    )
  );

  // синхронизировать из URL (когда таб меняется)
  useEffect(() => {
    setValues(
      fields.reduce(
        (acc, f) => ({ ...acc, [f.name]: query.get(f.name) || "" }),
        {}
      )
    );
  }, [fields, query]);

  function apply(v) {
    const params = new URLSearchParams(Array.from(query.entries()));
    Object.entries(v).forEach(([k, val]) => {
      if (val) params.set(k, val);
      else params.delete(k);
    });
    navigate({ search: params.toString() }, { replace: true });
    onChange?.(v);
  }

  function clear() {
    const empty = fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});
    apply(empty);
  }

  return (
    <div className="filterbar">
      <button className="filter-toggle" onClick={() => setOpen(!open)}>
        Фильтр {open ? "▴" : "▾"}
      </button>
      {open && (
        <div className="filter-grid">
          {fields.map((f) => (
            <div key={f.name} className="filter-item">
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  onBlur={() => apply(values)}
                >
                  <option value="">—</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                      {opt.label ?? opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[f.name]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  onBlur={() => apply(values)}
                  placeholder={f.placeholder || ""}
                />
              )}
            </div>
          ))}
          <div className="filter-actions">
            <button className="btn-secondary" onClick={clear}>
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* чипы активных фильтров */}
      <div className="filter-chips">
        {fields.map((f) => {
          const val = values[f.name];
          if (!val) return null;
          const label =
            f.options?.find((o) => (o.value ?? o) === val)?.label ?? val;
          return (
            <span
              key={f.name}
              className="chip"
              onClick={() => apply({ ...values, [f.name]: "" })}
            >
              {f.label}: {label} ✕
            </span>
          );
        })}
      </div>
    </div>
  );
}
