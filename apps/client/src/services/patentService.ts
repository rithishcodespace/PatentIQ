import { searchPatent, compareInventionFile, compareDirectText, fetchSearchHistory, deleteSearchHistoryRecord } from "./api";

export {
  searchPatent,
  compareInventionFile,
  compareDirectText,
  fetchSearchHistory,
  deleteSearchHistoryRecord,
};

export async function searchPatents(query?: any) {
  return searchPatent(query);
}
