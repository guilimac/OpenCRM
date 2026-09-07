import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'System health check and uptime probe' })
  check() {
    return {
      status: 'ok',
      service: 'opencrm-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
