import { BaseService } from "./base.service";
import { Manufacturer } from "../types";

export class ManufacturerService extends BaseService<Manufacturer> {
  constructor() {
    super(Manufacturer);
  }
}
