import { Firestore } from '@google-cloud/firestore';
import { Injectable } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { AppConfig } from './app-config';
import { baseUrl, clientId, clientSecret } from './config';
import { logger } from './logger';

const redirectUri = `${baseUrl}/twitter-callback`;

@Injectable()
export class AuthService {
  async generateAuthLink(): Promise<string> {
    const client = new TwitterApi({ clientId, clientSecret });
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(redirectUri, {
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    });

    // store codeVerifier and state for later
    const firestore = new Firestore();
    const appConfigDoc = firestore.collection('bots').doc('catholic-per-day');
    const appConfig = (await appConfigDoc.get()).data() as AppConfig;

    appConfig.auth.codeVerifier = codeVerifier;
    appConfig.auth.state = state;
    await appConfigDoc.update(appConfig);

    return url;
  }

  async handleCallback(state: string, code: string): Promise<void> {
    // get stored code and state
    const firestore = new Firestore();
    const appConfigDoc = firestore.collection('bots').doc('catholic-per-day');
    const appConfig = (await appConfigDoc.get()).data() as AppConfig;

    if (!code || !state || !appConfig.auth.codeVerifier || !appConfig.auth.state) {
      throw new Error('You denied the app or your session expired');
    }

    if (state !== appConfig.auth.state) {
      throw new Error('Stored tokens do not match');
    }

    const twitter = new TwitterApi({ clientId, clientSecret });
    const loginResult = await twitter.loginWithOAuth2({
      code,
      codeVerifier: appConfig.auth.codeVerifier,
      redirectUri,
    });

    // store access token and refresh token
    appConfig.auth.accessToken = loginResult.accessToken;
    appConfig.auth.refreshToken = loginResult.refreshToken;
    await appConfigDoc.update(appConfig);
  }

  async refreshTwitterAccessToken(): Promise<TwitterApi> {
    // get current refresh token
    logger.info('get current refresh token');
    const firestore = new Firestore();
    const appConfigDoc = firestore.collection('bots').doc('catholic-per-day');
    const appConfig = (await appConfigDoc.get()).data() as AppConfig;

    // refresh access token
    logger.info('refresh access token');
    const twitter = new TwitterApi({ clientId, clientSecret });
    const result = await twitter.refreshOAuth2Token(appConfig.auth.refreshToken);

    // update access token and refresh token in DB
    logger.info('updating tokens in DB');
    appConfig.auth.refreshToken = result.refreshToken;
    appConfig.auth.accessToken = result.accessToken;
    await appConfigDoc.update(appConfig);

    // return access token
    logger.info('token refresh successful');
    return result.client;
  }
}
