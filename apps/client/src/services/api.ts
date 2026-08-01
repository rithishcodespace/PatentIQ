import { dummyData } from "../data/dummyData";
import type { PatentSearchPayload } from "../types/search";
import type { SearchResponse } from "../types/api";

export const searchPatent = async (
  _payload?: PatentSearchPayload
): Promise<SearchResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return dummyData;
};