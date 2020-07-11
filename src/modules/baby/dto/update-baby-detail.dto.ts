import { BadRequestException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { Request } from 'express';
import { EBabyDetailData } from '../baby.interface';

const validator = new Validator();

export const ValidateUpdateBabyDetail = async (
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
  const { height, heightId } = body;
  if (heightId) {
    const validMongoId = validator.isMongoId(heightId);
    if (!validMongoId) {
      throw new BadRequestException('heightId should be a valid mongo id');
    }
  }
  if (height) {
    const validNumber = validator.isNumber(height);
    if (!validNumber) {
      throw new BadRequestException('height should be an integer');
    }
  }
};

const validateWeight = body => {
  const { weight, weightId } = body;
  if (weightId) {
    const validMongoId = validator.isMongoId(weightId);
    if (!validMongoId) {
      throw new BadRequestException('weightId should be a valid mongo id');
    }
  }
  if (weight) {
    const validNumber = validator.isNumber(weight);
    if (!validNumber) {
      throw new BadRequestException('weight should be an integer');
    }
  }
};

const validateImmunization = body => {
  const { immunization, immunizationId } = body;
  if (immunizationId) {
    const validMongoId = validator.isMongoId(immunizationId);
    if (!validMongoId) {
      throw new BadRequestException(
        'immunizationId should be a valid mongo id'
      );
    }
  }

  if (immunization) {
    const validMongo = validator.isMongoId(immunization);
    if (!validMongo) {
      throw new BadRequestException('immunization should be a valid mongo id');
    }
  }
};
