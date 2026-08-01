/**
 * Smart Validation Utility for GoldenGuard Form Fields
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  formattedValue?: string;
}

export const ValidationRules = {
  email: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(val.trim());
    return {
      isValid,
      message: isValid ? "Valid email address" : "Please enter a valid email address (e.g. user@domain.com)"
    };
  },

  phone: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    // Indian standard 10 digit, or with +91 country code
    const cleaned = val.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    const isValid = phoneRegex.test(cleaned);
    return {
      isValid,
      message: isValid 
        ? "Valid mobile number" 
        : "Enter a valid 10-digit mobile number (e.g. +91 98765 43210)"
    };
  },

  pincode: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    const pinRegex = /^[1-9][0-9]{5}$/;
    const isValid = pinRegex.test(val.trim());
    return {
      isValid,
      message: isValid ? "Valid 6-digit postal PIN code" : "PIN code must be a valid 6-digit number"
    };
  },

  vehicleNumber: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    // Format: e.g. MH12AB1234 or DL 01 C 9999
    const cleaned = val.replace(/[\s\-]/g, "").toUpperCase();
    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
    const isValid = vehicleRegex.test(cleaned);
    return {
      isValid,
      formattedValue: cleaned,
      message: isValid 
        ? "Valid vehicle registration number" 
        : "Standard format expected (e.g. MH-12-AB-1234)"
    };
  },

  bloodGroup: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    const validGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
    const upper = val.trim().toUpperCase();
    const isValid = validGroups.includes(upper);
    return {
      isValid,
      message: isValid ? "Valid Blood Group" : "Valid options: O+, O-, A+, A-, B+, B-, AB+, AB-"
    };
  },

  name: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    const nameRegex = /^[a-zA-Z\s'.\-]{2,50}$/;
    const isValid = nameRegex.test(val.trim());
    return {
      isValid,
      message: isValid ? "Valid name format" : "Name should contain at least 2 alphabetic characters"
    };
  },

  latLng: (val: string): ValidationResult => {
    if (!val) return { isValid: true };
    const parts = val.split(",").map(p => p.trim());
    if (parts.length !== 2) {
      return { isValid: false, message: "Enter valid coordinates as 'Latitude, Longitude'" };
    }
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    return {
      isValid,
      message: isValid ? "Valid coordinates" : "Latitude must be -90 to 90, Longitude -180 to 180"
    };
  }
};
