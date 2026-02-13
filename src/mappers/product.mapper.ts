import { ProductDto } from "../dtos/product.dto";
import { UserDto } from "../dtos/user.dto";
import { ProductModel } from "../models/product.model";
import { UserModel } from "../models/user.model";

export class ProductMapper
{
  static fromDto(dto: ProductDto): ProductModel{
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
    };
  }
}
