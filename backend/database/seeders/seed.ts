import sequelize from "../../config/database"; // Adjust path if needed (e.g. ../../config/database)
import {
  Manufacturer,
  Category,
  ProductType,
  Product,
  Inventory,
} from "../../types/index.js"; // Adjust path to point to your models/index.ts

export async function seed() {
  console.log("🌱 Starting Database Seed...");

  try {
    // We assume the DB structure exists via Migrations now.

    // 1. Clear existing data (Optional: prevents duplicates if you run seed twice)
    // We use TRUNCATE with CASCADE to wipe data but keep structure
    await sequelize.query(
      'TRUNCATE TABLE "inventories", "products", "categories", "manufacturers", "product_types" RESTART IDENTITY CASCADE;'
    );
    console.log("🧹 Tables truncated.");

    // ------------------------------------
    // 2. Manufacturers
    // ------------------------------------
    const [asus, msi, intel, amd, logitech] = await Promise.all([
      Manufacturer.create({
        name: "ASUS",
        logoUrl: "https://logo.com/asus.png",
      }),
      Manufacturer.create({ name: "MSI", logoUrl: "https://logo.com/msi.png" }),
      Manufacturer.create({
        name: "Intel",
        logoUrl: "https://logo.com/intel.png",
      }),
      Manufacturer.create({ name: "AMD", logoUrl: "https://logo.com/amd.png" }),
      Manufacturer.create({
        name: "Logitech",
        logoUrl: "https://logo.com/logitech.png",
      }),
    ]);

    // ------------------------------------
    // 3. Product Types
    // ------------------------------------
    const typeGPU = await ProductType.create({
      name: "Graphics Card",
      allowedAttributes: ["chipset", "vram", "interface", "length_mm"],
    });
    const typeCPU = await ProductType.create({
      name: "Processor",
      allowedAttributes: ["socket", "cores", "threads", "base_clock"],
    });
    const typeMouse = await ProductType.create({
      name: "Mouse",
      allowedAttributes: ["dpi", "connection_type", "buttons"],
    });

    // ------------------------------------
    // 4. Categories
    // ------------------------------------
    const hardware = await Category.create({
      name: "Hardware",
      slug: "hardware",
    });
    const peripherals = await Category.create({
      name: "Peripherals",
      slug: "peripherals",
    });
    const components = await Category.create({
      name: "Components",
      slug: "components",
      parentId: hardware.id,
    });
    const catGpu = await Category.create({
      name: "Graphics Cards",
      slug: "gpu",
      parentId: components.id,
    });
    const catCpu = await Category.create({
      name: "Processors",
      slug: "cpu",
      parentId: components.id,
    });
    const catMouse = await Category.create({
      name: "Mice",
      slug: "mice",
      parentId: peripherals.id,
    });

    // ------------------------------------
    // 5. Products & Inventory
    // ------------------------------------
    const p1 = await Product.create({
      name: "ROG Strix GeForce RTX 4090 OC Edition",
      sku: "ASUS-4090-OC",
      price: 1999.99,
      manufacturerId: asus.id,
      categoryId: catGpu.id,
      productTypeId: typeGPU.id,
      specs: { chipset: "NVIDIA GeForce RTX 4090", vram: "24GB GDDR6X" },
    });
    // Note: ensure your Inventory model has CreationOptional on 'reserved' or pass 0
    await Inventory.create({ productId: p1.id, quantity: 12, reserved: 0 });

    const p2 = await Product.create({
      name: "Intel Core i9-13900K",
      sku: "INTEL-13900K",
      price: 589.0,
      manufacturerId: intel.id,
      categoryId: catCpu.id,
      productTypeId: typeCPU.id,
      specs: { socket: "LGA 1700", cores: "24" },
    });
    await Inventory.create({ productId: p2.id, quantity: 2, reserved: 0 });

    const p3 = await Product.create({
      name: "Logitech G Pro X Superlight",
      sku: "LOGI-GPRO-BLK",
      price: 149.99,
      manufacturerId: logitech.id,
      categoryId: catMouse.id,
      productTypeId: typeMouse.id,
      specs: { dpi: "25,600", weight: "63g" },
    });
    await Inventory.create({ productId: p3.id, quantity: 0, reserved: 0 });

    const p4 = await Product.create({
      name: "MSI RTX 5090 Prototype",
      sku: "MSI-5090-PROTO",
      price: 2499.99,
      manufacturerId: msi.id,
      categoryId: catGpu.id,
      productTypeId: typeGPU.id,
      stockStatusOverride: "pre_order",
      specs: { chipset: "NVIDIA RTX 5090" },
    });
    await Inventory.create({ productId: p4.id, quantity: 0, reserved: 0 });

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

    if (productCount > 0 || manufacturerCount > 0) {
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
