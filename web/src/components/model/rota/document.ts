import date from "date-and-time";
import Excel from "exceljs";
import {Preferences, Statistics} from "../domain";
import {PrefsTable, ShiftTable} from "./table";

export class Document {
  private readonly prefsTable: PrefsTable;

  readonly themeColors: string[] = Array(10);
  readonly tables: ShiftTable[];

  static async build(file: File): Promise<Document> {
    const workbook = new Excel.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    return new Document(file, workbook);
  }

  private constructor(readonly file: File, readonly workbook: Excel.Workbook) {
    this.setThemeColors();
    this.prefsTable = new PrefsTable(this.workbook.getWorksheet("Preferences"));
    this.tables = workbook.worksheets
      .filter(sheet => !isNaN(date.parse(sheet.name, "DD-MM-YYYY").getDate()))
      .map(sheet => new ShiftTable(this, sheet));
  }

  private setThemeColors() {
    const themes = this.workbook.model.themes;
    // @ts-ignore
    const theme = themes["theme1"];
    const parser = new DOMParser();
    const themeXml = parser.parseFromString(theme, "text/xml");
    const lt1 = themeXml.getElementsByTagName("a:lt1")[0];
    this.themeColors[0] = lt1.getElementsByTagName("a:sysClr")[0].getAttribute("lastClr")!;
    const dk1 = themeXml.getElementsByTagName("a:dk1")[0];
    this.themeColors[1] = dk1.getElementsByTagName("a:sysClr")[0].getAttribute("lastClr")!;
    const lt2 = themeXml.getElementsByTagName("a:lt2")[0];
    this.themeColors[2] = lt2.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const dk2 = themeXml.getElementsByTagName("a:dk2")[0];
    this.themeColors[3] = dk2.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent1 = themeXml.getElementsByTagName("a:accent1")[0];
    this.themeColors[4] = accent1.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent2 = themeXml.getElementsByTagName("a:accent2")[0];
    this.themeColors[5] = accent2.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent3 = themeXml.getElementsByTagName("a:accent3")[0];
    this.themeColors[6] = accent3.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent4 = themeXml.getElementsByTagName("a:accent4")[0];
    this.themeColors[7] = accent4.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent5 = themeXml.getElementsByTagName("a:accent5")[0];
    this.themeColors[8] = accent5.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
    const accent6 = themeXml.getElementsByTagName("a:accent6")[0];
    this.themeColors[9] = accent6.getElementsByTagName("a:srgbClr")[0].getAttribute("val")!;
  }

  preferences(employeeName: string): Preferences {
    return this.prefsTable.getPreferences(employeeName);
  }

  statistics(recentTables: ShiftTable[], employeeName: string): Statistics {
    return recentTables.reduce((statistics: Statistics, table: ShiftTable) => {
      const record = table.findRecord(employeeName);
      if (record !== undefined) {
        statistics.addAssign(record.statistics);
      }
      return statistics;
    }, new Statistics());
  }

  tablesPreceding(sheet: Excel.Worksheet): ShiftTable[] {
    const thisSheetDate = date.parse(sheet.name, "DD-MM-YYYY");
    return this.tables.filter(table => {
      const sheetDate = date.parse(table.sheet.name, "DD-MM-YYYY");
      const dateDifference = date.subtract(thisSheetDate, sheetDate).toDays();
      // Consider sheets dated up to 12 weeks (84 days) before this sheet
      return dateDifference > 0 && dateDifference <= 84
    });
  }

  async getFile(): Promise<File> {
    this.workbook.eachSheet(worksheet => worksheet.removeConditionalFormatting(true));
    const buffer = await this.workbook.xlsx.writeBuffer();
    return new File([buffer], this.file.name, {type: this.file.type});
  }
}
