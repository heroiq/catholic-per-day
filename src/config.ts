import { config } from 'dotenv';

config();

export const clientId = process.env.TWITTER_CLIENT_ID;
export const clientSecret = process.env.TWITTER_CLIENT_SECRET;
export const baseUrl = process.env.BASE_URL;
