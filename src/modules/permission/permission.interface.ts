import { Document } from 'mongoose';
import { Field, ObjectType } from 'type-graphql';

export interface IPermission extends Document {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

@ObjectType()
export class OtPermission {
  @Field()
  _id: string;
  @Field()
  name: string;
  @Field()
  slug: string;
  @Field({ nullable: true })
  description: string;
  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
