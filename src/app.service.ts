import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getCatholicDailyReadings } from 'get-catholic-daily-readings';
import { buildTweets, TwitterAutoThreadClient } from 'twitter-auto-thread';
import { logger } from './logger';

@Injectable()
export class AppService {
  constructor(private auth: AuthService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async tweetDailyReadings(): Promise<void> {
    logger.info('refreshing twitter access token');
    const twitterBase = await this.auth.refreshTwitterAccessToken();

    logger.info('getting daily readings');
    const readings = await getCatholicDailyReadings();

    const twitter = new TwitterAutoThreadClient(twitterBase);

    logger.info('building tweets');
    const tweets = [
      ...buildTweets(`${readings.header}\nLectionary: ${readings.lectionary}`),
      ...readings.readings.flatMap((r) => {
        return [...buildTweets(`${r.header}\n${r.reference}`), ...buildTweets(r.formattedText)];
      }),
    ];

    logger.info('tweeting thread');
    await twitter.tweetThread(tweets, (tweet) => logger.info(tweet));
  }
}
