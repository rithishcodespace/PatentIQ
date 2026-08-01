/**
 * @deprecated This file duplicated services/api.ts and imported named
 * exports (`dummyReport`, `dummyResults`) that didn't exist on dummyData,
 * which would throw at runtime. It's kept only as a compatibility shim in
 * case something else still imports `searchPatents` from here — point new
 * code at `services/api.ts` -> `searchPatent(payload)` instead, which
 * actually receives the user's form input.
 */
import { searchPatent } from "./api";

export async function searchPatents() {
  return searchPatent();
}
