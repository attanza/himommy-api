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
  const validNumber = validator.isNumber(height);
  if (!validNumber) {
    throw new BadRequestException('height should be a number');
  }
};

const validateWeight = body => {
  const { weight } = body;
  if (!weight || weight === '') {
    throw new BadRequestException('weight is required');
  }
  const validNumber = validator.isNumber(weight);
  if (!validNumber) {
    throw new BadRequestException('weight should a number');
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
