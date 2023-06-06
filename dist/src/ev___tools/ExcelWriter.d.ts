export namespace ExcelWriter {
    function writeInExcel(complex_array?: any[], file_name?: string, params?: {
        properties: {
            defaultColWidth: number;
        };
    }): Promise<void>;
    function writeInExcelX(template?: {
        columnsKeys: {
            key: string;
        }[];
        columnsDesc: string[];
        rowsData: {
            title_1: string;
            title_2: string;
        }[];
    }, fileName?: string, params?: {
        properties: {
            defaultColWidth: number;
            tabColor: {
                argb: string;
            };
        };
    }): Promise<void>;
}
export const F_XLSX: "xlsx";
export const F_CSV: "csv";
