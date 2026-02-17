import { UserAddressService } from "../../services/userAddress.service";
import UserAddress from "../../types/UserAddress";

describe("UserAddressService", () => {
  let service: UserAddressService;

  beforeEach(() => {
    service = new UserAddressService();
    jest.clearAllMocks();
  });

  describe("getAllAddresses", () => {
    it("should return all addresses for a user ordered by default first", async () => {
      const mockAddresses = [
        { id: 1, userId: 10, recipientName: "John", isDefault: true },
        { id: 2, userId: 10, recipientName: "Jane", isDefault: false },
      ];

      jest.spyOn(UserAddress, "findAll").mockResolvedValue(mockAddresses as any);

      const result = await service.getAllAddresses(10);

      expect(UserAddress.findAll).toHaveBeenCalledWith({
        where: { userId: 10 },
        order: [
          ["isDefault", "DESC"],
          ["createdAt", "DESC"],
        ],
      });
      expect(result).toEqual(mockAddresses);
    });
  });

  describe("getAddressById", () => {
    it("should return address if found and belongs to user", async () => {
      const mockAddress = { id: 1, userId: 10, recipientName: "John" };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);

      const result = await service.getAddressById(10, 1);

      expect(UserAddress.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 10 },
      });
      expect(result).toEqual(mockAddress);
    });

    it("should return null if address not found", async () => {
      jest.spyOn(UserAddress, "findOne").mockResolvedValue(null);

      const result = await service.getAddressById(10, 999);

      expect(result).toBeNull();
    });
  });

  describe("getDefaultAddress", () => {
    it("should return the default address for a user", async () => {
      const mockAddress = { id: 1, userId: 10, isDefault: true };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);

      const result = await service.getDefaultAddress(10);

      expect(UserAddress.findOne).toHaveBeenCalledWith({
        where: { userId: 10, isDefault: true },
      });
      expect(result).toEqual(mockAddress);
    });

    it("should return null if no default address", async () => {
      jest.spyOn(UserAddress, "findOne").mockResolvedValue(null);

      const result = await service.getDefaultAddress(10);

      expect(result).toBeNull();
    });
  });

  describe("createAddress", () => {
    const addressData = {
      recipientName: "Mohammad Ali",
      streetAddress: "8228 King Abdulaziz Rd.",
      district: "2121 Alamal Dist.",
      postalCode: "12463",
      city: "RIYADH",
    };

    it("should create address and set as default if first address", async () => {
      const mockCreatedAddress = { id: 1, userId: 10, ...addressData, isDefault: true };

      jest.spyOn(UserAddress, "count").mockResolvedValue(0);
      jest.spyOn(UserAddress, "create").mockResolvedValue(mockCreatedAddress as any);

      const result = await service.createAddress(10, addressData);

      expect(UserAddress.count).toHaveBeenCalledWith({ where: { userId: 10 } });
      expect(UserAddress.create).toHaveBeenCalledWith({
        userId: 10,
        ...addressData,
        isDefault: true,
      });
      expect(result).toEqual(mockCreatedAddress);
    });

    it("should create address without default if user has existing addresses", async () => {
      const mockCreatedAddress = { id: 2, userId: 10, ...addressData, isDefault: false };

      jest.spyOn(UserAddress, "count").mockResolvedValue(2);
      jest.spyOn(UserAddress, "create").mockResolvedValue(mockCreatedAddress as any);

      const result = await service.createAddress(10, { ...addressData, isDefault: false });

      expect(UserAddress.create).toHaveBeenCalledWith({
        userId: 10,
        ...addressData,
        isDefault: false,
      });
    });

    it("should unset other defaults when creating with isDefault true", async () => {
      const mockCreatedAddress = { id: 3, userId: 10, ...addressData, isDefault: true };

      jest.spyOn(UserAddress, "update").mockResolvedValue([1] as any);
      jest.spyOn(UserAddress, "count").mockResolvedValue(2);
      jest.spyOn(UserAddress, "create").mockResolvedValue(mockCreatedAddress as any);

      await service.createAddress(10, { ...addressData, isDefault: true });

      expect(UserAddress.update).toHaveBeenCalledWith(
        { isDefault: false },
        { where: { userId: 10, isDefault: true } }
      );
    });
  });

  describe("updateAddress", () => {
    it("should update address if found", async () => {
      const mockAddress = {
        id: 1,
        userId: 10,
        recipientName: "Old Name",
        update: jest.fn().mockResolvedValue({ id: 1, recipientName: "New Name" }),
      };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);

      const result = await service.updateAddress(10, 1, { recipientName: "New Name" });

      expect(mockAddress.update).toHaveBeenCalledWith({ recipientName: "New Name" });
    });

    it("should return null if address not found", async () => {
      jest.spyOn(UserAddress, "findOne").mockResolvedValue(null);

      const result = await service.updateAddress(10, 999, { recipientName: "Test" });

      expect(result).toBeNull();
    });

    it("should unset other defaults when updating to isDefault true", async () => {
      const mockAddress = {
        id: 1,
        userId: 10,
        update: jest.fn().mockResolvedValue({ id: 1, isDefault: true }),
      };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);
      jest.spyOn(UserAddress, "update").mockResolvedValue([1] as any);

      await service.updateAddress(10, 1, { isDefault: true });

      expect(UserAddress.update).toHaveBeenCalledWith(
        { isDefault: false },
        { where: { userId: 10, isDefault: true } }
      );
    });
  });

  describe("deleteAddress", () => {
    it("should delete address and return true", async () => {
      const mockAddress = {
        id: 1,
        userId: 10,
        isDefault: false,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);

      const result = await service.deleteAddress(10, 1);

      expect(mockAddress.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if address not found", async () => {
      jest.spyOn(UserAddress, "findOne").mockResolvedValue(null);

      const result = await service.deleteAddress(10, 999);

      expect(result).toBe(false);
    });

    it("should set another address as default if deleted address was default", async () => {
      const mockAddress = {
        id: 1,
        userId: 10,
        isDefault: true,
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      const nextAddress = {
        id: 2,
        userId: 10,
        update: jest.fn().mockResolvedValue({ id: 2, isDefault: true }),
      };

      jest
        .spyOn(UserAddress, "findOne")
        .mockResolvedValueOnce(mockAddress as any) // First call for finding address to delete
        .mockResolvedValueOnce(nextAddress as any); // Second call for finding next address

      const result = await service.deleteAddress(10, 1);

      expect(nextAddress.update).toHaveBeenCalledWith({ isDefault: true });
      expect(result).toBe(true);
    });
  });

  describe("setDefaultAddress", () => {
    it("should set address as default and unset others", async () => {
      const mockAddress = {
        id: 2,
        userId: 10,
        isDefault: false,
        update: jest.fn().mockResolvedValue({ id: 2, isDefault: true }),
      };

      jest.spyOn(UserAddress, "findOne").mockResolvedValue(mockAddress as any);
      jest.spyOn(UserAddress, "update").mockResolvedValue([1] as any);

      const result = await service.setDefaultAddress(10, 2);

      expect(UserAddress.update).toHaveBeenCalledWith(
        { isDefault: false },
        { where: { userId: 10, isDefault: true } }
      );
      expect(mockAddress.update).toHaveBeenCalledWith({ isDefault: true });
    });

    it("should return null if address not found", async () => {
      jest.spyOn(UserAddress, "findOne").mockResolvedValue(null);

      const result = await service.setDefaultAddress(10, 999);

      expect(result).toBeNull();
    });
  });

  describe("validatePostalCode", () => {
    it("should return true for valid 5-digit postal code", () => {
      expect(service.validatePostalCode("12463")).toBe(true);
      expect(service.validatePostalCode("00000")).toBe(true);
      expect(service.validatePostalCode("99999")).toBe(true);
    });

    it("should return false for invalid postal codes", () => {
      expect(service.validatePostalCode("1234")).toBe(false); // Too short
      expect(service.validatePostalCode("123456")).toBe(false); // Too long
      expect(service.validatePostalCode("1234a")).toBe(false); // Contains letter
      expect(service.validatePostalCode("")).toBe(false); // Empty
      expect(service.validatePostalCode("12 34")).toBe(false); // Contains space
    });
  });
});
