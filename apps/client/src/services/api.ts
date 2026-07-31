import { dummyData } from "../data/dummyData";
import type { SearchResponse } from "../types/api";

export const searchPatent = async (_payload?: {
    title: string;
    abstract: string;
    claims: string;
}): Promise<SearchResponse> => {

        await new Promise(resolve=>setTimeout(resolve,2000));

        return dummyData;

}