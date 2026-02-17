import { BaseController } from "./base.controller";
import { ManufacturerService } from "../services/manufacturer.service";

export class ManufacturerController extends BaseController<ManufacturerService> {
  constructor() {
    super(new ManufacturerService());
  }
}
