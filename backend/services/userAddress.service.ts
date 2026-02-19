import UserAddress from "../types/UserAddress";

interface AddressInput {
  recipientName: string;
  streetAddress: string;
  district: string;
  postalCode: string;
  city: string;
  buildingNumber?: string;
  secondaryNumber?: string;
  phoneNumber?: string;
  isDefault?: boolean;
  label?: string;
}

export class UserAddressService {
  /**
   * Get all addresses for a user
   */
  async getAllAddresses(userId: number): Promise<UserAddress[]> {
    return await UserAddress.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"], // Default address first
        ["createdAt", "DESC"],
      ],
    });
  }

  /**
   * Get a specific address by ID (ensuring it belongs to the user)
   */
  async getAddressById(
    userId: number,
    addressId: number
  ): Promise<UserAddress | null> {
    return await UserAddress.findOne({
      where: { id: addressId, userId },
    });
  }

  /**
   * Get user's default address
   */
  async getDefaultAddress(userId: number): Promise<UserAddress | null> {
    return await UserAddress.findOne({
      where: { userId, isDefault: true },
    });
  }

  /**
   * Create a new address for a user
   */
  async createAddress(
    userId: number,
    data: AddressInput
  ): Promise<UserAddress> {
    // If this is set as default, unset other defaults first
    if (data.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    // If user has no addresses, make this the default
    const existingCount = await UserAddress.count({ where: { userId } });
    if (existingCount === 0) {
      data.isDefault = true;
    }

    return await UserAddress.create({
      userId,
      ...data,
    });
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    userId: number,
    addressId: number,
    data: Partial<AddressInput>
  ): Promise<UserAddress | null> {
    const address = await UserAddress.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      return null;
    }

    // If setting this as default, unset others first
    if (data.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    return await address.update(data);
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId: number, addressId: number): Promise<boolean> {
    const address = await UserAddress.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      return false;
    }

    const wasDefault = address.isDefault;
    await address.destroy();

    // If we deleted the default, set another as default
    if (wasDefault) {
      const nextAddress = await UserAddress.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });
      if (nextAddress) {
        await nextAddress.update({ isDefault: true });
      }
    }

    return true;
  }

  /**
   * Set an address as the default
   */
  async setDefaultAddress(
    userId: number,
    addressId: number
  ): Promise<UserAddress | null> {
    const address = await UserAddress.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      return null;
    }

    // Unset all other defaults
    await this.unsetDefaultAddresses(userId);

    // Set this one as default
    return await address.update({ isDefault: true });
  }

  /**
   * Helper: Unset all default addresses for a user
   */
  private async unsetDefaultAddresses(userId: number): Promise<void> {
    await UserAddress.update(
      { isDefault: false },
      { where: { userId, isDefault: true } }
    );
  }

  /**
   * Validate Egypt postal code format (5 digits)
   */
  validatePostalCode(postalCode: string): boolean {
    return /^[0-9]{5}$/.test(postalCode);
  }
}

export const userAddressService = new UserAddressService();
