import { Firestore } from '@google-cloud/firestore';
import { Injectable } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { AppConfig } from './app-config';
import { baseUrl, clientId, clientSecret } from './config';

@Injectable()
export class AuthService {
  async generateAuthLink(): Promise<string> {
    const client = new TwitterApi({ clientId, clientSecret });
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      `${baseUrl}/twitter-callback`,
      { scope: ['tweet.read', 'tweet.write', 'users.read'] },
    );

    // store codeVerifier and state for later
    const firestore = new Firestore();
    const appConfigDoc = firestore.collection('bots').doc('catholic-per-day');
    const appConfig = (await appConfigDoc.get()).data() as AppConfig;

    appConfig.auth.codeVerifier = codeVerifier;
    appConfig.auth.state = state;
    await appConfigDoc.update(appConfig);

    return url;
  }
}
