export declare function unzip(zipFileLocation: string, unzipDirLocation: string): Promise<void>;
export declare function archiveFolder(folderPath: any, targetPath: any, zipName: any): Promise<unknown>;
/**
 *  Returns array of files present in archived package
 */
export declare function getArchivedEntries(archivedPackage: string): Promise<unknown>;
