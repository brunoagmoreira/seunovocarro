import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesAdminController } from './vehicles-admin.controller';
import { AdminVehicleIntegrationGuard } from '../../common/guards/admin-vehicle-integration.guard';

@Module({
  controllers: [VehiclesAdminController, VehiclesController],
  providers: [VehiclesService, AdminVehicleIntegrationGuard],
})
export class VehiclesModule {}
