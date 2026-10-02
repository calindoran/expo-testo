import { useCallback, useEffect, useRef, useState } from "react";
import {
  cachePokeApiResponse,
  readCachedPokeApiResponse,
} from "@/lib/pokeapi-cache";

interface PokeApiState<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

interface RequestState<T> {
  key: string;
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}

export function usePokeApi<T>(url: string): PokeApiState<T> {
  const [requestId, setRequestId] = useState(0);
  const [requestState, setRequestState] = useState<RequestState<T>>({
    key: `${url}:${requestId}`,
    data: undefined,
    error: null,
    isLoading: true,
  });
  const refreshUrl = useRef<string | undefined>(undefined);
  const requestKey = `${url}:${requestId}`;
  const state =
    requestState.key === requestKey
      ? requestState
      : { key: requestKey, data: undefined, error: null, isLoading: true };

  useEffect(() => {
    const controller = new AbortController();
    const forceRefresh = refreshUrl.current === url;
    refreshUrl.current = undefined;

    const load = async () => {
      if (!forceRefresh) {
        try {
          const cached = await readCachedPokeApiResponse<T>(url);
          if (controller.signal.aborted) return;
          if (cached !== undefined) {
            setRequestState({
              key: requestKey,
              data: cached,
              error: null,
              isLoading: false,
            });
            return;
          }
        } catch (cacheError) {
          console.error("Failed to read the PokéAPI cache", cacheError);
        }
      }

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const result = (await response.json()) as T;
        if (controller.signal.aborted) return;

        setRequestState({
          key: requestKey,
          data: result,
          error: null,
          isLoading: false,
        });

        try {
          await cachePokeApiResponse(url, result);
        } catch (cacheError) {
          console.error("Failed to cache the PokéAPI response", cacheError);
        }
      } catch (cause: unknown) {
        if (!controller.signal.aborted) {
          setRequestState({
            key: requestKey,
            data: undefined,
            error:
              cause instanceof Error ? cause : new Error("Unable to load data"),
            isLoading: false,
          });
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [url, requestId, requestKey]);

  const refresh = useCallback(() => {
    refreshUrl.current = url;
    setRequestId((current) => current + 1);
  }, [url]);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    refresh,
  };
}
