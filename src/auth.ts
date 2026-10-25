/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

import { normalizePhoneNumber } from './lib/utils';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
        impersonationToken: { label: 'Impersonation Token', type: 'text' },
      },
      async authorize(credentials) {
        // 1. Handle Impersonation Token (Admin login as user)
        if (credentials?.impersonationToken && typeof credentials.impersonationToken === 'string') {
          const { decrypt } = await import('./lib/encryption');
          const decrypted = decrypt(credentials.impersonationToken);
          if (!decrypted) {
            throw new Error('Invalid or expired impersonation token.');
          }

          let payload: any;
          try {
            payload = JSON.parse(decrypted);
          } catch {
            throw new Error('Malformed impersonation payload.');
          }

          if (!payload.targetUserId || !payload.exp || Date.now() > payload.exp) {
            throw new Error('Impersonation token has expired.');
          }

          await connectToDatabase();

          // If starting an impersonation, verify that caller is an admin
          if (payload.adminId) {
            const adminUser = await User.findById(payload.adminId);
            if (!adminUser) {
              throw new Error('Admin user not found.');
            }
            const isAuthorized =
              adminUser.role === 'admin' ||
              adminUser.role === 'super_admin' ||
              adminUser.email === 'imranshuvo101@gmail.com';

            if (!isAuthorized) {
              throw new Error('Unauthorized impersonation attempt.');
            }
          }

          const targetUser = await User.findById(payload.targetUserId);
          if (!targetUser) {
            throw new Error('Target user not found.');
          }

          const isExit = !!payload.isExit;

          return {
            id: targetUser._id.toString(),
            name: targetUser.name,
            email: targetUser.email,
            image: targetUser.image,
            role: targetUser.role,
            phone: targetUser.phone,
            memberId: targetUser.memberId,
            isImpersonated: !isExit,
            impersonatorAdminId: isExit ? undefined : payload.adminId,
          };
        }

        const inputIdentifier = (typeof credentials?.email === 'string' ? credentials.email : '').trim();
        if (!inputIdentifier) {
          throw new Error('Please provide email or mobile number.');
        }

        const isEmail = inputIdentifier.includes('@');
        let query: any;
        if (isEmail) {
          query = { email: inputIdentifier.toLowerCase() };
        } else {
          const normalizedPhone = normalizePhoneNumber(inputIdentifier);
          const orConditions: any[] = [
            { username: inputIdentifier.toLowerCase() },
            { memberId: inputIdentifier.toUpperCase() },
            { memberId: inputIdentifier },
          ];

          // Only search by phone if identifier actually contains digits
          if (normalizedPhone && normalizedPhone.length >= 6) {
            orConditions.push({ phone: normalizedPhone });
            orConditions.push({ phone: inputIdentifier });
          }

          query = { $or: orConditions };
        }

        await connectToDatabase();
        const user = await User.findOne(query).select('+password');

        if (!user) {
          return null;
        }

        // Credentials login requires an existing password
        if (!user.password) {
          throw new Error('This account was created via Google. Please use Google Login or set a password.');
        }

        if (!credentials?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          memberId: user.memberId,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // 1. First, apply base logic from authConfig
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'user';
        token.image = user.image || token.picture;
        token.memberId = (user as any).memberId;
        if ((user as any).isImpersonated !== undefined) {
          token.isImpersonated = (user as any).isImpersonated;
          token.impersonatorAdminId = (user as any).impersonatorAdminId;
        }
      }

      // 2. Add DB-specific logic (keep role, name, and image dynamically synced with DB)
      const targetUserId = (user && user.id) || (token && token.id);
      if (targetUserId) {
        try {
          await connectToDatabase();
          const mongoose = (await import('mongoose')).default;

          if (mongoose.Types.ObjectId.isValid(targetUserId as string)) {
            const dbUser = await User.findById(targetUserId).select('role phone memberId image name status');
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role ?? 'user';
              token.phone = dbUser.phone;
              token.memberId = dbUser.memberId;
              token.image = dbUser.image || user?.image || token.picture;
            }
          }
        } catch (error) {
          console.error("JWT DB Enhancement Error:", error);
        }
      }

      if (trigger === 'update') {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.image = session.image;
      }

      if (token.email === 'imranshuvo101@gmail.com' && !token.isImpersonated) {
        token.role = 'super_admin';
      }

      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;

        try {
          const savedUser = await User.findOneAndUpdate(
            { email: user.email },
            {
              $set: {
                name: user.name || 'Unknown',
                image: user.image || '',
                googleId: account.providerAccountId,
              },
              $setOnInsert: {
                role: 'user',
                status: 'active',
              }
            },
            { upsert: true, new: true }
          );

          if (savedUser) {
            user.id = savedUser._id.toString();
            if (user.email === 'imranshuvo101@gmail.com') {
              (user as any).role = 'super_admin';
            }
          }
          return true;
        } catch (error) {
          console.error('Error in Google signIn:', error);
          return false;
        }
      }
      return true;
    },
  },
});
