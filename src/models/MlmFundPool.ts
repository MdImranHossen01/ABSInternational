import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMlmFundPool extends Document {
  autoProfit: number;        // 3.5% = 52 BDT per activation
  globalProfit: number;      // 2%   = 30 BDT per activation (distributed to all active members)
  incentiveFund: number;     // 2%   = 30 BDT per activation (for rank rewards)
  rankDevelopmentFund: number; // 2% = 30 BDT per activation (for rank promotion bonuses)
  royaltyFund: number;       // 2%   = 30 BDT per activation (Diamond/Crown/Director payouts)
  charityFund: number;       // 1%   = 15 BDT per activation (orphans/underprivileged)
  totalActivations: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MlmFundPoolSchema: Schema<IMlmFundPool> = new Schema(
  {
    autoProfit: { type: Number, default: 0, min: 0 },
    globalProfit: { type: Number, default: 0, min: 0 },
    incentiveFund: { type: Number, default: 0, min: 0 },
    rankDevelopmentFund: { type: Number, default: 0, min: 0 },
    royaltyFund: { type: Number, default: 0, min: 0 },
    charityFund: { type: Number, default: 0, min: 0 },
    totalActivations: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MlmFundPool: Model<IMlmFundPool> =
  mongoose.models.MlmFundPool || mongoose.model<IMlmFundPool>('MlmFundPool', MlmFundPoolSchema);

export default MlmFundPool;
