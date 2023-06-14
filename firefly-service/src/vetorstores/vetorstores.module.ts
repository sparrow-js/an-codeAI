import { Module } from '@nestjs/common';
import { VetorStoresService } from './vetorstores.service';

@Module({
  providers: [VetorStoresService],
  exports: [VetorStoresService],
})
export class VetorStoresModule {}
