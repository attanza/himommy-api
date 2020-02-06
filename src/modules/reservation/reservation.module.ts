import { TocologistServicesModule } from '@modules/tocologist-services/tocologist-services.module';
import { TocologistModule } from '@modules/tocologist/tocologist.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileReservationController } from './mobile-reservation.controller';
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
  controllers: [ReservationController, MobileReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
