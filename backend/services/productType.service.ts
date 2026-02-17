import { BaseService } from "./base.service";
import { ProductType } from "../types";

export class ProductTypeService extends BaseService<ProductType> {
  constructor() {
    super(ProductType);
  }
}
