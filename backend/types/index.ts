import Category from "./Category";
import Manufacturer from "./Manufacturer";
import Product from "./Product";
import ProductType from "./ProductType";
import Inventory from "./Inventory";
import ProductDisplayView from "./ProductView";
import User from "./User";
import Cart from "./Cart";
import CartItem from "./CartItem";
import UserAddress from "./UserAddress";
import OrderItem from "./OrderItem";
import Order from "./Order";
import Location from "./Location";
import DiscountCode from "./DiscountCode";
import ProductBundle from "./ProductBundle";
import BundleProduct from "./BundleProduct";

let associationsInitialized = false;

export const initAssociations = () => {
  if (associationsInitialized) return;

  // Recursive Category Logic
  Category.hasMany(Category, { as: "subcategories", foreignKey: "parentId" });
  Category.belongsTo(Category, { as: "parent", foreignKey: "parentId" });

  // Product Relationships
  Product.belongsTo(Manufacturer, { foreignKey: "manufacturerId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });
  Product.belongsTo(ProductType, { foreignKey: "productTypeId" });

  // Inventory Relationship (One-to-One)
  Product.hasOne(Inventory, { foreignKey: "productId", onDelete: "CASCADE" });
  Inventory.belongsTo(Product, { foreignKey: "productId" });

  // Cart Relationships
  User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  Cart.hasMany(CartItem, {
    foreignKey: "cartId",
    as: "items",
    onDelete: "CASCADE",
  });
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });

  CartItem.belongsTo(Product, { foreignKey: "productId" });
  Product.hasMany(CartItem, { foreignKey: "productId" });

  // Cart Bundle Relationships
  CartItem.belongsTo(ProductBundle, { foreignKey: "bundleId", as: "Bundle" });
  ProductBundle.hasMany(CartItem, { foreignKey: "bundleId" });

  // User Address Relationships (One-to-Many: user can have multiple addresses)
  User.hasMany(UserAddress, {
    foreignKey: "userId",
    as: "addresses",
    onDelete: "CASCADE",
  });
  UserAddress.belongsTo(User, { foreignKey: "userId" });

  // Order Item Relationships (for sales tracking)
  Product.hasMany(OrderItem, { foreignKey: "productId" });
  OrderItem.belongsTo(Product, { foreignKey: "productId" });

  // Order relationships
  User.hasMany(Order, {
    foreignKey: "userId",
    as: "orders",
    onDelete: "CASCADE",
  });
  Order.belongsTo(User, { foreignKey: "userId", as: "user" });
  Order.hasMany(OrderItem, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
  });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  // Order Location Relationship
  Order.belongsTo(Location, { foreignKey: "locationId", as: "location" });
  Location.hasMany(Order, { foreignKey: "locationId" });

  // Bundle Relationships
  ProductBundle.hasMany(BundleProduct, {
    foreignKey: "bundleId",
    as: "BundleProducts",
    onDelete: "CASCADE",
  });
  BundleProduct.belongsTo(ProductBundle, {
    foreignKey: "bundleId",
    as: "Bundle",
  });

  BundleProduct.belongsTo(Product, { foreignKey: "productId", as: "Product" });
  Product.hasMany(BundleProduct, { foreignKey: "productId" });

  ProductBundle.belongsToMany(Product, {
    through: BundleProduct,
    foreignKey: "bundleId",
    otherKey: "productId",
    as: "Products",
  });
  Product.belongsToMany(ProductBundle, {
    through: BundleProduct,
    foreignKey: "productId",
    otherKey: "bundleId",
    as: "Bundles",
  });

  associationsInitialized = true;
};

// Run associations immediately
initAssociations();

export {
  Category,
  Manufacturer,
  Product,
  ProductType,
  Inventory,
  ProductDisplayView,
  User,
  Cart,
  CartItem,
  UserAddress,
  OrderItem,
  Order,
  Location,
  DiscountCode,
  ProductBundle,
  BundleProduct,
};
