import { IPaginated } from '../interfaces/paginated.inteface';

export class BaseDbService {
  Model: any;
  constructor(model) {
    this.Model = model;
  }

  async getPaginated(ctx: IPaginated) {}
  async show() {}
  async store() {}
  async update() {}
  async destroy() {}
}
