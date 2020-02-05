import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiReservationController } from './api-reservation.controller';
import { ReservationController } from './reservation.controller';
import { ReservationSchema } from './reservation.schema';
import { ReservationService } from './reservation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
    ]),
    TocologistModule,
    TocologistServicesModule,
  ],
  controllers: [ReservationController, ApiReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
