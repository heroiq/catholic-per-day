import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getCatholicDailyReadings } from 'get-catholic-daily-readings';
import { buildTweets, TwitterAutoThreadClient } from 'twitter-auto-thread';

@Injectable()
export class AppService {
  constructor(private auth: AuthService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async tweetDailyReadings(): Promise<void> {
    const twitterBase = await this.auth.refreshTwitterAccessToken();
    const readings = await getCatholicDailyReadings();
    const twitter = new TwitterAutoThreadClient(twitterBase);

    const tweets = [
      ...buildTweets(`${readings.header}\nLectionary: ${readings.lectionary}`),
      ...readings.readings.flatMap((r) => {
        return [...buildTweets(`${r.header}\n${r.reference}`), ...buildTweets(r.formattedText)];
      }),
    ];

    await twitter.tweetThread(tweets);
  }
}
