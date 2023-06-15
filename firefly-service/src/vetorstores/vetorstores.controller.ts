import { Controller, Get, Query } from '@nestjs/common';

@Controller('vetorstores')
export class VetorStoresController {
  constructor() {
    console.log('*');
  }
}
