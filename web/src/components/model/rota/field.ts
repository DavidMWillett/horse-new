import Excel from "exceljs";
import {Duty, Status} from "../domain";
import Color from "color";
import assert from "assert";


abstract class Field {
  constructor(protected readonly cell: Excel.Cell) {}
}


export class TextField extends Field {
  get text() {
    return this.cell.text;
  }
}


export class PreferenceField extends Field {
  get canDo(): boolean {
    return this.cell.text === "Y";
  }
}


/**
 * A generic colored field.
 *
 * A field referencing a cell that is not of type pattern and of pattern solid is regarded as white, otherwise the
 * foreground color of the cell defines the color of the field.
 */

abstract class ColoredField extends Field {
  constructor(private readonly themeColors: string[], cell: Excel.Cell) {
    super(cell);
  }

  private _color: Color | undefined;

  get color(): Color {
    if (this._color === undefined) {
      this._color = this.getColor();
    }
    return this._color;
  }

  set color(value) {
    this.cell.style = {
      ...this.cell.style,
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: {argb: "FF" + value.hex().substring(1)},
      }
    }
    this._color = value;
  }

  private getColor(): Color {
    const fill = this.cell.fill;
    return fill.type === "pattern" && fill.pattern === "solid"
      // @ts-ignore
      ? this.getSolidColor(fill.fgColor)
      : Color("#FFFFFF");
  }

  private getSolidColor(fgColor: Partial<Excel.Color>): Color {
    if (fgColor.hasOwnProperty("argb")) {
      return Color("#" + fgColor.argb!.substring(2));
    }
    if (fgColor.hasOwnProperty("theme")) {
      assert(fgColor.theme !== undefined && fgColor.theme >= 0 && fgColor.theme <= 9);
      const color = Color("#" + this.themeColors[fgColor.theme]);
      if (fgColor.hasOwnProperty("tint")) {
        // @ts-ignore
        return color.lighten(fgColor.tint);
      }
      return color;
    }
    assert(false, "fgColor must have either argb or theme property");
  }
}


/**
 * A field representing an employee's shift.
 *
 * Provides methods for determining the status and/or duty from the color of the field.
 */

export class ShiftField extends ColoredField {
  get status(): Status {
    const status = Status.fromColor(this.color);
    if (status !== null) return status;
    if (ShiftField.isShadeOfGray(this.color) || this.cell.text === "A/L") return Status.ANNUAL_LEAVE;
    if (Duty.fromColor(this.color) !== null) return Status.AVAILABLE;
    return Status.UNAVAILABLE;
  }

  get duty(): Duty | null {
    return Duty.fromColor(Color(this.color));
  }

  set duty(value) {
    assert(value !== null);
    this.color = value.color;
  }

  private static isShadeOfGray(color: Color) {
    return color.array().every((val, i, arr) => val === arr[0]);
  }
}
