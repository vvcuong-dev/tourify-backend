import { TourImage } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TourImageResponse {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  url!: string;
  @ApiProperty({ example: 'tour/image/public-id', nullable: true })
  publicId!: string | null;

  constructor(image: TourImage) {
    this.id = image.id;
    this.url = image.url;
    this.publicId = image.publicId;
  }
}
