import { Request, Response, NextFunction } from "express";
import { userAddressService } from "../services/userAddress.service";

export class UserAddressController {
  /**
   * GET /addresses
   * Get all addresses for the authenticated user
   */
  getAllAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const addresses = await userAddressService.getAllAddresses(userId);

      res.json({ addresses });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /addresses/:id
   * Get a specific address
   */
  getAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const addressId = Number(req.params.id);

      const address = await userAddressService.getAddressById(userId, addressId);

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ address });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /addresses/default
   * Get the user's default address
   */
  getDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const address = await userAddressService.getDefaultAddress(userId);

      if (!address) {
        return res.status(404).json({ error: "No default address set" });
      }

      res.json({ address });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /addresses
   * Create a new address
   * Body: { recipientName, streetAddress, district, postalCode, city, ... }
   */
  createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const {
        recipientName,
        streetAddress,
        district,
        postalCode,
        city,
        buildingNumber,
        secondaryNumber,
        phoneNumber,
        isDefault,
        label,
      } = req.body;

      // Validate required fields
      if (!recipientName || !streetAddress || !district || !postalCode || !city) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["recipientName", "streetAddress", "district", "postalCode", "city"],
        });
      }

      // Validate postal code format
      if (!userAddressService.validatePostalCode(postalCode)) {
        return res.status(400).json({
          error: "Invalid postal code format. Must be exactly 5 digits.",
        });
      }

      const address = await userAddressService.createAddress(userId, {
        recipientName,
        streetAddress,
        district,
        postalCode,
        city,
        buildingNumber,
        secondaryNumber,
        phoneNumber,
        isDefault,
        label,
      });

      res.status(201).json({
        message: "Address created successfully",
        address,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /addresses/:id
   * Update an existing address
   */
  updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const addressId = Number(req.params.id);

      // Validate postal code if provided
      if (req.body.postalCode && !userAddressService.validatePostalCode(req.body.postalCode)) {
        return res.status(400).json({
          error: "Invalid postal code format. Must be exactly 5 digits.",
        });
      }

      const address = await userAddressService.updateAddress(userId, addressId, req.body);

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({
        message: "Address updated successfully",
        address,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /addresses/:id
   * Delete an address
   */
  deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const addressId = Number(req.params.id);

      const deleted = await userAddressService.deleteAddress(userId, addressId);

      if (!deleted) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({ message: "Address deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /addresses/:id/default
   * Set an address as default
   */
  setDefault = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const addressId = Number(req.params.id);

      const address = await userAddressService.setDefaultAddress(userId, addressId);

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      res.json({
        message: "Default address updated",
        address,
      });
    } catch (err) {
      next(err);
    }
  };
}

export const userAddressController = new UserAddressController();
