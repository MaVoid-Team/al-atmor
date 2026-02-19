import sequelize from "../../config/database"; // Adjust path if needed (e.g. ../../config/database)
import {
  Manufacturer,
  Category,
  ProductType,
  Product,
  Inventory,
  User,
  Location,
} from "../../types/index"; // Adjust path to point to your models/index.ts

export async function seed() {
  console.log("🌱 Starting Database Seed...");

  try {
    // We assume the DB structure exists via Migrations now.

    // 1. Clear existing data (Optional: prevents duplicates if you run seed twice)
    // We use TRUNCATE with CASCADE to wipe data but keep structure
    await sequelize.query(
      'TRUNCATE TABLE "users", "inventories", "products", "categories", "manufacturers", "product_types", "locations" RESTART IDENTITY CASCADE;'
    );
    console.log("🧹 Tables truncated.");

    // ------------------------------------
    // 1b. Create Admin Account
    // ------------------------------------
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@al-atmor.com",
      password: "adminPassword123", // User model hashes this in beforeCreate hook
      role: "admin",
    });
    console.log("👤 Admin account created (admin@al-atmor.com).");

    // ------------------------------------
    // 2. Manufacturers
    // ------------------------------------
    const [almarai, juhayna, nestle, kelloggs, kraft] = await Promise.all([
      Manufacturer.create({
        name: "Almarai",
        logoUrl: "https://example.com/almarai.png",
      }),
      Manufacturer.create({ name: "Juhayna", logoUrl: "https://example.com/juhayna.png" }),
      Manufacturer.create({
        name: "Nestle",
        logoUrl: "https://example.com/nestle.png",
      }),
      Manufacturer.create({ name: "Kellogg's", logoUrl: "https://example.com/kelloggs.png" }),
      Manufacturer.create({
        name: "Kraft",
        logoUrl: "https://example.com/kraft.png",
      }),
    ]);

    // ------------------------------------
    // 3. Product Types
    // ------------------------------------
    const typeDairy = await ProductType.create({
      name: "Dairy & Eggs",
      allowedAttributes: ["weight", "volume", "expiry_date", "fat_content"],
    });
    const typeGrains = await ProductType.create({
      name: "Pantry Essentials",
      allowedAttributes: ["weight", "origin", "expiry_date", "packaging_type"],
    });
    const typeBeverage = await ProductType.create({
      name: "Beverages",
      allowedAttributes: ["volume", "flavor", "is_carbonated"],
    });

    // ------------------------------------
    // 4. Categories
    // ------------------------------------
    const grocery = await Category.create({
      name: "Grocery",
      slug: "grocery",
    });
    const freshProduce = await Category.create({
      name: "Fresh Produce",
      slug: "fresh-produce",
    });
    const pantry = await Category.create({
      name: "Pantry",
      slug: "pantry",
      parentId: grocery.id,
    });
    const catMilk = await Category.create({
      name: "Milk & Dairy",
      slug: "milk-dairy",
      parentId: grocery.id,
    });
    const catRice = await Category.create({
      name: "Rice & Grains",
      slug: "rice-grains",
      parentId: pantry.id,
    });
    const catJuice = await Category.create({
      name: "Juices & Drinks",
      slug: "juices",
      parentId: grocery.id,
    });

    // ------------------------------------
    // 5. Products & Inventory
    // ------------------------------------
    const p1 = await Product.create({
      name: "Almarai Fresh Milk Full Fat 1L",
      sku: "ALM-MILK-1L",
      price: 45.00,
      manufacturerId: almarai.id,
      categoryId: catMilk.id,
      productTypeId: typeDairy.id,
      specs: { volume: "1L", fat_content: "Full Fat", origin: "Egypt" },
    });
    await Inventory.create({ productId: p1.id, quantity: 150, reserved: 0 });

    const p2 = await Product.create({
      name: "Nestlé Nescafé Classic 200g",
      sku: "NST-COFFEE-200G",
      price: 185.00,
      manufacturerId: nestle.id,
      categoryId: pantry.id,
      productTypeId: typeGrains.id,
      specs: { weight: "200g", type: "Instant Coffee" },
    });
    await Inventory.create({ productId: p2.id, quantity: 45, reserved: 0 });

    const p3 = await Product.create({
      name: "Juhayna Pure Apple Juice 1L",
      sku: "JUH-APPLE-1L",
      price: 35.00,
      manufacturerId: juhayna.id,
      categoryId: catJuice.id,
      productTypeId: typeBeverage.id,
      specs: { volume: "1L", flavor: "Apple" },
    });
    await Inventory.create({ productId: p3.id, quantity: 80, reserved: 0 });

    const p4 = await Product.create({
      name: "Kraft Cheddar Cheese 480g",
      sku: "KFT-CHEDDAR-480G",
      price: 210.00,
      manufacturerId: kraft.id,
      categoryId: catMilk.id,
      productTypeId: typeDairy.id,
      specs: { weight: "480g", type: "Cheddar" },
    });
    await Inventory.create({ productId: p4.id, quantity: 30, reserved: 0 });

    // ------------------------------------
    // 6. Delivery Locations (Egypt)
    // ------------------------------------
    await Location.create({
      city: "Cairo",
      name: "New Cairo",
      shippingRate: 50.00 / 1000, // Normalized or absolute depending on your logic
      taxRate: 0.14
    });
    await Location.create({
      city: "Cairo",
      name: "Maadi",
      shippingRate: 40.00 / 1000,
      taxRate: 0.14
    });
    await Location.create({
      city: "Alexandria",
      name: "Smouha",
      shippingRate: 30.00 / 1000,
      taxRate: 0.14
    });
    await Location.create({
      city: "Alexandria",
      name: "Sidi Gaber",
      shippingRate: 35.00 / 1000,
      taxRate: 0.14
    });
    await Location.create({
      city: "Giza",
      name: "6th of October",
      shippingRate: 45.00 / 1000,
      taxRate: 0.14
    });

    console.log("✅ Data seeded successfully.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

/**
 * Seed the DB only if key tables are empty. Intended to be called on server start.
 */
export async function seedIfEmpty() {
  try {
    const productCount = await Product.count();
    const manufacturerCount = await Manufacturer.count();
    const userCount = await User.count();

    if (productCount > 0 || manufacturerCount > 0 || userCount > 0) {
      console.log("ℹ️  Database already contains data — skipping seed.");
      return;
    }

    console.log("ℹ️  Database appears empty — running seed.");
    await seed();
  } catch (err) {
    console.error("❌ seedIfEmpty error:", err);
    // do not rethrow — server startup should decide how to handle
  }
}

/**
 * Ensures at least one admin user exists in the system.
 */
export async function ensureAdminExists() {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.log("ℹ️ No admin user found. Creating default admin...");
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@al-atmor.com",
        password: "adminPassword123",
        role: "admin",
      });
      console.log("✅ Default admin account created (admin@al-atmor.com).");
    }
  } catch (err) {
    console.error("❌ ensureAdminExists error:", err);
  }
}

// If this script is run directly, execute the seed function
if (require.main === module) {
  seed()
    .then(() => {
      console.log("🌱 Seeding completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
