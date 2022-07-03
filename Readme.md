This fetches the coinmarketcap crypto history list starting at 2013-04-29 to today's date. It will post all data fetched to the db at the end of all the fetches, this was to decrease time between pulls. 

Must have a .env with ```DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA```

Each file logs to the db different, was trying to figure out the best way to store/use the data as a csv file.

howManyTimes was just for testing. 

getDateArray was for me to be able to copy/paste the dates into the prisma model. 


To start:
```
npm install
```
then
```
ts-node *file.ts*
```
