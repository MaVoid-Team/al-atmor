import { BaseController } from "./base.controller";
import { ProductTypeService } from "../services/productType.service";

export class ProductTypeController extends BaseController<ProductTypeService> {
  constructor() {
    super(new ProductTypeService());
  }
}
