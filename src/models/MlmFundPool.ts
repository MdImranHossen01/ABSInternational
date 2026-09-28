import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMlmFundPool extends Document {
  autoProfit: number;          // 3.5% = 52.5 BDT per activation (Auto Club pool)
  globalProfit: number;        // 2%   = 30 BDT per activation (Global Fund, distributed to active members)
  incentiveFund: number;       // 2%   = 30 BDT per activation (Incentive Fund for rank rewards)
  rankDevelopmentFund: number; // 2.5% = 37.5 BDT per activation (Rank Dev Fund for leadership support)
  royaltyFund: number;         // 2%   = 30 BDT per activation (Royalty Fund for Diamond/Crown/Director)
  tourFund: number;            // 5%   = 75 BDT per activation (Tour Fund for travel & exploration)
  communityFund: number;       // 15%  = 225 BDT per activation (Community Fund for social responsibility)
  charityFund: number;         // 1%   = 15 BDT per activation (Charity Fund for helping humanity)
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
    tourFund: { type: Number, default: 0, min: 0 },
    communityFund: { type: Number, default: 0, min: 0 },
    charityFund: { type: Number, default: 0, min: 0 },
    totalActivations: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MlmFundPool: Model<IMlmFundPool> =
  mongoose.models.MlmFundPool || mongoose.model<IMlmFundPool>('MlmFundPool', MlmFundPoolSchema);

export default MlmFundPool;
