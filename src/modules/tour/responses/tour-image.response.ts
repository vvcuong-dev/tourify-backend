import { TourImage } from '../../../generated/prisma/client';

export class TourImageResponse {
  id!: number;
  url!: string;
  publicId!: string | null;

  constructor(image: TourImage) {
    this.id = image.id;
    this.url = image.url;
    this.publicId = image.publicId;
  }
}
