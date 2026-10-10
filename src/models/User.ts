import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user';
  image?: string;
  phone?: string;
  lastActive?: Date;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isSubscriptionActive: boolean;
  walletBalance: number;
  // MLM Fields
  username?: string;
  firstName?: string;
  lastName?: string;
  memberId: string;
  sponsorId?: string;
  placementId?: string;
  placementPosition?: number;
  rank: 'Premium Member' | 'Team Manager' | 'Royal Manager' | 'Silver Manager' | 'Gold Manager' | 'Diamond Manager' | 'Crown Manager' | 'Director' | 'user';
  depositWallet: number;
  bonusWallet: number;
  withdrawalWallet: number;
  personalSales: number;
  teamSales: number;
  teamCount: number;
  autoProfitPool: number;    // accumulated 52 BDT contributions from direct downline activations
  autoProfitTier: number;   // current completed tier (0-10)
  nidNumber?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  nidStatus: 'Not Submitted' | 'Pending' | 'Approved' | 'Rejected';
  nidRejectionReason?: string;
  kycFullName?: string;
  kycDateOfBirth?: string;
  kycFatherName?: string;
  kycMotherName?: string;
  kycPresentAddress?: string;
  kycPermanentAddress?: string;
  kycOwnerPhoto?: string;
  bkashNo?: string;
  nagadNo?: string;
  rocketNo?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  bankRoutingNo?: string;
  sebaCardNo?: string;
  isSebaCardGenerated: boolean;
  addresses: {
    street?: string;
    division?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }[];
  wishlist: mongoose.Types.ObjectId[];
  cart: {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    color?: string;
    size?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/, 'Please provide a valid email address']
    },
    password: { type: String, select: false },
    role: { type: String, enum: ['super_admin', 'admin', 'manager', 'user'], default: 'user' },
    image: { type: String },
    phone: { type: String },
    googleId: { type: String },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date },
    lastActive: { type: Date, default: Date.now },
    isSubscriptionActive: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0, min: 0 },
    // MLM fields in schema
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    memberId: { type: String, unique: true, sparse: true },
    sponsorId: { type: String, index: true },
    placementId: { type: String, index: true, trim: true },
    placementPosition: { type: Number, min: 1, max: 6 },
    rank: { 
      type: String, 
      enum: ['Premium Member', 'Team Manager', 'Royal Manager', 'Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director', 'user'], 
      default: 'user' 
    },
    depositWallet: { type: Number, default: 0 },
    bonusWallet: { type: Number, default: 0 },
    withdrawalWallet: { type: Number, default: 0 },
    personalSales: { type: Number, default: 0 },
    teamSales: { type: Number, default: 0 },
    teamCount: { type: Number, default: 0 },
    autoProfitPool: { type: Number, default: 0 },
    autoProfitTier: { type: Number, default: 0, min: 0, max: 10 },
    nidNumber: { type: String },
    nidFrontImage: { type: String },
    nidBackImage: { type: String },
    nidStatus: { 
      type: String, 
      enum: ['Not Submitted', 'Pending', 'Approved', 'Rejected'], 
      default: 'Not Submitted' 
    },
    nidRejectionReason: { type: String },
    kycFullName: { type: String },
    kycDateOfBirth: { type: String },
    kycFatherName: { type: String },
    kycMotherName: { type: String },
    kycPresentAddress: { type: String },
    kycPermanentAddress: { type: String },
    kycOwnerPhoto: { type: String },
    bkashNo: { type: String },
    nagadNo: { type: String },
    rocketNo: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    bankAccountNo: { type: String },
    bankRoutingNo: { type: String },
    sebaCardNo: { type: String },
    isSebaCardGenerated: { type: Boolean, default: false },
    addresses: [
      {
        street: { type: String, default: '' },
        division: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'Bangladesh' },
        isDefault: { type: Boolean, default: true },
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        color: { type: String },
        size: { type: String },
      }
    ],
  },
  { timestamps: true }
);

UserSchema.index({ placementId: 1, placementPosition: 1 }, { sparse: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

