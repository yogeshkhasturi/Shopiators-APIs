export class CustomerSerializer {
  static serialize(customer: any) {
    if (!customer) return null;

    const obj = customer.toObject ? customer.toObject() : customer;
    
    // Strip sensitive fields
    const { 
      _id, 
      __v, 
      password, 
      resetPasswordToken, 
      resetPasswordExpire, 
      resetAttempts,
      firstResetAttemptAt,
      storeSlug,
      ...rest 
    } = obj;

    return {
      id: _id ? _id.toString() : undefined,
      ...rest,
    };
  }

  static serializeMany(customers: any[]) {
    return customers.map((customer) => this.serialize(customer));
  }
}
