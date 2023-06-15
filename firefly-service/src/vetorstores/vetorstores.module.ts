import { Module } from '@nestjs/common';
import { VetorStoresService } from './vetorstores.service';
import { VetorStoresController } from './vetorstores.controller';
@Module({
  providers: [VetorStoresService],
  controllers: [VetorStoresController],
  exports: [VetorStoresService],
})
export class VetorStoresModule {}
