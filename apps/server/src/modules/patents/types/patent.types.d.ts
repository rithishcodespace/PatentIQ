export interface PatentSection {
    title: string;
    abstract: string;
    claims: string[];
    description?: string | undefined;
    ipcClassifications: string[];
    filingDate?: Date | undefined;
    grantDate?: Date | undefined;
    inventors?: string[] | undefined;
    assignee?: string | undefined;
}
export interface CleanedPatentRecord extends PatentSection {
    id: string;
    patentNumber: string;
    cleanedAt: Date;
}
//# sourceMappingURL=patent.types.d.ts.map