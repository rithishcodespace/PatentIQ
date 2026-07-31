import { dummyReport, dummyResults } from '../data/dummyData'

export async function searchPatents() {
  return {
    report: dummyReport,
    results: dummyResults,
  }
}