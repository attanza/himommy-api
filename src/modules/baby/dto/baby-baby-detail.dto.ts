import { BadRequestException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { Request } from 'express';
import { EBabyDetailData } from '../baby.interface';

const validator = new Validator();

export const ValidateBabyDetail = async (
  babyDetailParam: string,
  request: Request
) => {
  switch (babyDetailParam) {
    case EBabyDetailData.heights:
      validateHeight(request.body);
      break;

    case EBabyDetailData.weights:
      validateWeight(request.body);
      break;

    case EBabyDetailData.immunizations:
      validateImmunization(request.body);
      break;

    case EBabyDetailData.photos:
      break;

    default:
      throw new BadRequestException('Unknown babyDetailParam');
  }
};

const validateHeight = body => {
  const { height } = body;
  if (!height || height === '') {
    throw new BadRequestException('height is required');
  }
  const validInt = validator.isInt(height);
  if (!validInt) {
    throw new BadRequestException('height should be an integer');
  }
};

const validateWeight = body => {
  const { weight } = body;
  if (!weight || weight === '') {
    throw new BadRequestException('weight is required');
  }
  const validInt = validator.isInt(weight);
  if (!validInt) {
    throw new BadRequestException('weight should be an integer');
  }
};

const validateImmunization = body => {
  const { immunization } = body;
  if (!immunization || immunization === '') {
    throw new BadRequestException('immunization is required');
  }

  const validMongo = validator.isMongoId(immunization);
  if (!validMongo) {
    throw new BadRequestException('immunization should be a valid mongo id');
  }
};
