import { User, UserAddress } from "../types";
import jwt from "jsonwebtoken";

export class AuthService {
  async register(data: any) {
    const firstName = data?.firstName?.trim();
    const lastName = data?.lastName?.trim();

    if (!firstName || !lastName) {
      const error: any = new Error("First name and last name are required");
      error.status = 400;
      throw error;
    }

    // User model hook handles hashing
    const user = await User.create({
      ...data,
      firstName,
      lastName,
    });
    return this.generateToken(user);
  }

  async login(data: any) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user || !(await user.validatePassword(data.password))) {
      throw new Error("Invalid Credentials");
    }
    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "super_secret_key_change_me",
      { expiresIn: "1d" }
    );

    // Fetch user's address - default if exists, or the only address if user has exactly 1
    let address = null;

    // First try to get default address
    const defaultAddress = await UserAddress.findOne({
      where: { userId: user.id, isDefault: true },
    });

    if (defaultAddress) {
      address = defaultAddress;
    } else {
      // Check if user has exactly one address
      const addresses = await UserAddress.findAll({
        where: { userId: user.id },
        limit: 2, // Only fetch 2 to check count efficiently
      });

      if (addresses.length === 1) {
        address = addresses[0];
      }
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        address: address
          ? {
              id: address.id,
              recipientName: address.recipientName,
              streetAddress: address.streetAddress,
              district: address.district,
              postalCode: address.postalCode,
              city: address.city,
              buildingNumber: address.buildingNumber,
              secondaryNumber: address.secondaryNumber,
              phoneNumber: address.phoneNumber,
              label: address.label,
              isDefault: address.isDefault,
            }
          : null,
      },
    };
  }
}
