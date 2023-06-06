export function array_load(inputPath?: string, sheetName?: string): Promise<any[]>;
export function load_column(inputPath: any, sheetName: any, columnNumber: any): Promise<readonly import("exceljs").CellValue[] | undefined>;
export function load_columns(inputPath: any, sheetName: any, colStart: any, colEnd: any): Promise<(readonly import("exceljs").CellValue[] | undefined)[]>;
export function load_row(inputPath?: string, sheetName?: string, rowNumber?: number): Promise<any>;
export function load_rows(inputPath?: string, sheetName?: string, rowNumber?: number): Promise<any[]>;
export function save_array(outputPath?: string, sheetName?: string, array?: string[][], rowsFontHandler?: (row: any) => {
    name: string;
    family: number;
    size: number;
}): Promise<void>;
export function setStyles(path: any, sheetName?: string, rowsFontHandler?: (row: any) => {
    name: string;
    family: number;
    size: number;
}): Promise<void>;
