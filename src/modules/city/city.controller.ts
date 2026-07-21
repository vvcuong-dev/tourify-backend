import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { CityResponse } from './responses/city.response';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiOperation({ summary: 'List all cities' })
  @ApiResponse({
    status: 200,
    description: 'Cities retrieved successfully.',
    type: CityResponse,
    isArray: true,
  })
  findAll() {
    return this.cityService.findAll();
  }
}
