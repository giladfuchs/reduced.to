// reports.service.ts

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LinksService } from '../core/links/links.service';
import { calculateSkip } from '../shared/utils';
import { IFindAllOptions } from '../core/entity.service';
import { Link } from '@reduced.to/prisma';
import { AppLoggerSerivce } from '@reduced.to/logger';

@Injectable()
export class CronService {
  constructor(private readonly linksService: LinksService, private readonly logger: AppLoggerSerivce) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyCleanLink() {
    this.logger.log(`start to run cron job to clean link`);

    const links = await this.linksService.findAll({} as IFindAllOptions);
    const currentTime = new Date();
    //only after 30 days the link is expired
    currentTime.setDate(currentTime.getDate() - 30);

    // Filter the links whose expirationTime has passed
    const validLinks: Link[] = links.data.filter((link) => link.expirationTime && link.expirationTime < currentTime) as Link[];
    for (const link of validLinks) {
      this.logger.log(`delete link with id: ${link.id}`);
      await this.linksService.delete(link.id);
    }
    this.logger.log(`finish to run cron job to clean link`);
  }

  // @Cron('*/20 * * * * *')
  // async runEvery10Seconds() {
  //   this.logger.log(`finish to run cron job to clean link`);
  //
  //   console.log('Every 10 seconds');
  // }
}
