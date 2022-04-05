import React from 'react';

import { CompactConfig } from '../../EnvVisualizerCompactConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { CompactReferenceType, PrimitiveTypes } from '../../EnvVisualizerTypes';
import { getTextWidth, isNull } from '../../EnvVisualizerUtils';
import { ArrayNullUnit } from '../ArrayNullUnit';
import { Binding } from '../Binding';
import { Text } from '../Text';
import { Value } from './Value';

/** this classes encapsulates a primitive value in Source: number, string or null */
export class PrimitiveValue extends Value {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  private _isDrawn: boolean = false;

  /** the text to be rendered */
  readonly text: Text | ArrayNullUnit;

  constructor(
    /** data */
    readonly data: PrimitiveTypes,
    /** what this value is being referenced by */
    readonly referencedBy: CompactReferenceType[]
  ) {
    super();

    // derive the coordinates from the main reference (binding / array unit)
    const mainReference = this.referencedBy[0];
    if (mainReference instanceof Binding) {
      this._x =
        mainReference.x() + getTextWidth(mainReference.keyString) + CompactConfig.TextPaddingX;
      this._y = mainReference.y();
      this.text = new Text(this.data, this.x(), this.y(), { isStringIdentifiable: true });
    } else {
      const maxWidth = mainReference.width();
      const textWidth = Math.min(getTextWidth(String(this.data)), maxWidth);
      this._x = mainReference.x() + (mainReference.width() - textWidth) / 2;
      this._y = mainReference.y() + (mainReference.height() - CompactConfig.FontSize) / 2;
      this.text = isNull(this.data)
        ? new ArrayNullUnit([mainReference])
        : new Text(this.data, this.x(), this.y(), {
            maxWidth: maxWidth,
            isStringIdentifiable: true
          });
    }

    this._width = this.text.width();
    this._height = this.text.height();
  }

  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  height(): number {
    return this._height;
  }
  width(): number {
    return this._width;
  }
  isDrawn(): boolean {
    return this._isDrawn;
  }
  reset(): void {}
  updatePosition(pos?: { x: number; y: number }): void {}
  draw(): React.ReactNode {
    return <React.Fragment key={Layout.key++}>{this.text.draw()}</React.Fragment>;
  }
}
