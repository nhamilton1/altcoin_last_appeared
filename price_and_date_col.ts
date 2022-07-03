import axios from "axios";
import { PrismaClient } from "@prisma/client";

interface fetchedData {
    name: string;
    date_added: string;
    quote: {
        USD: {
            price: number;
        };
    };
}

interface fetchedDataArray {
    coin_name: string;
    first_appeared: Date | string;
    price: Array<{ price: number }>
    price_date: Array<{ date: Date }>
    last_appeared: string | Date | null;
}

// https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=2022-02-07&limit=5000&start=1

const prisma = new PrismaClient();

const main = async () => {
    console.time("fetch");
    let date: string | number = new Date("2013-04-29").toLocaleDateString(
        "en-CA"
    );
    const stopDate = new Date().getTime();
    let START = 1;
    let LIMIT_MAX = 5000;
    let fetchedLength = 0;

    const results: Array<fetchedDataArray> = [];
    let counter = 0;

    while (new Date(date).getTime() <= stopDate) {
        // sleep for 1.3 seconds before making the next api request
        // this is to prevent from being blocked from making requests
        await new Promise((resolve) => setTimeout(resolve, 1300));

        try {
            const url = `https://web-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?&date=${date}&limit=5000&start=${START}`;
            console.log("fetching date: ", date);
            const response = await axios.get(url);
            fetchedLength = response.data.data.length;
            response.data.data.map((i: fetchedData) => {
                // push only unqiue coins to the results array
                if (!results.find((j) => j.coin_name === i.name)) {
                    results.push({
                        coin_name: i.name,
                        first_appeared: new Date(i.date_added),
                        price: [

                            { price: i.quote.USD.price },

                        ],
                        price_date: [
                            { date: new Date(i.date_added) },
                        ],
                        last_appeared: null,
                    });
                }

                // if the coin is already in the results array, add the price to the array
                else {
                    const index = results.findIndex((j) => j.coin_name === i.name);
                    results[index].price.push({
                        price: i.quote.USD.price,
                    });
                    results[index].price_date.push({
                        date: new Date(date),
                    })
                }
            });

            // if the coin_name is not in the response array, then it means it was removed from the market.
            // update the last_appeared date to the date of the last appearance of the coin_name
            results.map((i: fetchedDataArray) => {
                if (!i.last_appeared) {
                    if (
                        response.data.data.findIndex((j: any) => j.name === i.coin_name) ===
                        -1
                    ) {
                        //finds how many days have passed between them
                        const days = Math.abs(
                            Math.round(
                                (new Date(i.first_appeared).getTime() -
                                    new Date(date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                        );
                        console.log(
                            `On ${date}, ${i.coin_name} was removed from the market. Had a life span of ${days} days.`
                        );
                        i.last_appeared = new Date(date);
                    }
                }

                // if the coin_name reappears in the response array, then update last_appeared to null
                else if (
                    response.data.data.findIndex((j: any) => j.name === i.coin_name) !==
                    -1
                ) {
                    console.log(
                        `On ${date}, ${i.coin_name} has reappeared in the market.`
                    );
                    i.last_appeared = null;
                }

            });
        } catch (err) {
            console.log(err);
        }

        counter++;
        console.log(`${counter} requests made`);
        console.log(`${fetchedLength} coins fetched`);

        if (fetchedLength === LIMIT_MAX) {
            START += 5000;
            console.log(
                `${date} reached the limit of ${LIMIT_MAX} coins, increasing the start value`
            );
        } else {
            date = new Date(date).setDate(new Date(date).getDate() + 7);
            date = new Date(date).toLocaleDateString("en-CA");
            START = 1;
        }
    }

    //add the results array to the database
    await prisma.coinsPriceDate.createMany({
        data: results.map((i: fetchedDataArray) => {
            return {
                coin_name: i.coin_name,
                first_appeared: i.first_appeared,
                price: i.price.map((j: any) => j.price),
                last_appeared: i.last_appeared,
                price_date: i.price_date.map((j: any) => j.date),
            };
        }),
        skipDuplicates: true,
    });

    console.log("amount of coins", results.length);
    const count = results.filter(
        (i: fetchedDataArray) => i.last_appeared !== null
    ).length;
    console.log("number of coins that left the market", count);
    console.log(`${(count / results.length) * 100}% of coins left the market`);
    console.log(
        `fetched from ${new Date(date).toLocaleDateString("en-CA")} to ${new Date(
            stopDate
        ).toLocaleDateString("en-CA")}`
    );
    console.timeEnd("fetch");
};

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
