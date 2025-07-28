// hooks/useProtectedQuery.ts
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";

export function useProtectedQuery<TData>(
  queryResult: UseTRPCQueryResult<TData, unknown>,
  redirectTo = "/dashboard/forbidden"
) {
  const router = useRouter();
  const { error } = queryResult;

  useEffect(() => {
    if (error && (error as any)?.data?.code === "FORBIDDEN") {
      router.push(redirectTo);
    }
  }, [error, router, redirectTo]);

  return queryResult;
}
