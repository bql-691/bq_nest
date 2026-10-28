import 'reflect-metadata';
import { Type } from 'class-transformer';
import { Equals, IsArray, IsNumber, IsString, MinLength, ValidateNested } from 'class-validator';

export class LineShape {
  @Equals('project/LineShape')
  type = 'project/LineShape' as const;

  @IsString()
  @MinLength(1)
  id!: string;

  @IsNumber()
  x1!: number;

  @IsNumber()
  y1!: number;

  @IsNumber()
  x2!: number;

  @IsNumber()
  y2!: number;
}

export class RectShape {
  @Equals('project/RectShape')
  type = 'project/RectShape' as const;

  @IsString()
  @MinLength(1)
  id!: string;

  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;
}

const shapeTypes = [
  { name: 'project/LineShape', value: LineShape },
  { name: 'project/RectShape', value: RectShape },
];

export class Document {
  @Equals('project/Document')
  type = 'project/Document' as const;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineShape, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: shapeTypes,
    },
  })
  shapes: Array<LineShape | RectShape> = [];
}
