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
    console.log('refreshing twitter access token');
    const twitterBase = await this.auth.refreshTwitterAccessToken();

    console.log('getting daily readings');
    const readings = await getCatholicDailyReadings();

    const twitter = new TwitterAutoThreadClient(twitterBase);

    console.log('building tweets');
    const tweets = [
      ...buildTweets(`${readings.header}\nLectionary: ${readings.lectionary}`),
      ...readings.readings.flatMap((r) => {
        return [...buildTweets(`${r.header}\n${r.reference}`), ...buildTweets(r.formattedText)];
      }),
    ];

    console.log('tweeting thread');
    await twitter.tweetThread(tweets);
  }
}
