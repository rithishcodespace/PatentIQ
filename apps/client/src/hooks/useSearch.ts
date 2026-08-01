import { useMemo, useState } from "react";
import { searchPatent } from "../services/api";
import type { PatentSearchPayload } from "../types/search";
import type { SearchResponse } from "../types/api";

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actions = useMemo(
    () => ({
      async runSearch(
        payload: PatentSearchPayload
      ): Promise<SearchResponse | null> {
        setLoading(true);
        setError(null);

        try {
          return await searchPatent(payload);
        } catch (cause) {
          setError(
            cause instanceof Error ? cause.message : "Unable to complete search"
          );
          return null;
        } finally {
          setLoading(false);
        }
      },
      resetError() {
        setError(null);
      },
    }),
    []
  );

  return { loading, error, ...actions };
}
