import prisma from "@/lib/db";
import { RawDomain } from "./filters";

export async function storeScrapedDomains(domains: RawDomain[]) {
  console.log(`Storing ${domains.length} domains in database...`);

  const run = await prisma.scrapeRun.create({
    data: {
      status: "running",
      startedAt: new Date(),
    },
  });

  let successCount = 0;
  let errorCount = 0;

  try {
    for (const domain of domains) {
      try {
        await prisma.domain.upsert({
          where: { name: domain.name },
          update: {
            aby: domain.aby,
            wby: domain.wby,
            backlinks: domain.backlinks,
            scrapedAt: new Date(),
          },
          create: {
            name: domain.name,
            tld: domain.tld,
            length: domain.length,
            aby: domain.aby,
            wby: domain.wby,
            backlinks: domain.backlinks,
            dropDate: domain.dropDate || new Date(),
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to upsert domain ${domain.name}:`, error);
        errorCount++;
      }
    }

    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        count: successCount,
      },
    });

    console.log(`Successfully stored ${successCount} domains. Errors: ${errorCount}`);
  } catch (error) {
    console.error("Critical error during domain storage:", error);
    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: String(error),
      },
    });
    throw error;
  }
}
